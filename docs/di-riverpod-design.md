# Riverpod風DI設計案

## 現在の実装

```typescript
// token.ts - トークン定義
export const TOKENS = {
  LOGGER: new InjectionToken<Logger>("logger"),
  DATABASE: new InjectionToken<Database>("Database"),
  CONTENT_REPOSITORY: new InjectionToken<ContentRepository>("ContentRepository"),
};

// dependencies.ts - プロバイダー登録
export const depend: DependencyEntry[] = [
  {
    token: TOKENS.LOGGER,
    provider: (_: Container) => logger,
  },
  {
    token: TOKENS.CONTENT_REPOSITORY,
    provider: (c: Container) => new ContentDataSource(c.get(TOKENS.DATABASE)),
  },
];

// 使用時
container.get(TOKENS.LOGGER);
container.get(TOKENS.CONTENT_REPOSITORY);
```

---

## 案1: 完全なRiverpod風

### 設計思想
- `InjectionToken`を廃止し、`Provider`オブジェクトで型とファクトリを一体化
- `ref.read(provider)`でDI解決
- 各プロバイダーは個別にエクスポート（TOKENSオブジェクト不要）

### 実装例

```typescript
// features/shared/container/provider.ts
export type Ref = {
  read<T>(provider: Provider<T>): T;
};

export type Provider<T> = {
  readonly _type: T; // 型推論用（実行時には使わない）
  readonly factory: (ref: Ref) => T;
  readonly name: string;
};

export function Provider<T>(
  name: string,
  factory: (ref: Ref) => T
): Provider<T> {
  return {
    _type: undefined as T,
    factory,
    name,
  };
}

// features/shared/container/container.ts
export class ProviderContainer implements Ref {
  private cache = new Map<Provider<unknown>, unknown>();
  private parent?: ProviderContainer;

  constructor(parent?: ProviderContainer) {
    this.parent = parent;
  }

  read<T>(provider: Provider<T>): T {
    // キャッシュチェック
    if (this.cache.has(provider)) {
      return this.cache.get(provider) as T;
    }

    // 親コンテナチェック
    if (this.parent?.cache.has(provider)) {
      return this.parent.cache.get(provider) as T;
    }

    // 新規作成してキャッシュ
    const value = provider.factory(this);
    this.cache.set(provider, value);
    return value;
  }

  override<T>(provider: Provider<T>, value: T): void {
    this.cache.set(provider, value);
  }

  createScope(): ProviderContainer {
    return new ProviderContainer(this);
  }
}
```

```typescript
// src/main/di/providers.ts
import { Provider } from "@/features/shared/container/provider.js";

// インフラ層
export const loggerProvider = Provider("logger", (_ref) => logger);

export const fileSystemProvider = Provider(
  "fileSystem",
  (_ref) => new FileSystemImpl((err) => console.error(err))
);

export const databaseProvider = Provider<Database>("database", (_ref) => {
  throw new Error("Database must be provided at runtime");
});

// リポジトリ層
export const contentRepositoryProvider = Provider(
  "contentRepository",
  (ref) => new ContentDataSource(ref.read(databaseProvider))
);

export const tagRepositoryProvider = Provider(
  "tagRepository",
  (ref) => new TagDataSource(ref.read(databaseProvider))
);

export const videoRepositoryProvider = Provider(
  "videoRepository",
  (ref) => new VideoDataSource(
    ref.read(loggerProvider),
    ref.read(databaseProvider)
  )
);

// サービス層
export const contentServiceProvider = Provider(
  "contentService",
  (ref) => new ContentServiceImpl(
    ref.read(loggerProvider),
    ref.read(fileSystemProvider),
    ref.read(projectPathProvider)
  )
);

// アクション層
export const contentActionProvider = Provider(
  "contentAction",
  (ref) => new ContentAction(
    ref.read(contentRepositoryProvider),
    ref.read(contentServiceProvider),
    ref.read(projectPathProvider)
  )
);
```

