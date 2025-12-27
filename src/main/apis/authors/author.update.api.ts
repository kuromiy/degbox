import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const updateAuthorSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(1).max(255),
	urls: z.string(),
});
export type UpdateAuthorRequest = z.infer<typeof updateAuthorSchema>;

export interface AuthorUpdateResponse {
	id: string;
	name: string;
	urls: Record<string, string>;
}

export async function updateAuthor(
	ctx: Context,
	request: UpdateAuthorRequest,
): Promise<AuthorUpdateResponse> {
	const { container } = ctx;
	const [logger, database, jobQueue] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.JOB_QUEUE,
	);
	logger.info("update author", request);
	const valid = updateAuthorSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	return new Promise((resolve, reject) => {
		jobQueue.enqueue({
			name: "update-author",
			input: valid.data,
			handle: async () => {
				return database.transaction(async (tx) => {
					const { id, name, urls: urlsString } = valid.data;

					// JSON文字列をRecord<string, string>に変換
					let urls: Record<string, string>;
					try {
						const parsed = JSON.parse(urlsString);
						urls = z.record(z.string(), z.string()).parse(parsed);
					} catch (error) {
						logger.error("Invalid JSON format for urls", { error, urlsString });
						throw new Error("Invalid JSON format for urls");
					}

					const scopedContainer = createScopedContainer(container, [
						TOKENS.DATABASE,
						tx,
					]);
					const repository = scopedContainer.get(TOKENS.AUTHOR_REPOSITORY);

					// 作者が存在するか確認
					const existingAuthor = await repository.get(id);
					if (!existingAuthor) {
						throw new Error("Author not found");
					}

					// 作者情報を更新
					const author = await repository.save({ id, name, urls });
					return author;
				});
			},
			onSuccess: (author) => {
				logger.info("Author updated successfully", { author });
				resolve({
					id: author.id,
					name: author.name,
					urls: author.urls,
				});
			},
			onError: (error) => {
				logger.error("Failed to update author", { error });
				reject(error);
			},
		});
	});
}
