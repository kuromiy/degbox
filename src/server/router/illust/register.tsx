import { extname } from "node:path";
import { csrf } from "hono/csrf";
import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { formValidatorMiddleware } from "../../middleware/formValidator.js";
import IllustRegisterPage from "../../view/pages/illust.register.page.js";

export const registerIllustSchema = z.object({
	files: z
		.array(
			z
				.instanceof(File)
				.refine(
					(file) => file.type.startsWith("image/"),
					"画像ファイルではありません",
				)
				.refine(
					(file) => file.size <= 50 * 1024 * 1024,
					"ファイルサイズが大きすぎます（50MBまで）",
				),
		)
		.min(1, "最低1枚の画像が必要です"),
	tags: z.string(),
	authorIds: z.array(z.string()).optional(),
});
export type RegisterIllustRequest = z.infer<typeof registerIllustSchema>;

const app = factory.createApp();

app.get("/register", async (c) => {
	const { session } = c.var;
	const formData = session.get("formData");
	const errors = session.get("errors");
	return c.render(<IllustRegisterPage formData={formData} errors={errors} />, {
		title: "イラスト登録",
	});
});

app.post(
	"/register",
	csrf(),
	formValidatorMiddleware(registerIllustSchema),
	async (c) => {
		const { container } = c.var;
		const [logger, database, fileSystem, jobQueue] = container.get(
			TOKENS.LOGGER,
			TOKENS.DATABASE,
			TOKENS.FILE_SYSTEM,
			TOKENS.JOB_QUEUE,
		);
		const valid = c.req.valid("form");
		jobQueue.enqueue({
			name: "register-illust",
			input: valid,
			handle: async () => {
				return database.transaction(async (tx) => {
					return fileSystem.transaction(async (fs) => {
						const { files, tags: rawTags, authorIds } = valid;

						const scopedContainer = createScopedContainer(
							container,
							[TOKENS.DATABASE, tx],
							[TOKENS.FILE_SYSTEM, fs],
						);
						const [authorRepository, contentAction, tagAction, illustAction] =
							scopedContainer.get(
								TOKENS.AUTHOR_REPOSITORY,
								TOKENS.CONTENT_ACTION,
								TOKENS.TAG_ACTION,
								TOKENS.ILLUST_ACTION,
							);

						// 複数ファイルのアップロード
						const contents = [];
						for (const file of files) {
							const buffer = await file.bytes();
							const path = await fs.writeTempFile(buffer, extname(file.name));
							logger.info("path", { path });

							// コンテンツの登録
							const content = await contentAction.register(path);
							logger.info("Content", { content });
							contents.push(content);
						}

						// タグの登録取得
						const tagNames = Tag.split(rawTags);
						const tags = await tagAction.getOrCreate(tagNames);
						logger.info("Tags", { tags });

						// 作者取得
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

						// イラスト登録
						const illust = await illustAction.register(tags, contents, authors);
						logger.info("Illust", { illust });

						// タグ共起行列の更新
						await tagAction.updateCooccurrences(tags);
						logger.info("Updated tag cooccurrences");

						return illust;
					});
				});
			},
			onSuccess: (illust) => {
				logger.info("Illust registered successfully", { illust });
			},
			onError: (error) => {
				logger.error("Failed to register illust", { error });
			},
		});

		return c.redirect(c.req.url);
	},
);

export default app;
