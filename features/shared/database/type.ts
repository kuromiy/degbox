import type { ResultSet } from "@libsql/client";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema.js";

type DATABASE_SCHEMA = typeof schema;
export type Database =
	| LibSQLDatabase<DATABASE_SCHEMA>
	| SQLiteTransaction<
			"async",
			ResultSet,
			DATABASE_SCHEMA,
			ExtractTablesWithRelations<DATABASE_SCHEMA>
	  >;
