import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle/user",
	schema: "./features/shared/database/user/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: "file:user.db",
	},
});
