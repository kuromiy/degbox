import { DirectoryCreateCommand } from "./commands/directory/directoryCreate.js";
import { DirectoryDeleteCommand } from "./commands/directory/directoryDelete.js";
import { FileCopyCommand } from "./commands/file/fileCopy.js";
import { FileDeleteCommand } from "./commands/file/fileDelete.js";
import { FileMoveCommand } from "./commands/file/fileMove.js";
import type { FileSystemOperationCommand } from "./commands/index.js";
import { TempFileWriteCommand } from "./commands/tempFileWrite.js";

export interface FileSystem {
	transaction<T>(transaction: (tx: FileSystem) => Promise<T> | T): Promise<T>;
	createDirectory(path: string): Promise<void>;
	move(src: string, dest: string): Promise<void>;
	copy(src: string, dest: string): Promise<void>;
	delete(path: string): Promise<void>;
	deleteDirectory(path: string): Promise<void>;
	writeTempFile(
		content: string | Uint8Array | Buffer,
		extension?: string,
	): Promise<string>;
}

export class FileSystemImpl implements FileSystem {
	constructor(private readonly errorLog: (error: Error) => void) {}

	public async transaction<T>(
		transaction: (tx: FileSystem) => Promise<T> | T,
	): Promise<T> {
		const invoker = new FileSystemInvoker(this.errorLog);
		try {
			const result = await transaction(invoker);
			await invoker.done();
			return result;
		} catch (e) {
			this.errorLog(e as Error);
			await invoker.undo();
			throw e;
		}
	}

	public async createDirectory(path: string): Promise<void> {
		return this.transaction(async (tx) => {
			await tx.createDirectory(path);
		});
	}

	public async move(src: string, dest: string): Promise<void> {
		return this.transaction(async (tx) => {
			await tx.move(src, dest);
		});
	}

	public async copy(src: string, dest: string): Promise<void> {
		return this.transaction(async (tx) => {
			await tx.copy(src, dest);
		});
	}

	public async delete(path: string): Promise<void> {
		return this.transaction(async (tx) => {
			await tx.delete(path);
		});
	}

	public async deleteDirectory(path: string): Promise<void> {
		return this.transaction(async (tx) => {
			await tx.deleteDirectory(path);
		});
	}

	public async writeTempFile(
		content: string | Uint8Array | Buffer,
		extension = "tmp",
	): Promise<string> {
		return this.transaction(async (tx) => {
			return await tx.writeTempFile(content, extension);
		});
	}
}

class FileSystemInvoker implements FileSystem {
	constructor(private readonly errorLog: (error: Error) => void) {}

	private commands: FileSystemOperationCommand[] = [];

	public async transaction<T>(
		transaction: (tx: FileSystem) => Promise<T> | T,
	): Promise<T> {
		// 新しいFileSystemInvokerインスタンスで別のトランザクション境界を作成
		const nestedInvoker = new FileSystemInvoker(this.errorLog);
		try {
			const result = await transaction(nestedInvoker);
			await nestedInvoker.done();
			return result;
		} catch (e) {
			this.errorLog(e as Error);
			await nestedInvoker.undo();
			throw e;
		}
	}

	public async createDirectory(path: string) {
		const command = new DirectoryCreateCommand(path);
		await command.execute();
		this.commands.push(command);
	}

	public async move(src: string, dest: string) {
		const command = new FileMoveCommand(src, dest);
		await command.execute();
		this.commands.push(command);
	}

	public async copy(src: string, dest: string) {
		const command = new FileCopyCommand(src, dest);
		await command.execute();
		this.commands.push(command);
	}

	public async delete(path: string) {
		const command = new FileDeleteCommand(path);
		await command.execute();
		this.commands.push(command);
	}

	public async deleteDirectory(path: string) {
		const command = new DirectoryDeleteCommand(path);
		await command.execute();
		this.commands.push(command);
	}

	public async writeTempFile(
		content: string | Uint8Array | Buffer,
		extension = "tmp",
	): Promise<string> {
		const command = new TempFileWriteCommand(content, extension);
		await command.execute();
		this.commands.push(command);
		return command.tempFilePath;
	}

	public async undo() {
		for (const command of this.commands.reverse()) {
			await command.undo();
		}
	}

	public async done() {
		for (const command of this.commands) {
			await command.done();
		}
	}
}
