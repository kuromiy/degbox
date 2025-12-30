import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const searchAuthorSchema = z.object({
	name: z.string().optional(),
	page: z.coerce.number().int().min(1).optional().default(1),
	size: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type SearchAuthorRequest = z.infer<typeof searchAuthorSchema>;

export const searchAuthorValidator = zodValidator(searchAuthorSchema);

export async function searchAuthor(ctx: Context, request: SearchAuthorRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
	);
	logger.info("search author", request);
	const { name, page: rowPage, size } = request;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する
	const count = await repository.count(name);
	if (count === 0) {
		return {
			count: count,
			result: [],
			page: rowPage,
			size: size,
		};
	}
	const result = await repository.search(name, page, size);
	return {
		count: count,
		result: result,
		page: rowPage,
		size: size,
	};
}
