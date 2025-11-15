import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const detailIllustSchema = z.object({
	illustId: z.string().uuid(),
});
export type DetailIllustRequest = z.infer<typeof detailIllustSchema>;

export async function detailIllust(ctx: Context, request: DetailIllustRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);
	logger.info("detail illust", request);
	const valid = detailIllustSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}
	const { illustId } = valid.data;
	const illust = await repository.findById(illustId);
	if (!illust) {
		logger.warn(`Illust not found: ${illustId}`);
		throw new Error("Illust not found");
	}
	return illust;
}
