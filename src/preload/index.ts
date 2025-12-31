import { contextBridge, ipcRenderer } from "electron";
import autoAPIS from "./autogenerate/register.js";

contextBridge.exposeInMainWorld("api", {
	...autoAPIS,
});

contextBridge.exposeInMainWorld("efevent", {
	onSuccess: (cb: (value: unknown) => void) => {
		const handler = (_event: Electron.IpcRendererEvent, value: unknown) => {
			cb(value);
		};
		ipcRenderer.on("onSuccess", handler);
		return () => {
			ipcRenderer.removeListener("onSuccess", handler);
		};
	},
});
