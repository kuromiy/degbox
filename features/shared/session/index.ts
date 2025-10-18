export interface ISession<BODY> {
	get<T extends keyof BODY>(key: T): BODY[T] | undefined;
	set<T extends keyof BODY>(key: T, value: BODY[T], flush?: boolean): void;
}

export interface ISessionStore<BODY> {
	getSession(id: string): Promise<ISession<BODY> | undefined>;
	setSession(id: string, session: ISession<BODY>): Promise<void>;
}
