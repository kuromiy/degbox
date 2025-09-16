import type { Context } from "../context.js";

export async function checkHealth(_: Context) {
	return { status: "ok", timestamp: Date.now() };
}
