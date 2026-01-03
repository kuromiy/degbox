import { createLogger, format, transports } from "winston";

/**
 * Errorオブジェクトのstackプロパティを展開するカスタムformat
 */
const errorStackFormat = format((info) => {
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

export const logger = createLogger({
	level: "info",
	format: format.combine(errorStackFormat(), format.json()),
	transports: [new transports.Console()],
});
