import { basename, dirname, extname, join, relative } from "node:path";
import type { Logger } from "winston";
import type { DuplicateContentAction } from "../duplicate-content/duplicate.content.action.js";
import type { ProjectContext } from "../project/project.context.js";
import type { FileSystem } from "../shared/filesystem/index.js";
import {
	buildContentPath,
	type Content,
	type ContentId,
	getMediaType,
} from "./content.model.js";
import type { ContentRepository } from "./content.repository.js";
import { detectContentType } from "./content.type.js";

export class ContentAction {
	constructor(
		private readonly logger: Logger,
		private readonly repository: ContentRepository,
		private readonly projectContext: ProjectContext,
		private readonly fs: FileSystem,
		private readonly duplicateContentAction: DuplicateContentAction,
	) {}

	async register(path: string) {
		const id = await this.repository.generateId();

		// ファイル移動（IDを使用）
		const destPath = await this.moveToDestination(path, id);

		// パスからファイル名を取得（プロジェクトルートからの相対パス）
		const projectPath = this.projectContext.getPath();
		const dirPath = relative(projectPath, dirname(destPath));
		const fileName = basename(destPath);

		const content = {
			id,
			path: dirPath,
			name: fileName,
			type: detectContentType(fileName),
		};
		const registered = await this.repository.save(content);

		// 重複コンテンツ管理登録
		await this.duplicateContentAction.register(registered);

		return registered;
	}

	async deleteContent(content: Content): Promise<void> {
		this.logger.info("ContentAction#deleteContent", { content });
		const fullPath = join(
			this.projectContext.getPath(),
			content.path,
			content.name,
		);
		this.logger.info("fullPath", { fullPath });
		await this.fs.delete(fullPath);
	}

	private async moveToDestination(
		sourcePath: string,
		contentId: ContentId,
	): Promise<string> {
		const mediaType = getMediaType(sourcePath);
		const relativePath = buildContentPath(contentId, mediaType);
		const ext = extname(sourcePath).toLowerCase();

		// コンテンツIDごとのフォルダを作成
		const destDir = join(this.projectContext.getPath(), relativePath);
		await this.fs.createDirectory(destDir);

		// original.{ext} という名前で保存
		const destPath = join(destDir, `original${ext}`);
		await this.fs.move(sourcePath, destPath);

		return destPath;
	}
}
