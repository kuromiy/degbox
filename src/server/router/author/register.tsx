import { csrf } from "hono/csrf";
import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { formValidatorMiddleware } from "../../middleware/formValidator.js";
import AuthorRegisterPage from "../../view/pages/author.register.page.js";

export const registerAuthorSchema = z.object({
	name: z.string().trim().min(1).max(255),
	urls: z.string(),
});
export type RegisterAuthorRequest = z.infer<typeof registerAuthorSchema>;

const app = factory.createApp();

app.get("/register", async (c) => {
	return c.render(<AuthorRegisterPage />, { title: "作者登録" });
});

app.post(
	"/register",
	csrf(),
	formValidatorMiddleware(registerAuthorSchema),
	async (c) => {
		const { container } = c.var;
		const [logger, database, jobQueue] = container.get(
			TOKENS.LOGGER,
			TOKENS.DATABASE,
			TOKENS.JOB_QUEUE,
		);
		const valid = c.req.valid("form");
		jobQueue.enqueue({
			name: "register-author",
			input: valid,
			handle: async () => {
				return database.transaction(async (tx) => {
					const { name, urls: urlsString } = valid;

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

		return c.redirect(c.req.url);
	},
);

export default app;
