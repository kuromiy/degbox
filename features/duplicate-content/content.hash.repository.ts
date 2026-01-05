import type { ContentHash } from "./content.hash.model.js";

export interface ContentHashRepository {
	save(contentHash: ContentHash): Promise<ContentHash>;
	findByTypeAndValue(type: string, value: string): Promise<ContentHash[]>;
	findByType(type: string): Promise<ContentHash[]>;

	deleteByContentId(contentId: string): Promise<void>;
}
