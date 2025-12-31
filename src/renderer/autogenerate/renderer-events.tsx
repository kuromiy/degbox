// auto generated
import type { Message } from "../../main/events/onsuccess.js";

// window.events の型定義
declare global {
    interface Window {
        events: {
            onMessage: (cb: (value: Message) => void) => () => void;
        };
    }
}

// イベント購読用インターフェース
export interface EventServiceIF {
    onMessage: (cb: (value: Message) => void) => () => void;
}

// イベント購読用実装クラス
export class EventService implements EventServiceIF {
    onMessage(cb: (value: Message) => void) {
        return window.events.onMessage(cb);
    }
}
