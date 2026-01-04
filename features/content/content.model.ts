import type { Branded } from "../shared/path/types.js";
import type { ContentType } from "./content.type.js";

/** コンテンツのID (UUID) */
export type ContentId = Branded<string, "ContentId">;
export function asContentId(value: string): ContentId {
	// UUIDのバリデーション
	if (
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			value,
		)
	) {
		throw new Error(`Invalid UUID: ${value}`);
	}
	return value as ContentId;
}

/** コンテンツのパス */
export type ContentPath = Branded<string, "ContentPath">;

export type Content = {
	id: ContentId;
	path: string;
	name: string;
	type: ContentType;
	// hash: string;
	// createdAt: Date;
	// updatedAt: Date;
};

/** メディアタイプ（ディレクトリ名として使用） */
export type MediaType = "videos" | "images" | "others";

const MEDIA_TYPE_EXTENSIONS = {
	videos: new Set([
		".mp4",
		".avi",
		".mkv",
		".mov",
		".wmv",
		".flv",
		".webm",
		".m4v",
		".3gp",
		".ogv",
	]),
	images: new Set([
		".jpg",
		".jpeg",
		".png",
		".gif",
		".bmp",
		".webp",
		".tiff",
		".svg",
		".ico",
		".avif",
	]),
};

/** 拡張子からメディアタイプを判定 */
export function getMediaType(filePath: string): MediaType {
	const ext = filePath.toLowerCase().split(".").pop() ?? "";
	const extWithDot = `.${ext}`;
	if (MEDIA_TYPE_EXTENSIONS.videos.has(extWithDot)) {
		return "videos";
	}
	if (MEDIA_TYPE_EXTENSIONS.images.has(extWithDot)) {
		return "images";
	}
	return "others";
}

/** ContentIdから相対パスを生成（DB保存用） */
export function buildContentPath(
	contentId: ContentId,
	mediaType: MediaType,
): string {
	const dir1 = contentId.slice(0, 2);
	const dir2 = contentId.slice(2, 4);
	return `${mediaType}/${dir1}/${dir2}/${contentId}`;
}
