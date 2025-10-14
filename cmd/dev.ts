import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { exit } from "node:process";
import react from "@vitejs/plugin-react";
import { watchBuild } from "electron-flow";
import esbuild from "esbuild";
import * as hydraBuilder from "react-hydra-builder";
import { createServer } from "vite";

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
	// customErrorHandler: {
	//     path: "./src/main/errorHandler.ts",
	//     functionName: "customErrorHandler",
	// }
});

// Tailwind CSSのビルド監視
// TODO: tailwindビルドが終わる前にrendererのviteサーバーが起動してしまう問題の解決
const tailwindcssPsByRenderer = watchBuildTailwindcssByRenderer();
const tailwindcssPsByServer = watchBuildTailwindcssByServer();

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
		outDir: "../../dist/renderer",
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
		{
			name: "build-logger",
			setup(build) {
				let buildStartTime: number;

				build.onStart(() => {
					buildStartTime = Date.now();
					console.log(
						`[${new Date().toLocaleTimeString()}] メインプロセスのビルドを開始しています...`,
					);
				});

				build.onEnd((result) => {
					const buildTime = Date.now() - buildStartTime;

					if (result.errors.length > 0) {
						console.log(
							`[${new Date().toLocaleTimeString()}] メインプロセスのビルドに失敗しました (${buildTime}ms)`,
						);
						result.errors.forEach((error) => {
							console.error(`エラー: ${error.text}`);
							if (error.location) {
								console.error(
									`  ファイル: ${error.location.file}:${error.location.line}:${error.location.column}`,
								);
							}
						});
					} else {
						console.log(
							`[${new Date().toLocaleTimeString()}] メインプロセスのビルドが完了しました (${buildTime}ms)`,
						);
					}

					if (result.warnings.length > 0) {
						result.warnings.forEach((warning) => {
							console.warn(`警告: ${warning.text}`);
						});
					}
				});
			},
		},
	],
});
await mainCtx.watch();

// electron起動
const ps = spawn("./node_modules/electron/dist/electron.exe", ["."]);
ps.stdout.on("data", (data) => {
	console.log(`${data.toString().trim()}`);
});
ps.stderr.on("data", (data) => {
	console.error(`[Electron Error] ${data.toString().trim()}`);
});
ps.on("error", (error) => {
	console.error(`[Process Error] Electronプロセスの起動に失敗しました:`, error);
});
ps.on("close", async (code) => {
	console.log(`electron closed with code ${code}`);
	await mainCtx.dispose();
	await rendererProcess.close();
	await preloadCtx.dispose();
	tailwindcssPsByRenderer.kill();
	tailwindcssPsByServer.kill();
	exit();
});

function watchBuildTailwindcssByRenderer() {
	const ps = spawn("npx", [
		"tailwindcss",
		"-i",
		"index.css",
		"-o",
		"./src/renderer/index.css",
		"--watch",
	]);
	ps.stdout.on("data", (data) => {
		console.log(`[Tailwindcss] ${data.toString().trim()}`);
	});
	ps.stderr.on("data", (data) => {
		console.error(`[Tailwindcss Error] ${data.toString().trim()}`);
	});
	ps.on("error", (error) => {
		console.error(
			`[Process Error] Tailwindcssプロセスの起動に失敗しました:`,
			error,
		);
	});
	ps.on("close", (code) => {
		console.log(`tailwindcss closed with code ${code}`);
	});
	return ps;
}

function watchBuildTailwindcssByServer() {
	const ps = spawn("npx", [
		"tailwindcss",
		"-i",
		"index.css",
		"-o",
		"./public/css/index.css",
		"--watch",
	]);
	ps.stdout.on("data", (data) => {
		console.log(`[Tailwindcss] ${data.toString().trim()}`);
	});
	ps.stderr.on("data", (data) => {
		console.error(`[Tailwindcss Error] ${data.toString().trim()}`);
	});
	ps.on("error", (error) => {
		console.error(
			`[Process Error] Tailwindcssプロセスの起動に失敗しました:`,
			error,
		);
	});
	ps.on("close", (code) => {
		console.log(`tailwindcss closed with code ${code}`);
	});
	return ps;
}
