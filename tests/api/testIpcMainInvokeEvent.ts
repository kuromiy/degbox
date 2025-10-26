import { mock } from "node:test";
import type { IpcMainInvokeEvent } from "electron";

export function createTestIpcMainInvokeEvent() {
	return {
		processId: 1,
		frameId: 1,
		sender: {
			id: 1,
			send: mock.fn(),
			sendSync: mock.fn(),
			sendTo: mock.fn(),
			sendToFrame: mock.fn(),
			postMessage: mock.fn(),
		} as unknown as IpcMainInvokeEvent["sender"],
		senderFrame: {} as unknown as IpcMainInvokeEvent["senderFrame"],
		preventDefault: mock.fn(),
	} as unknown as IpcMainInvokeEvent;
}
