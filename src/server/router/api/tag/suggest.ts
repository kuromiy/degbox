import { z } from "zod";
import { TOKENS } from "../../../../main/depend.injection.js";
import { factory } from "../../../factory.js";

/**
 * 関連タグサジェストAPI
 * 既に選択されているタグに基づいて、共起行列から関連性の高いタグを提案
 */

export const suggestRelatedTagsSchema = z.object({
	tagNames: z.array(z.string()).min(1),
	limit: z.number().optional().default(5),
});
export type SuggestRelatedTagsRequest = z.infer<
	typeof suggestRelatedTagsSchema
>;

const app = factory.createApp();

app.post("/suggest", async (c) => {
	const { container } = c.var;
	const [logger, tagSuggestionService] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_SUGGESTION_SERVICE,
	);

	const body = await c.req.json();
	logger.info("suggest related tags", body);

	const valid = suggestRelatedTagsSchema.safeParse(body);
	if (!valid.success) {
		logger.warn(
			`Invalid request: ${valid.error?.message ?? "validation failed"}`,
		);
		return c.json({ error: "Invalid request" }, 400);
	}

	const { tagNames, limit } = valid.data;

	// 空白やトリムされた結果が空のタグ名を除外
	const validTagNames = tagNames
		.map((name) => name.trim())
		.filter((name) => name.length > 0);

	if (validTagNames.length === 0) {
		return c.json([]);
	}

	const suggestions = await tagSuggestionService.suggestTagsByNames(
		validTagNames,
		limit,
	);

	return c.json(suggestions);
});

export default app;
