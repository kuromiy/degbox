import type { Author } from "../author/author.model.js";
import type { ContentAction } from "../content/content.action.js";
import type { Content } from "../content/content.model.js";
import type { ContentService } from "../content/content.service.js";
import type { Tag } from "../tag/tag.model.js";
import type { UnmanagedContentRepository } from "../unmanaged-content/unmanagedContent.repository.js";
import type { IllustContent } from "./illust.model.js";
import type { IllustRepository } from "./illust.repository.js";

type IllustContentItem = {
	content?: Content;
	order: number;
	newResourceId?: string;
};

export class IllustAction {
	constructor(
		private readonly repository: IllustRepository,
		private readonly contentAction: ContentAction,
		private readonly unmanagedContentRepository: UnmanagedContentRepository,
		private readonly contentService: ContentService,
	) {}

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

	async update(
		illustId: string,
		tags: Tag[],
		contentItems: IllustContentItem[],
		newResourceIds: string[],
		authors: Author[],
	) {
		// 新規リソースIDからコンテンツを登録（順序を保つためにマップ化）
		const newContentMap = new Map<string, Content>();
		for (const resourceId of newResourceIds) {
			// resourceIdから実際のファイルパスを取得
			const unmanagedContent =
				await this.unmanagedContentRepository.get(resourceId);
			if (!unmanagedContent) {
				throw new Error(`Unmanaged content not found for ID: ${resourceId}`);
			}
			// 実際のファイルパスを使ってコンテンツ登録
			const content = await this.contentAction.register(unmanagedContent.path);
			newContentMap.set(resourceId, content);
		}

		// contentItemsを処理し、最終的なコンテンツ配列を構築
		const allContents: IllustContent[] = [];
		for (const item of contentItems) {
			if (item.content) {
				// 既存コンテンツ
				allContents.push({
					content: item.content,
					order: allContents.length,
				});
			} else if (item.newResourceId) {
				// 新規コンテンツ
				const newContent = newContentMap.get(item.newResourceId);
				if (!newContent) {
					throw new Error(
						`New content not found for resource: ${item.newResourceId}`,
					);
				}
				allContents.push({
					content: newContent,
					order: allContents.length,
				});
			} else {
				throw new Error(
					"Invalid content item: must have either content or newResourceId",
				);
			}
		}

		const illust = {
			id: illustId,
			tags,
			contents: allContents,
			authors,
		};

		// イラストを保存（既存の関連は削除されて新しいものが保存される）
		return await this.repository.save(illust);
	}

	async delete(illustId: string): Promise<boolean> {
		// イラストデータを取得
		const illust = await this.repository.findById(illustId);
		if (!illust) {
			return false;
		}

		// 物理ファイルを削除（ContentServiceが利用可能な場合）
		for (const illustContent of illust.contents) {
			const content = illustContent.content;
			// buildFileUrlされたパスからオリジナルのパスを復元
			// content.pathはURLエンコードされている可能性があるため、
			// 実際のファイルパスとファイル名を使用
			console.log(content.path);
			await this.contentService.deleteContent(content.path, content.name);
		}

		// データベースから削除
		return await this.repository.delete(illustId);
	}
}
