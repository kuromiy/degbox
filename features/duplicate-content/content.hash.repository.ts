import type { ContentHash } from "./content.hash.model.js";

export interface ContentHashRepository {
	save(contentHash: ContentHash): Promise<ContentHash>;
	findByTypeAndValue(type: string, value: string): Promise<ContentHash[]>;
	findByType(type: string): Promise<ContentHash[]>;
	/**
	 * バッチ単位でContentHashを取得するAsyncIterableを返す
	 * @param type ハッシュタイプ
	 * @param batchSize 1バッチあたりの取得件数（デフォルト: 100）
	 */
	findByTypeBatched(
		type: string,
		batchSize?: number,
	): AsyncIterable<ContentHash[]>;

	deleteByContentId(contentId: string): Promise<void>;
}
