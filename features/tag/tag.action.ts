import type { Tag } from "./tag.model.js";
import type { TagRepository } from "./tag.repository.js";

export class TagAction {
	constructor(private readonly repository: TagRepository) {}

	async getOrCreate(tagNames: string[]): Promise<Tag[]> {
		const processes = tagNames.map(async (tagName) => {
			const exist = await this.repository.findByName(tagName);
			if (exist) {
				return exist;
			}

			const id = await this.repository.generateId();
			const newTag = { id, name: tagName };
			return await this.repository.save(newTag);
		});
		return await Promise.all(processes);
	}
}
