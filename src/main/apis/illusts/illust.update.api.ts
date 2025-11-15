import { z } from "zod";
import type { Content } from "../../../../features/content/content.model.js";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const updateIllustSchema = z.object({
	id: z.string(),
	tags: z.string(),
	imageItems: z.array(z.string()), // "existing:id" または "new:id" の形式
	authorIds: z.array(z.string()),
});
export type UpdateIllustRequest = z.infer<typeof updateIllustSchema>;

export interface UpdateIllustResponse {
	id: string;
}

export async function updateIllust(
	ctx: Context,
	request: UpdateIllustRequest,
): Promise<UpdateIllustResponse> {
	const { container } = ctx;
	const [logger, database, fileSystem, jobQueue] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.FILE_SYSTEM,
		TOKENS.JOB_QUEUE,
	);
	logger.info("update illust", request);
	const valid = updateIllustSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	return new Promise((resolve, reject) => {
		jobQueue.enqueue({
			name: "update-illust",
			input: valid.data,
			handle: async () => {
				return database.transaction(async (tx) => {
					return fileSystem.transaction(async (fs) => {
						const { id, tags: rawTags, imageItems, authorIds } = valid.data;

						const scopedContainer = createScopedContainer(
							container,
							[TOKENS.DATABASE, tx],
							[TOKENS.FILE_SYSTEM, fs],
						);
						const [
							authorRepository,
							tagAction,
							illustAction,
							illustRepository,
						] = scopedContainer.get(
							TOKENS.AUTHOR_REPOSITORY,
							TOKENS.TAG_ACTION,
							TOKENS.ILLUST_ACTION,
							TOKENS.ILLUST_REPOSITORY,
						);

						// イラストが存在するか確認
						const existingIllust = await illustRepository.findById(id);
						if (!existingIllust) {
							throw new Error("Illust not found");
						}

						// imageItemsをパースして、既存/新規を区別しながら順序通りに処理
						type IllustContentItem = {
							content?: Content;
							order: number;
							newResourceId?: string;
						};
						const illustContents: IllustContentItem[] = [];
						const newResourceIds: string[] = [];

						for (const item of imageItems) {
							const [type, itemId] = item.split(":");
							if (!type || !itemId) {
								throw new Error(`Invalid image item format: ${item}`);
							}

							if (type === "existing") {
								// 既存コンテンツを取得
								const found = existingIllust.contents.find(
									(ic) => ic.content.id === itemId,
								);
								if (!found) {
									throw new Error(`Content not found in illust: ${itemId}`);
								}
								illustContents.push({
									content: found.content,
									order: illustContents.length,
								});
							} else if (type === "new") {
								// 新規リソースIDを記録
								newResourceIds.push(itemId);
								// 順序を保持するためにプレースホルダーを追加
								illustContents.push({
									order: illustContents.length,
									newResourceId: itemId,
								});
							} else {
								throw new Error(`Unknown image item type: ${type}`);
							}
						}
						logger.info("Parsed image items", {
							illustContents,
							newResourceIds,
						});

						// タグの登録取得
						const tagNames = Tag.split(rawTags);
						const tags = await tagAction.getOrCreate(tagNames);
						logger.info("Tags", { tags });

						// 作者取得
						const authors = [];
						for (const authorId of authorIds) {
							const author = await authorRepository.get(authorId);
							if (!author) {
								throw new Error(`Author with ID '${authorId}' not found`);
							}
							authors.push(author);
						}
						logger.info("Authors", { authors });

						// イラスト更新
						const illust = await illustAction.update(
							id,
							tags,
							illustContents,
							newResourceIds,
							authors,
						);
						logger.info("Illust updated", { illust });

						// タグ共起行列の更新
						await tagAction.updateCooccurrences(tags);
						logger.info("Updated tag cooccurrences");

						return illust;
					});
				});
			},
			onSuccess: (illust) => {
				logger.info("Illust updated successfully", { illust });
				resolve({ id: illust.id });
			},
			onError: (error) => {
				logger.error("Failed to update illust", { error });
				reject(error);
			},
		});
	});
}
