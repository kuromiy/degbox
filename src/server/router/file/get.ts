import { constants, createReadStream, realpathSync } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { stream } from "hono/streaming";
import { TOKENS } from "../../../main/di/token.js";
import { factory } from "../../factory.js";

export interface FileRouterOptions {
	fileRoot: string;
}

function resolveRealFileRoot(fileRoot: string): string {
	const resolved = resolve(fileRoot);
	try {
		return realpathSync(resolved);
	} catch {
		// fileRootが存在しない場合は元のパスを使用
		return resolved;
	}
}

async function isExistFile(path: string) {
	try {
		await access(path, constants.R_OK);
		return true;
	} catch (_err) {
		return false;
	}
}

/**
 * パスを検証・正規化し、パストラバーサル攻撃とシンボリックリンク攻撃を防ぐ
 * @param requestPath リクエストパス（例: "/file/videos/test.mp4"）
 * @param realFileRoot 正規化されたファイルルートパス
 * @returns 安全な絶対パス、または検証失敗時はnull
 */
function sanitizeAndValidatePath(
	requestPath: string,
	realFileRoot: string,
): string | null {
	let userPath = requestPath.replace(/^\/file\//, "");

	// URIデコード
	try {
		userPath = decodeURIComponent(userPath);
	} catch {
		return null;
	}

	// 基本的なセキュリティチェック
	if (
		userPath.includes("\0") || // nullバイト
		isAbsolute(userPath) // 絶対パス
	) {
		return null;
	}

	// ベースディレクトリとユーザーパスを結合
	const resolvedPath = resolve(join(realFileRoot, userPath));

	// シンボリックリンクを解決して正規化された実パスを取得
	let realResolvedPath: string;
	try {
		realResolvedPath = realpathSync(resolvedPath);
	} catch {
		// ファイルが存在しない場合は、解決されたパスをそのまま使用
		// （存在確認は後で行われる）
		realResolvedPath = resolvedPath;
	}

	// 相対パスを計算してディレクトリ境界チェック
	const rel = relative(realFileRoot, realResolvedPath);

	// 以下の場合は拒否:
	// 1. 相対パスが '..' で始まる（親ディレクトリへのアクセス）
	// 2. 相対パスが絶対パス（異常なケース）
	if (rel.startsWith("..") || isAbsolute(rel)) {
		return null;
	}

	return realResolvedPath;
}

export function createFileRouter(options: FileRouterOptions) {
	const realFileRoot = resolveRealFileRoot(options.fileRoot);
	const app = factory.createApp();

	app.get("/*", async (c) => {
		const { container } = c.var;
		const logger = container.get(TOKENS.LOGGER);

		logger.info("raw request", { path: c.req.path });

		const safePath = sanitizeAndValidatePath(c.req.path, realFileRoot);
		if (!safePath) {
			logger.warn("Invalid path request", { path: c.req.path });
			return c.json({ error: "Forbidden" }, 403);
		}

		const exist = await isExistFile(safePath);
		logger.info(`path ${safePath} exist: ${exist}`);
		if (!exist) {
			return c.notFound();
		}

		// TOCTOU対策: ストリーミング直前に再検証
		let fileStats: Awaited<ReturnType<typeof stat>>;
		let resolvedRealPath: string;
		try {
			// シンボリックリンクを解決して実パスを取得
			resolvedRealPath = await realpath(safePath);
			// ファイル情報を取得
			fileStats = await stat(resolvedRealPath);
		} catch (err) {
			logger.warn("File disappeared or inaccessible", {
				path: safePath,
				error: err,
			});
			return c.notFound();
		}

		// ディレクトリではなく通常ファイルであることを確認
		if (!fileStats.isFile()) {
			logger.warn("Attempted to stream non-file", { path: resolvedRealPath });
			return c.json({ error: "Forbidden" }, 403);
		}

		// 解決されたパスが許可されたベースディレクトリ内にあることを再確認
		const relFromRoot = relative(realFileRoot, resolvedRealPath);
		if (relFromRoot.startsWith("..") || isAbsolute(relFromRoot)) {
			logger.warn("Resolved path outside allowed directory", {
				path: resolvedRealPath,
			});
			return c.json({ error: "Forbidden" }, 403);
		}

		return stream(c, async (responseStream) => {
			let fileStream: ReturnType<typeof createReadStream> | null = null;
			let streamClosed = false;
			let clientAborted = false;

			const cleanupStream = () => {
				if (fileStream && !streamClosed) {
					streamClosed = true;
					fileStream.destroy();
					logger.info("File stream closed");
				}
			};

			responseStream.onAbort(() => {
				logger.info("Response aborted by client");
				clientAborted = true;
				cleanupStream();
			});

			try {
				fileStream = createReadStream(resolvedRealPath);

				// ファイルストリームのエラーハンドリング
				fileStream.on("error", (err: NodeJS.ErrnoException) => {
					// クライアント切断によるエラーは警告レベルに下げる
					if (err.code === "ERR_STREAM_PREMATURE_CLOSE" && clientAborted) {
						logger.info("Stream closed due to client abort", {
							path: resolvedRealPath,
						});
					} else {
						logger.error("File stream error", {
							path: resolvedRealPath,
							error: err,
						});
					}
					cleanupStream();
				});

				for await (const chunk of fileStream) {
					// クライアントが切断した場合はループを抜ける
					if (clientAborted) {
						break;
					}
					await responseStream.write(chunk);
				}
			} catch (err) {
				// クライアント切断によるエラーは警告レベルに下げる
				if (clientAborted) {
					logger.info("Streaming interrupted by client abort", {
						path: resolvedRealPath,
					});
				} else {
					logger.error("Error during streaming", {
						path: resolvedRealPath,
						error: err,
					});
					throw err;
				}
			} finally {
				cleanupStream();
			}
		});
	});

	return app;
}
