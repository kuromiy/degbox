import { randomUUID } from "node:crypto";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ファイル削除コマンド
 * 指定されたファイルを削除する
 * ロールバック時に削除したファイルを復元するために一時ディレクトリにコピーを保存する
 * トランザクションが完了したら一時ディレクトリのファイルを削除する
 */
export class FileDeleteCommand implements FileSystemOperationCommand {
	private readonly tempDir: string;
	private readonly fileName: string;

	constructor(
		private path: string,
		basePath?: string,
	) {
		this.tempDir = basePath ? join(basePath, "temp") : "./temp";
		this.fileName = randomUUID().toString();
	}

	public async execute() {
		await mkdir(this.tempDir, { recursive: true });
		await copyFile(this.path, join(this.tempDir, this.fileName));
		await rm(this.path);
	}

	public async undo() {
		await copyFile(join(this.tempDir, this.fileName), this.path);
		await rm(join(this.tempDir, this.fileName));
	}

	public async done() {
		await rm(join(this.tempDir, this.fileName));
	}
}
