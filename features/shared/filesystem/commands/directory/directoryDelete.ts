import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
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
	private readonly backupPath: string;

	constructor(private path: string) {
		// 削除対象ディレクトリの親ディレクトリにバックアップを作成
		const parentDir = dirname(path);
		this.backupPath = join(parentDir, `.backup_${randomUUID()}`);
	}

	public async execute() {
		await copyDirectory(this.path, this.backupPath);
		await rm(this.path, { recursive: true });
	}

	public async undo() {
		await copyDirectory(this.backupPath, this.path);
		await rm(this.backupPath, { recursive: true });
	}

	public async done() {
		await rm(this.backupPath, { recursive: true });
	}
}

async function copyDirectory(src: string, dest: string) {
	// コピー先のルートディレクトリを作成
	await mkdir(dest, { recursive: true });

	const files = await readdir(src, { withFileTypes: true, recursive: true });
	for (const file of files) {
		const relativePath = relative(src, file.parentPath);
		const destPath =
			relativePath === ""
				? join(dest, file.name)
				: join(dest, relativePath, file.name);
		if (file.isDirectory()) {
			await mkdir(destPath, { recursive: true });
		} else {
			// ファイルの親ディレクトリが存在することを保証
			const destDir = dirname(destPath);
			await mkdir(destDir, { recursive: true });
			const srcPath = join(file.parentPath, file.name);
			await copyFile(srcPath, destPath);
		}
	}
}
