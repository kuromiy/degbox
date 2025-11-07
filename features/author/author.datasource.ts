import { randomUUID } from "node:crypto";
import { countDistinct, desc, eq, like, sql } from "drizzle-orm";
import { AUTHORS, VIDEOS_AUTHORS } from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Author, AuthorWithVideoCount } from "./author.model.js";
import type { AuthorRepository } from "./author.repository.js";

export class AuthorDataSource implements AuthorRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(author: Author): Promise<Author> {
		await this.db
			.insert(AUTHORS)
			.values(author)
			.onConflictDoUpdate({
				target: AUTHORS.id,
				set: { ...author },
			});

		return author;
	}

	async get(id: string): Promise<Author | undefined> {
		const result = await this.db
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, id))
			.limit(1);

		if (result.length === 0) {
			return undefined;
		}

		const author = result[0];
		if (!author) {
			return undefined;
		}

		return {
			id: author.id,
			name: author.name,
			urls: author.urls,
		};
	}

	async delete(id: string): Promise<boolean> {
		// 関連する動画との紐付けを削除
		await this.db.delete(VIDEOS_AUTHORS).where(eq(VIDEOS_AUTHORS.authorId, id));

		// 作者を削除
		const result = await this.db.delete(AUTHORS).where(eq(AUTHORS.id, id));

		return result.rowsAffected > 0;
	}

	async count(name?: string): Promise<number> {
		const trimmedName = name?.trim();

		const query =
			trimmedName && trimmedName !== ""
				? this.db
						.select({ count: countDistinct(AUTHORS.id) })
						.from(AUTHORS)
						.where(like(AUTHORS.name, `%${trimmedName}%`))
				: this.db.select({ count: countDistinct(AUTHORS.id) }).from(AUTHORS);

		const result = await query.execute();
		const c = result[0]?.count;
		if (c === undefined || c === null) {
			throw new Error("count is undefined");
		}
		return c;
	}

	async search(
		name: string | undefined,
		page: number,
		size: number,
	): Promise<AuthorWithVideoCount[]> {
		// パラメータのバリデーション
		if (page < 0 || size <= 0 || size > 100) {
			throw new Error(
				`Invalid pagination parameters: page=${page}, size=${size}`,
			);
		}

		const trimmedName = name?.trim();

		// 作者を検索し、各作者の動画数も取得
		const query = this.db
			.select({
				id: AUTHORS.id,
				name: AUTHORS.name,
				urls: AUTHORS.urls,
				videoCount: sql<number>`count(distinct ${VIDEOS_AUTHORS.videoId})`,
			})
			.from(AUTHORS)
			.leftJoin(VIDEOS_AUTHORS, eq(AUTHORS.id, VIDEOS_AUTHORS.authorId))
			.groupBy(AUTHORS.id, AUTHORS.name, AUTHORS.urls)
			.orderBy(desc(AUTHORS.name))
			.limit(size)
			.offset(page * size);

		const result =
			trimmedName && trimmedName !== ""
				? await query.where(like(AUTHORS.name, `%${trimmedName}%`)).execute()
				: await query.execute();

		return result.map((r) => ({
			id: r.id,
			name: r.name,
			urls: r.urls,
			videoCount: Number(r.videoCount) || 0,
		}));
	}
}
