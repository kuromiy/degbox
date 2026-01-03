import type { Content } from "../content/content.model.js";
import type { CalculatorFactory } from "./calculator/calculator.factory.js";
import type { ContentHash } from "./content.hash.model.js";
import type { ContentHashRepository } from "./content.hash.repository.js";
import type { DuplicateGroup } from "./duplicate.content.model.js";
import type { DuplicateContentRepository } from "./duplicate.content.repository.js";

export class DuplicateContentAction {
	constructor(
		private readonly factory: CalculatorFactory,
		private readonly duplicateContentRepository: DuplicateContentRepository,
		private readonly contentHashRepository: ContentHashRepository,
	) {}

	async register(content: Content) {
		const calculator = this.factory.create(content.type);
		const hashes = await calculator.calculate(content);

		console.log("hash save");
		for (const hash of hashes) {
			// ハッシュ保存
			await this.contentHashRepository.save(hash);

			// SHA-256は即時で重複グループ更新
			await this.updateExactGroup(content.id, hash);
		}
	}

	private async updateExactGroup(contentId: string, hash: ContentHash) {
		// 同じハッシュ値を持つ既存レコードを検索
		const existing = await this.contentHashRepository.findByTypeAndValue(
			hash.type,
			hash.value,
		);

		const others = existing.filter((h) => h.contentId !== contentId);
		const firstOther = others[0];
		if (!firstOther) return;

		// 既存グループを検索
		const existingGroup =
			await this.duplicateContentRepository.findByContentIdAndHashType(
				firstOther.contentId,
				hash.type,
			);

		if (existingGroup) {
			// 既存グループに追加
			existingGroup.items.push({ contentId, similarity: 100 });
			await this.duplicateContentRepository.save(existingGroup);
		} else {
			// 新規グループ作成
			const newGroup: DuplicateGroup = {
				id: await this.duplicateContentRepository.generateId(),
				hashType: hash.type,
				items: [
					...others.map((o) => ({ contentId: o.contentId, similarity: 100 })),
					{ contentId, similarity: 100 },
				],
			};
			await this.duplicateContentRepository.save(newGroup);
		}
	}
}
