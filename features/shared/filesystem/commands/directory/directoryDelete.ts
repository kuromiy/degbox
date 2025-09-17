import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { relative } from "node:path";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ディレクトリ削除コマンド
 *
 * 指定されたディレクトリを削除する
 *
 * ロールバック時に削除したディレクトリを復元するために一時ディレクトリにコピーを保存する
 *
 * トランザクションが完了したら一時ディレクトリのディレクトリを削除する
 */
export class DirectoryDeleteCommand implements FileSystemOperationCommand {
	private TEMP_DIR = "./temp";

	private readonly directoryName: string;

	constructor(private path: string) {
		this.directoryName = randomUUID().toString();
	}

	public async execute() {
		await copyDirectory(this.path, `${this.TEMP_DIR}/${this.directoryName}`);
		await rm(this.path, { recursive: true });
	}

	public async undo() {
		await copyDirectory(`${this.TEMP_DIR}/${this.directoryName}`, this.path);
		await rm(`${this.TEMP_DIR}/${this.directoryName}`, { recursive: true });
	}

	public async done() {
		await rm(`${this.TEMP_DIR}/${this.directoryName}`, { recursive: true });
	}
}

async function copyDirectory(src: string, dest: string) {
	const files = await readdir(src, { withFileTypes: true, recursive: true });
	for (const file of files) {
		const destPath =
			relative(src, file.parentPath) === ""
				? `${dest}/${file.name}`
				: `${dest}/${relative(src, file.parentPath)}/${file.name}`;
		if (file.isDirectory()) {
			await mkdir(destPath, { recursive: true });
		} else {
			const srcPath = `${file.parentPath}/${file.name}`;
			await copyFile(srcPath, destPath);
		}
	}
}
