import type { Content, ContentId } from "./content.model.js";

export interface ContentRepository {
	generateId(): Promise<ContentId>;
	save(content: Content): Promise<Content>;
	findById(id: string): Promise<Content | null>;

	delete(id: string): Promise<void>;

	/**
	 * コンテンツに関連する中間テーブル（VIDEOS_CONTENTS, ILLUSTS_CONTENTS）のレコードを削除する
	 */
	deleteRelations(contentId: string): Promise<void>;
}
