import { TagCooccurrence } from "./tag.cooccurrence.model.js";
import type { TagCooccurrenceRepository } from "./tag.cooccurrence.repository.js";
import type { Tag } from "./tag.model.js";
import type { TagRepository } from "./tag.repository.js";

export class TagAction {
	constructor(
		private readonly repository: TagRepository,
		private readonly cooccurrenceRepository: TagCooccurrenceRepository,
	) {}

	async getOrCreate(tagNames: string[]): Promise<Tag[]> {
		const processes = tagNames.map(async (tagName) => {
			const id = await this.repository.generateId();
			const newTag = { id, name: tagName };
			return await this.repository.save(newTag);
		});
		return await Promise.all(processes);
	}

	/**
	 * タグの共起行列を更新
	 * @param tags 同時に使用されたタグの配列
	 */
	async updateCooccurrences(tags: Tag[]): Promise<void> {
		if (tags.length < 2) {
			return;
		}

		const tagIds = tags.map((tag) => tag.id);
		const pairs = TagCooccurrence.generatePairs(tagIds);

		// すべてのペアの共起カウントをインクリメント
		for (const [tag1Id, tag2Id] of pairs) {
			await this.cooccurrenceRepository.incrementCount(tag1Id, tag2Id);
		}
	}
}
