import type { Author } from "./author.model.js";

export interface AuthorRepository {
	get(id: string): Promise<Author | undefined>;
}
