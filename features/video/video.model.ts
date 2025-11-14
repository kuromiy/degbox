import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";

export type VideoContent = {
	content: Content;
	order: number;
	videoUrl: string; // HLS動画ファイル(index.m3u8)の完全URL
};

export type Video = {
	id: string;
	previewGifPath: string;
	thumbnailPath: string;
	contents: VideoContent[];
	tags: Tag[];
	authors: Author[];
};
