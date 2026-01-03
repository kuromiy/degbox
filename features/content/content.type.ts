export type ContentType = "image" | "video" | "audio";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "flac", "aac", "ogg", "m4a"];

export function detectContentType(path: string): ContentType {
	const ext = path.toLowerCase().split(".").pop() ?? "";

	if (IMAGE_EXTENSIONS.includes(ext)) return "image";
	if (VIDEO_EXTENSIONS.includes(ext)) return "video";
	if (AUDIO_EXTENSIONS.includes(ext)) return "audio";

	throw new Error(`Unsupported file type: ${ext}`);
}
