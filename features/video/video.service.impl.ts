import { spawn } from "node:child_process";
import { dirname } from "node:path";
import type { Logger } from "winston";
import type { FileSystem } from "../shared/filesystem/index.js";
import type { VideoService } from "./video.service.js";

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";

export class VideoServiceImpl implements VideoService {
	constructor(
		private readonly logger: Logger,
		private readonly fs: FileSystem,
	) {}
	generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const process = spawn(FFMPEG_PATH, [
				"-i",
				inputPath, // 入力動画ファイル
				"-vf",
				"thumbnail=1000", // ビデオフィルタ: 1000フレームごとに最も代表的なフレームを選択
				"-frames:v",
				"1", // 出力するフレーム数を1枚に制限
				outputPath, // 出力画像ファイルパス
			]);
			// このイベントでログを出力していると連続処理しているとハングアップして処理が止まるかも？
			process.stdout.on("data", (data) => {
				this.logger.debug(`createThumbnails stdout: ${data}`);
			});
			process.stderr.on("data", (data) => {
				this.logger.debug(`createThumbnails stderr: ${data}`);
			});

			// 対象動画ファイルが壊れているとこのイベントが発生
			process.on("error", (err) => {
				this.logger.error(`createThumbnails process error: ${err.message}`);
				reject(err);
			});

			process.stdout.on("end", () => {
				this.logger.debug("createThumbnails stdout ended");
			});

			process.stderr.on("end", () => {
				this.logger.debug("createThumbnails stderr ended");
			});

			// 出力ファイル名に拡張子がないとcode: 1, signal: null で終了するためエラー
			process.once("close", (code, signal) => {
				if (code === 0) {
					this.logger.info(`createThumbnails completed successfully`);
					resolve();
				} else {
					this.logger.error(
						`createThumbnails failed with code: ${code}, signal: ${signal}`,
					);
					reject(
						new Error(`Process exited with code: ${code}, signal: ${signal}`),
					);
				}
			});
		});
	}
	generateThumbnailGif(inputPath: string, outputPath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const process = spawn(FFMPEG_PATH, [
				"-y",
				"-i",
				inputPath, // 入力動画ファイルパス
				"-r",
				"20", // フレームレート: 20fps(1秒間に20フレーム)
				"-ss",
				"0", // 開始地点: 0秒から開始
				"-t",
				"5", // 切り取り時間: 5秒間のクリップを作成
				outputPath, // 出力GIFファイルパス
			]);
			process.on("error", (err) => {
				this.logger.error(`createThumbnailsGif process error: ${err.message}`);
				reject(err);
			});
			process.stdout.on("data", (data) => {
				this.logger.debug(`createThumbnailsGif stdout: ${data}`);
			});
			process.stderr.on("data", (data) => {
				this.logger.debug(`createThumbnailsGif stderr: ${data}`);
			});
			process.once("close", (code, signal) => {
				if (code === 0) {
					this.logger.info(`createThumbnailsGif completed successfully`);
					resolve();
				} else {
					this.logger.error(
						`createThumbnailsGif failed with code: ${code}, signal: ${signal}`,
					);
					reject(
						new Error(`Process exited with code: ${code}, signal: ${signal}`),
					);
				}
			});
		});
	}
	async generateHls(
		inputPath: string,
		outputTsPath: string,
		outputM3u8Path: string,
	): Promise<void> {
		// hlsフォルダを作成（存在しない場合）
		const segmentDir = dirname(outputTsPath);
		await this.fs.createDirectory(segmentDir);

		return new Promise<void>((resolve, reject) => {
			const process = spawn(FFMPEG_PATH, [
				"-y",
				"-i",
				inputPath, // 入力動画ファイルパス
				"-c:v",
				"copy", // ビデオコーデック: コピー（再エンコードしない）
				"-c:a",
				"copy", // オーディオコーデック: コピー（再エンコードしない）
				"-f",
				"hls", // 出力フォーマット: HLS（HTTP Live Streaming）
				"-hls_time",
				"15", // セグメント長: 各tsファイルを15秒ごとに分割
				"-hls_playlist_type",
				"vod", // プレイリストタイプ: VOD（Video On Demand）用
				"-hls_base_url",
				`hls/`, // セグメントファイルのベースURL
				"-hls_segment_filename",
				outputTsPath, // セグメントファイル名のパターン（例: segment_%03d.ts）
				outputM3u8Path, // 出力プレイリストファイル（.m3u8）パス
			]);
			process.on("error", (err) => {
				this.logger.error(`createHLS process error: ${err.message}`);
				reject(err);
			});
			process.stdout.on("data", (data) => {
				this.logger.debug(`createHLS stdout: ${data}`);
			});
			process.stderr.on("data", (data) => {
				this.logger.debug(`createHLS stderr: ${data}`);
			});
			process.once("close", (code, signal) => {
				if (code === 0) {
					this.logger.info(`createHLS completed successfully`);
					resolve();
				} else {
					this.logger.error(
						`createHLS failed with code: ${code}, signal: ${signal}`,
					);
					reject(
						new Error(`Process exited with code: ${code}, signal: ${signal}`),
					);
				}
			});
		});
	}
}
