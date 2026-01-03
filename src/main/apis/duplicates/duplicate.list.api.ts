import { posix } from "node:path";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

const FILE_SERVER_URL = process.env.FILE_SERVER_URL || "http://localhost:8080";

function buildFileUrl(path: string): string {
	const baseUrl = FILE_SERVER_URL.replace(/\/$/, "");
	const normalizedPath = path.replace(/^\//, "");
	return `${baseUrl}/file/${normalizedPath}`;
}

export async function listDuplicateGroups(ctx: Context) {
	const { container } = ctx;
	const [logger, duplicateRepository, contentRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
		TOKENS.CONTENT_REPOSITORY,
	);
	logger.info("list duplicate groups");

	const groups = await duplicateRepository.findAll();

	// 各グループの代表サムネイル用に最初のコンテンツのpathを取得し、URLに変換
	const groupsWithThumbnail = await Promise.all(
		groups.map(async (group) => {
			const firstItem = group.items[0];
			if (!firstItem) {
				return { ...group, thumbnailPath: undefined };
			}
			const content = await contentRepository.findById(firstItem.contentId);
			if (!content) {
				return { ...group, thumbnailPath: undefined };
			}
			// 動画の場合はthumbnail.jpg、画像の場合はオリジナルファイルを使用
			const thumbnailFile =
				content.type === "video" ? "thumbnail.jpg" : content.name;
			const thumbnailPath = buildFileUrl(
				posix.join(content.path, thumbnailFile),
			);
			return { ...group, thumbnailPath };
		}),
	);

	return { groups: groupsWithThumbnail };
}
