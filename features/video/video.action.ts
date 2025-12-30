import { join, posix } from "node:path";
import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";
import type { VideoRepository } from "./video.repository.js";
import type { VideoService } from "./video.service.js";

export class VideoAction {
	constructor(
		private readonly repository: VideoRepository,
		private readonly service: VideoService,
		private readonly projectPath: string,
	) {}

	async register(tags: Tag[], contents: Content[], authors?: Author[]) {
		// ビデオエンティティ作成
		const id = await this.repository.generateId();

		// コンテンツチェック
		if (contents.length === 0) {
			throw new Error("At least one content is required");
		}

		// すべてのコンテンツに対してHLS生成
		for (const content of contents) {
			const fullPath = join(this.projectPath, content.path, content.name);
			const outputDir = join(this.projectPath, content.path);

			// HLS生成（hlsサブフォルダに出力）
			await this.service.generateHls(
				fullPath,
				join(outputDir, "hls", "segment_%03d.ts"),
				join(outputDir, "index.m3u8"),
			);
		}

		// 最初のコンテンツからサムネイルとGIF生成
		const firstContent = contents[0] as Content;
		const firstFullPath = join(
			this.projectPath,
			firstContent.path,
			firstContent.name,
		);
		const firstOutputDir = join(this.projectPath, firstContent.path);

		// サムネイル生成
		await this.service.generateThumbnail(
			firstFullPath,
			join(firstOutputDir, "thumbnail.jpg"),
		);

		// アニメーションGIF生成
		await this.service.generateThumbnailGif(
			firstFullPath,
			join(firstOutputDir, "preview.gif"),
		);

		// コンテンツに並び順とvideoURLを付与
		const videoContents = contents.map((content, index) => ({
			content,
			order: index,
			videoUrl: posix.join(content.path, "index.m3u8"),
		}));

		const video = {
			id,
			tags,
			previewGifPath: join(firstOutputDir, "preview.gif"),
			thumbnailPath: join(firstOutputDir, "thumbnail.jpg"),
			contents: videoContents,
			authors: authors || [],
		};

		// すべてのメディア生成が成功した後にビデオを保存
		return await this.repository.save(video);
	}
}
