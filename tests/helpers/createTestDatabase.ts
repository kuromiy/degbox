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
		// await rm(absoluteDbPath, { force: true });
		// これコメントアウトすると [Error: EBUSY: resource busy or locked, unlink 'xxxx\search.server.test.db'] { errno: -4082, code: 'EBUSY', syscall: 'unlink', path: 'xxxx\\search.server.test.db' }
	};

	return { database, cleanup };
}
