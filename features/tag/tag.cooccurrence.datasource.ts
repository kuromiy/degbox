import { and, eq, or, sql } from "drizzle-orm";
import { TAG_COOCCURRENCES } from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { TagCooccurrence } from "./tag.cooccurrence.model.js";
import type { TagCooccurrenceRepository } from "./tag.cooccurrence.repository.js";

export class TagCooccurrenceDataSource implements TagCooccurrenceRepository {
	constructor(private readonly db: Database) {}

	async incrementCount(
		tag1Id: string,
		tag2Id: string,
		increment = 1,
	): Promise<void> {
		// INSERT OR REPLACE で共起カウントを更新
		await this.db
			.insert(TAG_COOCCURRENCES)
			.values({
				tag1Id,
				tag2Id,
				count: increment,
			})
			.onConflictDoUpdate({
				target: [TAG_COOCCURRENCES.tag1Id, TAG_COOCCURRENCES.tag2Id],
				set: {
					count: sql`${TAG_COOCCURRENCES.count} + ${increment}`,
				},
			});
	}

	async findRelatedTags(
		tagId: string,
		limit = 10,
	): Promise<Array<{ tagId: string; count: number }>> {
		// tag1Idまたはtag2Idがマッチする行を検索し、相手側のタグIDを返す
		const results = await this.db
			.select({
				tag1Id: TAG_COOCCURRENCES.tag1Id,
				tag2Id: TAG_COOCCURRENCES.tag2Id,
				count: TAG_COOCCURRENCES.count,
			})
			.from(TAG_COOCCURRENCES)
			.where(
				or(
					eq(TAG_COOCCURRENCES.tag1Id, tagId),
					eq(TAG_COOCCURRENCES.tag2Id, tagId),
				),
			)
			.orderBy(sql`${TAG_COOCCURRENCES.count} DESC`)
			.limit(limit);

		// 相手側のタグIDを抽出
		return results.map((row) => ({
			tagId: row.tag1Id === tagId ? row.tag2Id : row.tag1Id,
			count: row.count,
		}));
	}

	async getCount(tag1Id: string, tag2Id: string): Promise<number> {
		const result = await this.db
			.select({ count: TAG_COOCCURRENCES.count })
			.from(TAG_COOCCURRENCES)
			.where(
				and(
					eq(TAG_COOCCURRENCES.tag1Id, tag1Id),
					eq(TAG_COOCCURRENCES.tag2Id, tag2Id),
				),
			)
			.limit(1);

		return result[0]?.count ?? 0;
	}

	async findAll(): Promise<TagCooccurrence[]> {
		return await this.db
			.select({
				tag1Id: TAG_COOCCURRENCES.tag1Id,
				tag2Id: TAG_COOCCURRENCES.tag2Id,
				count: TAG_COOCCURRENCES.count,
			})
			.from(TAG_COOCCURRENCES);
	}
}
