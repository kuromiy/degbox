import { readFile, writeFile } from "node:fs/promises";
import type { ZodError, ZodIssue, ZodSchema } from "zod";
import { logger } from "../logger/index.js";

export interface FileStore<T> {
	get(): Promise<T>;
	save(value: T): Promise<void>;
}

export class FileStoreValidationError extends Error {
	constructor(
		public readonly path: string,
		public readonly zodError: ZodError,
	) {
		super(
			`Failed to validate file store at ${path}: ${zodError.issues.map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
		);
		this.name = "FileStoreValidationError";
	}
}

export async function createJsonFileStore<T>(
	path: string,
	init: T,
	schema: ZodSchema<T>,
): Promise<FileStore<T>> {
	const store = new JsonFileStore<T>(path, init, schema);
	await store.load();
	return store;
}

export interface CreateJsonFileStoreWithFallbackOptions {
	/**
	 * バリデーションエラー時のコールバック
	 * trueを返すと初期値にリセット、falseを返すとエラーを再スロー
	 */
	onValidationError?: (error: FileStoreValidationError) => Promise<boolean>;
}

/**
 * バリデーションエラー時にフォールバック機能を持つJsonFileStoreを作成
 * ファイルが破損している場合、初期値にリセットするかエラーをスローするかを選択可能
 */
export async function createJsonFileStoreWithFallback<T>(
	path: string,
	init: T,
	schema: ZodSchema<T>,
	options: CreateJsonFileStoreWithFallbackOptions = {},
): Promise<FileStore<T>> {
	const { onValidationError } = options;

	try {
		return await createJsonFileStore(path, init, schema);
	} catch (error) {
		if (error instanceof FileStoreValidationError) {
			logger.warn(
				`FileStore: Validation error at ${path}, considering fallback`,
				{
					path,
					error: error.message,
				},
			);

			// コールバックがなければデフォルトで初期値にリセット
			const shouldReset = onValidationError
				? await onValidationError(error)
				: true;

			if (shouldReset) {
				logger.info(`FileStore: Resetting to initial value at ${path}`);
				const store = new JsonFileStore<T>(path, init, schema);
				await store.save(init);
				return store;
			}
		}
		throw error;
	}
}

class JsonFileStore<T> implements FileStore<T> {
	constructor(
		private readonly path: string,
		private cached: T,
		private readonly schema: ZodSchema<T>,
	) {}

	async load() {
		try {
			const content = await readFile(this.path, "utf-8");
			const parsed: unknown = JSON.parse(content);
			const result = this.schema.safeParse(parsed);
			if (!result.success) {
				throw new FileStoreValidationError(this.path, result.error);
			}
			this.cached = result.data;
		} catch (error) {
			if (error instanceof FileStoreValidationError) {
				throw error;
			}
			// ファイルがなければ初期値のまま（ENOENTエラー等）
			// ファイル読み取りやJSONパースエラーを記録
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			const errorCode =
				error instanceof Error && "code" in error
					? (error as NodeJS.ErrnoException).code
					: undefined;
			logger.warn(`FileStore: Failed to load file at ${this.path}`, {
				path: this.path,
				error: errorMessage,
				code: errorCode,
			});
		}
	}

	async get(): Promise<T> {
		return this.cached;
	}

	async save(value: T): Promise<void> {
		const result = this.schema.safeParse(value);
		if (!result.success) {
			throw new FileStoreValidationError(this.path, result.error);
		}
		const content = JSON.stringify(result.data, null, 2);
		await writeFile(this.path, content, "utf-8");
		this.cached = result.data;
	}
}
