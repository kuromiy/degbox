import { randomUUID } from "node:crypto";
import { getCookie, setCookie } from "hono/cookie";
import { factory } from "../factory.js";
import { sessionStore } from "../session.js";

const SESSION_ID = "degbox-session-id";

export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, SESSION_ID) || randomUUID();
	const session = await sessionStore.getSession(sessionId);

	// セッションストアは新規セッションを自動作成するため、常に有効なセッションが返る
	if (session) {
		c.set("session", session);
	}

	try {
		await next();
	} finally {
		// エラー発生時もセッション状態を永続化
		if (session) {
			await sessionStore.setSession(sessionId, session);
		}
		setCookie(c, SESSION_ID, sessionId, {
			httpOnly: true, // JavaScriptからのアクセスを防止
			secure: false, // HTTP通信を許可（ローカルLAN環境）
			sameSite: "Lax", // CSRF攻撃を防止
			path: "/", // アプリ全体で有効
			maxAge: 1800, // 30分 (sessionStoreのTTLと整合)
		});
	}
});
