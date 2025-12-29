# プロジェクトベースストレージ 残タスク

## 実装状況サマリー

| フェーズ | 状態 |
|---------|------|
| フェーズ1: 基盤インフラ | ✅ 完了 |
| フェーズ2: API実装 | ✅ 完了 |
| フェーズ3: ウィンドウ管理 | ✅ 完了 |
| フェーズ4: レンダラー追加 | ⚠️ UI実装のみ未完了 |
| フェーズ5: 統合 | ✅ 完了 |

---

## 未実装タスク

### プロジェクト選択画面 UI 実装

対象ファイル: `src/renderer/pages/project-select/project-select.page.tsx`

#### 1. 最近使ったプロジェクト一覧取得
- [ ] `listProjects` API を呼び出して一覧を取得
- [ ] loader で初期データを取得

#### 2. 新規作成ボタン
- [ ] Electron の `dialog.showOpenDialog` でフォルダ選択ダイアログを開く
- [ ] プロジェクト名入力（フォルダ名をデフォルトに）
- [ ] `launchProject({ path, mode: "create", name })` API を呼び出し

#### 3. 既存を開くボタン
- [ ] Electron の `dialog.showOpenDialog` でフォルダ選択ダイアログを開く
- [ ] `project.degbox` ファイルの存在確認
- [ ] `launchProject({ path, mode: "open" })` API を呼び出し

#### 4. 最近のプロジェクトを開く
- [ ] リスト項目クリック/ダブルクリックで選択・開く
- [ ] `launchProject({ path, mode: "open" })` API を呼び出し

#### 5. オフライン時の警告表示
- [ ] プロジェクトパスの存在確認（`validateProject` API）
- [ ] 存在しない場合は警告アイコン・メッセージ表示
- [ ] 開けない状態を明示（ボタン無効化など）

#### 6. フォルダ選択ダイアログ API（新規）
- [ ] `src/main/apis/dialog/dialog.open-folder.api.ts` 作成
- [ ] Electron の `dialog.showOpenDialog` をラップ

---

## 技術的な実装メモ

### フォルダ選択ダイアログ API

```typescript
// src/main/apis/dialog/dialog.open-folder.api.ts
import { dialog } from "electron";
import { z } from "zod";
import type { Context } from "../../context.js";

export const openFolderDialogSchema = z.object({
  title: z.string().optional(),
});
export type OpenFolderDialogRequest = z.infer<typeof openFolderDialogSchema>;

export type OpenFolderDialogResponse = {
  path: string | null;
};

export async function openFolderDialog(
  ctx: Context,
  request: OpenFolderDialogRequest,
): Promise<OpenFolderDialogResponse> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    title: request.title ?? "フォルダを選択",
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { path: null };
  }
  return { path: result.filePaths[0] };
}
```

### プロジェクト選択画面での使用例

```typescript
// project-select.page.tsx
import { ApiService } from "../../autogenerate/register.js";

const client = new ApiService();

// 新規作成
const handleCreateNew = async () => {
  const result = await client.openFolderDialog({ title: "新規プロジェクトの場所を選択" });
  if (!result.path) return;

  const name = prompt("プロジェクト名を入力", basename(result.path));
  if (!name) return;

  await client.launchProject(result.path, "create", name);
};

// 既存を開く
const handleOpenExisting = async () => {
  const result = await client.openFolderDialog({ title: "プロジェクトフォルダを選択" });
  if (!result.path) return;

  await client.launchProject(result.path, "open", undefined);
};

// 最近のプロジェクトを開く
const handleOpenRecent = async (path: string) => {
  await client.launchProject(path, "open", undefined);
};
```

### loader でプロジェクト一覧取得

```typescript
export async function loader() {
  const result = await client.listProjects();
  if (isFailure(result)) {
    return { projects: [], error: result.error.message };
  }
  return { projects: result.value.projects };
}
```
