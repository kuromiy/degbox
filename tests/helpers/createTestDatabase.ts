import { rm } from "node:fs/promises";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../features/shared/database/schema.js";

/**
 * テスト用のデータベースを作成する
 * @param dbName データベースファイル名（例: "search.test.db"）
 * @returns drizzleインスタンス
 */
export async function createTestDatabase(dbName: string) {
	// 既存のデータベースファイルを削除（存在しない場合は無視）
	await rm(dbName, { force: true });

	const url = `file:${dbName}`;
	const client = createClient({ url });
	const db = drizzle({ client, schema });

	// マイグレーションを実行
	await migrate(db, { migrationsFolder: "./drizzle" });

	return db;
}
