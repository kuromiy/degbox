import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import { convertIllustArrayContentPathsToUrls } from "../../../server/helpers/illust.helper.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const searchIllustSchema = z.object({
	keyword: z.string().optional(),
	sortBy: z.string().optional().default("createdAt"),
	order: z.string().optional().default("desc"),
	page: z.number().int().min(1).optional().default(1),
	limit: z.number().int().min(1).max(100).optional().default(20),
});
export type SearchIllustRequest = z.infer<typeof searchIllustSchema>;

export const searchIllustValidator = zodValidator(searchIllustSchema);

export async function searchIllust(ctx: Context, request: SearchIllustRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);
	logger.info("search illust", request);
	const { keyword, sortBy, order, page: rowPage, limit } = request;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する
	const total = await repository.count(keyword);
	const hasNext = total > rowPage * limit;
	const hasPrev = rowPage > 1;

	if (total === 0) {
		return {
			items: [],
			total: 0,
			page: rowPage,
			limit: limit,
			hasNext: false,
			hasPrev: false,
			...(keyword && { keyword }),
		};
	}
	const items = await repository.search(keyword, sortBy, order, page, limit);
	// datasource層から取得したパスを完全URLに変換
	const itemsWithUrls = convertIllustArrayContentPathsToUrls(items);
	return {
		items: itemsWithUrls,
		total: total,
		page: rowPage,
		limit: limit,
		hasNext: hasNext,
		hasPrev: hasPrev,
		...(keyword && { keyword }),
	};
}
