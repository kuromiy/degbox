import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import type { Container } from "../../features/shared/container/index.js";
import { factory } from "./factory.js";
import { createContainerMiddleware } from "./middleware/container.js";
import { renderMiddleware } from "./middleware/renderer.js";
import { sessionMiddleware } from "./middleware/session.js";
import tagAutocompleteRouter from "./router/api/tag/autocomplete.js";
import tagSuggestRouter from "./router/api/tag/suggest.js";
import fileRouter from "./router/file/get.js";
import videoRouter from "./router/video/register.js";
import videoSearchRouter from "./router/video/search.js";
import type { Env } from "./types.js";

export function createServer(container: Container): Hono<Env> {
	const app = factory.createApp();
	app.use("/public/*", serveStatic({ root: "./" }));
	app.use(createContainerMiddleware(container));
	app.use(sessionMiddleware);
	app.use(renderMiddleware);
	app.route("/file", fileRouter);
	app.route("/api/tag", tagAutocompleteRouter);
	app.route("/api/tag", tagSuggestRouter);
	app.route("/video", videoRouter);
	app.route("/video", videoSearchRouter);
	app.onError((err, c) => {
		console.log("error", err);
		return c.text("error", 500);
	});
	return app;
}
