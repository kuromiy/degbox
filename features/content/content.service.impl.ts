import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";
import type { FileSystem } from "../shared/filesystem/index.js";
import type { ContentService } from "./content.service.js";

type MediaType = "videos" | "images" | "others";
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

export class ContentServiceImpl implements ContentService {
	private readonly baseContentPath: string;

	constructor(
		private readonly fs: FileSystem,
		baseContentPath = "content",
	) {
		this.baseContentPath = resolve(baseContentPath);
	}

	async calcHash(path: string): Promise<string> {
		return await new Promise((resolve, reject) => {
			const hash = createHash("sha256");
			const rs = createReadStream(path);
			rs.on("data", (chunk) => hash.update(chunk));
			rs.on("end", () => resolve(hash.digest("hex")));
			rs.on("error", reject);
		});
	}

	async moveToDestination(
		sourcePath: string,
		contentId: string,
	): Promise<string> {
		// UUIDのバリデーション
		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				contentId,
			)
		) {
			throw new Error(`Invalid UUID: ${contentId}`);
		}

		const mediaType = this.getMediaType(sourcePath);
		const dir1 = contentId.slice(0, 2);
		const dir2 = contentId.slice(2, 4);
		const ext = extname(sourcePath).toLowerCase();

		// コンテンツIDごとのフォルダを作成
		const destDir = join(
			this.baseContentPath,
			mediaType,
			dir1,
			dir2,
			contentId,
		);
		await this.fs.createDirectory(destDir);

		// original.{ext} という名前で保存
		const destPath = join(destDir, `original${ext}`);
		await this.fs.move(sourcePath, destPath);

		return destPath;
	}

	async deleteContent(contentPath: string, contentName: string): Promise<void> {
		const fullPath = join(this.baseContentPath, contentPath, contentName);
		await this.fs.delete(fullPath);
	}

	private getMediaType(filePath: string): MediaType {
		const ext = extname(filePath).toLowerCase();
		if (MEDIA_TYPE_EXTENSIONS.videos.has(ext)) {
			return "videos";
		}
		if (MEDIA_TYPE_EXTENSIONS.images.has(ext)) {
			return "images";
		}
		return "others";
	}
}
