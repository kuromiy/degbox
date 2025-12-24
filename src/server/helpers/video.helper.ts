import type { Video } from "../../../features/video/video.model.js";
import { buildFileUrl } from "../config/index.js";

/**
 * Videoのパスを完全URLに変換
 * datasource層から取得した生のパスを、フロントエンドで使える完全URLに変換する
 */
export function convertVideoPathsToUrls(video: Video): Video {
	return {
		...video,
		previewGifPath: buildFileUrl(video.previewGifPath),
		thumbnailPath: buildFileUrl(video.thumbnailPath),
		contents: video.contents.map((c) => ({
			...c,
			videoUrl: buildFileUrl(c.videoUrl),
		})),
	};
}

/**
 * 複数のVideoのパスを完全URLに変換
 */
export function convertVideoArrayPathsToUrls(videos: Video[]): Video[] {
	return videos.map(convertVideoPathsToUrls);
}
