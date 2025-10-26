import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../features/shared/database/schema.js";

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
	database: ReturnType<typeof drizzle<typeof schema>>;
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
	// 既存のデータベースファイルを削除（存在しない場合は無視）
	await rm(dbName, { force: true });

	const url = `file:${dbName}`;
	const client = createClient({ url });
	const database = drizzle({ client, schema });

	// マイグレーションを実行（絶対パスを使用）
	const migrationsFolder = join(__dirname, "../../drizzle");
	await migrate(database, { migrationsFolder });

	// クリーンアップ関数を作成
	const cleanup = async () => {
		client.close();
	};

	return { database, cleanup };
}
