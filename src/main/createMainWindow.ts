import { BrowserWindow } from "electron";

export async function createMainWindow(
	isDev: boolean,
	preloadPath: string,
	rendererPath: string,
) {
	const window = new BrowserWindow({
		width: 320 * 4,
		height: 320 * 3,
		webPreferences: {
			preload: preloadPath,
		},
	});

	if (isDev) {
		window.loadURL("http://localhost:5173");
		window.webContents.openDevTools();
	} else {
		window.loadFile(rendererPath);
	}

	window.setMenuBarVisibility(false);
}
