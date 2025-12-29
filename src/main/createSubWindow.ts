import { BrowserWindow } from "electron";

export function createSubWindow(
	isDev: boolean,
	preloadPath: string,
	rendererPath: string,
) {
	const window = new BrowserWindow({
		width: 320 * 3,
		height: 320 * 2,
		webPreferences: {
			preload: preloadPath,
		},
	});

	if (isDev) {
		window.loadURL("http://localhost:5173/project-select.html");
		window.webContents.openDevTools();
	} else {
		window.loadFile(rendererPath);
	}

	window.setMenuBarVisibility(false);

	return window;
}
