import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

/**
 * Tailwind CSS監視ビルドの設定
 */
export interface TailwindWatchConfig {
	/** 入力CSSファイルのパス */
	inputPath: string;
	/** 出力CSSファイルのパス */
	outputPath: string;
	/** ログに表示するラベル（省略時は "Tailwindcss"） */
	label?: string;
}

/**
 * Tailwind CSSの監視ビルドプロセスを作成
 *
 * @param config - Tailwind CSS監視ビルドの設定
 * @returns 起動したChildProcessインスタンス
 *
 * @example
 * ```ts
 * const watcher = createTailwindWatcher({
 *   inputPath: "index.css",
 *   outputPath: "./src/renderer/index.css",
 *   label: "Renderer"
 * });
 *
 * // クリーンアップ時
 * watcher.kill();
 * ```
 */
export function createTailwindWatcher(
	config: TailwindWatchConfig,
): ChildProcess {
	const { inputPath, outputPath, label = "Tailwindcss" } = config;

	const ps = spawn("npx", [
		"tailwindcss",
		"-i",
		inputPath,
		"-o",
		outputPath,
		"--watch",
	]);

	ps.stdout.on("data", (data) => {
		console.log(`[${label}] ${data.toString().trim()}`);
	});

	ps.stderr.on("data", (data) => {
		// Tailwind v4はstderrに通常のメッセージ（"Done in Xms"など）を出力するため、
		// エラーかどうかを内容で判断
		const message = data.toString().trim();
		if (message.includes("Error") || message.includes("error")) {
			console.error(`[${label} Error] ${message}`);
		} else {
			console.log(`[${label}] ${message}`);
		}
	});

	ps.on("error", (error) => {
		console.error(
			`[Process Error] ${label}プロセスの起動に失敗しました:`,
			error,
		);
	});

	ps.on("close", (code) => {
		console.log(`[${label}] プロセスが終了しました (code: ${code})`);
	});

	return ps;
}
