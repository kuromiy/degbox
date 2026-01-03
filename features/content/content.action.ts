import { basename, dirname, relative } from "node:path";
import type { DuplicateContentAction } from "../duplicate-content/duplicate.content.action.js";
import type { ContentRepository } from "./content.repository.js";
import type { ContentService } from "./content.service.js";
import { detectContentType } from "./content.type.js";

export class ContentAction {
	constructor(
		private readonly repository: ContentRepository,
		private readonly service: ContentService,
		private readonly projectPath: string,
		private readonly duplicateContentAction: DuplicateContentAction,
	) {}

	async register(path: string) {
		const id = await this.repository.generateId();

		// ハッシュ計算
		// const hash = await this.service.calcHash(path);

		// ファイル移動（IDを使用）
		const destPath = await this.service.moveToDestination(path, id);

		// パスからファイル名を取得（プロジェクトルートからの相対パス）
		const dirPath = relative(this.projectPath, dirname(destPath));
		const fileName = basename(destPath);

		const content = {
			id,
			path: dirPath,
			name: fileName,
			type: detectContentType(fileName),
			// hash,
		};
		const registered = await this.repository.save(content);

		// 重複コンテンツ管理登録
		await this.duplicateContentAction.register(registered);

		return registered;
	}
}
