# サーバー起動機能の実装計画

## 概要

プロジェクト登録時およびプロジェクト切り替え時にサーバーを起動/再起動できるようにする。

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `src/main/di/token.ts` | 修正 | `PROJECT_PATH` トークン追加 |
| `src/main/startServer.ts` | 新規作成 | サーバー起動/停止管理 |
| `src/main/apis/project/project.register.api.ts` | 修正 | サーバー起動処理追加 |

---

## 1. `src/main/di/token.ts`

```typescript
// 追加
PROJECT_PATH: new InjectionToken<string>("ProjectPath"),
```

---

## 2. `src/main/startServer.ts` (新規)

```typescript
import { serve, type ServerType } from "@hono/node-server";
import type { Container } from "../../features/shared/container/index.js";
import { createServer } from "../server/server.js";

let serverInstance: ServerType | null = null;

export async function startServer(
    container: Container,
    fileRoot: string,
    port = 8080
): Promise<ServerType> {
    if (serverInstance) {
        await stopServer();
    }

    const application = createServer({ container, fileRoot });
    serverInstance = serve({
        fetch: application.fetch,
        port,
    });
    return serverInstance;
}

export async function stopServer(): Promise<void> {
    if (serverInstance) {
        serverInstance.close();
        serverInstance = null;
    }
}

export function getServerInstance(): ServerType | null {
    return serverInstance;
}
```

---

## 3. `src/main/apis/project/project.register.api.ts`

```typescript
// インポート追加
import { startServer } from "../../startServer.js";

// registerProject 関数内（メインウィンドウ作成前）
container.register(TOKENS.PROJECT_PATH, () => foldPath);
await startServer(container, foldPath);
```

---

## 処理フロー

```
プロジェクト登録
    ↓
アプリケーションDB作成・コンテナ登録
    ↓
PROJECT_PATH をコンテナに登録
    ↓
startServer(container, foldPath, 8080) 実行
    ↓
メインウィンドウを開く
```
