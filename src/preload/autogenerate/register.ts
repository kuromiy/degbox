// auto generated
import { ipcRenderer } from "electron";

export default {
    suggestTags: (value: string) => ipcRenderer.invoke("suggestTags", { value }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => ipcRenderer.invoke("registerVideo", { resourceId, rawTags, authorId }),
    searchVideo: (keyword: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchVideo", { keyword, page, size })
};
