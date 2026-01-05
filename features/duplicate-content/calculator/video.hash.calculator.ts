import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { Content } from "../../content/content.model.js";
import type { FileSystem } from "../../shared/filesystem/index.js";
import type { VideoService } from "../../video/video.service.js";
import type { ContentHash } from "../content.hash.model.js";
import type { HashService } from "../hash.service.js";
import type { HashCalculator } from "./hash.calculator.js";

// 最小1秒間隔
const MIN_INTERVAL = 1;

export class VideoHashCalculator implements HashCalculator {
	constructor(
		private readonly hashService: HashService,
		private readonly projectPath: string,
		private readonly videoService: VideoService,
		private readonly fs: FileSystem,
	) {}

	async calculate(content: Content): Promise<ContentHash[]> {
		const filePath = join(this.projectPath, content.path, content.name);
		const results: ContentHash[] = [];
		results.push({
			id: randomUUID(),
			type: "sha256",
			value: await this.hashService.calcSha256(filePath),
			contentId: content.id,
		});

		// 動画から5枚画像としてとりだす
		// 最低1枚で、１秒間隔で最大5枚取り出す
		const duration = await this.videoService.getDuration(filePath);
		const maxFrame = Math.floor(duration / MIN_INTERVAL);
		const frameCount = Math.min(5, Math.max(1, maxFrame));
		// 確定した画像数からどの位置から取り出すか秒数を決定
		const positions: number[] = [];
		const interval = duration / (frameCount + 1);
		for (let i = 1; i <= frameCount; i++) {
			positions.push(interval * i);
		}
		// 作業に一時ディレクトリ作成
		const tempDir = join(this.projectPath, "temp", randomUUID());
		await this.fs.createDirectory(tempDir);

		for (const timestamp of positions) {
			const framePath = join(tempDir, `frame_${timestamp}.jpg`);
			await this.videoService.extractFrame(filePath, timestamp, framePath);

			results.push({
				id: randomUUID(),
				type: "dhash",
				value: await this.hashService.calcDhash(framePath),
				contentId: content.id,
				metadata: {
					source: "scene",
					timestamp,
				},
			});
		}

		// 一時ディレクトリ削除
		await this.fs.deleteDirectory(tempDir);

		return results;
	}
}
