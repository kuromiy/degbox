import { basename } from "node:path";
import { dialog } from "electron";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export async function pickupVideo(ctx: Context) {
	const { container } = ctx;
	const [logger, unmanagedContentRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.UNMANAGED_CONTENT_REPOSITORY,
	);
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openFile", "multiSelections"],
		filters: [
			{
				name: "Videos",
				extensions: ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv"],
			},
		],
	});
	if (canceled || filePaths.length === 0) {
		logger.info("No file selected");
		throw new Error("No file selected");
	}

	const results = [];
	for (const path of filePaths) {
		const id = await unmanagedContentRepository.generateId();
		const unmanagedContent = { id, path };
		logger.info(`Picked up video: ${basename(path)}`);
		await unmanagedContentRepository.save(unmanagedContent);
		results.push({
			id: unmanagedContent.id,
			name: basename(unmanagedContent.path),
		});
	}

	return results;
}
