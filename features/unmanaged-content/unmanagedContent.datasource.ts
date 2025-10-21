import { randomUUID } from "node:crypto";
import type { UnmanagedContent } from "./unmanagedContent.model.js";
import type { UnmanagedContentRepository } from "./unmanagedContent.repository.js";

export class UnmanagedContentDataSource implements UnmanagedContentRepository {
	constructor(private readonly storage: Map<string, UnmanagedContent>) {}

	async save(unmanagedContent: UnmanagedContent): Promise<UnmanagedContent> {
		this.storage.set(unmanagedContent.id, unmanagedContent);
		return unmanagedContent;
	}

	async get(id: string): Promise<UnmanagedContent | undefined> {
		return this.storage.get(id);
	}

	async generateId(): Promise<string> {
		return randomUUID();
	}
}
