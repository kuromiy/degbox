import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { asc, countDistinct, desc, eq, inArray, like } from "drizzle-orm";
import type { Logger } from "winston";
import { buildFileUrl } from "../../src/server/config/index.js";
import {
	AUTHORS,
	CONTENTS,
	ILLUSTS,
	ILLUSTS_AUTHORS,
	ILLUSTS_CONTENTS,
	ILLUSTS_TAGS,
	TAGS,
} from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Illust } from "./illust.model.js";
import type { IllustRepository } from "./illust.repository.js";

export class IllustDataSource implements IllustRepository {
	constructor(
		private readonly logger: Logger,
		private readonly db: Database,
	) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(illust: Illust): Promise<Illust> {
		// 重複排除ヘルパー関数
		const uniq = <T extends { id: string }>(arr: T[]) =>
			Array.from(new Map(arr.map((x) => [x.id, x])).values());

		const tags = uniq(illust.tags);
		const authors = uniq(illust.authors);

		// イラスト本体を保存
		await this.db
			.insert(ILLUSTS)
			.values({
				id: illust.id,
			})
			.onConflictDoNothing({
				target: ILLUSTS.id,
			});

		// 既存の関連を削除
		await this.db
			.delete(ILLUSTS_CONTENTS)
			.where(eq(ILLUSTS_CONTENTS.illustId, illust.id));
		await this.db
			.delete(ILLUSTS_TAGS)
			.where(eq(ILLUSTS_TAGS.illustId, illust.id));
		await this.db
			.delete(ILLUSTS_AUTHORS)
			.where(eq(ILLUSTS_AUTHORS.illustId, illust.id));

		// コンテンツの関連を保存（並び順付き）
		if (illust.contents.length > 0) {
			await this.db.insert(ILLUSTS_CONTENTS).values(
				illust.contents.map((illustContent) => ({
					illustId: illust.id,
					contentId: illustContent.content.id,
					order: illustContent.order,
				})),
			);
		}

		// タグの関連を保存
		if (tags.length > 0) {
			await this.db.insert(ILLUSTS_TAGS).values(
				tags.map((tag) => ({
					illustId: illust.id,
					tagId: tag.id,
				})),
			);
		}

		// 作者の関連を保存
		if (authors.length > 0) {
			await this.db.insert(ILLUSTS_AUTHORS).values(
				authors.map((author) => ({
					illustId: illust.id,
					authorId: author.id,
				})),
			);
		}

		return illust;
	}

