import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const registerVideoSchema = z.object({
	resourceId: z.string(),
	rawTags: z.string(),
	authorId: z.string().optional(),
});
export type RegisterVideoRequest = z.infer<typeof registerVideoSchema>;

export async function registerVideo(
	ctx: Context,
	request: RegisterVideoRequest,
) {
	const { container } = ctx;
	const [logger, database, fileSystem, jobQueue] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.FILE_SYSTEM,
		TOKENS.JOB_QUEUE,
	);
	logger.info("register video", request);
	const valid = registerVideoSchema.safeParse(request);
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
					const { resourceId, rawTags, authorId } = valid.data;

					const scopedContainer = createScopedContainer(
						container,
						[TOKENS.DATABASE, tx],
						[TOKENS.FILE_SYSTEM, fs],
					);
					const [
						unmanagedContentRepository,
						authorRepository,
						contentAction,
						tagAction,
						videoAction,
					] = scopedContainer.get(
						TOKENS.UNMANAGED_CONTENT_REPOSITORY,
						TOKENS.AUTHOR_REPOSITORY,
						TOKENS.CONTENT_ACTION,
						TOKENS.TAG_ACTION,
						TOKENS.VIDEO_ACTION,
					);

					// 未管理コンテンツの取得
					const unmanagedContent =
						await unmanagedContentRepository.get(resourceId);
					if (!unmanagedContent) {
						throw new Error("Unmanaged content not found");
					}
					logger.info("Found unmanaged content", { unmanagedContent });

					// コンテンツの登録
					const content = await contentAction.register(unmanagedContent.path);
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
}
