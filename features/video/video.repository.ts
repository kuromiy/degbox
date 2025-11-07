import type { Video } from "./video.model.js";

export interface VideoRepository {
	generateId(): Promise<string>;
	save(video: Video): Promise<Video>;
	count(keyword: string): Promise<number>;
	search(keyword: string, page: number, size: number): Promise<Video[]>;
	findById(videoId: string): Promise<Video | null>;
	countByAuthorId(authorId: string): Promise<number>;
	findByAuthorId(
		authorId: string,
		page: number,
		size: number,
	): Promise<Video[]>;
}
