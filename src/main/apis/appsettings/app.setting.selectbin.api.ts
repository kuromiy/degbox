import { join } from "node:path";
import { dialog } from "electron";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

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

	return {
		ffmpegPath: join(binPath, "ffmpeg.exe"),
		ffprobePath: join(binPath, "ffprobe.exe"),
	};
}
