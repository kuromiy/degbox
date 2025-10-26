import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { isAbsolute, join, normalize, resolve } from "node:path";
import { stream } from "hono/streaming";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";

const app = factory.createApp();
const FILE_ROOT = resolve(process.cwd(), "content");

async function isExistFile(path: string) {
	try {
		await access(path);
		return true;
	} catch (_err) {
		return false;
	}
}

/**
 * パスを検証・正規化し、パストラバーサル攻撃を防ぐ
 * @param requestPath リクエストパス（例: "/file/videos/test.mp4"）
 * @returns 安全な絶対パス、または検証失敗時はnull
 */
function sanitizeAndValidatePath(requestPath: string): string | null {
	let userPath = requestPath.replace(/^\/file\//, "");

	// URIデコード
	try {
		userPath = decodeURIComponent(userPath);
	} catch {
		return null;
	}

	// セキュリティチェック
	if (
		userPath.includes("\0") || // nullバイト
		userPath.includes("..") || // パストラバーサル
		isAbsolute(userPath) // 絶対パス
	) {
		return null;
	}

	// 正規化とベースディレクトリ結合
	const resolvedPath = normalize(join(FILE_ROOT, userPath));

	// ベースディレクトリ境界チェック（最重要）
	if (!resolvedPath.startsWith(FILE_ROOT)) {
		return null;
	}

	return resolvedPath;
}

app.get("/*", async (c) => {
	const { container } = c.var;
	const logger = container.get(TOKENS.LOGGER);

	const safePath = sanitizeAndValidatePath(c.req.path);
	if (!safePath) {
		logger.warn("Invalid path request", { path: c.req.path });
		return c.json({ error: "Forbidden" }, 403);
	}

	const exist = await isExistFile(safePath);
	logger.info(`path ${safePath} exist: ${exist}`);
	if (!exist) {
		return c.notFound();
	}

	return stream(c, async (stream) => {
		stream.onAbort(() => console.log("Aborted."));
		const fileStream = createReadStream(safePath);
		for await (const chunk of fileStream) {
			await stream.write(chunk);
		}
	});
});

export default app;
