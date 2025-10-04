import type { Video } from "./video.model.ts";

export interface VideoRepository {
	generateId(): Promise<string>;
	save(video: Video): Promise<Video>;
}
