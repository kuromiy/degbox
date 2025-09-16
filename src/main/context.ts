import type { IpcMainInvokeEvent } from "electron";

export type Context = {
	event: IpcMainInvokeEvent;
};
