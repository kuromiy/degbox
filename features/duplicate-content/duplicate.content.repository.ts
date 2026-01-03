import type { DuplicateGroup } from "./duplicate.content.model.js";

export interface DuplicateContentRepository {
	save(duplicateGroup: DuplicateGroup): Promise<DuplicateGroup>;
	generateId(): Promise<string>;
	findByContentIdAndHashType(
		contentId: string,
		hashType: string,
	): Promise<DuplicateGroup | null>;
}
