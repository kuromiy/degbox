export type TagCooccurrence = {
	tag1Id: string;
	tag2Id: string;
	count: number;
};

export namespace TagCooccurrence {
	/**
	 * 2つのタグIDを正規化された順序で返す（tag1Id < tag2Id）
	 * 共起行列の対称性を保つために使用
	 */
	export function normalize(tagId1: string, tagId2: string): [string, string] {
		return tagId1 < tagId2 ? [tagId1, tagId2] : [tagId2, tagId1];
	}

	/**
	 * タグIDの配列から、すべての共起ペアを生成
	 */
	export function generatePairs(tagIds: string[]): Array<[string, string]> {
		const pairs: Array<[string, string]> = [];
		for (let i = 0; i < tagIds.length; i++) {
			for (let j = i + 1; j < tagIds.length; j++) {
				const tagId1 = tagIds[i];
				const tagId2 = tagIds[j];
				if (tagId1 && tagId2) {
					pairs.push(normalize(tagId1, tagId2));
				}
			}
		}
		return pairs;
	}
}
