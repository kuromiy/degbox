import { z } from "zod";
import { TOKENS } from "../../../../main/depend.injection.js";
import { factory } from "../../../factory.js";

/**
 * 作者検索API
 * クエリパラメータに基づいて作者を検索し、JSON形式で結果を返す
 */

export const searchAuthorSchema = z.object({
	name: z.string().optional(),
	page: z.coerce.number().int().min(1).optional().default(1),
	size: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type SearchAuthorRequest = z.infer<typeof searchAuthorSchema>;

const app = factory.createApp();

app.get("/search", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
	);

	// クエリパラメータを取得
	const query = c.req.query();
	const parsedQuery = searchAuthorSchema.safeParse(query);

	if (!parsedQuery.success) {
		logger.warn("Invalid search query", parsedQuery.error);
		return c.json(
			{
				error: "Invalid request",
				details: parsedQuery.error.issues,
			},
			400,
		);
	}

	const { name, page: rowPage, size } = parsedQuery.data;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する

	logger.info("search author", { name, page: rowPage, size });

	const count = await repository.count(name);
	if (count === 0) {
		const searchResult =
			name !== undefined
				? {
						count: 0,
						result: [],
						page: rowPage,
						size: size,
						name: name,
					}
				: {
						count: 0,
						result: [],
						page: rowPage,
						size: size,
					};
		return c.json(searchResult);
	}

	const result = await repository.search(name, page, size);
	const searchResult =
		name !== undefined
			? {
					count: count,
					result: result,
					page: rowPage,
					size: size,
					name: name,
				}
			: {
					count: count,
					result: result,
					page: rowPage,
					size: size,
				};
	return c.json(searchResult);
});

export default app;
