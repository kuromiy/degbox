import { type ServerType, serve } from "@hono/node-server";
import type { Container } from "../../features/shared/container/index.js";

let serverInstance: ServerType | null = null;

export async function startServer(
	container: Container,
	fileRoot: string,
	port = 8080,
): Promise<ServerType> {
	if (serverInstance) {
		await stopServer();
	}

	const { createServer } = await import("../server/server.js");
	const application = createServer({ container, fileRoot });
	serverInstance = serve({
		fetch: application.fetch,
		port,
	});
	return serverInstance;
}

export async function stopServer(): Promise<void> {
	if (serverInstance) {
		serverInstance.close();
		serverInstance = null;
	}
}

export function getServerInstance(): ServerType | null {
	return serverInstance;
}
