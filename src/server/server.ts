import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import type { Container } from "../../features/shared/container/index.js";
import { factory } from "./factory.js";
import { createContainerMiddleware } from "./middleware/container.js";
import { renderMiddleware } from "./middleware/renderer.js";
import videoRouter from "./router/video/register.js";
import type { Env } from "./types.js";

export function createServer(container: Container): Hono<Env> {
	const app = factory.createApp();
	app.use("/public/*", serveStatic({ root: "./" }));
	app.use(createContainerMiddleware(container));
	app.use(renderMiddleware);
	app.route("/video", videoRouter);
	app.onError((err, c) => {
		console.log("error", err);
		return c.text("error", 500);
	});
	return app;
}
