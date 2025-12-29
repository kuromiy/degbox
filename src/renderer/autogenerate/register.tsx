// auto generated
import type { getAppSetting } from "../../main/apis/appsettings/app.setting.get.api.js";
import type { updateAppSetting } from "../../main/apis/appsettings/app.setting.update.api.js";
import type { deleteAuthor } from "../../main/apis/authors/author.delete.api.js";
import type { getAuthorDetail } from "../../main/apis/authors/author.detail.api.js";
import type { registerAuthor } from "../../main/apis/authors/author.register.api.js";
import type { searchAuthor } from "../../main/apis/authors/author.search.api.js";
import type { updateAuthor } from "../../main/apis/authors/author.update.api.js";
import type { deleteIllust } from "../../main/apis/illusts/illust.delete.api.js";
import type { detailIllust } from "../../main/apis/illusts/illust.detail.api.js";
import type { pickupImage } from "../../main/apis/illusts/illust.pickup.api.js";
import type { registerIllust } from "../../main/apis/illusts/illust.register.api.js";
import type { searchIllust } from "../../main/apis/illusts/illust.search.api.js";
import type { updateIllust } from "../../main/apis/illusts/illust.update.api.js";
import type { openProject } from "../../main/apis/project/project.open.api.js";
import type { getRecentProject } from "../../main/apis/project/project.recent.get.api.js";
import type { registerProject } from "../../main/apis/project/project.register.api.js";
import type { selectProject } from "../../main/apis/project/project.select.api.js";
import type { autocompleteTags } from "../../main/apis/tags/tag.autocomplete.api.js";
import type { suggestRelatedTags } from "../../main/apis/tags/tag.suggest.api.js";
import type { detailVideo } from "../../main/apis/videos/video.detail.api.js";
import type { pickupVideo } from "../../main/apis/videos/video.pickup.api.js";
import type { registerVideo } from "../../main/apis/videos/video.register.api.js";
import type { searchVideo } from "../../main/apis/videos/video.search.api.js";
import type { Result } from "electron-flow";

// Promise を外す型ユーティリティ
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
// 関数型の戻り値を取得し、Promise を外す型ユーティリティ
type ReturnTypeUnwrapped<T> = T extends (...args: infer _Args) => infer R
    ? UnwrapPromise<R>
    : never;

