import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const searchVideoSchema = z.object({
	keyword: z.string().optional().default(""),
	page: z.number().optional().default(1),
	size: z.number().optional().default(20),
});
export type SearchVideoRequest = z.infer<typeof searchVideoSchema>;

export async function searchVideo(ctx: Context, request: SearchVideoRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);
	logger.info("search video", request);
	const valid = searchVideoSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}
	const { keyword, page: rowPage, size } = valid.data;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する
	const count = await repository.count(keyword);
	if (count === 0) {
		return {
			count: count,
			result: [],
			page: page,
			size: size,
		};
	}
	const result = await repository.search(keyword, page, size);
	return {
		count: count,
		result: result,
		page: page,
		size: size,
	};
}
