// auto generated
import type { Context } from "../context.js";
import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { success, failure } from "electron-flow";

import { deleteAuthor } from "../apis/authors/author.delete.api.js";
import { getAuthorDetail } from "../apis/authors/author.detail.api.js";
import { registerAuthor } from "../apis/authors/author.register.api.js";
import { searchAuthor } from "../apis/authors/author.search.api.js";
import { updateAuthor } from "../apis/authors/author.update.api.js";
import { detailIllust } from "../apis/illusts/illust.detail.api.js";
import { pickupImage } from "../apis/illusts/illust.pickup.api.js";
import { registerIllust } from "../apis/illusts/illust.register.api.js";
import { searchIllust } from "../apis/illusts/illust.search.api.js";
import { autocompleteTags } from "../apis/tags/tag.autocomplete.api.js";
import { suggestRelatedTags } from "../apis/tags/tag.suggest.api.js";
import { detailVideo } from "../apis/videos/video.detail.api.js";
import { pickupVideo } from "../apis/videos/video.pickup.api.js";
import { registerVideo } from "../apis/videos/video.register.api.js";
import { searchVideo } from "../apis/videos/video.search.api.js";

export const autoGenerateHandlers = {
    "deleteAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await deleteAuthor({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "getAuthorDetail": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await getAuthorDetail({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "registerAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await registerAuthor({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "searchAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await searchAuthor({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "updateAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await updateAuthor({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "detailIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await detailIllust({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "pickupImage": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await pickupImage({ ...ctx, event }, );
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "registerIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await registerIllust({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "searchIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await searchIllust({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "autocompleteTags": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await autocompleteTags({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "suggestRelatedTags": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await suggestRelatedTags({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "detailVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await detailVideo({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "pickupVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await pickupVideo({ ...ctx, event }, );
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "registerVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await registerVideo({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
    "searchVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await searchVideo({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return failure(e);
            }
        };
    },
};

export function registerAutoGenerateAPI(ctx: Omit<Context, "event">) {
    Object.entries(autoGenerateHandlers).forEach(([key, value]) => {
        ipcMain.handle(key, value(ctx));
    });
}

export function removeAutoGenerateAPI() {
    Object.keys(autoGenerateHandlers).forEach(key => {
        ipcMain.removeHandler(key);
    });
}
