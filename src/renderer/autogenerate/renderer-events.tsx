// auto generated
import type { Message } from "../../main/events/onsuccess.js";

// window.events の型定義
declare global {
    interface Window {
        events: {
            onSuccess: (cb: (value: Message) => void) => () => void;
        };
    }
}

// イベント購読用インターフェース
export interface EventServiceIF {
    onSuccess: (cb: (value: Message) => void) => () => void;
}

// イベント購読用実装クラス
export class EventService implements EventServiceIF {
    onSuccess(cb: (value: Message) => void) {
        return window.events.onSuccess(cb);
    }
}
