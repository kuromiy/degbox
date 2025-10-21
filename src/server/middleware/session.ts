import { randomUUID } from "node:crypto";
import { getCookie, setCookie } from "hono/cookie";
import { factory } from "../factory.js";
import type { SessionData } from "../session.js";
import { Session, sessionStore } from "../session.js";

const SESSION_ID = "degbox-session-id";

export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
	const sessionId = getCookie(c, SESSION_ID) || randomUUID();
	let session = await sessionStore.getSession(sessionId);

	// セッションが取得できない場合は新規作成（ストア実装変更に対応）
	if (!session) {
		session = new Session<SessionData>();
	}

	c.set("session", session);

	try {
		await next();
	} finally {
		// エラー発生時もセッション状態を常に永続化
		await sessionStore.setSession(sessionId, session);
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
	}
});
