import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import AuthorDetailPage from "../../view/pages/author.detail.page.js";

export const detailAuthorSchema = z.object({
	authorId: z.string(),
	videoPage: z.coerce.number().int().min(1).optional().default(1),
	videoSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type DetailAuthorRequest = z.infer<typeof detailAuthorSchema>;

const app = factory.createApp();

app.get("/:authorId", async (c) => {
	const { container } = c.var;
	const [logger, authorRepository, videoRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
		TOKENS.VIDEO_REPOSITORY,
	);

	const authorId = c.req.param("authorId");
	const query = c.req.query();
	const parsedParams = detailAuthorSchema.safeParse({
		authorId,
		videoPage: query.videoPage,
		videoSize: query.videoSize,
	});

	if (!parsedParams.success) {
		logger.warn("Invalid author ID or query params", parsedParams.error);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>無効な作者IDまたはパラメータです</p>
			</div>,
			{ title: "エラー" },
		);
	}

	const { videoPage: rowPage, videoSize } = parsedParams.data;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する

	logger.info("detail author", { authorId, videoPage: rowPage, videoSize });

	// 作者情報を取得
	const author = await authorRepository.get(authorId);
	if (!author) {
		logger.warn(`Author not found: ${authorId}`);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>作者が見つかりませんでした</p>
			</div>,
			{ title: "エラー" },
		);
	}

	// 動画情報を取得
	const videoCount = await videoRepository.countByAuthorId(authorId);
	const videos = await videoRepository.findByAuthorId(
		authorId,
		page,
		videoSize,
	);

	const authorDetail = {
		id: author.id,
		name: author.name,
		urls: author.urls,
		videos: {
			count: videoCount,
			result: videos.map((video) => ({
				id: video.id,
				title: video.contents[0]?.content.name || "",
				thumbnailPath: video.thumbnailPath,
				previewGifPath: video.previewGifPath,
				createdAt: new Date().toISOString(), // TODO: 実際の作成日時を取得
			})),
			page: rowPage,
			size: videoSize,
		},
	};

	return c.render(<AuthorDetailPage authorDetail={authorDetail} />, {
		title: `作者詳細 - ${author.name}`,
	});
});

export default app;
