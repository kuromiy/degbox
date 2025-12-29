# サーバーのプロジェクト切り替え対応

## 現状の問題

### 1. ファイル配信のパス問題
`src/server/router/file/get.ts`で`FILE_ROOT`がモジュールロード時に固定されている：

```typescript
const FILE_ROOT = resolve(process.cwd());
```

プロジェクト切り替え時にこの値が変わらないため、間違ったフォルダからファイルを配信してしまう。

### 2. サーバー起動の未実装
`src/main/apis/project/project.register.api.ts`でメインウィンドウを開いているが、サーバーを起動していない：

```typescript
// TODO: メインウィンドウ開くだけでサーバーを起動していない。
// プロジェクト切り替え時、サーバーも立ち上げなおす
await createMainWindow(appConfig.isDev, appConfig.preloadPath, appConfig.rendererPath);
```

## 解決方針：コンテナ経由での差し替え

サーバーを再起動せず、コンテナ内の依存関係を差し替える方式を採用する。

### メリット
- サーバー再起動が不要
- 既存の接続を維持できる
- シンプルな実装

### デメリット
- 差し替え中のリクエスト処理に注意が必要

## 実装タスク

### 1. PROJECT_PATHトークンの追加

`src/main/di/token.ts`に追加：

```typescript
export const TOKENS = {
    // ... 既存のトークン
    PROJECT_PATH: createToken<string>("PROJECT_PATH"),
};
```

### 2. ファイル配信ルーターの修正

`src/server/router/file/get.ts`を修正：

```typescript
// 変更前
const FILE_ROOT = resolve(process.cwd());

// 変更後 - コンテナからプロジェクトパスを取得
app.get("/*", async (c) => {
    const { container } = c.var;
    const projectPath = container.get(TOKENS.PROJECT_PATH);
    const FILE_ROOT = resolve(projectPath);
    // ... 以降の処理
});
```

### 3. サーバー起動関数の作成

`src/main/startServer.ts`を作成：

```typescript
import { serve } from "@hono/node-server";
import type { Container } from "./di/container.js";
import { createServer } from "../server/server.js";

let serverInstance: ReturnType<typeof serve> | null = null;

export async function startServer(container: Container, port = 8080) {
    const application = createServer(container);
    serverInstance = serve({
        fetch: application.fetch,
        port,
    });
    return serverInstance;
}

export function getServerInstance() {
    return serverInstance;
}
```

### 4. プロジェクト登録APIの修正

`src/main/apis/project/project.register.api.ts`に追加：

```typescript
// サーバー起動
await startServer(container);

// PROJECT_PATHを登録
container.register(TOKENS.PROJECT_PATH, () => foldPath);
```

### 5. プロジェクト切り替え時の処理

プロジェクト切り替え時は以下を更新：
- `TOKENS.DATABASE` - アプリケーションDB
- `TOKENS.PROJECT_PATH` - プロジェクトパス

```typescript
// プロジェクト切り替え
container.register(TOKENS.PROJECT_PATH, () => newProjectPath);
container.register(TOKENS.DATABASE, () => newDatabase);
```

## 注意事項

### コンテナの差し替えタイミング
- リクエスト処理中に差し替えが発生する可能性がある
- 必要に応じてロック機構を検討

### 初回起動時
- プロジェクト選択画面ではサーバーは起動しない
- プロジェクト登録/選択後に初めてサーバーを起動

## 関連ファイル

- `src/main/index.ts` - メインプロセスエントリ
- `src/main/apis/project/project.register.api.ts` - プロジェクト登録API
- `src/server/server.ts` - Honoサーバー作成
- `src/server/router/file/get.ts` - ファイル配信ルーター
- `src/main/di/token.ts` - DIトークン定義
