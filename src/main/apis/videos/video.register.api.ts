import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import { Tag } from "../../../../features/tag/tag.model.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const registerVideoSchema = z.object({
	resourceIds: z.array(z.string()).min(1),
	rawTags: z.string(),
	authorIds: z.array(z.string()).optional(),
});
export type RegisterVideoRequest = z.infer<typeof registerVideoSchema>;

export const registerVideoValidator = zodValidator(registerVideoSchema);

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

	jobQueue.enqueue({
		name: "register-video",
		input: request,
		handle: async () => {
			return database.transaction(async (tx) => {
				return fileSystem.transaction(async (fs) => {
					const { resourceIds, rawTags, authorIds } = request;

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
					const contents = [];
					for (const resourceId of resourceIds) {
						const unmanagedContent =
							await unmanagedContentRepository.get(resourceId);
						if (!unmanagedContent) {
							throw new Error(`Unmanaged content not found: ${resourceId}`);
						}
						logger.info("Found unmanaged content", { unmanagedContent });

						// コンテンツの登録
						const content = await contentAction.register(unmanagedContent.path);
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

					// 動画登録
					const video = await videoAction.register(tags, contents, authors);
					logger.info("Video", { video });

					// タグ共起行列の更新
					await tagAction.updateCooccurrences(tags);
					logger.info("Updated tag cooccurrences");

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
