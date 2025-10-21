// auto generated
import type { suggestTags } from "../../main/apis/tags/tag.suggest.api.js";
import type { pickupVideo } from "../../main/apis/videos/video.pickup.api.js";
import type { registerVideo } from "../../main/apis/videos/video.register.api.js";
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
            suggestTags: (value: string) => Promise<Result<ReturnTypeUnwrapped<typeof suggestTags>, Error>>;
            pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
            registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
        };
    }
}

// サービスインターフェース
export interface ServiceIF {
    suggestTags: (value: string) => Promise<Result<ReturnTypeUnwrapped<typeof suggestTags>, Error>>;
    pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
}

// サービス実装クラス
export class ApiService implements ServiceIF {
    async suggestTags(value: string) {
        return window.api.suggestTags(value);
    }

    async pickupVideo() {
        return window.api.pickupVideo();
    }

    async registerVideo(resourceId: string, rawTags: string, authorId: string | undefined) {
        return window.api.registerVideo(resourceId, rawTags, authorId);
    }
}
