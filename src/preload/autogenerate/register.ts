// auto generated
import { ipcRenderer } from "electron";

export default {
    checkHealth: () => ipcRenderer.invoke("checkHealth", {  })
};
