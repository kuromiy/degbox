/**
 * ErrorResponse型（main側のcustomErrorHandlerから返される）
 */
export type ErrorResponse =
	| { type: "valid"; messages: Record<string, string[]> }
	| { type: "application"; messages: string }
	| { type: "system"; messages: string };

/**
 * unknown型がErrorResponse型かどうかを判定する
 */
export function isErrorResponse(error: unknown): error is ErrorResponse {
	if (error === null || typeof error !== "object") {
		return false;
	}
	if (!("type" in error) || !("messages" in error)) {
		return false;
	}

	const obj = error as { type: unknown; messages: unknown };

	if (typeof obj.type !== "string") {
		return false;
	}

	// type: "valid" の場合、messages は Record<string, string[]>
	if (obj.type === "valid") {
		if (obj.messages === null || typeof obj.messages !== "object") {
			return false;
		}
		const messagesObj = obj.messages as Record<string, unknown>;
		return Object.values(messagesObj).every(
			(arr) => Array.isArray(arr) && arr.every((m) => typeof m === "string"),
		);
	}

	// type: "application" または "system" の場合、messages は string
	if (obj.type === "application" || obj.type === "system") {
		return typeof obj.messages === "string";
	}

	return false;
}

/**
 * unknown型のエラーからメッセージを抽出する（application/systemエラー用）
 */
export function getErrorMessage(error: unknown): string {
	if (error === null || error === undefined) {
		return "不明なエラーが発生しました";
	}

	// ErrorResponse型の場合
	if (isErrorResponse(error)) {
		if (error.type === "valid") {
			// バリデーションエラーの場合、全メッセージを結合
			const allMessages = Object.values(error.messages).flat();
			if (allMessages.length === 0) {
				return "入力内容に問題があります";
			}
			return allMessages.join(", ");
		}
		return error.messages;
	}

	// 通常のError型の場合
	if (error instanceof Error) {
		return error.message;
	}

	// 文字列の場合
	if (typeof error === "string") {
		return error;
	}

	return "不明なエラーが発生しました";
}

/**
 * ActionData用の型
 */
export type ActionError = {
	error: ErrorResponse;
};

/**
 * ActionDataがエラーかどうかを判定する
 */
export function isActionError(data: unknown): data is ActionError {
	return (
		data !== null &&
		typeof data === "object" &&
		"error" in data &&
		isErrorResponse((data as ActionError).error)
	);
}
