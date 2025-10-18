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
	private lastAccess: Record<string, number> = {};
	private lastCleanup = 0;
	private readonly ttl: number;
	private readonly CLEANUP_INTERVAL = 60 * 1000; // 1分に1回まで

	constructor(ttlMs: number = 30 * 60 * 1000) {
		this.ttl = ttlMs;
	}

	async getSession(id: string): Promise<ISession<BODY> | undefined> {
		this.cleanup();
		// セッションが存在しない場合は新規作成
		if (!this._session[id]) {
			this._session[id] = new Session<BODY>();
		}
		this.lastAccess[id] = Date.now();
		return this._session[id];
	}

	async setSession(id: string, session: ISession<BODY>): Promise<void> {
		this._session[id] = session;
		this.lastAccess[id] = Date.now();
	}

	private cleanup(): void {
		const now = Date.now();
		// 前回のクリーンアップから一定時間経過していない場合はスキップ
		if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
			return;
		}
		this.lastCleanup = now;

		for (const id in this.lastAccess) {
			const lastAccessTime = this.lastAccess[id];
			if (lastAccessTime !== undefined && now - lastAccessTime > this.ttl) {
				delete this._session[id];
				delete this.lastAccess[id];
			}
		}
	}

	destroy(): void {
		this._session = {};
		this.lastAccess = {};
	}
}

export const sessionStore = new MemorySessionStore<SessionData>();
