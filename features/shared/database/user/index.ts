import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema.js";

export async function createDatabase(url: string, path: string) {
	const client = createClient({ url: url });
	const database = drizzle({ client, schema });
	const migFolder = join(path, "drizzle", "user");
	await migrate(database, { migrationsFolder: migFolder });
	return database;
}
