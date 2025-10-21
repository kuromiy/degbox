import { basename, dirname } from "node:path";
import type { ContentRepository } from "./content.repository.js";
import type { ContentService } from "./content.service.js";

export class ContentAction {
	constructor(
		private readonly repository: ContentRepository,
		private readonly service: ContentService,
	) {}

	async register(path: string) {
		const id = await this.repository.generateId();

		// ハッシュ計算
		const hash = await this.service.calcHash(path);

		// ファイル移動（IDを使用）
		const destPath = await this.service.moveToDestination(path, id);

		// パスからファイル名を取得
		const dirPath = dirname(destPath);
		const fileName = basename(destPath);

		const content = {
			id,
			path: dirPath,
			name: fileName,
			hash,
		};
		return await this.repository.save(content);
	}
}
