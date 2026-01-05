import { and, eq } from "drizzle-orm";
import { CONTENT_HASHS } from "../shared/database/application/schema.js";
import type { Database } from "../shared/database/application/type.js";
import type { ContentHash } from "./content.hash.model.js";
import type { ContentHashRepository } from "./content.hash.repository.js";

export class ContentHashDataSource implements ContentHashRepository {
	constructor(private readonly db: Database) {}

	async save(contentHash: ContentHash): Promise<ContentHash> {
		await this.db
			.insert(CONTENT_HASHS)
			.values({
				id: contentHash.id,
				contentId: contentHash.contentId,
				type: contentHash.type,
				value: contentHash.value,
			})
			.onConflictDoUpdate({
				target: CONTENT_HASHS.id,
				set: {
					type: contentHash.type,
					value: contentHash.value,
				},
			});

		return contentHash;
	}

	async findByTypeAndValue(
		type: string,
		value: string,
	): Promise<ContentHash[]> {
		const rows = await this.db
			.select({
				id: CONTENT_HASHS.id,
				contentId: CONTENT_HASHS.contentId,
				type: CONTENT_HASHS.type,
				value: CONTENT_HASHS.value,
			})
			.from(CONTENT_HASHS)
			.where(and(eq(CONTENT_HASHS.type, type), eq(CONTENT_HASHS.value, value)));

		return rows;
	}

	async findByType(type: string): Promise<ContentHash[]> {
		const rows = await this.db
			.select({
				id: CONTENT_HASHS.id,
				contentId: CONTENT_HASHS.contentId,
				type: CONTENT_HASHS.type,
				value: CONTENT_HASHS.value,
			})
			.from(CONTENT_HASHS)
			.where(eq(CONTENT_HASHS.type, type));

		return rows;
	}

	async deleteByContentId(contentId: string): Promise<void> {
		await this.db
			.delete(CONTENT_HASHS)
			.where(eq(CONTENT_HASHS.contentId, contentId));
	}
}
