import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FileSystemOperationCommand } from "./index.js";

export class TempFileWriteCommand implements FileSystemOperationCommand {
	public readonly tempFilePath: string;

	constructor(
		private content: string | Uint8Array | Buffer,
		private extension = "tmp", // 拡張子任意指定（省略時は ".tmp"）
	) {
		const fileName = `${randomUUID()}.${this.extension}`;
		this.tempFilePath = join("data/temp", fileName);
	}

	async execute() {
		await writeFile(this.tempFilePath, this.content);
	}

	async undo() {
		// await rm(this.tempFilePath);
	}

	async done() {
		// await rm(this.tempFilePath);
	}
}
