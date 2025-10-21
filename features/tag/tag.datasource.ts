import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { TAGS } from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Tag } from "./tag.model.js";
import type { TagRepository } from "./tag.repository.js";

export class TagDataSource implements TagRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(tag: Tag): Promise<Tag> {
		// name が既に存在する場合は既存行をそのまま返す (id 不変を保証)
		const result = await this.db
			.insert(TAGS)
			.values({
				id: tag.id,
				name: tag.name,
			})
			.onConflictDoNothing({ target: TAGS.name })
			.returning();

		// 挿入成功時は result[0] が返る、競合時は空配列
		const inserted = result[0];
		if (inserted) {
			return inserted;
		}

		// 競合時: 既存行を取得 (name はユニーク制約があるため必ず存在)
		const existing = await this.findByName(tag.name);
		if (!existing) {
			throw new Error(
				`Tag "${tag.name}" should exist after conflict, but not found`,
			);
		}
		return existing;
	}

	async findById(id: string): Promise<Tag | undefined> {
		const result = await this.db
			.select()
			.from(TAGS)
			.where(eq(TAGS.id, id))
			.limit(1);

		return result[0];
	}

	async findByName(name: string): Promise<Tag | undefined> {
		const result = await this.db
			.select()
			.from(TAGS)
			.where(eq(TAGS.name, name))
			.limit(1);

		return result[0];
	}

	async listByName(name: string): Promise<Tag[]> {
		// ワイルドカード文字をエスケープ
		const escapedName = name
			.replace(/\\/g, "\\\\") // \ → \\
			.replace(/%/g, "\\%") // % → \%
			.replace(/_/g, "\\_"); // _ → \_

		const pattern = `%${escapedName}%`;

		const result = await this.db
			.select()
			.from(TAGS)
			.where(sql`${TAGS.name} LIKE ${pattern} ESCAPE '\\'`);

		return result;
	}
}
