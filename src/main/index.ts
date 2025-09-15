import { app, BrowserWindow } from "electron";
import { join } from "node:path";

app.whenReady().then(async () => {
    const window = new BrowserWindow({
        width: 320 * 4,
        height: 320 * 3,
        // webPreferences: {
        //     preload: join(__dirname, "../preload/index.js"),
        // },
    });

    window.loadURL('http://localhost:5173');
    window.webContents.openDevTools();

    window.setMenuBarVisibility(false);

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});