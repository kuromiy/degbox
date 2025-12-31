// auto generated
import type { WebContents } from "electron";
import type { Message } from "./events/onsuccess.js";

/**
 * 型安全なイベント送信クラス
 * Contextに組み込んで使用する
 */
export class EventSender {
    constructor(private sender: WebContents) {}

    onSuccess(value: Message) {
        this.sender.send("onSuccess", value);
    }
}

/**
 * EventSenderのファクトリ関数
 */
export function createEventSender(sender: WebContents): EventSender {
    return new EventSender(sender);
}
