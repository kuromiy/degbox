import { spawn } from "node:child_process";
import { dirname } from "node:path";
import type { Logger } from "winston";
import type { UserAppSettingRepository } from "../appsetting/user.app.setting.repository.js";
import type { FileSystem } from "../shared/filesystem/index.js";
import type { VideoService } from "./video.service.js";

function createFfmpegNotFoundError(): Error {
	return new Error(
		"ffmpegが見つかりません。PATHに追加するか、設定画面でパスを指定してください。",
	);
}

export class VideoServiceImpl implements VideoService {
	constructor(
		private readonly logger: Logger,
		private readonly fs: FileSystem,
		private readonly userAppSettingRepository: UserAppSettingRepository,
	) {}
	generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.userAppSettingRepository
				.get()
				.then((value) => {
					const ffmpegPath = value.ffmpeg || "ffmpeg";
					const process = spawn(ffmpegPath, [
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
					process.on("error", (err: NodeJS.ErrnoException) => {
						this.logger.error(`createThumbnails process error: ${err.message}`);
						if (err.code === "ENOENT") {
							reject(createFfmpegNotFoundError());
						} else {
							reject(err);
						}
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
								new Error(
									`Process exited with code: ${code}, signal: ${signal}`,
								),
							);
						}
					});
				})
				.catch(reject);
		});
	}
	generateThumbnailGif(inputPath: string, outputPath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.userAppSettingRepository
				.get()
				.then((value) => {
					const ffmpegPath = value.ffmpeg || "ffmpeg";
					const process = spawn(ffmpegPath, [
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
					process.on("error", (err: NodeJS.ErrnoException) => {
						this.logger.error(
							`createThumbnailsGif process error: ${err.message}`,
						);
						if (err.code === "ENOENT") {
							reject(createFfmpegNotFoundError());
						} else {
							reject(err);
						}
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
								new Error(
									`Process exited with code: ${code}, signal: ${signal}`,
								),
							);
						}
					});
				})
				.catch(reject);
		});
	}
	getDuration(videoPath: string): Promise<number> {
		return new Promise((resolve, reject) => {
			this.userAppSettingRepository
				.get()
				.then((value) => {
					const ffprobePath = value.ffprobe || "ffprobe";
					const process = spawn(ffprobePath, [
						"-v",
						"error",
						"-show_entries",
						"format=duration",
						"-of",
						"default=noprint_wrappers=1:nokey=1",
						videoPath,
					]);
					let output = "";
					process.stdout.on("data", (data) => {
						output += data.toString();
					});
					process.stderr.on("data", (data) => {
						this.logger.debug(`getDuration stderr: ${data}`);
					});
					process.on("error", (err: NodeJS.ErrnoException) => {
						this.logger.error(`getDuration process error: ${err.message}`);
						if (err.code === "ENOENT") {
							reject(
								new Error(
									"ffprobeが見つかりません。PATHに追加するか、設定画面でパスを指定してください。",
								),
							);
						} else {
							reject(err);
						}
					});
					process.once("close", (code, signal) => {
						if (code === 0) {
							const duration = Number.parseFloat(output.trim());
							if (Number.isNaN(duration)) {
								reject(new Error("動画の長さを取得できませんでした"));
							} else {
								this.logger.debug(`getDuration: ${duration}s`);
								resolve(duration);
							}
						} else {
							this.logger.error(
								`getDuration failed with code: ${code}, signal: ${signal}`,
							);
							reject(
								new Error(
									`Process exited with code: ${code}, signal: ${signal}`,
								),
							);
						}
					});
				})
				.catch(reject);
		});
	}
	extractFrame(
		videoPath: string,
		timestamp: number,
		outputPath: string,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			this.userAppSettingRepository
				.get()
				.then((value) => {
					const ffmpegPath = value.ffmpeg || "ffmpeg";
					const process = spawn(ffmpegPath, [
						"-y",
						"-ss",
						timestamp.toString(),
						"-i",
						videoPath,
						"-frames:v",
						"1",
						"-q:v",
						"2",
						outputPath,
					]);
					process.stderr.on("data", (data) => {
						this.logger.debug(`extractFrame stderr: ${data}`);
					});
					process.on("error", (err: NodeJS.ErrnoException) => {
						this.logger.error(`extractFrame process error: ${err.message}`);
						if (err.code === "ENOENT") {
							reject(createFfmpegNotFoundError());
						} else {
							reject(err);
						}
					});
					process.once("close", (code, signal) => {
						if (code === 0) {
							this.logger.debug(`extractFrame completed: ${outputPath}`);
							resolve();
						} else {
							this.logger.error(
								`extractFrame failed with code: ${code}, signal: ${signal}`,
							);
							reject(
								new Error(
									`Process exited with code: ${code}, signal: ${signal}`,
								),
							);
						}
					});
				})
				.catch(reject);
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
		const appsetting = await this.userAppSettingRepository.get();
		const ffmpegPath = appsetting.ffmpeg || "ffmpeg";

		return new Promise<void>((resolve, reject) => {
			const stderrChunks: string[] = [];
			const process = spawn(ffmpegPath, [
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
			process.on("error", (err: NodeJS.ErrnoException) => {
				this.logger.error(`createHLS process error: ${err.message}`);
				if (err.code === "ENOENT") {
					reject(createFfmpegNotFoundError());
				} else {
					reject(err);
				}
			});
			process.stdout.on("data", (data) => {
				this.logger.debug(`createHLS stdout: ${data}`);
			});
			process.stderr.on("data", (data) => {
				stderrChunks.push(String(data));
				this.logger.debug(`createHLS stderr: ${data}`);
			});
			process.once("close", (code, signal) => {
				if (code === 0) {
					this.logger.info(`createHLS completed successfully`);
					resolve();
				} else {
					const stderrOutput = stderrChunks.join("");
					this.logger.error(
						`createHLS failed with code: ${code}, signal: ${signal}`,
					);
					this.logger.error(`createHLS stderr output: ${stderrOutput}`);
					reject(
						new Error(`Process exited with code: ${code}, signal: ${signal}`),
					);
				}
			});
		});
	}
}
