import type { Context } from "../context.js";
import { registerAutoGenerateAPI, removeAutoGenerateAPI } from "./register.js";

export function registerAPI(ctx: Omit<Context, "event">) {
	registerAutoGenerateAPI(ctx);

	// Object.entries(handlers).forEach(([key, handler]) => {
	//     ipcMain.handle(key, handler(ctx));
	// });
}

export function removeAPI() {
	removeAutoGenerateAPI();

	// Object.keys(handlers).forEach(key => {
	//     ipcMain.removeHandler(key);
	// });
}
