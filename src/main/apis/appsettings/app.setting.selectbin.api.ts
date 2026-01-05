import { accessSync, constants } from "node:fs";
import { join } from "node:path";
import { dialog } from "electron";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

function getExecutableName(baseName: string): string {
	return process.platform === "win32" ? `${baseName}.exe` : baseName;
}

function isExecutable(filePath: string): boolean {
	try {
		// Check if file exists and is readable
		accessSync(filePath, constants.R_OK);
		// On Unix, also check execute permission
		if (process.platform !== "win32") {
			accessSync(filePath, constants.X_OK);
		}
		return true;
	} catch {
		return false;
	}
}

export async function selectFfmpegBin(ctx: Context) {
	const { container } = ctx;
	const logger = container.get(TOKENS.LOGGER);

	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openDirectory"],
		title: "FFmpegのbinフォルダを選択",
	});

	if (canceled || filePaths.length === 0) {
		logger.info("ffmpeg bin folder selection canceled");
		return null;
	}

	const binPath = filePaths[0];
	if (!binPath) {
		logger.info("ffmpeg bin folder path is undefined");
		return null;
	}

	logger.info("ffmpeg bin folder selected", { binPath });

	const ffmpegPath = join(binPath, getExecutableName("ffmpeg"));
	const ffprobePath = join(binPath, getExecutableName("ffprobe"));

	if (!isExecutable(ffmpegPath)) {
		logger.warn("ffmpeg executable not found or not executable", {
			ffmpegPath,
		});
		throw new Error(`ffmpegが見つからないか実行できません: ${ffmpegPath}`);
	}

	if (!isExecutable(ffprobePath)) {
		logger.warn("ffprobe executable not found or not executable", {
			ffprobePath,
		});
		throw new Error(`ffprobeが見つからないか実行できません: ${ffprobePath}`);
	}

	return {
		ffmpegPath,
		ffprobePath,
	};
}
