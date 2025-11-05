import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { countDistinct, desc, eq, inArray, like } from "drizzle-orm";
import type { Logger } from "winston";
import { buildFileUrl } from "../../src/server/config/index.js";
import {
	AUTHORS,
	CONTENTS,
	TAGS,
	VIDEOS,
	VIDEOS_AUTHORS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Video } from "./video.model.js";
import type { VideoRepository } from "./video.repository.js";

export class VideoDataSource implements VideoRepository {
	constructor(
		private readonly logger: Logger,
		private readonly db: Database,
	) {}

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

	async count(keyword: string): Promise<number> {
		this.logger.info(`VideoDataSource#count call. keyword: ${keyword}`);

		const trimmedKeyword = keyword.trim();

		const query =
			trimmedKeyword !== ""
				? // キーワードがある場合：タグでフィルタリング
					this.db
						.select({ count: countDistinct(VIDEOS.id) })
						.from(VIDEOS)
						.innerJoin(VIDEOS_TAGS, eq(VIDEOS.id, VIDEOS_TAGS.videoId))
						.innerJoin(TAGS, eq(TAGS.id, VIDEOS_TAGS.tagId))
						.where(like(TAGS.name, `%${trimmedKeyword}%`))
				: // キーワードが空の場合：すべてのビデオをカウント
					this.db
						.select({ count: countDistinct(VIDEOS.id) })
						.from(VIDEOS);

		const result = await query.execute();
		this.logger.info("result", result);
		const c = result[0]?.count;
		if (c === undefined || c === null) {
			this.logger.warn("count is undefined");
			throw new Error(`count is undefined`);
		}
		this.logger.info(`count: ${c}`);
		return c;
	}

	async search(keyword: string, page: number, size: number): Promise<Video[]> {
		this.logger.info(
			`VideoDataSource#search. keyword: ${keyword}, page: ${page}, size: ${size}`,
		);

		// パラメータのバリデーション
		if (page < 0 || size <= 0 || size > 100) {
			throw new Error(
				`Invalid pagination parameters: page=${page}, size=${size}`,
			);
		}

		const trimmedKeyword = keyword.trim();
		let videoIdsResult: { id: string }[];

		if (trimmedKeyword !== "") {
			// キーワードがある場合：タグでフィルタリング
			const videoIdQuery = this.db
				.selectDistinct({ id: VIDEOS.id })
				.from(VIDEOS)
				.innerJoin(VIDEOS_TAGS, eq(VIDEOS.id, VIDEOS_TAGS.videoId))
				.innerJoin(TAGS, eq(TAGS.id, VIDEOS_TAGS.tagId))
				.where(like(TAGS.name, `%${trimmedKeyword}%`))
				.orderBy(desc(VIDEOS.id))
				.limit(size)
				.offset(page * size);

			videoIdsResult = await videoIdQuery.execute();
			this.logger.info(`unique videos length: ${videoIdsResult.length}`);

			// キーワードでフィルタリングした結果、該当するビデオがない場合は早期リターン
			if (videoIdsResult.length === 0) {
				this.logger.info("No videos found for keyword, returning empty result");
				return [];
			}
		} else {
			// キーワードが空の場合：すべてのビデオを取得（タグのJOINなし）
			const videoIdQuery = this.db
				.selectDistinct({ id: VIDEOS.id })
				.from(VIDEOS)
				.orderBy(desc(VIDEOS.id))
				.limit(size)
				.offset(page * size);

			videoIdsResult = await videoIdQuery.execute();
			this.logger.info(`unique videos length: ${videoIdsResult.length}`);
		}

		const videoIds = videoIdsResult.map((v) => v.id);

		const tags = await this.db
			.select()
			.from(TAGS)
			.innerJoin(VIDEOS_TAGS, eq(TAGS.id, VIDEOS_TAGS.tagId))
			.where(inArray(VIDEOS_TAGS.videoId, videoIds));

		const contents = await this.db
			.select()
			.from(CONTENTS)
			.innerJoin(VIDEOS_CONTENTS, eq(CONTENTS.id, VIDEOS_CONTENTS.contentId))
			.where(inArray(VIDEOS_CONTENTS.videoId, videoIds));

		const authors = await this.db
			.select()
			.from(AUTHORS)
			.innerJoin(VIDEOS_AUTHORS, eq(AUTHORS.id, VIDEOS_AUTHORS.authorId))
			.where(inArray(VIDEOS_AUTHORS.videoId, videoIds));

		const result = videoIds
			.map((videoId) => {
				const ts = tags
					.filter((t) => t.videos_tags.videoId === videoId)
					.map((t) => t.tags);
				const cs = contents
					.filter((c) => c.videos_contents.videoId === videoId)
					.map((c) => c.contents);
				const as = authors
					.filter((a) => a.videos_authors.videoId === videoId)
					.map((a) => a.authors);

				const firstContent = cs[0];
				if (!firstContent) {
					this.logger.warn(
						`No content found for video: ${videoId}, skipping from results`,
					);
					return null;
				}

				return {
					id: videoId,
					previewGifPath: buildFileUrl(
						posix.join(firstContent.path, "preview.gif"),
					),
					thumbnailPath: buildFileUrl(
						posix.join(firstContent.path, "thumbnail.jpg"),
					),
					tags: ts,
					contents: cs,
					authors: as,
				};
			})
			.filter((v): v is Video => v !== null);
		this.logger.info(`result num: ${result.length}`);
		return result;
	}

	async findById(videoId: string): Promise<Video | null> {
		this.logger.info(`VideoDataSource#findById. videoId: ${videoId}`);

		// ビデオが存在するか確認
		const videoResult = await this.db
			.select()
			.from(VIDEOS)
			.where(eq(VIDEOS.id, videoId))
			.limit(1);

		if (videoResult.length === 0) {
			this.logger.info(`Video not found: ${videoId}`);
			return null;
		}

		// タグを取得
		const tags = await this.db
			.select()
			.from(TAGS)
			.innerJoin(VIDEOS_TAGS, eq(TAGS.id, VIDEOS_TAGS.tagId))
			.where(eq(VIDEOS_TAGS.videoId, videoId));

		// コンテンツを取得
		const contents = await this.db
			.select()
			.from(CONTENTS)
			.innerJoin(VIDEOS_CONTENTS, eq(CONTENTS.id, VIDEOS_CONTENTS.contentId))
			.where(eq(VIDEOS_CONTENTS.videoId, videoId));

		// 作者を取得
		const authors = await this.db
			.select()
			.from(AUTHORS)
			.innerJoin(VIDEOS_AUTHORS, eq(AUTHORS.id, VIDEOS_AUTHORS.authorId))
			.where(eq(VIDEOS_AUTHORS.videoId, videoId));

		const firstContent = contents[0]?.contents;
		if (!firstContent) {
			this.logger.warn(
				`No content found for video: ${videoId}, treating as non-existent`,
			);
			return null;
		}

		return {
			id: videoId,
			previewGifPath: buildFileUrl(
				posix.join(firstContent.path, "preview.gif"),
			),
			thumbnailPath: buildFileUrl(
				posix.join(firstContent.path, "thumbnail.jpg"),
			),
			tags: tags.map((t) => t.tags),
			contents: contents.map((c) => c.contents),
			authors: authors.map((a) => a.authors),
		};
	}
}
