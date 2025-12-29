import { rm, writeFile } from "node:fs/promises";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ファイル作成コマンド
 * 指定されたパスに新規ファイルを作成する
 */
export class FileCreateCommand implements FileSystemOperationCommand {
	constructor(
		private path: string,
		private content: string | Buffer = "",
	) {}

	public async execute() {
		await writeFile(this.path, this.content);
	}

	public async undo() {
		await rm(this.path);
	}

	public async done() {}
}
