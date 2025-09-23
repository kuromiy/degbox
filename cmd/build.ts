import { rm } from "node:fs/promises";
import tailwindccss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import * as flow from "electron-flow";
import esbuild from "esbuild";
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
	// customErrorHandler: {
	//     path: "./src/main/errorHandler.ts",
	//     functionName: "customErrorHandler",
	// }
});

// レンダラー
await vite.build({
	plugins: [react(), tailwindccss()],
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
});

// メイン
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
});
