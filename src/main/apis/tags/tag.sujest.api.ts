import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const sujestTagsSchema = z.object({
	value: z.string(),
});
export type SujestTagsRequest = z.infer<typeof sujestTagsSchema>;

export async function sujestTags(ctx: Context, request: SujestTagsRequest) {
	const { container } = ctx;
	const [logger, tagRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.TAG_REPOSITORY,
	);
	logger.info("sujest tags", request);
	const valid = sujestTagsSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}
	const { value } = valid.data;
	if (value.length === 0) {
		return [];
	}
	return await tagRepository.listByName(value);
}
