import type { Plugin } from "esbuild";

/**
 * esbuild build-loggerプラグインの設定
 */
export interface BuildLoggerOptions {
	/** ログに表示するプロセス名（例: "メインプロセス", "プリロードプロセス"） */
	processName?: string;
	/** ビルド成功時のコールバック関数（2回目以降のビルドでのみ実行） */
	onRebuildSuccess?: () => void;
}

/**
 * esbuildのビルド進捗とエラーをログに出力するプラグイン
 *
 * @param options - プラグインの設定
 * @returns esbuild Pluginインスタンス
 *
 * @example
 * ```ts
 * const ctx = await esbuild.context({
 *   entryPoints: ["./src/main/index.ts"],
 *   plugins: [
 *     createBuildLoggerPlugin({
 *       processName: "メインプロセス",
 *       onRebuildSuccess: () => electron.reload()
 *     })
 *   ]
 * });
 * ```
 */
export function createBuildLoggerPlugin(
	options: BuildLoggerOptions = {},
): Plugin {
	const { processName = "プロセス", onRebuildSuccess } = options;

	return {
		name: "build-logger",
		setup(build) {
			let buildStartTime: number;
			let isFirstBuild = true;

			build.onStart(() => {
				buildStartTime = Date.now();
				console.log(
					`[${new Date().toLocaleTimeString()}] ${processName}のビルドを開始しています...`,
				);
			});

			build.onEnd((result) => {
				const buildTime = Date.now() - buildStartTime;

				if (result.errors.length > 0) {
					console.log(
						`[${new Date().toLocaleTimeString()}] ${processName}のビルドに失敗しました (${buildTime}ms)`,
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
						`[${new Date().toLocaleTimeString()}] ${processName}のビルドが完了しました (${buildTime}ms)`,
					);

					// 2回目以降のビルド成功時にコールバックを実行
					if (!isFirstBuild && onRebuildSuccess) {
						onRebuildSuccess();
					}
					isFirstBuild = false;
				}

				if (result.warnings.length > 0) {
					result.warnings.forEach((warning) => {
						console.warn(`警告: ${warning.text}`);
					});
				}
			});
		},
	};
}
