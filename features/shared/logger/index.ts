import { createLogger, format, transports } from "winston";

/**
 * Errorオブジェクトのstackプロパティを展開するカスタムformat
 */
const _errorStackFormat = format((info) => {
	if (info.error instanceof Error) {
		const { message, stack, name, cause } = info.error;
		info.error = {
			name,
			message,
			stack,
			cause,
		};
	}
	return info;
});

const myFormat = format.printf(({ level, message, timestamp }) => {
	return `${timestamp} [${level}] ${message}`;
});

export const logger = createLogger({
	level: "debug",
	// format: format.combine(
	// 	errorStackFormat(),
	// 	format.json(),
	// ),
	format: format.combine(format.timestamp(), myFormat),
	transports: [new transports.Console()],
});
