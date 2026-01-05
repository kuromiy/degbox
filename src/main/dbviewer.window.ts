import { BrowserWindow } from "electron";

let dbViewerWindow: BrowserWindow | null = null;

/**
 * DB Viewerウィンドウを開く（開発モード専用）
 * 既存のウィンドウがあればフォーカスする
 */
export function openDbViewerWindow(preloadPath: string): void {
	if (dbViewerWindow && !dbViewerWindow.isDestroyed()) {
		dbViewerWindow.focus();
		return;
	}

	dbViewerWindow = new BrowserWindow({
		width: 1000,
		height: 700,
		title: "DB Viewer (Dev)",
		webPreferences: {
			preload: preloadPath,
		},
	});

	dbViewerWindow.loadURL("http://localhost:5173/dbviewer.html");
	dbViewerWindow.webContents.openDevTools();
	dbViewerWindow.setMenuBarVisibility(false);

	dbViewerWindow.on("closed", () => {
		dbViewerWindow = null;
	});
}

/**
 * DB Viewerウィンドウを閉じる
 */
export function closeDbViewerWindow(): void {
	if (dbViewerWindow && !dbViewerWindow.isDestroyed()) {
		dbViewerWindow.close();
		dbViewerWindow = null;
	}
}

/**
 * DB Viewerウィンドウが開いているかどうか
 */
export function isDbViewerWindowOpen(): boolean {
	return dbViewerWindow !== null && !dbViewerWindow.isDestroyed();
}
