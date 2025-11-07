import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";
import { cors } from "hono/cors";
import type { Container } from "../../features/shared/container/index.js";
import { factory } from "./factory.js";
import { createContainerMiddleware } from "./middleware/container.js";
import { renderMiddleware } from "./middleware/renderer.js";
import { sessionMiddleware } from "./middleware/session.js";
import tagAutocompleteRouter from "./router/api/tag/autocomplete.js";
import tagSuggestRouter from "./router/api/tag/suggest.js";
import authorDetailRouter from "./router/author/detail.js";
import authorRegisterRouter from "./router/author/register.js";
import authorSearchRouter from "./router/author/search.js";
import fileRouter from "./router/file/get.js";
import videoDetailRouter from "./router/video/detail.js";
import videoRouter from "./router/video/register.js";
import videoSearchRouter from "./router/video/search.js";
import type { Env } from "./types.js";

export function createServer(container: Container): Hono<Env> {
	const app = factory.createApp();
	// CORSミドルウェア: Renderer(localhost:5173)からのアクセスを許可
	app.use(
		"/*",
		cors({
			origin: [
				"http://localhost:5173",
				"http://192.168.3.33:8080",
				"http://localhost:8080",
			],
			credentials: true,
		}),
	);
	app.use("/public/*", serveStatic({ root: "./" }));
	app.use(createContainerMiddleware(container));
	app.use(sessionMiddleware);
	app.use(renderMiddleware);
	app.route("/file", fileRouter);
	app.route("/api/tag", tagAutocompleteRouter);
	app.route("/api/tag", tagSuggestRouter);
	app.route("/video", videoRouter);
	app.route("/video", videoSearchRouter);
	app.route("/video", videoDetailRouter);
	app.route("/author", authorRegisterRouter);
	app.route("/author", authorSearchRouter);
	app.route("/author", authorDetailRouter);
	app.onError((err, c) => {
		console.log("error", err);
		return c.text("error", 500);
	});
	return app;
}
