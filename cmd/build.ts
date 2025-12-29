import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import react from "@vitejs/plugin-react";
import * as flow from "electron-flow";
import esbuild from "esbuild";
import * as hydraBuilder from "react-hydra-builder";
import * as vite from "vite";

await rm("./dist", { recursive: true, force: true });

// 自動生成
await flow.build({
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
});

// Tailwind CSSのビルド
await buildTailwindcssByRenderer();
await buildTailwindcssByServer();

// メインプロセスビルド（metadata.json生成）
await esbuild.build({
	entryPoints: ["./src/main/index.ts"],
	outdir: "./dist/main",
	bundle: true,
	platform: "node",
	packages: "external",
	outExtension: {
		".js": ".mjs",
	},
	format: "esm",
	sourcemap: true,
});

// サーバー側ページビルド（metadata.json使用）
await hydraBuilder.build({
	buildTargetDir: "./src/server/view/pages",
	buildTargetFileSuffix: "page.tsx",
	outputDir: "./public/js",
	metadataPath: "./dist/main/metadata.json",
});

// レンダラー
await vite.build({
	plugins: [react()],
	build: {
		outDir: "../../dist/renderer",
	},
	root: "./src/renderer",
	base: "./",
});

// プリロード
await esbuild.build({
	entryPoints: ["./src/preload/index.ts"],
	outdir: "./dist/preload",
	bundle: true,
	platform: "browser",
	packages: "external",
	sourcemap: true,
});

async function buildTailwindcssByRenderer(): Promise<void> {
	return new Promise((resolve, reject) => {
		const ps = spawn("npx", [
			"tailwindcss",
			"-i",
			"index.css",
			"-o",
			"./src/renderer/index.css",
		]);
		ps.stdout.on("data", (data) => {
			console.log(`[Tailwindcss] ${data.toString().trim()}`);
		});
		ps.stderr.on("data", (data) => {
			console.log(`[Tailwindcss] ${data.toString().trim()}`);
		});
		ps.on("error", (error) => {
			console.error(
				`[Process Error] Tailwindcssプロセスの起動に失敗しました:`,
				error,
			);
			reject(error);
		});
		ps.on("close", (code) => {
			console.log(`tailwindcss closed with code ${code}`);
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Tailwindcss process exited with code ${code}`));
			}
		});
	});
}

async function buildTailwindcssByServer(): Promise<void> {
	return new Promise((resolve, reject) => {
		const ps = spawn("npx", [
			"tailwindcss",
			"-i",
			"index.css",
			"-o",
			"./public/css/index.css",
		]);
		ps.stdout.on("data", (data) => {
			console.log(`[Tailwindcss] ${data.toString().trim()}`);
		});
		ps.stderr.on("data", (data) => {
			console.log(`[Tailwindcss] ${data.toString().trim()}`);
		});
		ps.on("error", (error) => {
			console.error(
				`[Process Error] Tailwindcssプロセスの起動に失敗しました:`,
				error,
			);
			reject(error);
		});
		ps.on("close", (code) => {
			console.log(`tailwindcss closed with code ${code}`);
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Tailwindcss process exited with code ${code}`));
			}
		});
	});
}
