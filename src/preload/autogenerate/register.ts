// auto generated
import { ipcRenderer } from "electron";

export default {
    sujestTags: (value: string) => ipcRenderer.invoke("sujestTags", { value }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => ipcRenderer.invoke("registerVideo", { resourceId, rawTags, authorId })
};