	async count(keyword?: string): Promise<number> {
		this.logger.info(
			`IllustDataSource#count call. keyword: ${keyword ?? "(none)"}`,
		);

		const trimmedTag = keyword?.trim();

		const query =
			trimmedTag && trimmedTag !== ""
				? // タグがある場合：タグで前方一致フィルタリング
					this.db
						.select({ count: countDistinct(ILLUSTS.id) })
						.from(ILLUSTS)
						.innerJoin(ILLUSTS_TAGS, eq(ILLUSTS.id, ILLUSTS_TAGS.illustId))
						.innerJoin(TAGS, eq(TAGS.id, ILLUSTS_TAGS.tagId))
						.where(like(TAGS.name, `${trimmedTag}%`))
				: // タグが空の場合：すべてのイラストをカウント
					this.db
						.select({ count: countDistinct(ILLUSTS.id) })
						.from(ILLUSTS);

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

	async search(
		keyword: string | undefined,
		sortBy: string,
		order: string,
		page: number,
		limit: number,
	): Promise<Illust[]> {
		this.logger.info(
			`IllustDataSource#search. keyword: ${keyword ?? "(none)"}, sortBy: ${sortBy}, order: ${order}, page: ${page}, limit: ${limit}`,
		);

		// パラメータのバリデーション
		if (page < 0 || limit <= 0 || limit > 100) {
			throw new Error(
				`Invalid pagination parameters: page=${page}, limit=${limit}`,
			);
		}

		const trimmedTag = keyword?.trim();

		// sortByパラメータのバリデーションとカラム選択
		const sortColumn =
			sortBy === "updatedAt"
				? ILLUSTS.updatedAt
				: sortBy === "id"
					? ILLUSTS.id
					: ILLUSTS.createdAt; // デフォルトはcreatedAt

		// orderパラメータのバリデーション
		const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

		let illustIdsResult: { id: string }[];

		if (trimmedTag && trimmedTag !== "") {
			// タグがある場合：タグで前方一致フィルタリング
			const illustIdQuery = this.db
				.selectDistinct({ id: ILLUSTS.id })
				.from(ILLUSTS)
				.innerJoin(ILLUSTS_TAGS, eq(ILLUSTS.id, ILLUSTS_TAGS.illustId))
				.innerJoin(TAGS, eq(TAGS.id, ILLUSTS_TAGS.tagId))
				.where(like(TAGS.name, `${trimmedTag}%`))
				.orderBy(orderBy)
				.limit(limit)
				.offset(page * limit);

			illustIdsResult = await illustIdQuery.execute();
			this.logger.info(`unique illusts length: ${illustIdsResult.length}`);

			// タグでフィルタリングした結果、該当するイラストがない場合は早期リターン
			if (illustIdsResult.length === 0) {
				this.logger.info("No illusts found for tag, returning empty result");
				return [];
			}
		} else {
			// タグが空の場合：すべてのイラストを取得
			const illustIdQuery = this.db
				.selectDistinct({ id: ILLUSTS.id })
				.from(ILLUSTS)
				.orderBy(orderBy)
				.limit(limit)
				.offset(page * limit);

			illustIdsResult = await illustIdQuery.execute();
			this.logger.info(`unique illusts length: ${illustIdsResult.length}`);
		}

		const illustIds = illustIdsResult.map((v) => v.id);

		const tags = await this.db
			.select()
			.from(TAGS)
			.innerJoin(ILLUSTS_TAGS, eq(TAGS.id, ILLUSTS_TAGS.tagId))
			.where(inArray(ILLUSTS_TAGS.illustId, illustIds));

		const contents = await this.db
			.select()
			.from(CONTENTS)
			.innerJoin(ILLUSTS_CONTENTS, eq(CONTENTS.id, ILLUSTS_CONTENTS.contentId))
			.where(inArray(ILLUSTS_CONTENTS.illustId, illustIds))
			.orderBy(asc(ILLUSTS_CONTENTS.order));

		const authors = await this.db
			.select()
			.from(AUTHORS)
			.innerJoin(ILLUSTS_AUTHORS, eq(AUTHORS.id, ILLUSTS_AUTHORS.authorId))
			.where(inArray(ILLUSTS_AUTHORS.illustId, illustIds));

		const result = illustIds
			.map((illustId) => {
				const ts = tags
					.filter((t) => t.illusts_tags.illustId === illustId)
					.map((t) => t.tags);
				const cs = contents
					.filter((c) => c.illusts_contents.illustId === illustId)
					.map((c) => ({
						content: {
							...c.contents,
							path: buildFileUrl(posix.join(c.contents.path, c.contents.name)),
						},
						order: c.illusts_contents.order,
					}));
				const as = authors
					.filter((a) => a.illusts_authors.illustId === illustId)
					.map((a) => ({
						id: a.authors.id,
						name: a.authors.name,
						urls: a.authors.urls,
					}));

				if (cs.length === 0) {
					this.logger.warn(
						`No content found for illust: ${illustId}, skipping from results`,
					);
					return null;
				}

				return {
					id: illustId,
					tags: ts,
					contents: cs,
					authors: as,
				};
			})
			.filter((v): v is Illust => v !== null);
		this.logger.info(`result num: ${result.length}`);
		return result;
	}

	async findById(illustId: string): Promise<Illust | null> {
		this.logger.info(`IllustDataSource#findById. illustId: ${illustId}`);

		// イラストが存在するか確認
		const illustResult = await this.db
			.select()
			.from(ILLUSTS)
			.where(eq(ILLUSTS.id, illustId))
			.limit(1);

		if (illustResult.length === 0) {
			this.logger.info(`Illust not found: ${illustId}`);
			return null;
		}

		// タグを取得
		const tags = await this.db
			.select()
			.from(TAGS)
			.innerJoin(ILLUSTS_TAGS, eq(TAGS.id, ILLUSTS_TAGS.tagId))
			.where(eq(ILLUSTS_TAGS.illustId, illustId));

		// コンテンツを取得（並び順でソート）
		const contents = await this.db
			.select()
			.from(CONTENTS)
			.innerJoin(ILLUSTS_CONTENTS, eq(CONTENTS.id, ILLUSTS_CONTENTS.contentId))
			.where(eq(ILLUSTS_CONTENTS.illustId, illustId))
			.orderBy(asc(ILLUSTS_CONTENTS.order));

		// 作者を取得
		const authors = await this.db
			.select()
			.from(AUTHORS)
			.innerJoin(ILLUSTS_AUTHORS, eq(AUTHORS.id, ILLUSTS_AUTHORS.authorId))
			.where(eq(ILLUSTS_AUTHORS.illustId, illustId));

		if (contents.length === 0) {
			this.logger.warn(
				`No content found for illust: ${illustId}, treating as non-existent`,
			);
			return null;
		}

		return {
			id: illustId,
			tags: tags.map((t) => t.tags),
			contents: contents.map((c) => ({
				content: {
					...c.contents,
					path: buildFileUrl(posix.join(c.contents.path, c.contents.name)),
				},
				order: c.illusts_contents.order,
			})),
			authors: authors.map((a) => ({
				id: a.authors.id,
				name: a.authors.name,
				urls: a.authors.urls,
			})),
		};
	}

	async countByAuthorId(authorId: string): Promise<number> {
		this.logger.info(`IllustDataSource#countByAuthorId. authorId: ${authorId}`);

		const result = await this.db
			.select({ count: countDistinct(ILLUSTS.id) })
			.from(ILLUSTS)
			.innerJoin(ILLUSTS_AUTHORS, eq(ILLUSTS.id, ILLUSTS_AUTHORS.illustId))
			.where(eq(ILLUSTS_AUTHORS.authorId, authorId))
			.execute();

		const c = result[0]?.count;
		if (c === undefined || c === null) {
			this.logger.warn("count is undefined");
			return 0;
		}
		this.logger.info(`count: ${c}`);
		return c;
	}

	async findByAuthorId(
		authorId: string,
		page: number,
		size: number,
	): Promise<Illust[]> {
		this.logger.info(
			`IllustDataSource#findByAuthorId. authorId: ${authorId}, page: ${page}, size: ${size}`,
		);

		// パラメータのバリデーション
		if (page < 0 || size <= 0 || size > 100) {
			throw new Error(
				`Invalid pagination parameters: page=${page}, size=${size}`,
			);
		}

		// 作者に紐づいたイラストIDを取得
		const illustIdQuery = this.db
			.selectDistinct({ id: ILLUSTS.id })
			.from(ILLUSTS)
			.innerJoin(ILLUSTS_AUTHORS, eq(ILLUSTS.id, ILLUSTS_AUTHORS.illustId))
			.where(eq(ILLUSTS_AUTHORS.authorId, authorId))
			.orderBy(desc(ILLUSTS.id))
			.limit(size)
			.offset(page * size);

		const illustIdsResult = await illustIdQuery.execute();
		this.logger.info(`unique illusts length: ${illustIdsResult.length}`);

		// 該当するイラストがない場合は早期リターン
		if (illustIdsResult.length === 0) {
			this.logger.info("No illusts found for author, returning empty result");
			return [];
		}

		const illustIds = illustIdsResult.map((v) => v.id);

		const tags = await this.db
			.select()
			.from(TAGS)
			.innerJoin(ILLUSTS_TAGS, eq(TAGS.id, ILLUSTS_TAGS.tagId))
			.where(inArray(ILLUSTS_TAGS.illustId, illustIds));

		const contents = await this.db
			.select()
			.from(CONTENTS)
			.innerJoin(ILLUSTS_CONTENTS, eq(CONTENTS.id, ILLUSTS_CONTENTS.contentId))
			.where(inArray(ILLUSTS_CONTENTS.illustId, illustIds))
			.orderBy(asc(ILLUSTS_CONTENTS.order));

		const authors = await this.db
			.select()
			.from(AUTHORS)
			.innerJoin(ILLUSTS_AUTHORS, eq(AUTHORS.id, ILLUSTS_AUTHORS.authorId))
			.where(inArray(ILLUSTS_AUTHORS.illustId, illustIds));

		const result = illustIds
			.map((illustId) => {
				const ts = tags
					.filter((t) => t.illusts_tags.illustId === illustId)
					.map((t) => t.tags);
				const cs = contents
					.filter((c) => c.illusts_contents.illustId === illustId)
					.map((c) => ({
						content: {
							...c.contents,
							path: buildFileUrl(posix.join(c.contents.path, c.contents.name)),
						},
						order: c.illusts_contents.order,
					}));
				const as = authors
					.filter((a) => a.illusts_authors.illustId === illustId)
					.map((a) => ({
						id: a.authors.id,
						name: a.authors.name,
						urls: a.authors.urls,
					}));

				if (cs.length === 0) {
					this.logger.warn(
						`No content found for illust: ${illustId}, skipping from results`,
					);
					return null;
				}

				return {
					id: illustId,
					tags: ts,
					contents: cs,
					authors: as,
				};
			})
			.filter((v): v is Illust => v !== null);
		this.logger.info(`result num: ${result.length}`);
		return result;
	}
}
