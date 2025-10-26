import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export function createDatabase(url: string) {
	const client = createClient({ url: url }); // "file:local.db"
	return drizzle({ client, schema });
}
