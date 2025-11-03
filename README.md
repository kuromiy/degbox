# degbox

## セットアップ

### 1. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成してください:

```sh
cp .env.example .env
```

`.env`ファイルを編集して、必要な値を設定してください:

```env
# FFmpeg実行ファイルのパス (動画処理に必要)
FFMPEG_PATH=C:\ffmpeg-6.0-full_build\ffmpeg-6.0-full_build\bin\ffmpeg

# 開発サーバーのURL
VITE_FILE_SERVER_URL=http://localhost:8080
```

### 2. 依存関係のインストール

```sh
npm install
```

### 3. データベースのセットアップ

```sh
npm run db:migrate
```
