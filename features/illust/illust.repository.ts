import type { Illust } from "./illust.model.js";

export interface IllustRepository {
	generateId(): Promise<string>;
	save(illust: Illust): Promise<Illust>;
	count(keyword?: string): Promise<number>;
	search(
		keyword: string | undefined,
		sortBy: string,
		order: string,
		page: number,
		limit: number,
	): Promise<Illust[]>;
	findById(illustId: string): Promise<Illust | null>;
	countByAuthorId(authorId: string): Promise<number>;
	findByAuthorId(
		authorId: string,
		page: number,
		size: number,
	): Promise<Illust[]>;
	delete(illustId: string): Promise<boolean>;
}
