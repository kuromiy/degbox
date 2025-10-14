import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { FileSystemOperationCommand } from "./index.js";

export class TempFileWriteCommand implements FileSystemOperationCommand {
	public readonly tempFilePath: string;

	constructor(
		private content: string | Uint8Array | Buffer,
		private extension = "tmp", // 拡張子任意指定（省略時は "tmp"）
	) {
		// 拡張子の先頭のドットを除去
		const ext = this.extension.startsWith(".")
			? this.extension.slice(1)
			: this.extension;
		const fileName = `${randomUUID()}.${ext}`;
		this.tempFilePath = join("data/temp", fileName);
	}

	async execute() {
		// ディレクトリを作成（既に存在する場合は無視）
		await mkdir(dirname(this.tempFilePath), { recursive: true });
		await writeFile(this.tempFilePath, this.content);
	}

	async undo() {
		// await rm(this.tempFilePath);
	}

	async done() {
		// await rm(this.tempFilePath);
	}
}
