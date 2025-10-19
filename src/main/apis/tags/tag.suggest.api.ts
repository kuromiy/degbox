import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const suggestTagsSchema = z.object({
	value: z.string(),
});
export type SuggestTagsRequest = z.infer<typeof suggestTagsSchema>;

export async function suggestTags(ctx: Context, request: SuggestTagsRequest) {
	const { container } = ctx;
	const [logger, tagRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_REPOSITORY,
	);
	logger.info("suggest tags", request);
	const valid = suggestTagsSchema.safeParse(request);
	if (!valid.success) {
		logger.warn(
			`Invalid request: ${valid.error?.message ?? "validation failed"}`,
		);
		throw new Error("Invalid request");
	}
	const { value } = valid.data;
	const query = value.trim();
	if (query.length === 0) {
		return [];
	}
	return await tagRepository.listByName(query);
}
