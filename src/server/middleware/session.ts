import { randomUUID } from "node:crypto";
import { getCookie, setCookie } from "hono/cookie";
import { factory } from "../factory.js";
import { sessionStore } from "../session.js";

const SESSION_ID = "degbox-session-id";

export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, SESSION_ID) || randomUUID();
	const session = await sessionStore.getSession(sessionId);
	c.set("session", session);

	// セッションCookieを即座に設定
	setCookie(c, SESSION_ID, sessionId, {
		httpOnly: true, // JavaScriptからのアクセスを防止
		// ローカルLAN環境のみを想定しHTTPS化しない
		// 理由: ローカルネットワーク内は物理的に保護されており、
		//       httpOnly + sameSite で十分なXSS/CSRF対策が可能
		secure: false,
		sameSite: "Lax", // CSRF攻撃を防止
		path: "/", // アプリ全体で有効
		maxAge: 1800, // 30分 (sessionStoreのTTLと整合)
	});

	try {
		await next();
	} finally {
		// エラー発生時もセッション状態を常に永続化
		await sessionStore.setSession(sessionId, session);
	}
});
