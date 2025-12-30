import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const getAuthorDetailSchema = z.object({
	authorId: z.string(),
	videoPage: z.coerce.number().int().min(1).optional().default(1),
	videoSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type GetAuthorDetailRequest = z.infer<typeof getAuthorDetailSchema>;

export const getAuthorDetailValidator = zodValidator(getAuthorDetailSchema);

export interface AuthorDetailResponse {
	id: string;
	name: string;
	urls: Record<string, string>;
	videos: {
		count: number;
		result: Array<{
			id: string;
			title: string;
			thumbnailPath?: string;
			previewGifPath?: string;
			createdAt: string;
		}>;
		page: number;
		size: number;
	};
}

export async function getAuthorDetail(
	ctx: Context,
	request: GetAuthorDetailRequest,
): Promise<AuthorDetailResponse> {
	const { container } = ctx;
	const [logger, authorRepository, videoRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
		TOKENS.VIDEO_REPOSITORY,
	);

	logger.info("get author detail", request);

	const { authorId, videoPage: rowPage, videoSize } = request;
	const page = rowPage - 1; // 表示は1ベース、処理は0ベースなので-1する

	// 作者情報を取得
	const author = await authorRepository.get(authorId);
	if (!author) {
		throw new Error("Author not found");
	}

	// 動画情報を取得
	const videoCount = await videoRepository.countByAuthorId(authorId);
	const videos = await videoRepository.findByAuthorId(
		authorId,
		page,
		videoSize,
	);

	// レスポンスを構築
	return {
		id: author.id,
		name: author.name,
		urls: author.urls,
		videos: {
			count: videoCount,
			result: videos.map((video) => ({
				id: video.id,
				title: video.contents[0]?.content.name || "",
				thumbnailPath: video.thumbnailPath,
				...(video.previewGifPath
					? { previewGifPath: video.previewGifPath }
					: {}),
				createdAt: new Date().toISOString(), // TODO: 実際の作成日時を取得
			})),
			page: rowPage,
			size: videoSize,
		},
	};
}
