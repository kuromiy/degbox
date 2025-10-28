import type { TagCooccurrence } from "./tag.cooccurrence.model.js";

export interface TagCooccurrenceRepository {
	/**
	 * 共起行列のカウントを増加させる
	 * @param tag1Id 正規化された順序のタグID1（tag1Id < tag2Id）
	 * @param tag2Id 正規化された順序のタグID2（tag1Id < tag2Id）
	 * @param increment 増加量（デフォルト: 1）
	 */
	incrementCount(
		tag1Id: string,
		tag2Id: string,
		increment?: number,
	): Promise<void>;

	/**
	 * 指定されたタグIDと共起するタグを、共起回数が多い順に取得
	 * @param tagId 基準となるタグID
	 * @param limit 取得件数の上限
	 */
	findRelatedTags(
		tagId: string,
		limit?: number,
	): Promise<Array<{ tagId: string; count: number }>>;

	/**
	 * 2つのタグの共起回数を取得
	 */
	getCount(tag1Id: string, tag2Id: string): Promise<number>;

	/**
	 * すべての共起データを取得（デバッグ用）
	 */
	findAll(): Promise<TagCooccurrence[]>;
}
