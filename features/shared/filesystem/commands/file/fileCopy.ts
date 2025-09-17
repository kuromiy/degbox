import { copyFile, rm } from "node:fs/promises";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ファイルコピーコマンド
 * 指定されたファイルをコピーする
 */
export class FileCopyCommand implements FileSystemOperationCommand {
	constructor(
		private src: string,
		private dest: string,
	) {}

	public async execute() {
		await copyFile(this.src, this.dest);
	}

	public async undo() {
		await rm(this.dest);
	}

	public async done() {}
}
