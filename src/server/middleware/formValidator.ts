import type { Context } from "hono";
import { validator } from "hono/validator";
import type { z } from "zod";
import type { Env } from "../types.js";

export function formValidatorMiddleware<T>(schema: z.ZodType<T>) {
	return validator("form", (value, c: Context<Env>) => {
		const { session } = c.var;
		const valid = schema.safeParse(value);
		if (!valid.success) {
			// zodエラーを Record<string, string[]> 形式に変換
			const errors: Record<string, string[]> = {};
			for (const issue of valid.error.issues) {
				const path = issue.path.join(".") || "form";
				if (!errors[path]) {
					errors[path] = [];
				}
				errors[path].push(issue.message);
			}
			// セッションにエラーとフォームデータを保存
			session.set("errors", errors, true);
			session.set("formData", value, true);
			return c.redirect(c.req.url);
		}
		return valid.data;
	});
}
