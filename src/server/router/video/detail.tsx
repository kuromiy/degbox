import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import VideoDetailPage from "../../view/pages/video.detail.page.js";

export const detailVideoSchema = z.object({
	videoId: z.string().uuid(),
});
export type DetailVideoRequest = z.infer<typeof detailVideoSchema>;

const app = factory.createApp();

app.get("/detail/:videoId", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.VIDEO_REPOSITORY,
	);

	const videoId = c.req.param("videoId");
	const parsedParams = detailVideoSchema.safeParse({ videoId });

	if (!parsedParams.success) {
		logger.warn("Invalid video ID", parsedParams.error);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>無効な動画IDです</p>
			</div>,
			{ title: "エラー" },
		);
	}

	logger.info("detail video", { videoId });

	const video = await repository.findById(videoId);
	if (!video) {
		logger.warn(`Video not found: ${videoId}`);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>動画が見つかりませんでした</p>
			</div>,
			{ title: "エラー" },
		);
	}

	return c.render(<VideoDetailPage video={video} />, {
		title: `動画詳細 - ${videoId}`,
	});
});

export default app;
