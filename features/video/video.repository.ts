import type { Video } from "./video.model.js";

export interface VideoRepository {
	generateId(): Promise<string>;
	save(video: Video): Promise<Video>;
}
