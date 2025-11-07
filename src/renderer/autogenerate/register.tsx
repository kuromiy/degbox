// auto generated
import type { deleteAuthor } from "../../main/apis/authors/author.delete.api.js";
import type { getAuthorDetail } from "../../main/apis/authors/author.detail.api.js";
import type { registerAuthor } from "../../main/apis/authors/author.register.api.js";
import type { searchAuthor } from "../../main/apis/authors/author.search.api.js";
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
            deleteAuthor: (id: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteAuthor>, Error>>;
            getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof getAuthorDetail>, Error>>;
            registerAuthor: (name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof registerAuthor>, Error>>;
            searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchAuthor>, Error>>;
            autocompleteTags: (value: string, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof autocompleteTags>, Error>>;
            suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof suggestRelatedTags>, Error>>;
            detailVideo: (videoId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailVideo>, Error>>;
            pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
            registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
            searchVideo: (keyword: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchVideo>, Error>>;
        };
    }
}

// サービスインターフェース
export interface ServiceIF {
    deleteAuthor: (id: string) => Promise<Result<ReturnTypeUnwrapped<typeof deleteAuthor>, Error>>;
    getAuthorDetail: (authorId: string, videoPage: number | undefined, videoSize: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof getAuthorDetail>, Error>>;
    registerAuthor: (name: string, urls: string) => Promise<Result<ReturnTypeUnwrapped<typeof registerAuthor>, Error>>;
    searchAuthor: (name: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchAuthor>, Error>>;
    autocompleteTags: (value: string, limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof autocompleteTags>, Error>>;
    suggestRelatedTags: (tagNames: unknown[], limit: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof suggestRelatedTags>, Error>>;
    detailVideo: (videoId: string) => Promise<Result<ReturnTypeUnwrapped<typeof detailVideo>, Error>>;
    pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
    searchVideo: (keyword: string | undefined, page: number | undefined, size: number | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof searchVideo>, Error>>;
}

// サービス実装クラス
export class ApiService implements ServiceIF {
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

    async registerVideo(resourceId: string, rawTags: string, authorId: string | undefined) {
        return window.api.registerVideo(resourceId, rawTags, authorId);
    }

    async searchVideo(keyword: string | undefined, page: number | undefined, size: number | undefined) {
        return window.api.searchVideo(keyword, page, size);
    }
}
