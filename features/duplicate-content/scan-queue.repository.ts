import type {
	ContentHashWithQueue,
	ScanQueueItem,
} from "./scan-queue.model.js";

export interface ScanQueueRepository {
	add(contentHashId: string): Promise<void>;
	count(): Promise<number>;
	findAll(): Promise<ScanQueueItem[]>;
	findWithHash(): Promise<ContentHashWithQueue[]>;
	remove(id: string): Promise<void>;
	removeByContentHashId(contentHashId: string): Promise<void>;
	clear(): Promise<void>;
}
