import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { AUTHORS } from "../shared/database/schema.js";
import type { Database } from "../shared/database/type.js";
import type { Author } from "./author.model.js";
import type { AuthorRepository } from "./author.repository.js";

export class AuthorDataSource implements AuthorRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
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
			urls: Object.values(author.urls),
		};
	}
}
