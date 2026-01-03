import type { Content } from "./content.model.js";

export interface ContentRepository {
	generateId(): Promise<string>;
	save(content: Content): Promise<Content>;
	findById(id: string): Promise<Content | null>;
}
