import { csrf } from "hono/csrf";
import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { convertIllustContentPathsToUrls } from "../../helpers/illust.helper.js";
import { formValidatorMiddleware } from "../../middleware/formValidator.js";
import IllustEditPage from "../../view/pages/illust.edit.page.js";

export const updateIllustSchema = z.object({
	imageItems: z
		.union([z.string(), z.array(z.string())])
		.transform((val) => (Array.isArray(val) ? val : [val]))
		.pipe(z.array(z.string()).min(1, "最低1枚の画像が必要です")),
	tags: z.string(),
	authorIds: z
		.union([z.string(), z.array(z.string())])
		.transform((val) =>
			val === undefined || val === "" ? [] : Array.isArray(val) ? val : [val],
		)
		.pipe(z.array(z.string()))
		.optional(),
});
export type UpdateIllustRequest = z.infer<typeof updateIllustSchema>;

const app = factory.createApp();

app.get("/:illustId/edit", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);

	const illustId = c.req.param("illustId");
	logger.info("edit illust page", { illustId });

	// イラスト情報を取得
	const illust = await repository.findById(illustId);
	if (!illust) {
		logger.warn(`Illust not found: ${illustId}`);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>イラストが見つかりませんでした</p>
			</div>,
			{ title: "エラー" },
		);
	}

	// datasource層から取得したパスを完全URLに変換
	const illustWithUrls = convertIllustContentPathsToUrls(illust);

	return c.render(<IllustEditPage illust={illustWithUrls} />, {
		title: `イラスト編集`,
	});
});

app.post(
	"/:illustId/edit",
	csrf(),
	formValidatorMiddleware(updateIllustSchema),
	async (c) => {
		const { container } = c.var;
		const [logger, database, fileSystem, jobQueue] = container.get(
			TOKENS.LOGGER,
			TOKENS.DATABASE,
			TOKENS.FILE_SYSTEM,
			TOKENS.JOB_QUEUE,
		);

		const illustId = c.req.param("illustId");
		const valid = c.req.valid("form");

		jobQueue.enqueue({
			name: "update-illust",
			input: { id: illustId, ...valid },
			handle: async () => {
				return database.transaction(async (tx) => {
					return fileSystem.transaction(async (fs) => {
						const { imageItems, tags: rawTags, authorIds } = valid;

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

						// 既存イラスト情報を取得
						const existingIllust = await illustRepository.findById(illustId);
						if (!existingIllust) {
							throw new Error(`Illust not found: ${illustId}`);
						}

						// 既存コンテンツマップを作成
						const existingContentMap = new Map(
							existingIllust.contents.map((ic) => [ic.content.id, ic.content]),
						);

						// 画像アイテムの処理
						const contentItems = [];
						const newResourceIds = [];

						for (let index = 0; index < imageItems.length; index++) {
							const item = imageItems[index];
							if (!item) {
								throw new Error(`Invalid image item at index ${index}`);
							}

							const [type, id] = item.split(":");
							if (!type || !id) {
								throw new Error(`Invalid image item format: ${item}`);
							}

							if (type === "existing") {
								// 既存コンテンツ
								const content = existingContentMap.get(id);
								if (!content) {
									throw new Error(`Existing content not found: ${id}`);
								}
								contentItems.push({ content, order: index });
							} else if (type === "new") {
								// 新規コンテンツ
								contentItems.push({ newResourceId: id, order: index });
								newResourceIds.push(id);
							} else {
								throw new Error(`Unknown image item type: ${type}`);
							}
						}

						// タグの処理
						const tagNames = Tag.split(rawTags);
						const tags = await tagAction.getOrCreate(tagNames);
						logger.info("Tags", { tags });

						// 作者の処理
						const authors = [];
						if (authorIds) {
							for (const authorId of authorIds) {
								const author = await authorRepository.get(authorId);
								if (!author) {
									throw new Error(`Author with ID '${authorId}' not found`);
								}
								authors.push(author);
							}
						}
						logger.info("Authors", { authors });

						// イラスト更新
						const illust = await illustAction.update(
							illustId,
							tags,
							contentItems,
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
			},
			onError: (error) => {
				logger.error("Failed to update illust", { error });
			},
		});

		// 更新成功後、イラスト詳細画面へリダイレクト
		return c.redirect(`/illust/detail/${illustId}`);
	},
);

export default app;
