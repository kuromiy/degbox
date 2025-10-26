import { join } from "node:path";
import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";
import type { VideoRepository } from "./video.repository.js";
import type { VideoService } from "./video.service.js";

export class VideoAction {
	constructor(
		private readonly repository: VideoRepository,
		private readonly service: VideoService,
	) {}

	async register(tags: Tag[], content: Content, author?: Author) {
		// ビデオエンティティ作成
		const id = await this.repository.generateId();

		// 各種メディアファイル生成（同じディレクトリ内）
		const fullPath = join(content.path, content.name);
		const outputDir = content.path; // original.mp4と同じディレクトリ

		// HLS生成
		await this.service.generateHls(
			fullPath,
			join(outputDir, "segment_%03d.ts"),
			join(outputDir, "index.m3u8"),
		);

		// サムネイル生成
		await this.service.generateThumbnail(
			fullPath,
			join(outputDir, "thumbnail.jpg"),
		);

		// アニメーションGIF生成
		await this.service.generateThumbnailGif(
			fullPath,
			join(outputDir, "preview.gif"),
		);

		const video = {
			id,
			tags,
			previewGifPath: join(outputDir, "preview.gif"),
			thumbnailPath: join(outputDir, "thumbnail.jpg"),
			contents: [content],
			authors: author ? [author] : [],
		};

		// すべてのメディア生成が成功した後にビデオを保存
		return await this.repository.save(video);
	}
}
