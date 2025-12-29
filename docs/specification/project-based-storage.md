# プロジェクトベースストレージ仕様

## 概要

アプリのデータ（DB、コンテンツ）をユーザーが選択したフォルダに保存し、疑似的な「プロジェクト」として管理する機能。

## プロジェクト構造

```
D:\MyCollection\
├── project.degbox        ← プロジェクトファイル
├── local.db              ← このプロジェクトのDB
├── settings.json         ← このプロジェクトの設定
└── content/              ← このプロジェクトのコンテンツ
    ├── videos/
    └── illusts/
```

### .degboxファイル

プロジェクトのメタ情報を格納するJSONファイル。

```json
{
  "name": "MyCollection",
  "version": "1.0.0",
  "created": "2025-12-25T00:00:00Z"
}
```

## アプリ設定（グローバル）

アプリ自体の設定は `%APPDATA%/degbox/` に保存。

```
%APPDATA%/degbox/
└── app-config.json
```

### app-config.json

```json
{
  "recentProjects": [
    { "name": "MyCollection", "path": "D:\\MyCollection" },
    { "name": "WorkArchive", "path": "E:\\WorkArchive" }
  ],
  "lastOpenedProject": "D:\\MyCollection"
}
```

## 画面構成

### 別ウィンドウ方式

プロジェクト選択とメイン画面を別ウィンドウで管理する。

| ウィンドウ | 役割 | サイズ |
|-----------|------|--------|
| プロジェクト選択ウィンドウ | プロジェクトの選択・作成 | 小さめ（例: 600x400） |
| メインウィンドウ | コンテンツ管理 | 通常サイズ |

### 設計上のメリット

- **責務の分離**: 選択画面とメイン画面が独立
- **拡張性**: 選択画面の機能追加がメインに影響しない
- **シンプルなメイン側**: プロジェクト確定を前提にできる（nullチェック不要）
- **将来対応**: 複数プロジェクト同時起動への布石

## ユーザーフロー

### 初回起動

```
アプリ起動
    ↓
プロジェクト選択ウィンドウを開く
    ↓
┌─────────────────────────────┐
│  プロジェクトを選択         │
│                             │
│  [新規作成]  [既存を開く]   │
└─────────────────────────────┘
    ↓
フォルダ選択ダイアログ
    ↓
プロジェクト作成/読み込み
    ↓
選択ウィンドウを閉じる
    ↓
メインウィンドウを開く
```

### 次回起動以降

```
アプリ起動
    ↓
app-config.json から lastOpenedProject を確認
    ↓
┌─ lastOpenedProject がある
│   → メインウィンドウを直接開く
│
└─ lastOpenedProject がない
    → プロジェクト選択ウィンドウを開く
```

### プロジェクト切り替え

```
メインウィンドウのメニュー「プロジェクト切り替え」
    ↓
メインウィンドウを閉じる
    ↓
プロジェクト選択ウィンドウを開く
    ↓
プロジェクト選択
    ↓
新しいメインウィンドウを開く
```

## メリット

| メリット | 説明 |
|----------|------|
| 用途別管理 | 仕事用/趣味用など分けられる |
| ポータブル | フォルダごとコピー/移動できる |
| バックアップ容易 | フォルダ単位でバックアップ |
| 複数PC共有 | 外付けHDDで持ち運び可能 |
| 容量管理 | ドライブごとに分散できる |

## 考慮事項

### オフライン時の動作

プロジェクトフォルダがオフライン（外付けHDD未接続など）の場合：
- プロジェクト選択画面で警告表示
- 該当プロジェクトは開けない状態を明示

### プロジェクトの移動

フォルダを移動した場合：
- 「最近使ったプロジェクト」リストは手動更新が必要
- 「既存を開く」から新しい場所を選択すれば開ける

## 技術設計

### マルチウィンドウ実現方式

シングルViteサーバー + ファイルベースのマルチエントリーポイント方式を採用。

