import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../features/shared/database/schema.js";
import type { Database } from "../../features/shared/database/type.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * テスト用データベースのクリーンアップ関数の型
 */
export type CleanupFunction = () => Promise<void>;

/**
 * テスト用データベースの戻り値の型
 */
export type TestDatabaseResult = {
	database: Database;
	cleanup: CleanupFunction;
};

/**
 * グローバルクリーンアップ用のDBパス登録
 */
const pendingCleanupPaths = new Set<string>();

/**
 * ファイル削除をリトライする
 * @param path 削除するファイルのパス
 * @param retries リトライ回数（デフォルト: 3）
 * @param delayMs リトライ間隔（ミリ秒、デフォルト: 100）
 */
async function unlinkWithRetry(
	path: string,
	retries = 3,
	delayMs = 100,
): Promise<void> {
	for (let i = 0; i < retries; i++) {
		try {
			await rm(path, { force: true });
			pendingCleanupPaths.delete(path);
			return;
		} catch (_error) {
			if (i === retries - 1) {
				// 最終リトライ失敗時はグローバルクリーンアップに登録
				console.warn(
					`Failed to delete ${path} after ${retries} retries. Registered for global cleanup.`,
				);
				pendingCleanupPaths.add(path);
				return;
			}
			// リトライ前に待機（指数バックオフ）
			await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
		}
	}
}

/**
 * テスト用のデータベースを作成する
 * @param dbName データベースファイル名（例: "search.test.db"）
 * @returns データベースインスタンスとクリーンアップ関数
 */
export async function createTestDatabase(
	dbName: string,
): Promise<TestDatabaseResult> {
	// 絶対パスに解決（テストヘルパーディレクトリを基準とするため、CWDに依存しない）
	const absoluteDbPath = join(__dirname, "../../", dbName);

	// 既存のデータベースファイルを削除（存在しない場合は無視）
	await rm(absoluteDbPath, { force: true });

	const url = `file:${absoluteDbPath}`;
	const client = createClient({ url });
	const database = drizzle({ client, schema });

	// マイグレーションを実行（絶対パスを使用）
	const migrationsFolder = join(__dirname, "../../drizzle");
	await migrate(database, { migrationsFolder });

	// クリーンアップ関数を作成（絶対パスを使用して確実に削除）
	const cleanup = async () => {
		client.close();
		// ファイルハンドル解放を待ってからリトライベースで削除
		await unlinkWithRetry(absoluteDbPath);
	};

	return { database, cleanup };
}
