import { createLogger, format, transports } from "winston";

/**
 * Errorオブジェクトを再帰的にフォーマットする
 */
function formatError(error: Error): object {
	const result: Record<string, unknown> = {
		name: error.name,
		message: error.message,
		stack: error.stack,
	};
	if (error.cause instanceof Error) {
		result.cause = formatError(error.cause);
	} else if (error.cause) {
		result.cause = error.cause;
	}
	return result;
}

/**
 * Errorオブジェクトのstackプロパティを展開するカスタムformat
 */
const errorStackFormat = format((info) => {
	if (info.error instanceof Error) {
		info.error = formatError(info.error);
	}
	return info;
});

const myFormat = format.printf((info) => {
	const { level, message, timestamp, ...metadata } = info;
	const base = `${timestamp} [${level}] ${message}`;

	// winstonの内部プロパティを除外
	const filtered = Object.fromEntries(
		Object.entries(metadata).filter(
			([key]) => !key.startsWith("Symbol") && key !== "splat",
		),
	);

	if (Object.keys(filtered).length > 0) {
		return `${base}\n${JSON.stringify(filtered, null, 2)}`;
	}
	return base;
});

export const logger = createLogger({
	level: "debug",
	format: format.combine(format.timestamp(), errorStackFormat(), myFormat),
	transports: [new transports.Console()],
});
