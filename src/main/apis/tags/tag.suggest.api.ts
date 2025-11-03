import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

/**
 * 関連タグサジェストAPI
 * 既に選択されているタグに基づいて、共起行列から関連性の高いタグを提案
 */

export const suggestRelatedTagsSchema = z.object({
	tagNames: z.array(z.string().trim().min(1)).min(1),
	limit: z.number().optional().default(5),
});
export type SuggestRelatedTagsRequest = z.infer<
	typeof suggestRelatedTagsSchema
>;

export async function suggestRelatedTags(
	ctx: Context,
	request: SuggestRelatedTagsRequest,
) {
	const { container } = ctx;
	const [logger, tagSuggestionService] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_SUGGESTION_SERVICE,
	);

	logger.info("suggest related tags", request);

	const valid = suggestRelatedTagsSchema.safeParse(request);
	if (!valid.success) {
		logger.warn(
			`Invalid request: ${valid.error?.message ?? "validation failed"}`,
		);
		throw new Error("Invalid request");
	}

	const { tagNames, limit } = valid.data;

	// スキーマでトリムと最小長チェックが完了しているため、そのまま使用
	const suggestions = await tagSuggestionService.suggestTagsByNames(
		tagNames,
		limit,
	);

	return suggestions;
}
