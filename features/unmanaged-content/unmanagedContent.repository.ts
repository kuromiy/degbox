import type { UnmanagedContent } from "./unmanagedContent.model.js";

export interface UnmanagedContentRepository {
	save(unmanagedContent: UnmanagedContent): Promise<UnmanagedContent>;
	get(id: string): Promise<UnmanagedContent | undefined>;
	generateId(): Promise<string>;
}
