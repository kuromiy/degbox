import { createLogger } from "winston";

export const testLogger = createLogger({
	silent: true, // すべてのログ出力を抑制
});
