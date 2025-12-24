import { readFile, writeFile } from "node:fs/promises";

export interface FileStore<T> {
	get(): Promise<T>;
	save(value: T): Promise<void>;
}

export async function createJsonFileStore<T>(
	path: string,
	init: T,
): Promise<FileStore<T>> {
	const store = new JsonFileStore<T>(path, init);
	await store.load();
	return store;
}

class JsonFileStore<T> implements FileStore<T> {
	constructor(
		private readonly path: string,
		private cached: T,
	) {}

	async load() {
		try {
			const content = await readFile(this.path, "utf-8");
			this.cached = JSON.parse(content) as T;
		} catch {
			// ファイルがなければ初期値のまま
		}
	}

	async get(): Promise<T> {
		return this.cached;
	}

	async save(value: T): Promise<void> {
		const content = JSON.stringify(value, null, 2);
		await writeFile(this.path, content, "utf-8");
		this.cached = value;
	}
}
