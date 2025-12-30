import { z } from "zod";
import { ValidError } from "../../../../features/shared/error/valid/index.js";
import { convertVideoArrayPathsToUrls } from "../../../server/helpers/video.helper.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const searchVideoSchema = z.object({
	keyword: z.string().optional().default(""),
	sortBy: z.string().optional().default("createdAt"),
	order: z.string().optional().default("desc"),
	page: z.number().int().min(1).optional().default(1),
	size: z.number().int().min(1).max(100).optional().default(20),
});
export type SearchVideoRequest = z.infer<typeof searchVideoSchema>;

export function searchVideoValidator(args: unknown, ctx: Context) {
	const logger = ctx.container.get(TOKENS.LOGGER);
	const valid = searchVideoSchema.safeParse(args);
	if (!valid.success) {
		const error = new ValidError(valid.error);
		logger.debug("invalid request", { error });
		throw error;
	}
	return valid.data;
}

export async function searchVideo(ctx: Context, request: SearchVideoRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);
	logger.info("search video", request);
	const { keyword, sortBy, order, page: rowPage, size } = request;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する
	const count = await repository.count(keyword);
	if (count === 0) {
		return {
			count: count,
			result: [],
			page: rowPage,
			size: size,
		};
	}
	const result = await repository.search(keyword, sortBy, order, page, size);
	// datasource層から取得したパスを完全URLに変換
	const resultWithUrls = convertVideoArrayPathsToUrls(result);
	return {
		count: count,
		result: resultWithUrls,
		page: rowPage,
		size: size,
	};
}
