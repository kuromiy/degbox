import { posix } from "node:path";
import type { Illust } from "../../../features/illust/illust.model.js";
import { buildFileUrl } from "../config/index.js";

/**
 * Illustのcontentsのパスを完全URLに変換
 * datasource層から取得した生のパスを、フロントエンドで使える完全URLに変換する
 */
export function convertIllustContentPathsToUrls(illust: Illust): Illust {
	return {
		...illust,
		contents: illust.contents.map((c) => ({
			...c,
			content: {
				...c.content,
				path: buildFileUrl(posix.join(c.content.path, c.content.name)),
			},
		})),
	};
}

/**
 * 複数のIllustのパスを完全URLに変換
 */
export function convertIllustArrayContentPathsToUrls(
	illusts: Illust[],
): Illust[] {
	return illusts.map(convertIllustContentPathsToUrls);
}
