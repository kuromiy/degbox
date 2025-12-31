// auto generated
import { ipcRenderer } from "electron";

import type { Message } from "../../main/events/onsuccess.js";

export default {
    onMessage: (cb: (value: Message) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, value: Message) => {
            cb(value);
        };
        ipcRenderer.on("onMessage", handler);
        return () => {
            ipcRenderer.removeListener("onMessage", handler);
        };
    }
};
