import { basename } from "node:path";
import { PassThrough } from "node:stream";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { stream } from "hono/streaming";
import { renderToPipeableStream } from "react-dom/server.node";
import { ComponentResolver } from "react-hydra-builder";

export const renderMiddleware = createMiddleware(async (c, next) => {
	c.setRenderer(async (context, options) => {
		return await render(c, context, options);
	});
	await next();
});

/**
 * Safely serialize JSON for inline script injection
 * Prevents XSS by escaping:
 * - < and > to prevent closing script tags
 * - & to prevent HTML entity injection
 * - U+2028 and U+2029 (line/paragraph separators) that can break string literals
 */
function safeJSONStringify(obj: unknown): string {
	return JSON.stringify(obj)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

async function render(
	c: Context,
	page: React.ReactElement,
	options?: { title: string },
) {
	// コンポーネント名を取得
	const componentName =
		typeof page.type === "function" && page.type.name
			? page.type.name
			: "DefaultPage";

	// ComponentResolverでメタデータから解決を試みる
	const scriptFileName = await ComponentResolver.resolveScriptPath(
		componentName,
		"./dist/main/metadata.json",
	);
	const clientScript = basename(scriptFileName);
	c.header("Content-Type", "text/html; charset=utf-8");
	return stream(c, async (stream) => {
		await new Promise<void>((resolve, reject) => {
			const { pipe, abort } = renderToPipeableStream(
				<html lang="ja">
					<head>
						<meta charSet="utf-8" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
						<link rel="stylesheet" href="/public/css/index.css" />
						<title>{options?.title}</title>
					</head>
					<body className="h-full bg-surface-950 text-text-50 font-light">
						{/* biome-ignore lint/correctness/useUniqueElementIds: SSR root element */}
						<div id="app" className="h-screen">
							{page}
						</div>
					</body>
				</html>,
				{
					bootstrapScripts: [`/public/js/${clientScript}`],
					bootstrapScriptContent: `window.__SERVER_DATA__ = ${safeJSONStringify(page.props)};`,
					onShellReady() {
						const passThrough = new PassThrough();

						passThrough.on("data", (chunk) => {
							stream.write(chunk);
						});

						passThrough.on("end", () => {
							resolve();
						});

						passThrough.on("error", reject);

						pipe(passThrough);
					},
					onError(error) {
						reject(error);
					},
				},
			);

			stream.onAbort(() => {
				abort();
			});
		});
	});
}
