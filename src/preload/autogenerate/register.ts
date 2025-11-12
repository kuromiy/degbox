// auto generated
import { ipcRenderer } from "electron";

export default {
    deleteAuthor: (id: string) => ipcRenderer.invoke("deleteAuthor", { id }),
    getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => ipcRenderer.invoke("getAuthorDetail", { authorId, videoPage, videoSize }),
    registerAuthor: (name: string, urls: string) => ipcRenderer.invoke("registerAuthor", { name, urls }),
    searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchAuthor", { name, page, size }),
    updateAuthor: (id: string, name: string, urls: string) => ipcRenderer.invoke("updateAuthor", { id, name, urls }),
    pickupImage: () => ipcRenderer.invoke("pickupImage", {  }),
    registerIllust: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => ipcRenderer.invoke("registerIllust", { resourceIds, rawTags, authorIds }),
    searchIllust: (tag: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, limit: number | undefined) => ipcRenderer.invoke("searchIllust", { tag, sortBy, order, page, limit }),
    autocompleteTags: (value: string, limit: number | undefined) => ipcRenderer.invoke("autocompleteTags", { value, limit }),
    suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => ipcRenderer.invoke("suggestRelatedTags", { tagNames, limit }),
    detailVideo: (videoId: string) => ipcRenderer.invoke("detailVideo", { videoId }),
    pickupVideo: () => ipcRenderer.invoke("pickupVideo", {  }),
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => ipcRenderer.invoke("registerVideo", { resourceId, rawTags, authorId }),
    searchVideo: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, size: number | undefined) => ipcRenderer.invoke("searchVideo", { keyword, sortBy, order, page, size })
};
