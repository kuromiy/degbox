// auto generated
import { ipcRenderer } from "electron";

export default {
    getAppSetting: () => ipcRenderer.invoke("getAppSetting", {  }),
    updateAppSetting: (ffmpegPath: string) => ipcRenderer.invoke("updateAppSetting", { ffmpegPath }),
    deleteAuthor: (id: string) => ipcRenderer.invoke("deleteAuthor", { id }),
    getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => ipcRenderer.invoke("getAuthorDetail", { authorId, videoPage, videoSize }),
    registerAuthor: (name: string, urls: string) => ipcRenderer.invoke("registerAuthor", { name, urls }),
    searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchAuthor", { name, page, size }),
    updateAuthor: (id: string, name: string, urls: string) => ipcRenderer.invoke("updateAuthor", { id, name, urls }),
    deleteIllust: (illustId: string) => ipcRenderer.invoke("deleteIllust", { illustId }),
    detailIllust: (illustId: string) => ipcRenderer.invoke("detailIllust", { illustId }),
    pickupImage: () => ipcRenderer.invoke("pickupImage", {  }),
    registerIllust: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => ipcRenderer.invoke("registerIllust", { resourceIds, rawTags, authorIds }),
    searchIllust: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, limit: number | undefined) => ipcRenderer.invoke("searchIllust", { keyword, sortBy, order, page, limit }),
    updateIllust: (id: string, tags: string, imageItems: unknown[], authorIds: unknown[]) => ipcRenderer.invoke("updateIllust", { id, tags, imageItems, authorIds }),
    autocompleteTags: (value: string, limit: number | undefined) => ipcRenderer.invoke("autocompleteTags", { value, limit }),
    suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => ipcRenderer.invoke("suggestRelatedTags", { tagNames, limit }),
    detailVideo: (videoId: string) => ipcRenderer.invoke("detailVideo", { videoId }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => ipcRenderer.invoke("registerVideo", { resourceIds, rawTags, authorIds }),
    searchVideo: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchVideo", { keyword, sortBy, order, page, size })
};
