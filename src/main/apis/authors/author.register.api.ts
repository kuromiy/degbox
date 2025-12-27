import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const registerAuthorSchema = z.object({
	name: z.string().trim().min(1).max(255),
	urls: z.string(),
});
export type RegisterAuthorRequest = z.infer<typeof registerAuthorSchema>;

export async function registerAuthor(
	ctx: Context,
	request: RegisterAuthorRequest,
) {
	const { container } = ctx;
	const [logger, database, jobQueue] = container.get(
		TOKENS.LOGGER,
		TOKENS.DATABASE,
		TOKENS.JOB_QUEUE,
	);
	logger.info("register author", request);
	const valid = registerAuthorSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	jobQueue.enqueue({
		name: "register-author",
		input: valid.data,
		handle: async () => {
			return database.transaction(async (tx) => {
				const { name, urls: urlsString } = valid.data;

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

				const id = await repository.generateId();
				const author = await repository.save({ id, name, urls });
				return author;
			});
		},
		onSuccess: (author) => {
			logger.info("Author registered successfully", { author });
		},
		onError: (error) => {
			logger.error("Failed to register author", { error });
		},
	});
}
