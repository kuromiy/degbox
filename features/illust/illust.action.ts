import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";
import type { IllustRepository } from "./illust.repository.js";

export class IllustAction {
	constructor(private readonly repository: IllustRepository) {}

	async register(tags: Tag[], contents: Content[], authors?: Author[]) {
		// イラストエンティティ作成
		const id = await this.repository.generateId();

		// コンテンツに並び順を付与
		const illustContents = contents.map((content, index) => ({
			content,
			order: index,
		}));

		const illust = {
			id,
			tags,
			contents: illustContents,
			authors: authors || [],
		};

		// イラストを保存
		return await this.repository.save(illust);
	}
}
