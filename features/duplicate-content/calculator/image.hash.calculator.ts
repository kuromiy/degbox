import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { Content } from "../../content/content.model.js";
import type { ContentHash } from "../content.hash.model.js";
import type { HashService } from "../hash.service.js";
import type { HashCalculator } from "./hash.calculator.js";

export class ImageHashCalculator implements HashCalculator {
	constructor(
		private readonly hashService: HashService,
		private readonly projectPath: string,
	) {}

	async calculate(content: Content): Promise<ContentHash[]> {
		const filePath = join(this.projectPath, content.path, content.name);
		const result: ContentHash = {
			id: randomUUID.toString(),
			type: "sha256",
			value: await this.hashService.calcSha256(filePath),
			contentId: content.id,
		};

		return [result];
	}
}
