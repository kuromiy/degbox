import type { z } from "zod";

export type ValidMessage = Record<string, string[]>;

export class ValidError extends Error {
	private _messages: ValidMessage;

	constructor(src: z.ZodError) {
		super("valid error.");
		this.name = "ValidError";
		this._messages = toValidError(src);
	}

	public get messages() {
		return this._messages;
	}
}

function toValidError<T>(error: z.ZodError<T>) {
	const errors: Record<string, string[]> = {};
	for (const issue of error.issues) {
		const path = issue.path.join(".");
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path].push(issue.message);
	}
	return errors;
}
