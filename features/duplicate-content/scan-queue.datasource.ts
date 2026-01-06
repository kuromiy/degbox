import { count, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
	CONTENT_HASHS,
	SIMILARITY_SCAN_QUEUE,
} from "../shared/database/application/schema.js";
import type { Database } from "../shared/database/application/type.js";
import type {
	ContentHashWithQueue,
	ScanQueueItem,
} from "./scan-queue.model.js";
import type { ScanQueueRepository } from "./scan-queue.repository.js";

export class ScanQueueDataSource implements ScanQueueRepository {
	constructor(private readonly db: Database) {}

	async add(contentHashId: string): Promise<void> {
		// 既存のエントリがあるかチェック（重複防止）
		const existing = await this.db
			.select({ id: SIMILARITY_SCAN_QUEUE.id })
			.from(SIMILARITY_SCAN_QUEUE)
			.where(eq(SIMILARITY_SCAN_QUEUE.contentHashId, contentHashId))
			.limit(1);

		if (existing.length > 0) {
			return;
		}

		await this.db.insert(SIMILARITY_SCAN_QUEUE).values({
			id: uuidv4(),
			contentHashId,
		});
	}

	async count(): Promise<number> {
		const result = await this.db
			.select({ count: count() })
			.from(SIMILARITY_SCAN_QUEUE);
		return result[0]?.count ?? 0;
	}

	async findAll(): Promise<ScanQueueItem[]> {
		const rows = await this.db
			.select({
				id: SIMILARITY_SCAN_QUEUE.id,
				contentHashId: SIMILARITY_SCAN_QUEUE.contentHashId,
				createdAt: SIMILARITY_SCAN_QUEUE.createdAt,
			})
			.from(SIMILARITY_SCAN_QUEUE);

		return rows;
	}

	async findWithHash(): Promise<ContentHashWithQueue[]> {
		const rows = await this.db
			.select({
				queueId: SIMILARITY_SCAN_QUEUE.id,
				contentHashId: SIMILARITY_SCAN_QUEUE.contentHashId,
				contentId: CONTENT_HASHS.contentId,
				hashValue: CONTENT_HASHS.value,
			})
			.from(SIMILARITY_SCAN_QUEUE)
			.innerJoin(
				CONTENT_HASHS,
				eq(SIMILARITY_SCAN_QUEUE.contentHashId, CONTENT_HASHS.id),
			);

		return rows;
	}

	async remove(id: string): Promise<void> {
		await this.db
			.delete(SIMILARITY_SCAN_QUEUE)
			.where(eq(SIMILARITY_SCAN_QUEUE.id, id));
	}

	async removeByContentHashId(contentHashId: string): Promise<void> {
		await this.db
			.delete(SIMILARITY_SCAN_QUEUE)
			.where(eq(SIMILARITY_SCAN_QUEUE.contentHashId, contentHashId));
	}

	async clear(): Promise<void> {
		await this.db.delete(SIMILARITY_SCAN_QUEUE);
	}
}
