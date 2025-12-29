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
	return (
		error !== null &&
		typeof error === "object" &&
		"type" in error &&
		"messages" in error
	);
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
 * バリデーションエラーから特定フィールドのエラーメッセージを取得する
 */
export function getFieldErrors(
	error: unknown,
	fieldName: string,
): string[] | undefined {
	if (isErrorResponse(error) && error.type === "valid") {
		return error.messages[fieldName];
	}
	return undefined;
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
