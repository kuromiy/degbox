import type { Content } from "./content.model.ts";

export interface ContentRepository {
	generateId(): Promise<string>;
	save(content: Content): Promise<Content>;
}
