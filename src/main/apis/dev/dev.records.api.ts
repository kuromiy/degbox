import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const devRecordsSchema = z.object({
	tableName: z.string().min(1),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(50),
});

export type DevRecordsRequest = z.infer<typeof devRecordsSchema>;

export type ColumnInfo = {
	cid: number;
	name: string;
	type: string;
	notnull: number;
	dflt_value: string | null;
	pk: number;
};

export type DevRecordsResponse = {
	columns: ColumnInfo[];
	records: Record<string, unknown>[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

// テーブル名のバリデーション（SQLインジェクション対策）
const VALID_TABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * 指定テーブルのレコードを取得するAPI（開発モード専用）
 */
export async function devRecords(
	ctx: Context,
	request: DevRecordsRequest,
): Promise<DevRecordsResponse> {
	const { container } = ctx;
	const [logger, appConfig, db] = container.get(
		TOKENS.LOGGER,
		TOKENS.APP_CONFIG,
		TOKENS.DATABASE,
	);

	if (!appConfig.isDev) {
		logger.warn("devRecords API called in production mode");
		return {
			columns: [],
			records: [],
			total: 0,
			page: 1,
			limit: 50,
			totalPages: 0,
		};
	}

	const { tableName, page, limit } = request;

	// テーブル名のバリデーション
	if (!VALID_TABLE_NAME_REGEX.test(tableName)) {
		logger.warn("Invalid table name", { tableName });
		throw new Error("Invalid table name");
	}

	// テーブルが存在するかチェック
	const tableExistsResult = await db.run(
		`SELECT name FROM sqlite_master WHERE type='table' AND name = '${tableName}'`,
	);

	if (tableExistsResult.rows.length === 0) {
		logger.warn("Table not found", { tableName });
		throw new Error("Table not found");
	}

	// カラム情報取得
	const columnsResult = await db.run(`PRAGMA table_info(${tableName})`);
	const columns = columnsResult.rows.map((row) => ({
		cid: row.cid as number,
		name: row.name as string,
		type: row.type as string,
		notnull: row.notnull as number,
		dflt_value: row.dflt_value as string | null,
		pk: row.pk as number,
	}));

	// 総レコード数取得
	const countResult = await db.run(
		`SELECT COUNT(*) as count FROM ${tableName}`,
	);
	const total = (countResult.rows[0]?.count as number) ?? 0;

	// レコード取得（ページネーション）
	const offset = (page - 1) * limit;
	const recordsResult = await db.run(
		`SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`,
	);
	const records = recordsResult.rows.map(
		(row) => Object.fromEntries(Object.entries(row)) as Record<string, unknown>,
	);

	const totalPages = Math.ceil(total / limit);

	return {
		columns,
		records,
		total,
		page,
		limit,
		totalPages,
	};
}

export const devRecordsValidator = zodValidator(devRecordsSchema);
