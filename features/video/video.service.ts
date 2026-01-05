export interface VideoService {
	generateHls(
		inputPath: string,
		outputTsPath: string,
		outputM3u8Path: string,
	): Promise<void>;
	generateThumbnail(inputPath: string, outputPath: string): Promise<void>;
	generateThumbnailGif(inputPath: string, outputPath: string): Promise<void>;
	/**
	 * 動画の長さを取得する
	 * @param videoPath 動画ファイルのパス
	 * @returns 動画の長さ（秒）
	 */
	getDuration(videoPath: string): Promise<number>;
	/**
	 * 指定した秒数のフレームを抽出する
	 * @param videoPath 動画ファイルのパス
	 * @param timestamp 抽出する秒数
	 * @param outputPath 出力ファイルのパス
	 */
	extractFrame(
		videoPath: string,
		timestamp: number,
		outputPath: string,
	): Promise<void>;
}
