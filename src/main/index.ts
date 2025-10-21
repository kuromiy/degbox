import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { app, BrowserWindow, protocol } from "electron";
import { Container } from "../../features/shared/container/index.js";
import { createServer } from "../server/server.js";
import { registerAPI, registerProtocol } from "./autogenerate/index.js";
import { depend } from "./depend.injection.js";

const IS_DEV =
	process.env.NODE_ENV === "development" ||
	(!app.isPackaged && !process.env.IS_TEST);

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadPath = join(__dirname, "../preload/index.js");
const rendererPath = join(__dirname, "../renderer/index.html");

// 動画を扱うプロトコルでは、以下のように情報を登録する必要あり
protocol.registerSchemesAsPrivileged([
	{
		scheme: "resources",
		privileges: {
			stream: true,
		},
	},
]);

app.whenReady().then(async () => {
	const container = new Container();
	depend.forEach(({ token, provider }) => {
		container.register(token, provider);
	});

	const application = createServer(container);
	serve({
		fetch: application.fetch,
		port: 8080,
	});

	const window = new BrowserWindow({
		width: 320 * 4,
		height: 320 * 3,
		webPreferences: {
			preload: preloadPath,
		},
	});

	if (IS_DEV) {
		window.loadURL("http://localhost:5173");
		window.webContents.openDevTools();
	} else {
		window.loadFile(rendererPath);
	}

	window.setMenuBarVisibility(false);

	registerAPI({
		container,
	});
	registerProtocol(container);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
