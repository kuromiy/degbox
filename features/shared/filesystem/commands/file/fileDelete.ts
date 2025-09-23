import { randomUUID } from "node:crypto";
import { copyFile, rm } from "node:fs/promises";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ファイル削除コマンド
 * 指定されたファイルを削除する
 * ロールバック時に削除したファイルを復元するために一時ディレクトリにコピーを保存する
 * トランザクションが完了したら一時ディレクトリのファイルを削除する
 */
export class FileDeleteCommand implements FileSystemOperationCommand {
	private TEMP_DIR = "./temp";

	private readonly fileName: string;

	constructor(private path: string) {
		this.fileName = randomUUID().toString();
	}

	public async execute() {
		await copyFile(this.path, `${this.TEMP_DIR}/${this.fileName}`);
		await rm(this.path);
	}

	public async undo() {
		await copyFile(`${this.TEMP_DIR}/${this.fileName}`, this.path);
		await rm(`${this.TEMP_DIR}/${this.fileName}`);
	}

	public async done() {
		await rm(`${this.TEMP_DIR}/${this.fileName}`);
	}
}
