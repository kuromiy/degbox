import type {
	ISession,
	ISessionStore,
} from "../../features/shared/session/index.js";

export type SessionData = {
	errors: Record<string, string[]>;
	formData: Record<string, unknown>;
};

export class Session<BODY> implements ISession<BODY> {
	private data: Partial<BODY> = {};
	private flashKeys: Set<keyof BODY> = new Set();

	get<T extends keyof BODY>(key: T): BODY[T] | undefined {
		const value = this.data[key];

		// フラッシュデータの場合は取得後に削除
		if (this.flashKeys.has(key)) {
			delete this.data[key];
			this.flashKeys.delete(key);
		}

		return value;
	}

	set<T extends keyof BODY>(key: T, value: BODY[T], flush?: boolean): void {
		this.data[key] = value;

		// flush=true の場合はフラッシュキーに追加
		if (flush === true) {
			this.flashKeys.add(key);
		}
	}
}

class MemorySessionStore<BODY> implements ISessionStore<BODY> {
	private _session: Record<string, ISession<BODY>> = {};

	async getSession(id: string): Promise<ISession<BODY> | undefined> {
		// セッションが存在しない場合は新規作成
		if (!this._session[id]) {
			this._session[id] = new Session<BODY>();
		}
		return this._session[id];
	}
	async setSession(id: string, session: ISession<BODY>): Promise<void> {
		this._session[id] = session;
	}
}

export const sessionStore = new MemorySessionStore<SessionData>();
