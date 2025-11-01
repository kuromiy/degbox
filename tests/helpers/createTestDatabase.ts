import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../../features/shared/database/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * テスト用のデータベースを作成する
 * @param dbName データベースファイル名（例: "search.test"）
 * @returns データベースインスタンスとクリーンアップ関数
 */
export async function createTestDatabase(dbName: string) {
	// tests/db ディレクトリを作成（既に存在する場合は無視）
	const dbDir = join(__dirname, "../db");
	await mkdir(dbDir, { recursive: true });

	// tests/db ディレクトリ配下に配置
	const absoluteDbPath = join(dbDir, dbName);

	const uuid = randomUUID();
	const url = `file:${absoluteDbPath}-${uuid}.db`;
	const client = createClient({ url });
	const database = drizzle({ client, schema });

	// マイグレーションを実行（絶対パスを使用）
	const migrationsFolder = join(__dirname, "../../drizzle");
	await migrate(database, { migrationsFolder });

	return database;
}
