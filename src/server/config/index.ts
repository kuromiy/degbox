/**
 * サーバープロセスの設定
 * 環境変数や実行時設定を管理
 */

/**
 * ファイルサーバーのベースURL
 * 環境変数 FILE_SERVER_URL から読み込み
 * デフォルト: http://localhost:8080
 */
export const FILE_SERVER_URL =
	process.env.FILE_SERVER_URL || "http://localhost:8080";

/**
 * ファイルパスからフルURLを構築
 * @param path ファイルパス（例: "videos/thumbnail.jpg"）
 * @returns フルURL（例: "http://localhost:8080/file/videos/thumbnail.jpg"）
 */
export function buildFileUrl(path: string): string {
	// ベースURLの末尾のスラッシュを除去
	const baseUrl = FILE_SERVER_URL.replace(/\/$/, "");
	// パスの先頭のスラッシュを除去
	const normalizedPath = path.replace(/^\//, "");

	return `${baseUrl}/file/${normalizedPath}`;
}
