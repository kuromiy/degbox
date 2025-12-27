import { z } from "zod";
import { TOKENS } from "../../../../main/di/token.js";
import { factory } from "../../../factory.js";

/**
 * タグオートコンプリートAPI
 * 入力中の文字列に部分一致するタグを返す
 */

export const autocompleteTagsSchema = z.object({
	value: z.string(),
	limit: z.number().positive().max(1000).optional().default(10),
});
export type AutocompleteTagsRequest = z.infer<typeof autocompleteTagsSchema>;

const app = factory.createApp();

app.get("/autocomplete", async (c) => {
	const { container } = c.var;
	const [logger, tagRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_REPOSITORY,
	);

	// クエリパラメータから値を取得
	const value = c.req.query("value");
	const limitParam = c.req.query("limit");
	const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;

	logger.info("autocomplete tags", { value, limit });

	const valid = autocompleteTagsSchema.safeParse({ value, limit });
	if (!valid.success) {
		logger.warn(
			`Invalid request: ${valid.error?.message ?? "validation failed"}`,
		);
		return c.json({ error: "Invalid request" }, 400);
	}

	const query = valid.data.value.trim();
	if (query.length === 0) {
		return c.json([]);
	}

	const tags = await tagRepository.listByName(query, valid.data.limit);
	return c.json(tags);
});

export default app;
