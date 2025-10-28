import type { TagCooccurrenceRepository } from "./tag.cooccurrence.repository.js";
import type { Tag } from "./tag.model.js";
import type { TagRepository } from "./tag.repository.js";

export type TagSuggestion = {
	tag: Tag;
	score: number;
};

export class TagSuggestionService {
	constructor(
		private readonly tagRepository: TagRepository,
		private readonly cooccurrenceRepository: TagCooccurrenceRepository,
	) {}

	/**
	 * 入力されたタグに基づいて、関連するタグを提案
	 * @param inputTagIds すでに選択されているタグIDの配列
	 * @param limit 提案するタグの最大数
	 * @returns 提案タグのリスト（スコア降順）
	 */
	async suggestTags(
		inputTagIds: string[],
		limit = 5,
	): Promise<TagSuggestion[]> {
		if (inputTagIds.length === 0) {
			return [];
		}

		// 各入力タグに対して関連タグを取得
		const relatedTagsMap = new Map<string, number>();

		for (const tagId of inputTagIds) {
			const relatedTags =
				await this.cooccurrenceRepository.findRelatedTags(tagId);

			for (const { tagId: relatedTagId, count } of relatedTags) {
				// すでに選択されているタグは除外
				if (inputTagIds.includes(relatedTagId)) {
					continue;
				}

				// スコアを累積（複数の入力タグと共起するタグはスコアが高くなる）
				const currentScore = relatedTagsMap.get(relatedTagId) ?? 0;
				relatedTagsMap.set(relatedTagId, currentScore + count);
			}
		}

		// スコア順にソートして上位を取得
		const sortedTagIds = Array.from(relatedTagsMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
			.map(([tagId, score]) => ({ tagId, score }));

		// タグの詳細情報を取得
		const suggestions: TagSuggestion[] = [];
		for (const { tagId, score } of sortedTagIds) {
			const tag = await this.tagRepository.findById(tagId);
			if (tag) {
				suggestions.push({ tag, score });
			}
		}

		return suggestions;
	}

	/**
	 * タグ名の配列から提案を取得（名前解決を含む）
	 * @param inputTagNames 入力されたタグ名の配列
	 * @param limit 提案するタグの最大数
	 */
	async suggestTagsByNames(
		inputTagNames: string[],
		limit = 5,
	): Promise<TagSuggestion[]> {
		// タグ名からIDを取得
		const tagIds: string[] = [];
		for (const name of inputTagNames) {
			const tag = await this.tagRepository.findByName(name);
			if (tag) {
				tagIds.push(tag.id);
			}
		}

		return this.suggestTags(tagIds, limit);
	}
}
