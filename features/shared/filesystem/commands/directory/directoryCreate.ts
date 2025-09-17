import { mkdir, rm } from "node:fs/promises";
import type { FileSystemOperationCommand } from "../index.js";

/**
 * ディレクトリ作成コマンド
 * 指定されたディレクトリを作成する
 */
export class DirecctoryCreateCommand implements FileSystemOperationCommand {
	constructor(private path: string) {}

	public async execute() {
		await mkdir(this.path, { recursive: true });
	}

	public async undo() {
		await rm(this.path, { recursive: true });
	}

	public async done() {}
}