```typescript
// 使用例
const container = new ProviderContainer();
container.override(databaseProvider, db); // ランタイム値の注入

const action = container.read(contentActionProvider);
// 依存関係は自動解決される
```

### メリット
- Riverpodに最も近い直感的なAPI
- プロバイダー定義と依存関係が一箇所に集約
- TOKENSオブジェクトの二重管理が不要
- 型推論が強力

### デメリット
- 大規模なリファクタリングが必要
- 既存コードすべての`container.get(TOKENS.XXX)`を書き換え
- 循環参照の検出がやや複雑

---

## 案2: ハイブリッド

### 設計思想
- 現在のTOKENS構造を維持しつつ、Provider風の記述を導入
- 移行コストを最小化しながら、新規コードはRiverpod風で書ける

### 実装例

```typescript
// features/shared/container/index.ts
export class InjectionToken<T> {
  constructor(
    public readonly name: string,
    public readonly factory?: (ref: Ref) => T
  ) {}
}

export type Ref = {
  read<T>(token: InjectionToken<T>): T;
};

export class Container implements Ref {
  private cache = new Map<InjectionToken<unknown>, unknown>();
  private overrides = new Map<InjectionToken<unknown>, unknown>();
  private parent?: Container;

  read<T>(token: InjectionToken<T>): T {
    // オーバーライドチェック
    if (this.overrides.has(token)) {
      return this.overrides.get(token) as T;
    }

    // キャッシュチェック
    if (this.cache.has(token)) {
      return this.cache.get(token) as T;
    }

    // 親チェック
    if (this.parent) {
      return this.parent.read(token);
    }

    // ファクトリがあれば実行
    if (token.factory) {
      const value = token.factory(this);
      this.cache.set(token, value);
      return value;
    }

    throw new Error(`No provider for ${token.name}`);
  }

  // 後方互換性のため維持
  get<T>(token: InjectionToken<T>): T {
    return this.read(token);
  }

  provide<T>(token: InjectionToken<T>, value: T): void {
    this.overrides.set(token, value);
  }
}
```

```typescript
// src/main/di/token.ts（拡張版）
export const TOKENS = {
  // 既存のトークン（ファクトリなし - ランタイム注入用）
  DATABASE: new InjectionToken<Database>("Database"),
  PROJECT_PATH: new InjectionToken<string>("ProjectPath"),

  // 新しいトークン（ファクトリ付き - 自動解決）
  LOGGER: new InjectionToken<Logger>("logger", () => logger),

  FILE_SYSTEM: new InjectionToken<FileSystem>(
    "FileSystem",
    () => new FileSystemImpl((err) => console.error(err))
  ),

  CONTENT_REPOSITORY: new InjectionToken<ContentRepository>(
    "ContentRepository",
    (ref) => new ContentDataSource(ref.read(TOKENS.DATABASE))
  ),

  CONTENT_SERVICE: new InjectionToken<ContentService>(
    "ContentService",
    (ref) => new ContentServiceImpl(
      ref.read(TOKENS.LOGGER),
      ref.read(TOKENS.FILE_SYSTEM),
      ref.read(TOKENS.PROJECT_PATH)
    )
  ),

  CONTENT_ACTION: new InjectionToken<ContentAction>(
    "ContentAction",
    (ref) => new ContentAction(
      ref.read(TOKENS.CONTENT_REPOSITORY),
      ref.read(TOKENS.CONTENT_SERVICE),
      ref.read(TOKENS.PROJECT_PATH)
    )
  ),
};
```

```typescript
// 使用例（新旧両方のAPIが使える）
const container = new Container();
container.provide(TOKENS.DATABASE, db);
container.provide(TOKENS.PROJECT_PATH, "/path/to/project");

// 新しいAPI
const action = container.read(TOKENS.CONTENT_ACTION);

// 旧API（後方互換）
const logger = container.get(TOKENS.LOGGER);
```

### メリット
- 段階的な移行が可能
- 既存コードはそのまま動作
- 新規コードからRiverpod風に書ける

### デメリット
- 2つのパターンが混在する過渡期がある
- TOKENSオブジェクト内での循環参照定義が必要（変数巻き上げに注意）

