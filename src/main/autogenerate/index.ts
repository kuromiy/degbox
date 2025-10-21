import { pathToFileURL } from "node:url";
import { net, protocol } from "electron";
import type { Container } from "../../../features/shared/container/index.js";
import type { Context } from "../context.js";
import { TOKENS } from "../depend.injection.js";
import { registerAutoGenerateAPI, removeAutoGenerateAPI } from "./register.js";

export function registerAPI(ctx: Omit<Context, "event">) {
	registerAutoGenerateAPI(ctx);

	// Object.entries(handlers).forEach(([key, handler]) => {
	//     ipcMain.handle(key, handler(ctx));
	// });
}

export function removeAPI() {
	removeAutoGenerateAPI();

	// Object.keys(handlers).forEach(key => {
	//     ipcMain.removeHandler(key);
	// });
}

export function registerProtocol(container: Container) {
	protocol.handle("resources", async (req: GlobalRequest) => {
		const [logger, repository] = container.get(
			TOKENS.LOGGER,
			TOKENS.UNMANAGED_CONTENT_REPOSITORY,
		);
		const resourceId = req.url.slice("resources://".length);
		logger.info(`resourceId: ${resourceId}`);
		const cached = await repository.get(resourceId);
		if (cached) {
			return net.fetch(pathToFileURL(cached.path).toString());
		}
		logger.info(`Not found in cache. resourceId: ${resourceId}`);
		return new Response(null, { status: 404 });
	});
}
