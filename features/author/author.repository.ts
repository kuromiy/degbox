import type { Author, AuthorWithVideoCount } from "./author.model.js";

export interface AuthorRepository {
	generateId(): Promise<string>;
	get(id: string): Promise<Author | undefined>;
	save(author: Author): Promise<Author>;
	count(name?: string): Promise<number>;
	search(
		name: string | undefined,
		page: number,
		size: number,
	): Promise<AuthorWithVideoCount[]>;
}