---

## 案3: シンプル版

### 設計思想
- Providerの定義スタイルのみRiverpod風に変更
- Containerクラスは現状維持
- 依存関係の記述を簡潔化

### 実装例

```typescript
// src/main/di/providers.ts
import type { Container } from "@/features/shared/container/index.js";
import { TOKENS } from "./token.js";

// ヘルパー関数
const define = <T>(factory: (ref: Container) => T) => factory;

// プロバイダー定義（Riverpod風の記述）
export const providers = {
  // インフラ層
  [TOKENS.LOGGER.name]: define(() => logger),

  [TOKENS.FILE_SYSTEM.name]: define(
    () => new FileSystemImpl((err) => console.error(err))
  ),

  // リポジトリ層
  [TOKENS.CONTENT_REPOSITORY.name]: define(
    (ref) => new ContentDataSource(ref.get(TOKENS.DATABASE))
  ),

  [TOKENS.TAG_REPOSITORY.name]: define(
    (ref) => new TagDataSource(ref.get(TOKENS.DATABASE))
  ),

  // サービス層
  [TOKENS.CONTENT_SERVICE.name]: define(
    (ref) => new ContentServiceImpl(
      ref.get(TOKENS.LOGGER),
      ref.get(TOKENS.FILE_SYSTEM),
      ref.get(TOKENS.PROJECT_PATH)
    )
  ),

  // アクション層
  [TOKENS.CONTENT_ACTION.name]: define(
    (ref) => new ContentAction(
      ref.get(TOKENS.CONTENT_REPOSITORY),
      ref.get(TOKENS.CONTENT_SERVICE),
      ref.get(TOKENS.PROJECT_PATH)
    )
  ),
};

// 自動登録ヘルパー
export function registerAll(container: Container): void {
  for (const [name, factory] of Object.entries(providers)) {
    const token = Object.values(TOKENS).find((t) => t.name === name);
    if (token) {
      container.register(token, factory);
    }
  }
}
```

```typescript
// より関数的なスタイル
// src/main/di/providers.ts

export const loggerProvider = (ref: Container) => logger;

export const fileSystemProvider = (ref: Container) =>
  new FileSystemImpl((err) => console.error(err));

export const contentRepositoryProvider = (ref: Container) =>
  new ContentDataSource(ref.get(TOKENS.DATABASE));

export const contentServiceProvider = (ref: Container) =>
  new ContentServiceImpl(
    ref.get(TOKENS.LOGGER),
    ref.get(TOKENS.FILE_SYSTEM),
    ref.get(TOKENS.PROJECT_PATH)
  );

// 依存関係マッピング
export const providerMap = new Map([
  [TOKENS.LOGGER, loggerProvider],
  [TOKENS.FILE_SYSTEM, fileSystemProvider],
  [TOKENS.CONTENT_REPOSITORY, contentRepositoryProvider],
  [TOKENS.CONTENT_SERVICE, contentServiceProvider],
]);
```

### メリット
- 最小限の変更で実現可能
- 既存のContainerとTOKENSをそのまま利用
- 学習コストが低い

### デメリット
- Riverpodの本質的なメリット（Provider自体が依存を表現）は得られない
- TOKENSとプロバイダーの二重管理は残る

---

## 比較表

| 観点 | 案1: 完全Riverpod風 | 案2: ハイブリッド | 案3: シンプル版 |
|------|---------------------|-------------------|-----------------|
| Riverpod度 | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| 移行コスト | 高 | 中 | 低 |
| 型安全性 | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| コード量 | 増加 | 微増 | 微減 |
| 後方互換性 | なし | あり | あり |
| 新規開発のしやすさ | ★★★★★ | ★★★★☆ | ★★★☆☆ |

---

## 推奨

プロジェクトの状況に応じて：

- **新規プロジェクト/大規模リファクタ予定あり** → **案1**
- **既存コードを維持しながら段階的に改善したい** → **案2**
- **最小限の変更で記述を整理したい** → **案3**
