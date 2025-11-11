import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import IllustSearchPage from "../../view/pages/illust.search.page.js";

export const searchIllustSchema = z.object({
	tag: z.string().optional(),
	sortBy: z.enum(["id"]).optional().default("id"),
	order: z.enum(["asc", "desc"]).optional().default("desc"),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type SearchIllustRequest = z.infer<typeof searchIllustSchema>;

const app = factory.createApp();

app.get("/search", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);

	// クエリパラメータを取得
	const query = c.req.query();
	const parsedQuery = searchIllustSchema.safeParse(query);

	if (!parsedQuery.success) {
		logger.warn("Invalid search query", parsedQuery.error);
		return c.render(
			<IllustSearchPage
				searchResult={{
					items: [],
					total: 0,
					page: 1,
					limit: 20,
					hasNext: false,
					hasPrev: false,
				}}
			/>,
			{ title: "イラスト検索" },
		);
	}

	const { tag, sortBy, order, page: rowPage, limit } = parsedQuery.data;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する

	logger.info("search illust", { tag, sortBy, order, page: rowPage, limit });

	const total = await repository.count(tag);
	const hasNext = total > rowPage * limit;
	const hasPrev = rowPage > 1;

	if (total === 0) {
		return c.render(
			<IllustSearchPage
				searchResult={{
					items: [],
					total: 0,
					page: rowPage,
					limit: limit,
					hasNext: false,
					hasPrev: false,
					...(tag && { tag }),
					...(sortBy && { sortBy }),
					...(order && { order }),
				}}
			/>,
			{ title: "イラスト検索" },
		);
	}

	const items = await repository.search(tag, sortBy, order, page, limit);
	return c.render(
		<IllustSearchPage
			searchResult={{
				items: items,
				total: total,
				page: rowPage,
				limit: limit,
				hasNext: hasNext,
				hasPrev: hasPrev,
				...(tag && { tag }),
				...(sortBy && { sortBy }),
				...(order && { order }),
			}}
		/>,
		{ title: "イラスト検索" },
	);
});

export default app;
