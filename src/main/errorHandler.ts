import { failure } from "electron-flow/result";
import { ApplicationError } from "../../features/shared/error/application/index.js";
import type { SystemMessage } from "../../features/shared/error/system/index.js";
import { ValidError } from "../../features/shared/error/valid/index.js";
import type { Context } from "./context.js";
import { TOKENS } from "./di/token.js";

export type ErrorResponse =
	| { type: "valid"; messages: Record<string, string[]> }
	| { type: "application"; messages: string }
	| { type: "system"; messages: string };

export function customErrorHandler(e: unknown, ctx: Context) {
	const logger = ctx.container.get(TOKENS.LOGGER);
	if (e instanceof ValidError) {
		// バリデーションエラー → debug（通常のユーザー入力ミス）
		logger.debug("Validation error", {
			errors: e.messages,
		});
		return failure({ type: "valid", messages: e.messages } as ErrorResponse);
	}

	if (e instanceof ApplicationError) {
		// アプリケーションエラー → warn（業務ロジック上の問題）
		logger.warn("Application error", {
			message: e.messages,
		});
		return failure({
			type: "application",
			messages: e.messages,
		} as ErrorResponse);
	}

	// システムエラー → error（調査必要）
	logger.error("Unexpected error", {
		error: e instanceof Error ? e.message : String(e),
		stack: e instanceof Error ? e.stack : undefined,
	});
	return failure({
		type: "system",
		messages: "予期せぬエラーが発生しました" as SystemMessage,
	} as ErrorResponse);
}
