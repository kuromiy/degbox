import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { exit } from "node:process";
import electron from "electron";

type ElectronProcess = {
	run(cleanup: (code: number | null) => Promise<void>): void;
	reload(): void;
};

let ps: ChildProcessWithoutNullStreams | null = null;
let cleanupHandler: ((code: number | null) => Promise<void>) | null = null;

export function createElectron(): ElectronProcess {
	function start() {
		// 既存のElectronプロセスを終了
		if (ps) {
			console.log(
				`[${new Date().toLocaleTimeString()}] 既存のElectronプロセスを終了しています...`,
			);
			ps.kill();
			ps = null;
		}

		// Electronバイナリパスを解決
		const electronPath = electron as unknown as string;
		if (!electronPath || typeof electronPath !== "string") {
			throw new Error("Electronバイナリのパスを解決できませんでした");
		}

		// 新しいElectronプロセスを起動
		console.log(
			`[${new Date().toLocaleTimeString()}] Electronプロセスを起動しています...`,
		);
		ps = spawn(electronPath, ["."], { stdio: "pipe" });

		ps.stdout.on("data", (data) => {
			console.log(`${data.toString().trim()}`);
		});

		ps.stderr.on("data", (data) => {
			console.error(`[Electron Error] ${data.toString().trim()}`);
		});

		ps.on("error", (error) => {
			console.error(
				`[Process Error] Electronプロセスの起動に失敗しました:`,
				error,
			);
		});

		ps.on("close", async (code, signal) => {
			console.log(
				`electron closed with code: ${code}, signal: ${signal ?? "none"}`,
			);
			if (cleanupHandler) {
				await cleanupHandler(code ?? null);
			}
			exit(typeof code === "number" ? code : 0);
		});
	}

	return {
		run(cleanup) {
			cleanupHandler = cleanup;
			console.log(
				`[${new Date().toLocaleTimeString()}] Electronを起動しています...`,
			);
			start();
		},
		reload() {
			console.log(
				`[${new Date().toLocaleTimeString()}] 変更検知: Electronを再起動しています...`,
			);
			start();
		},
	};
}
