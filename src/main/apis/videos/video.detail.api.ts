import { z } from "zod";
import { ValidError } from "../../../../features/shared/error/valid/index.js";
import { convertVideoPathsToUrls } from "../../../server/helpers/video.helper.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const detailVideoSchema = z.object({
	videoId: z.string().uuid(),
});
export type DetailVideoRequest = z.infer<typeof detailVideoSchema>;

export function detailVideoValidator(args: unknown, ctx: Context) {
	const logger = ctx.container.get(TOKENS.LOGGER);
	const valid = detailVideoSchema.safeParse(args);
	if (!valid.success) {
		const error = new ValidError(valid.error);
		logger.debug("invalid request", { error });
		throw error;
	}
	return valid.data;
}

export async function detailVideo(ctx: Context, request: DetailVideoRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);
	logger.info("detail video", request);
	const { videoId } = request;
	const video = await repository.findById(videoId);
	if (!video) {
		logger.warn(`Video not found: ${videoId}`);
		throw new Error("Video not found");
	}
	// datasource層から取得したパスを完全URLに変換
	return convertVideoPathsToUrls(video);
}
