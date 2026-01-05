import type { ContentType } from "../../content/content.type.js";
import type { ProjectContext } from "../../project/project.context.js";
import type { FileSystem } from "../../shared/filesystem/index.js";
import type { VideoService } from "../../video/video.service.js";
import type { HashService } from "../hash.service.js";
import type { HashCalculator } from "./hash.calculator.js";
import { ImageHashCalculator } from "./image.hash.calculator.js";
import { VideoHashCalculator } from "./video.hash.calculator.js";

export class CalculatorFactory {
	constructor(
		private readonly hashService: HashService,
		private readonly projectContext: ProjectContext,
		private readonly videoService: VideoService,
		private readonly fs: FileSystem,
	) {}

	create(type: ContentType): HashCalculator {
		const projectPath = this.projectContext.getPath();
		switch (type) {
			case "image":
				return new ImageHashCalculator(this.hashService, projectPath);
			case "video":
				return new VideoHashCalculator(
					this.hashService,
					projectPath,
					this.videoService,
					this.fs,
				);
			default:
				throw new Error(`Unsupported content type: ${type}`);
		}
	}
}
