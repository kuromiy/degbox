import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
	DUPLICATE_GROUP_ITEMS,
	DUPLICATE_GROUPS,
} from "../shared/database/application/schema.js";
import type { Database } from "../shared/database/application/type.js";
import type { DuplicateGroup } from "./duplicate.content.model.js";
import type { DuplicateContentRepository } from "./duplicate.content.repository.js";

export class DuplicateContentDataSource implements DuplicateContentRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(duplicateGroup: DuplicateGroup): Promise<DuplicateGroup> {
		// グループを保存（存在すれば更新）
		await this.db
			.insert(DUPLICATE_GROUPS)
			.values({
				id: duplicateGroup.id,
				hashType: duplicateGroup.hashType,
			})
			.onConflictDoUpdate({
				target: DUPLICATE_GROUPS.id,
				set: {
					hashType: duplicateGroup.hashType,
				},
			});

		// 既存のアイテムを削除して再挿入
		await this.db
			.delete(DUPLICATE_GROUP_ITEMS)
			.where(eq(DUPLICATE_GROUP_ITEMS.groupId, duplicateGroup.id));

		if (duplicateGroup.items.length > 0) {
			await this.db.insert(DUPLICATE_GROUP_ITEMS).values(
				duplicateGroup.items.map((item) => ({
					groupId: duplicateGroup.id,
					contentId: item.contentId,
					similarity: item.similarity,
				})),
			);
		}

		return duplicateGroup;
	}

	async findByContentIdAndHashType(
		contentId: string,
		hashType: string,
	): Promise<DuplicateGroup | null> {
		// contentIdを含むグループを検索
		const result = await this.db
			.select({
				groupId: DUPLICATE_GROUP_ITEMS.groupId,
			})
			.from(DUPLICATE_GROUP_ITEMS)
			.innerJoin(
				DUPLICATE_GROUPS,
				eq(DUPLICATE_GROUP_ITEMS.groupId, DUPLICATE_GROUPS.id),
			)
			.where(
				and(
					eq(DUPLICATE_GROUP_ITEMS.contentId, contentId),
					eq(DUPLICATE_GROUPS.hashType, hashType),
				),
			)
			.limit(1);

		const first = result[0];
		if (!first) return null;

		// グループの全アイテムを取得
		const group = await this.db
			.select({
				id: DUPLICATE_GROUPS.id,
				hashType: DUPLICATE_GROUPS.hashType,
			})
			.from(DUPLICATE_GROUPS)
			.where(eq(DUPLICATE_GROUPS.id, first.groupId))
			.limit(1);

		const groupRow = group[0];
		if (!groupRow) return null;

		const items = await this.db
			.select({
				contentId: DUPLICATE_GROUP_ITEMS.contentId,
				similarity: DUPLICATE_GROUP_ITEMS.similarity,
			})
			.from(DUPLICATE_GROUP_ITEMS)
			.where(eq(DUPLICATE_GROUP_ITEMS.groupId, first.groupId));

		return {
			id: groupRow.id,
			hashType: groupRow.hashType,
			items: items.map((item) => ({
				contentId: item.contentId,
				similarity: item.similarity ?? 100,
			})),
		};
	}
}
