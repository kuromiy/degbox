import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
	VIDEOS,
	VIDEOS_AUTHORS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Video } from "./video.model.js";
import type { VideoRepository } from "./video.repository.js";

export class VideoDataSource implements VideoRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(video: Video): Promise<Video> {
		// 重複排除ヘルパー関数
		const uniq = <T extends { id: string }>(arr: T[]) =>
			Array.from(new Map(arr.map((x) => [x.id, x])).values());

		const contents = uniq(video.contents);
		const tags = uniq(video.tags);
		const authors = uniq(video.authors);

		// ビデオ本体を保存
		await this.db
			.insert(VIDEOS)
			.values({
				id: video.id,
			})
			.onConflictDoNothing({
				target: VIDEOS.id,
			});

		// 既存の関連を削除
		await this.db
			.delete(VIDEOS_CONTENTS)
			.where(eq(VIDEOS_CONTENTS.videoId, video.id));
		await this.db.delete(VIDEOS_TAGS).where(eq(VIDEOS_TAGS.videoId, video.id));
		await this.db
			.delete(VIDEOS_AUTHORS)
			.where(eq(VIDEOS_AUTHORS.videoId, video.id));

		// コンテンツの関連を保存
		if (contents.length > 0) {
			await this.db.insert(VIDEOS_CONTENTS).values(
				contents.map((content) => ({
					videoId: video.id,
					contentId: content.id,
				})),
			);
		}

		// タグの関連を保存
		if (tags.length > 0) {
			await this.db.insert(VIDEOS_TAGS).values(
				tags.map((tag) => ({
					videoId: video.id,
					tagId: tag.id,
				})),
			);
		}

		// 作者の関連を保存
		if (authors.length > 0) {
			await this.db.insert(VIDEOS_AUTHORS).values(
				authors.map((author) => ({
					videoId: video.id,
					authorId: author.id,
				})),
			);
		}

		return video;
	}
}
