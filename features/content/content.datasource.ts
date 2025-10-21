import { randomUUID } from "node:crypto";
import { CONTENTS } from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Content } from "./content.model.js";
import type { ContentRepository } from "./content.repository.js";

export class ContentDataSource implements ContentRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(content: Content): Promise<Content> {
		await this.db
			.insert(CONTENTS)
			.values({
				id: content.id,
				path: content.path,
				name: content.name,
				hash: content.hash,
			})
			.onConflictDoUpdate({
				target: CONTENTS.id,
				set: {
					path: content.path,
					hash: content.hash,
				},
			});

		return content;
	}
}
