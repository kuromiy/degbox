import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import { registerAPI } from "./autogenerate/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadPath = join(__dirname, "../preload/index.js");

app.whenReady().then(async () => {
	const window = new BrowserWindow({
		width: 320 * 4,
		height: 320 * 3,
		webPreferences: {
			preload: preloadPath,
		},
	});

	window.loadURL("http://localhost:5173");
	window.webContents.openDevTools();

	window.setMenuBarVisibility(false);

	registerAPI({});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
