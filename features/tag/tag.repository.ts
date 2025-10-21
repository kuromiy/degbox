import type { Tag } from "./tag.model.js";

export interface TagRepository {
	generateId(): Promise<string>;
	save(tag: Tag): Promise<Tag>;
	findById(id: string): Promise<Tag | undefined>;
	findByName(name: string): Promise<Tag | undefined>;
	listByName(name: string): Promise<Tag[]>;
}
