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
		properties: ["openFile"],
	});
	if (canceled || filePaths.length === 0) {
		logger.info("No file selected");
		throw new Error("No file selected");
	}
	const id = await unmanagedContentRepository.generateId();
	const path = filePaths[0];
	if (!path) {
		logger.info("No file selected");
		throw new Error("No file selected");
	}
	const unmanagedContent = { id, path };
	logger.info(`Picked up video: ${basename(path)}`);
	await unmanagedContentRepository.save(unmanagedContent);
	return { id: unmanagedContent.id, name: basename(unmanagedContent.path) };
}
