import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const deleteContentSchema = z.object({
	groupId: z.string(),
	contentId: z.string(),
});
export type DeleteContentRequest = z.infer<typeof deleteContentSchema>;

export const deleteContentValidator = zodValidator(deleteContentSchema);

export interface DeleteContentResponse {
	success: boolean;
	error?: string;
}

export async function deleteContent(
	ctx: Context,
	request: DeleteContentRequest,
): Promise<DeleteContentResponse> {
	const { container } = ctx;
	const [logger, database, contentRepository, contentService] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.CONTENT_REPOSITORY,
		TOKENS.CONTENT_SERVICE,
	);
	logger.info("delete content from duplicate group", request);

	// 1. Content情報を取得（トランザクション外で先に取得）
	const content = await contentRepository.findById(request.contentId);
	if (!content) {
		logger.warn(`Content not found: ${request.contentId}`);
		return { success: false, error: "Content not found" };
	}

	// 2. トランザクション内でDB操作を実行
	await database.transaction(async (tx) => {
		const scopedContainer = createScopedContainer(container, [
			TOKENS.DATABASE,
			tx,
		]);
		const [
			txContentRepository,
			txContentHashRepository,
			txDuplicateRepository,
		] = scopedContainer.get(
			TOKENS.CONTENT_REPOSITORY,
			TOKENS.CONTENT_HASH_REPOSITORY,
			TOKENS.DUPLICATE_CONTENT_REPOSITORY,
		);

		// 2-1. グループからアイテム除外
		await txDuplicateRepository.removeItemFromGroup(
			request.groupId,
			request.contentId,
		);

		// 2-2. ContentHash削除
		await txContentHashRepository.deleteByContentId(request.contentId);

		// 2-3. 中間テーブルの関連を削除（外部キー制約対策）
		await txContentRepository.deleteRelations(request.contentId);

		// 2-4. Content削除
		await txContentRepository.delete(request.contentId);
	});

	// 3. 物理ファイル削除（トランザクション成功後に実行）
	try {
		await contentService.deleteContent(content.path, content.name);
	} catch (error) {
		// 物理ファイル削除に失敗してもDBは既にコミット済み
		// ログに記録して続行（孤立ファイルとして残る可能性がある）
		logger.error("Failed to delete physical file", {
			path: content.path,
			name: content.name,
			error,
		});
	}

	return { success: true };
}
