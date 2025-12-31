// auto generated
import { ipcRenderer } from "electron";

import type { Message } from "../../main/events/onsuccess.js";

export default {
    onSuccess: (cb: (value: Message) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, value: Message) => {
            cb(value);
        };
        ipcRenderer.on("onSuccess", handler);
        return () => {
            ipcRenderer.removeListener("onSuccess", handler);
        };
    }
};
