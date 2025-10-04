// auto generated
import type { sujestTags } from "../../main/apis/tags/tag.sujest.api.js";
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
            sujestTags: (value: string) => Promise<Result<ReturnTypeUnwrapped<typeof sujestTags>, Error>>;
            pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
            registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
        };
    }
}

// サービスインターフェース
export interface ServiceIF {
    sujestTags: (value: string) => Promise<Result<ReturnTypeUnwrapped<typeof sujestTags>, Error>>;
    pickupVideo: () => Promise<Result<ReturnTypeUnwrapped<typeof pickupVideo>, Error>>;
    registerVideo: (resourceId: string, rawTags: string, authorId: string | undefined) => Promise<Result<ReturnTypeUnwrapped<typeof registerVideo>, Error>>;
}

// サービス実装クラス
export class ApiService implements ServiceIF {
    async sujestTags(value: string) {
        return window.api.sujestTags(value);
    }

    async pickupVideo() {
        return window.api.pickupVideo();
    }

    async registerVideo(resourceId: string, rawTags: string, authorId: string | undefined) {
        return window.api.registerVideo(resourceId, rawTags, authorId);
    }
}
