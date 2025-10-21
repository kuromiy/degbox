export interface VideoService {
	generateHls(
		inputPath: string,
		outputTsPath: string,
		outputM3u8Path: string,
	): Promise<void>;
	generateThumbnail(inputPath: string, outputPath: string): Promise<void>;
	generateThumbnailGif(inputPath: string, outputPath: string): Promise<void>;
}