// window.api の型定義
declare global {
    interface Window {
        api: {
            getAppSetting: () => Promise<Result<ReturnTypeUnwrapped<typeof getAppSetting>, Error>>;
            updateAppSetting: (ffmpegPath: string) => Promise<Result<ReturnTypeUnwrapped<typeof updateAppSetting>, Error>>;
            deleteAuthor: (id: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteAuthor>, Error>>;
            getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof getAuthorDetail>, Error>>;
            registerAuthor: (name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof registerAuthor>, Error>>;
            searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchAuthor>, Error>>;
            updateAuthor: (id: string, name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof updateAuthor>, Error>>;
            deleteIllust: (illustId: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteIllust>, Error>>;
            detailIllust: (illustId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailIllust>, Error>>;
            pickupImage: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupImage>, Error>>;
            registerIllust: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerIllust>, Error>>;
            searchIllust: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchIllust>, Error>>;
            updateIllust: (id: string, tags: string, imageItems: unknown[], authorIds: unknown[]) => Promise<Result<ReturnTypeUnwrapped<typeof updateIllust>, Error>>;
            openProject: (projectId: string) => Promise<Result<ReturnTypeUnwrapped<typeof openProject>, Error>>;
            getRecentProject: () => Promise<Result<ReturnTypeUnwrapped<typeof getRecentProject>, Error>>;
            registerProject: () => Promise<Result<ReturnTypeUnwrapped<typeof registerProject>, Error>>;
            selectProject: () => Promise<Result<ReturnTypeUnwrapped<typeof selectProject>, Error>>;
            autocompleteTags: (value: string, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof autocompleteTags>, Error>>;
            suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof suggestRelatedTags>, Error>>;
            detailVideo: (videoId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailVideo>, Error>>;
            pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
            registerVideo: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
            searchVideo: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchVideo>, Error>>;
        };
    }
}

// サービスインターフェース
export interface ServiceIF {
    getAppSetting: () => Promise<Result<ReturnTypeUnwrapped<typeof getAppSetting>, Error>>;
    updateAppSetting: (ffmpegPath: string) => Promise<Result<ReturnTypeUnwrapped<typeof updateAppSetting>, Error>>;
    deleteAuthor: (id: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteAuthor>, Error>>;
    getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof getAuthorDetail>, Error>>;
    registerAuthor: (name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof registerAuthor>, Error>>;
    searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchAuthor>, Error>>;
    updateAuthor: (id: string, name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof updateAuthor>, Error>>;
    deleteIllust: (illustId: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteIllust>, Error>>;
    detailIllust: (illustId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailIllust>, Error>>;
    pickupImage: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupImage>, Error>>;
    registerIllust: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerIllust>, Error>>;
    searchIllust: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchIllust>, Error>>;
    updateIllust: (id: string, tags: string, imageItems: unknown[], authorIds: unknown[]) => Promise<Result<ReturnTypeUnwrapped<typeof updateIllust>, Error>>;
    openProject: (projectId: string) => Promise<Result<ReturnTypeUnwrapped<typeof openProject>, Error>>;
    getRecentProject: () => Promise<Result<ReturnTypeUnwrapped<typeof getRecentProject>, Error>>;
    registerProject: () => Promise<Result<ReturnTypeUnwrapped<typeof registerProject>, Error>>;
    selectProject: () => Promise<Result<ReturnTypeUnwrapped<typeof selectProject>, Error>>;
    autocompleteTags: (value: string, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof autocompleteTags>, Error>>;
    suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof suggestRelatedTags>, Error>>;
    detailVideo: (videoId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailVideo>, Error>>;
    pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
    registerVideo: (resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
    searchVideo: (keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchVideo>, Error>>;
}

// サービス実装クラス
export class ApiService implements ServiceIF {
    async getAppSetting() {
        return window.api.getAppSetting();
    }

    async updateAppSetting(ffmpegPath: string) {
        return window.api.updateAppSetting(ffmpegPath);
    }

    async deleteAuthor(id: string) {
        return window.api.deleteAuthor(id);
    }

    async getAuthorDetail(authorId: string, videoPage: number | undefined, videoSize: number | undefined) {
        return window.api.getAuthorDetail(authorId, videoPage, videoSize);
    }

    async registerAuthor(name: string, urls: string) {
        return window.api.registerAuthor(name, urls);
    }

    async searchAuthor(name: string | undefined, page: number | undefined, size: number | undefined) {
        return window.api.searchAuthor(name, page, size);
    }

    async updateAuthor(id: string, name: string, urls: string) {
        return window.api.updateAuthor(id, name, urls);
    }

    async deleteIllust(illustId: string) {
        return window.api.deleteIllust(illustId);
    }

    async detailIllust(illustId: string) {
        return window.api.detailIllust(illustId);
    }

    async pickupImage() {
        return window.api.pickupImage();
    }

    async registerIllust(resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) {
        return window.api.registerIllust(resourceIds, rawTags, authorIds);
    }

    async searchIllust(keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, limit: number | undefined) {
        return window.api.searchIllust(keyword, sortBy, order, page, limit);
    }

    async updateIllust(id: string, tags: string, imageItems: unknown[], authorIds: unknown[]) {
        return window.api.updateIllust(id, tags, imageItems, authorIds);
    }

    async openProject(projectId: string) {
        return window.api.openProject(projectId);
    }

    async getRecentProject() {
        return window.api.getRecentProject();
    }

    async registerProject() {
        return window.api.registerProject();
    }

    async selectProject() {
        return window.api.selectProject();
    }

    async autocompleteTags(value: string, limit: number | undefined) {
        return window.api.autocompleteTags(value, limit);
    }

    async suggestRelatedTags(tagNames: unknown[], limit: number | undefined) {
        return window.api.suggestRelatedTags(tagNames, limit);
    }

    async detailVideo(videoId: string) {
        return window.api.detailVideo(videoId);
    }

    async pickupVideo() {
        return window.api.pickupVideo();
    }

    async registerVideo(resourceIds: unknown[], rawTags: string, authorIds: unknown[] | undefined) {
        return window.api.registerVideo(resourceIds, rawTags, authorIds);
    }

    async searchVideo(keyword: string | undefined, sortBy: string | undefined, order: string | undefined, page: number | undefined, size: number | undefined) {
        return window.api.searchVideo(keyword, sortBy, order, page, size);
    }
}
