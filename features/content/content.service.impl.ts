import { extname, join } from "node:path";
import type { Logger } from "winston";
import type { ProjectContext } from "../project/project.context.js";
import type { FileSystem } from "../shared/filesystem/index.js";
import {
	buildContentPath,
	type Content,
	type ContentId,
	getMediaType,
} from "./content.model.js";
import type { ContentService } from "./content.service.js";

export class ContentServiceImpl implements ContentService {
	constructor(
		private readonly logger: Logger,
		private readonly fs: FileSystem,
		private readonly projectContext: ProjectContext,
	) {}

	async moveToDestination(
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

	async deleteContent(content: Content): Promise<void> {
		this.logger.info("content service#deleteContent", {
			content,
		});
		const fullPath = join(
			this.projectContext.getPath(),
			content.path,
			content.name,
		);
		this.logger.info("fullPath", { fullPath });
		await this.fs.delete(fullPath);
	}
}
