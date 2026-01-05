import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export type TableInfo = {
	name: string;
};

export type DevTablesResponse = {
	tables: TableInfo[];
};

/**
 * テーブル一覧を取得するAPI（開発モード専用）
 */
export async function devTables(ctx: Context): Promise<DevTablesResponse> {
	const { container } = ctx;
	const [logger, appConfig, db] = container.get(
		TOKENS.LOGGER,
		TOKENS.APP_CONFIG,
		TOKENS.DATABASE,
	);

	if (!appConfig.isDev) {
		logger.warn("devTables API called in production mode");
		return { tables: [] };
	}

	const result = await db.run(
		"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
	);

	return {
		tables: result.rows.map((row) => ({ name: row.name as string })),
	};
}
