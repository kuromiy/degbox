import type { Author } from "./author.model.js";

export interface AuthorRepository {
	generateId(): Promise<string>;
	get(id: string): Promise<Author | undefined>;
	save(author: Author): Promise<Author>;
}
