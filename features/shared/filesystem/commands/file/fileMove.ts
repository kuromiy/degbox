import { copyFile, rm } from "node:fs/promises";
import type { FileSystemOperationCommand } from "../index.js";

export class FileMoveCommand implements FileSystemOperationCommand {
	constructor(
		private src: string,
		private dest: string,
	) {}

	public async execute() {
		await copyFile(this.src, this.dest);
		// await rm(this.src);
	}

	public async undo() {
		// await copyFile(this.dest, this.src);
		await rm(this.dest);
	}

	public async done() {}
}
