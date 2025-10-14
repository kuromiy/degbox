import { extname } from "node:path";
import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import VideoRegisterPage from "../../view/pages/video.register.page.js";

export const registerVideoSchema = z.object({
	file: z
		.instanceof(File)
		.refine(
			(file) => file.type.startsWith("video/"),
			"動画ファイルではありません",
		)
		.refine(
			(file) => file.size <= 100 * 1024 * 1024,
			"ファイルサイズが大きすぎます（100MBまで）",
		),
	tags: z.string(),
	authorId: z.string().optional(),
});
export type RegisterVideoRequest = z.infer<typeof registerVideoSchema>;

const app = factory.createApp();

app.get("/register", async (c) => {
	return c.render(<VideoRegisterPage />, { title: "動画登録" });
});

app.post("/register", async (c) => {
	const { container } = c.var;
	const [logger, database, fileSystem, jobQueue] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.FILE_SYSTEM,
		TOKENS.JOB_QUEUE,
	);
	const body = await c.req.parseBody({ all: true });
	logger.info("register video", body);
	const valid = registerVideoSchema.safeParse(body);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}
	jobQueue.enqueue({
		name: "register-video",
		input: valid.data,
		handle: async () => {
			return database.transaction(async (tx) => {
				return fileSystem.transaction(async (fs) => {
					const { file, tags: rawTags, authorId } = valid.data;

					const scopedContainer = createScopedContainer(
						container,
						[TOKENS.DATABASE, tx],
						[TOKENS.FILE_SYSTEM, fs],
					);
					const [authorRepository, contentAction, tagAction, videoAction] =
						scopedContainer.get(
							TOKENS.AUTHOR_REPOSITORY,
							TOKENS.CONTENT_ACTION,
							TOKENS.TAG_ACTION,
							TOKENS.VIDEO_ACTION,
						);

					// ファイルアップロード
					const buffer = await file.bytes();
					const path = await fs.writeTempFile(buffer, extname(file.name));

					// コンテンツの登録
					const content = await contentAction.register(path);
					logger.info("Content", { content });

					// タグの登録取得
					const tagNames = Tag.split(rawTags);
					const tags = await tagAction.getOrCreate(tagNames);
					logger.info("Tags", { tags });

					// 作者取得
					const author = authorId
						? await authorRepository.get(authorId)
						: undefined;
					logger.info("Author", { author });
					// 作者IDが指定されているが見つからない場合はエラー
					if (authorId && !author) {
						throw new Error(`Author with ID '${authorId}' not found`);
					}

					// 動画登録
					const video = await videoAction.register(tags, content, author);
					logger.info("Video", { video });

					return video;
				});
			});
		},
		onSuccess: (video) => {
			logger.info("Video registered successfully", { video });
		},
		onError: (error) => {
			logger.error("Failed to register video", { error });
		},
	});

	return c.redirect(c.req.url);
});

export default app;
