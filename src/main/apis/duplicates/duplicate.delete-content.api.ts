import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	ILLUSTS_CONTENTS,
	VIDEOS_CONTENTS,
} from "../../../../features/shared/database/application/schema.js";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const deleteContentSchema = z.object({
	groupId: z.string(),
	contentId: z.string(),
});
export type DeleteContentRequest = z.infer<typeof deleteContentSchema>;

export const deleteContentValidator = zodValidator(deleteContentSchema);

export async function deleteContent(
	ctx: Context,
	request: DeleteContentRequest,
) {
	const { container } = ctx;
	const [logger, db, contentRepository, contentHashRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.CONTENT_REPOSITORY,
		TOKENS.CONTENT_HASH_REPOSITORY,
	);
	const [duplicateRepository, contentService] = container.get(
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
		TOKENS.CONTENT_SERVICE,
	);
	logger.info("delete content from duplicate group", request);

	// 1. Content情報を取得
	const content = await contentRepository.findById(request.contentId);
	if (!content) {
		return { success: false, error: "Content not found" };
	}

	// 2. グループからアイテム除外
	await duplicateRepository.removeItemFromGroup(
		request.groupId,
		request.contentId,
	);

	// 3. ContentHash削除
	await contentHashRepository.deleteByContentId(request.contentId);

	// 4. 中間テーブルの関連を削除（外部キー制約対策）
	await db
		.delete(VIDEOS_CONTENTS)
		.where(eq(VIDEOS_CONTENTS.contentId, request.contentId));
	await db
		.delete(ILLUSTS_CONTENTS)
		.where(eq(ILLUSTS_CONTENTS.contentId, request.contentId));

	// 5. Content削除
	await contentRepository.delete(request.contentId);

	// 6. 物理ファイル削除
	await contentService.deleteContent(content.path, content.name);

	return { success: true };
}
