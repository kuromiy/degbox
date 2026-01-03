import type { ContentType } from "../../content/content.type.js";
import type { HashService } from "../hash.service.js";
import type { HashCalculator } from "./hash.calculator.js";
import { ImageHashCalculator } from "./image.hash.calculator.js";
import { VideoHashCalculator } from "./video.hash.calculator.js";

export class CalculatorFactory {
	constructor(
		private readonly hashService: HashService,
		private readonly projectPath: string,
	) {}

	create(type: ContentType): HashCalculator {
		switch (type) {
			case "image":
				return new ImageHashCalculator(this.hashService, this.projectPath);
			case "video":
				return new VideoHashCalculator(this.hashService, this.projectPath);
			default:
				throw new Error(`Unsupported content type: ${type}`);
		}
	}
}
