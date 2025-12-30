// auto generated
import { ipcRenderer } from "electron";

export default {
    getAppSetting: () => ipcRenderer.invoke("getAppSetting", {  }),
    updateAppSetting: (ffmpegPath: string) => ipcRenderer.invoke("updateAppSetting", { ffmpegPath }),
    deleteAuthor: (id: string) => ipcRenderer.invoke("deleteAuthor", { id }),
    getAuthorDetail: (authorId: string, videoPage: number, videoSize: number) => ipcRenderer.invoke("getAuthorDetail", { authorId, videoPage, videoSize }),
    registerAuthor: (name: string, urls: string) => ipcRenderer.invoke("registerAuthor", { name, urls }),
    searchAuthor: (name: string | undefined, page: number, size: number) => ipcRenderer.invoke("searchAuthor", { name, page, size }),
    updateAuthor: (id: string, name: string, urls: string) => ipcRenderer.invoke("updateAuthor", { id, name, urls }),
    deleteIllust: (illustId: string) => ipcRenderer.invoke("deleteIllust", { illustId }),
    detailIllust: (illustId: string) => ipcRenderer.invoke("detailIllust", { illustId }),
    pickupImage: () => ipcRenderer.invoke("pickupImage", {  }),
    registerIllust: (resourceIds: string[], rawTags: string, authorIds: string[] | undefined) => ipcRenderer.invoke("registerIllust", { resourceIds, rawTags, authorIds }),
    searchIllust: (keyword: string | undefined, sortBy: string, order: string, page: number, limit: number) => ipcRenderer.invoke("searchIllust", { keyword, sortBy, order, page, limit }),
    updateIllust: (id: string, tags: string, imageItems: string[], authorIds: string[]) => ipcRenderer.invoke("updateIllust", { id, tags, imageItems, authorIds }),
    openProject: (projectId: string) => ipcRenderer.invoke("openProject", { projectId }),
    getRecentProject: () => ipcRenderer.invoke("getRecentProject", {  }),
    registerProject: () => ipcRenderer.invoke("registerProject", {  }),
    selectProject: () => ipcRenderer.invoke("selectProject", {  }),
    autocompleteTags: (value: string, limit: number) => ipcRenderer.invoke("autocompleteTags", { value, limit }),
    suggestRelatedTags: (tagNames: string[], limit: number) => ipcRenderer.invoke("suggestRelatedTags", { tagNames, limit }),
    detailVideo: (videoId: string) => ipcRenderer.invoke("detailVideo", { videoId }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceIds: string[], rawTags: string, authorIds: string[] | undefined) => ipcRenderer.invoke("registerVideo", { resourceIds, rawTags, authorIds }),
    searchVideo: (keyword: string, sortBy: string, order: string, page: number, size: number) => ipcRenderer.invoke("searchVideo", { keyword, sortBy, order, page, size })
};
