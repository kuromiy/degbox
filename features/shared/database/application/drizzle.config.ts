import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle/application",
	schema: "./features/shared/database/application/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "file:application.db",
	},
});
