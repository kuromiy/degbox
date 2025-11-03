import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const detailVideoSchema = z.object({
	videoId: z.string().uuid(),
});
export type DetailVideoRequest = z.infer<typeof detailVideoSchema>;

export async function detailVideo(ctx: Context, request: DetailVideoRequest) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);
	logger.info("detail video", request);
	const valid = detailVideoSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}
	const { videoId } = valid.data;
	const video = await repository.findById(videoId);
	if (!video) {
		logger.warn(`Video not found: ${videoId}`);
		throw new Error("Video not found");
	}
	return video;
}
