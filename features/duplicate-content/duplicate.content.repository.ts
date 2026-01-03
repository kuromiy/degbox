import type { DuplicateGroup } from "./duplicate.content.model.js";

export interface DuplicateContentRepository {
	save(duplicateGroup: DuplicateGroup): Promise<DuplicateGroup>;
	generateId(): Promise<string>;
	findByContentIdAndHashType(
		contentId: string,
		hashType: string,
	): Promise<DuplicateGroup | null>;
	findAll(): Promise<DuplicateGroup[]>;
	findById(id: string): Promise<DuplicateGroup | null>;
	delete(id: string): Promise<void>;
	removeItemFromGroup(groupId: string, contentId: string): Promise<void>;
}
