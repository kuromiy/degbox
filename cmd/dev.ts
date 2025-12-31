import { rm } from "node:fs/promises";
import react from "@vitejs/plugin-react";
import { watchBuild } from "electron-flow";
import esbuild from "esbuild";
import * as hydraBuilder from "react-hydra-builder";
import { createServer } from "vite";
import { createElectron } from "./lib/electron-process.js";
import { createBuildLoggerPlugin } from "./lib/esbuild-logger-plugin.js";
import { createTailwindWatcher } from "./lib/tailwind-watcher.js";

// Electronプロセス管理を初期化
const electron = createElectron();

// 初回実行はviteキャッシュを削除(net::err_aborted 504 (outdated optimize dep)が発生するため)
await rm("./node_modules/.vite", { recursive: true, force: true });

// 自動生成
await watchBuild({
	targetDirPath: "./src/main/apis",
	ignores: [],
	registerPath: "./src/main/autogenerate/register.ts",
	preloadPath: "./src/preload/autogenerate/register.ts",
	rendererPath: "./src/renderer/autogenerate/register.tsx",
	contextPath: "./src/main/context.ts",
	customErrorHandler: {
		path: "./src/main/errorHandler.ts",
		functionName: "customErrorHandler",
	},
	validatorConfig: {
		// パターン: {funcName}Validator → getUserValidator
		pattern: "{funcName}Validator",
	},
	eventDirPath: "./src/main/events", // 新規
	preloadEventsPath: "./src/preload/autogenerate/preload-events.ts", // 新規
	eventSenderPath: "./src/main/event-sender.ts", // 新規
	rendererEventsPath: "./src/renderer/autogenerate/renderer-events.tsx", // 新規
});

// Tailwind CSSのビルド監視
// TODO: tailwindビルドが終わる前にrendererのviteサーバーが起動してしまう問題の解決
const tailwindcssPsByRenderer = createTailwindWatcher({
	inputPath: "index.css",
	outputPath: "./src/renderer/index.css",
	label: "Tailwindcss (Renderer)",
});
const tailwindcssPsByServer = createTailwindWatcher({
	inputPath: "index.css",
	outputPath: "./public/css/index.css",
	label: "Tailwindcss (Server)",
});

// サーバー側ページビルド
await hydraBuilder.watchBuild({
	buildTargetDir: "./src/server/view/pages",
	buildTargetFileSuffix: "page.tsx",
	outputDir: "./public/js",
	metadataPath: "./dist/main/metadata.json",
});

// レンダラープロセス起動
const rendererProcess = await createServer({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				index: "./src/renderer/index.html",
				"project-select": "./src/renderer/project-select.html",
			},
		},
	},
	root: "./src/renderer",
	base: "./",
});
await rendererProcess.listen();

// プリロード監視ビルド
const preloadCtx = await esbuild.context({
	entryPoints: ["./src/preload/index.ts"],
	outdir: "./dist/preload",
	bundle: true,
	platform: "browser",
	packages: "external",
});
await preloadCtx.watch();

// メイン監視ビルド
const mainCtx = await esbuild.context({
	entryPoints: ["./src/main/index.ts"],
	outdir: "./dist/main",
	bundle: true,
	platform: "node",
	packages: "external",
	outExtension: {
		".js": ".mjs",
	},
	format: "esm",
	plugins: [
		createBuildLoggerPlugin({
			processName: "メインプロセス",
			onRebuildSuccess: () => electron.reload(),
		}),
	],
});
await mainCtx.watch();

// electron起動（cleanup処理を登録）
electron.run(async (_) => {
	await mainCtx.dispose();
	await rendererProcess.close();
	await preloadCtx.dispose();
	tailwindcssPsByRenderer.kill();
	tailwindcssPsByServer.kill();
});
