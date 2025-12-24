import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { convertVideoArrayPathsToUrls } from "../../helpers/video.helper.js";
import VideoSearchPage from "../../view/pages/video.search.page.js";

export const searchVideoSchema = z.object({
	keyword: z.string().optional().default(""),
	sortBy: z.string().optional().default("createdAt"),
	order: z.string().optional().default("desc"),
	page: z.coerce.number().int().min(1).optional().default(1),
	size: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type SearchVideoRequest = z.infer<typeof searchVideoSchema>;

const app = factory.createApp();

app.get("/search", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);

	// クエリパラメータを取得
	const query = c.req.query();
	const parsedQuery = searchVideoSchema.safeParse(query);

	if (!parsedQuery.success) {
		logger.warn("Invalid search query", parsedQuery.error);
		return c.render(
			<VideoSearchPage
				searchResult={{
					count: 0,
					result: [],
					page: 1,
					size: 20,
					keyword: "",
				}}
			/>,
			{ title: "動画検索" },
		);
	}

	const { keyword, sortBy, order, page: rowPage, size } = parsedQuery.data;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する

	logger.info("search video", { keyword, sortBy, order, page: rowPage, size });

	const count = await repository.count(keyword);
	if (count === 0) {
		return c.render(
			<VideoSearchPage
				searchResult={{
					count: 0,
					result: [],
					page: rowPage,
					size: size,
					keyword: keyword,
				}}
			/>,
			{ title: "動画検索" },
		);
	}

	const result = await repository.search(keyword, sortBy, order, page, size);
	// datasource層から取得したパスを完全URLに変換
	const resultWithUrls = convertVideoArrayPathsToUrls(result);
	return c.render(
		<VideoSearchPage
			searchResult={{
				count: count,
				result: resultWithUrls,
				page: rowPage,
				size: size,
				keyword: keyword,
			}}
		/>,
		{ title: "動画検索" },
	);
});

export default app;