```
src/renderer/
├── index.html              # メイン用エントリー（既存）
├── index.tsx               # メイン用（既存）
├── project-select.html     # プロジェクト選択用エントリー（新規）
├── project-select.tsx      # プロジェクト選択用（新規）
├── pages/
│   ├── home/
│   ├── video/
│   └── project-select/     # 選択画面用ページ追加
└── autogenerate/           # electron-flow（共通）
```

### Vite設定

```typescript
// dev.ts内
const rendererProcess = await createServer({
  plugins: [react()],
  root: "./src/renderer",
  build: {
    rollupOptions: {
      input: {
        index: './src/renderer/index.html',
        'project-select': './src/renderer/project-select.html',
      },
    },
  },
});
```

### ウィンドウからのアクセス

```typescript
// プロジェクト選択ウィンドウ
projectSelectWindow.loadURL('http://localhost:5173/project-select.html');

// メインウィンドウ
mainWindow.loadURL('http://localhost:5173/index.html');
```

### 方式のメリット

| 項目 | 利点 |
|------|------|
| Viteサーバー | 1つのみ |
| ポート | 1つのみ（5173） |
| 共通コンポーネント | 簡単に共有 |
| electron-flow | 1回の生成でOK |
| 開発環境変更 | 最小限 |

## 実装計画

### フェーズ1: 基盤インフラ

#### 1. アプリ設定リポジトリ

`%APPDATA%/degbox/app-config.json` を管理。

```
src/main/repositories/app-config/
├── app-config.repository.ts
└── app-config.schema.ts
```

#### 2. プロジェクトリポジトリ

`.degbox` ファイルを管理。

```
src/main/repositories/project/
├── project.repository.ts
└── project.schema.ts
```

### フェーズ2: API実装

#### 3. プロジェクト関連API

```
src/main/apis/project/
├── project.create.api.ts     # 新規プロジェクト作成
├── project.open.api.ts       # 既存プロジェクトを開く
├── project.list.api.ts       # 最近のプロジェクト一覧取得
└── project.validate.api.ts   # パス存在確認
```

### フェーズ3: ウィンドウ管理

#### 4. WindowManager実装

```
src/main/window/
├── window-manager.ts         # ウィンドウ管理
├── project-select-window.ts  # 選択ウィンドウ定義（600x400）
└── main-window.ts            # メインウィンドウ定義
```

### フェーズ4: レンダラー追加

#### 5. 新規ファイル追加

- `project-select.html` - エントリーポイント
- `project-select.tsx` - Reactルート
- `pages/project-select/` - 選択画面ページ

#### 6. dev.ts 修正

- マルチエントリーポイント対応

### フェーズ5: 統合

#### 7. 既存機能の動的パス対応

- Context にプロジェクトパスを追加
- DB・コンテンツパスをプロジェクト基準に変更

## 実装タスク

### フェーズ1: 基盤インフラ
- [ ] AppConfigRepository 実装
- [ ] ProjectRepository 実装

### フェーズ2: API実装
- [ ] project.create.api.ts
- [ ] project.open.api.ts
- [ ] project.list.api.ts
- [ ] project.validate.api.ts

### フェーズ3: ウィンドウ管理
- [ ] WindowManager 実装
- [ ] project-select-window.ts
- [ ] main-window.ts
- [ ] メインプロセスエントリポイント改修

### フェーズ4: レンダラー追加
- [ ] project-select.html 作成
- [ ] project-select.tsx 作成
- [ ] プロジェクト選択画面 UI 実装
- [ ] dev.ts マルチエントリー対応

### フェーズ5: 統合
- [ ] Context へのプロジェクトパス追加
- [ ] DBパスの動的設定
- [ ] コンテンツ保存先の動的設定

## 将来の拡張（保留）

- ファイル関連付け（.degboxファイルのダブルクリックでアプリ起動）
