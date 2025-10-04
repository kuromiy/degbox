import type { IpcMainInvokeEvent } from "electron";
import type { Container } from "../../features/shared/container/index.js";

export type Context = {
	container: Container;
	event: IpcMainInvokeEvent;
};
