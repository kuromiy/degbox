import { watchBuild } from "electron-flow";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { exit } from "node:process";
import esbuild from "esbuild";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

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
});
await mainCtx.watch();

// electron起動
const ps = spawn("./node_modules/electron/dist/electron.exe", ["."]);
ps.stdout.on("data", (data) => {
    console.log(`${data.toString().trim()}`);
});
ps.on("close", async () => {
    console.log("electron closed");
    await mainCtx.dispose();
    await rendererProcess.close();
    exit();
});
