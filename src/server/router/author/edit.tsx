import { csrf } from "hono/csrf";
import { z } from "zod";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { formValidatorMiddleware } from "../../middleware/formValidator.js";
import AuthorEditPage from "../../view/pages/author.edit.page.js";

export const updateAuthorSchema = z.object({
	name: z.string().trim().min(1).max(255),
	urls: z.string(),
});
export type UpdateAuthorRequest = z.infer<typeof updateAuthorSchema>;

const app = factory.createApp();

app.get("/:authorId/edit", async (c) => {
	const { container } = c.var;
	const [logger, authorRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
	);

	const authorId = c.req.param("authorId");
	logger.info("edit author page", { authorId });

	// 作者情報を取得
	const author = await authorRepository.get(authorId);
	if (!author) {
		logger.warn(`Author not found: ${authorId}`);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>作者が見つかりませんでした</p>
			</div>,
			{ title: "エラー" },
		);
	}

	return c.render(
		<AuthorEditPage
			author={{
				id: author.id,
				name: author.name,
				urls: author.urls,
			}}
		/>,
		{ title: `作者編集 - ${author.name}` },
	);
});

app.post(
	"/:authorId/edit",
	csrf(),
	formValidatorMiddleware(updateAuthorSchema),
	async (c) => {
		const { container } = c.var;
		const [logger, database, jobQueue] = container.get(
			TOKENS.LOGGER,
			TOKENS.DATABASE,
			TOKENS.JOB_QUEUE,
		);

		const authorId = c.req.param("authorId");
		const valid = c.req.valid("form");

		jobQueue.enqueue({
			name: "update-author",
			input: { id: authorId, ...valid },
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

					// 作者が存在するか確認
					const existingAuthor = await repository.get(authorId);
					if (!existingAuthor) {
						throw new Error("Author not found");
					}

					// 作者情報を更新
					const author = await repository.save({ id: authorId, name, urls });
					return author;
				});
			},
			onSuccess: (author) => {
				logger.info("Author updated successfully", { author });
			},
			onError: (error) => {
				logger.error("Failed to update author", { error });
			},
		});

		// 更新成功後、作者詳細画面へリダイレクト
		return c.redirect(`/author/${authorId}`);
	},
);

export default app;
