import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

/**
 * タグオートコンプリートAPI
 * 入力中の文字列に部分一致するタグを返す
 */

export const autocompleteTagsSchema = z.object({
	value: z.string(),
	limit: z.number().positive().max(1000).optional().default(10),
});
export type AutocompleteTagsRequest = z.infer<typeof autocompleteTagsSchema>;

export async function autocompleteTags(
	ctx: Context,
	request: AutocompleteTagsRequest,
) {
	const { container } = ctx;
	const [logger, tagRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_REPOSITORY,
	);
	logger.info("autocomplete tags", request);
	const valid = autocompleteTagsSchema.safeParse(request);
	if (!valid.success) {
		logger.warn(
			`Invalid request: ${valid.error?.message ?? "validation failed"}`,
		);
		throw new Error("Invalid request");
	}
	const { value, limit } = valid.data;
	const query = value.trim();
	if (query.length === 0) {
		return [];
	}
	return await tagRepository.listByName(query, limit);
}
