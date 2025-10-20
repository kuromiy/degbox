import { randomUUID } from "node:crypto";
import { eq, like } from "drizzle-orm";
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
			.onConflictDoNothing({ target: TAGS.name })
			.returning();

		// 新規作成された場合
		const [inserted] = result;
		if (inserted) {
			return inserted;
		}

		// 競合した場合は既存レコードを返す
		const existing = await this.findByName(tag.name);
		if (!existing) {
			throw new Error(`Failed to save tag: ${tag.name}`);
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
		const result = await this.db
			.select()
			.from(TAGS)
			.where(like(TAGS.name, `%${name}%`));
		return result;
	}
}
