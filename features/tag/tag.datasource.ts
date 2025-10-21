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
		const result = await this.db
			.insert(TAGS)
			.values({
				id: tag.id,
				name: tag.name,
			})
			.onConflictDoUpdate({
				target: TAGS.name,
				set: { id: sql`id` }, // 競合時は既存のidを保持(no-op)
			})
			.returning();

		const saved = result[0];
		if (!saved) {
			throw new Error(`Failed to save tag: ${tag.name}`);
		}
		return saved;
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
