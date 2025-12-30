import { z } from "zod";
import { ValidError } from "../../../../features/shared/error/valid/index.js";
import { convertIllustContentPathsToUrls } from "../../../server/helpers/illust.helper.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const detailIllustSchema = z.object({
	illustId: z.string().uuid(),
});
export type DetailIllustRequest = z.infer<typeof detailIllustSchema>;

export function detailIllustValidator(args: unknown, ctx: Context) {
	const logger = ctx.container.get(TOKENS.LOGGER);
	const valid = detailIllustSchema.safeParse(args);
	if (!valid.success) {
		const error = new ValidError(valid.error);
		logger.debug("invalid request", { error });
		throw error;
	}
	return valid.data;
}

export async function detailIllust(ctx: Context, request: DetailIllustRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);
	logger.info("detail illust", request);
	const { illustId } = request;
	const illust = await repository.findById(illustId);
	if (!illust) {
		logger.warn(`Illust not found: ${illustId}`);
		throw new Error("Illust not found");
	}
	// datasource層から取得したパスを完全URLに変換
	return convertIllustContentPathsToUrls(illust);
}
