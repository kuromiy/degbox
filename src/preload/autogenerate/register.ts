// auto generated
import { ipcRenderer } from "electron";

export default {
    registerAuthor: (name: string, urls: string) => ipcRenderer.invoke("registerAuthor", { name, urls }),
    searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchAuthor", { name, page, size }),
    autocompleteTags: (value: string, limit: number | undefined) => ipcRenderer.invoke("autocompleteTags", { value, limit }),
    suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => ipcRenderer.invoke("suggestRelatedTags", { tagNames, limit }),
    detailVideo: (videoId: string) => ipcRenderer.invoke("detailVideo", { videoId }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => ipcRenderer.invoke("registerVideo", { resourceId, rawTags, authorId }),
    searchVideo: (keyword: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchVideo", { keyword, page, size })
};
