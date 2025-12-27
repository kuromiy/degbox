import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PROJECTS = sqliteTable("projects", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	path: text("path").notNull().unique(),
	overview: text("overview").notNull(),
	openedAt: text("opened_at").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
