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
		await this.db
			.insert(TAGS)
			.values({
				id: tag.id,
				name: tag.name,
			})
			.onConflictDoUpdate({
				target: TAGS.id,
				set: {
					name: tag.name,
				},
			});

		return tag;
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
