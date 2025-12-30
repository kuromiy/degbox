import type { z } from "zod";
import type { Context } from "../../../src/main/context.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { ValidError } from "../error/valid/index.js";

export function zodValidator<T>(schema: z.ZodSchema<T>) {
	return (args: unknown, ctx: Context): T => {
		const logger = ctx.container.get(TOKENS.LOGGER);
		const valid = schema.safeParse(args);
		if (!valid.success) {
			const error = new ValidError(valid.error);
			logger.debug("invalid request", { error });
			throw error;
		}
		return valid.data;
	};
}
