import { randomUUID } from "node:crypto";
import { CONTENTS } from "../shared/database/application/schema.js";
import type { Database } from "../shared/database/application/type.js";
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
				type: content.type,
			})
			.onConflictDoUpdate({
				target: CONTENTS.id,
				set: {
					path: content.path,
					type: content.type,
				},
			});

		return content;
	}
}
