export class InjectionToken<_T = unknown> {
	constructor(private readonly description: string) {}

	toString(): string {
		return `InjectionToken(${this.description})`;
	}
}

type Provider<T> = (container: Container) => T;

export class Container {
	private providers = new Map<InjectionToken<unknown>, Provider<unknown>>();
	private parent: Container | undefined;

	constructor(parent?: Container) {
		this.parent = parent;
	}

	createScope(): Container {
		return new Container(this);
	}

	register<T>(token: InjectionToken<T>, provider: Provider<T>): void {
		this.providers.set(token, provider);
	}

	// オーバーロードシグネチャ
	get<T>(token: InjectionToken<T>): T;
	get<T1, T2>(t1: InjectionToken<T1>, t2: InjectionToken<T2>): [T1, T2];
	get<T1, T2, T3>(
		t1: InjectionToken<T1>,
		t2: InjectionToken<T2>,
		t3: InjectionToken<T3>,
	): [T1, T2, T3];
	get<T1, T2, T3, T4>(
		t1: InjectionToken<T1>,
		t2: InjectionToken<T2>,
		t3: InjectionToken<T3>,
		t4: InjectionToken<T4>,
	): [T1, T2, T3, T4];
	get<T1, T2, T3, T4, T5>(
		t1: InjectionToken<T1>,
		t2: InjectionToken<T2>,
		t3: InjectionToken<T3>,
		t4: InjectionToken<T4>,
		t5: InjectionToken<T5>,
	): [T1, T2, T3, T4, T5];
	// biome-ignore lint/suspicious/noExplicitAny: オーバーロード実装のため
	get(...args: any[]): any {
		return args.length === 1
			? this.getSingle(args[0])
			: // biome-ignore lint/suspicious/noExplicitAny: 複数引数は任意の型のトークン
				args.map((token: any) => this.getSingle(token));
	}

	private getSingle<T>(token: InjectionToken<T>): T {
		// プロバイダーを探す（現在のコンテナから親に向かって）
		const provider = this.findProvider(token);

		// factory関数を呼び出してインスタンスを返す
		return provider(this);
	}

	private findProvider<T>(token: InjectionToken<T>): Provider<T> {
		// 現在のコンテナから親に向かってプロバイダーを探す
		let currentContainer: Container | undefined = this;

		while (currentContainer) {
			const provider = currentContainer.providers.get(token);
			if (provider) {
				return provider as Provider<T>;
			}
			currentContainer = currentContainer.parent;
		}

		throw new Error(`No provider for ${token.toString()}`);
	}
}

export function createScopedContainer<T1>(
	parentContainer: Container,
	tuple1: [InjectionToken<T1>, T1],
): Container;
export function createScopedContainer<T1, T2>(
	parentContainer: Container,
	tuple1: [InjectionToken<T1>, T1],
	tuple2: [InjectionToken<T2>, T2],
): Container;
export function createScopedContainer<T1, T2, T3>(
	parentContainer: Container,
	tuple1: [InjectionToken<T1>, T1],
	tuple2: [InjectionToken<T2>, T2],
	tuple3: [InjectionToken<T3>, T3],
): Container;
export function createScopedContainer<T1, T2, T3, T4>(
	parentContainer: Container,
	tuple1: [InjectionToken<T1>, T1],
	tuple2: [InjectionToken<T2>, T2],
	tuple3: [InjectionToken<T3>, T3],
	tuple4: [InjectionToken<T4>, T4],
): Container;
export function createScopedContainer<T1, T2, T3, T4, T5>(
	parentContainer: Container,
	tuple1: [InjectionToken<T1>, T1],
	tuple2: [InjectionToken<T2>, T2],
	tuple3: [InjectionToken<T3>, T3],
	tuple4: [InjectionToken<T4>, T4],
	tuple5: [InjectionToken<T5>, T5],
): Container;
export function createScopedContainer(
	parentContainer: Container,
	...args: unknown[]
): Container {
	const scopedContainer = parentContainer.createScope();
	for (const [token, instance] of args as [
		InjectionToken<unknown>,
		unknown,
	][]) {
		if (token && instance !== undefined) {
			scopedContainer.register(token, () => instance);
		}
	}
	return scopedContainer;
}
