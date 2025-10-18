import { randomUUID } from "node:crypto";
import { getCookie, setCookie } from "hono/cookie";
import { factory } from "../factory.js";
import { sessionStore } from "../session.js";

const SESSIONN_ID = "degbox-session-id";

// TODO: 全体フローの見直し
export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, SESSIONN_ID) || randomUUID();
	const session = await sessionStore.getSession(sessionId);
	if (!session) {
		// TODO: 新規セッション作成
		throw new Error("Session not found");
	}
	c.set("session", session);
	await next();
	await sessionStore.setSession(sessionId, session);
	setCookie(c, SESSIONN_ID, sessionId);
});
