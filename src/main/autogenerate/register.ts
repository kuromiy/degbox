// auto generated
import type { Context } from "../context.js";
import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { success, failure } from "electron-flow";
import { customErrorHandler } from "../errorHandler.js";

import { getAppSetting } from "../apis/appsettings/app.setting.get.api.js";
import { updateAppSetting } from "../apis/appsettings/app.setting.update.api.js";
import { deleteAuthor, deleteAuthorValidator } from "../apis/authors/author.delete.api.js";
import { getAuthorDetail, getAuthorDetailValidator } from "../apis/authors/author.detail.api.js";
import { registerAuthor, registerAuthorValidator } from "../apis/authors/author.register.api.js";
import { searchAuthor, searchAuthorValidator } from "../apis/authors/author.search.api.js";
import { updateAuthor, updateAuthorValidator } from "../apis/authors/author.update.api.js";
import { deleteContent, deleteContentValidator } from "../apis/duplicates/duplicate.delete-content.api.js";
import { deleteDuplicateGroup, deleteDuplicateGroupValidator } from "../apis/duplicates/duplicate.delete.api.js";
import { getDuplicateGroup, getDuplicateGroupValidator } from "../apis/duplicates/duplicate.detail.api.js";
import { listDuplicateGroups } from "../apis/duplicates/duplicate.list.api.js";
import { removeItemFromGroup, removeItemFromGroupValidator } from "../apis/duplicates/duplicate.remove-item.api.js";
import { deleteIllust, deleteIllustValidator } from "../apis/illusts/illust.delete.api.js";
import { detailIllust, detailIllustValidator } from "../apis/illusts/illust.detail.api.js";
import { pickupImage } from "../apis/illusts/illust.pickup.api.js";
import { registerIllust, registerIllustValidator } from "../apis/illusts/illust.register.api.js";
import { searchIllust, searchIllustValidator } from "../apis/illusts/illust.search.api.js";
import { updateIllust, updateIllustValidator } from "../apis/illusts/illust.update.api.js";
import { openProject } from "../apis/project/project.open.api.js";
import { getRecentProject } from "../apis/project/project.recent.get.api.js";
import { registerProject } from "../apis/project/project.register.api.js";
import { selectProject } from "../apis/project/project.select.api.js";
import { autocompleteTags } from "../apis/tags/tag.autocomplete.api.js";
import { suggestRelatedTags } from "../apis/tags/tag.suggest.api.js";
import { detailVideo, detailVideoValidator } from "../apis/videos/video.detail.api.js";
import { pickupVideo } from "../apis/videos/video.pickup.api.js";
import { registerVideo, registerVideoValidator } from "../apis/videos/video.register.api.js";
import { searchVideo, searchVideoValidator } from "../apis/videos/video.search.api.js";

export const autoGenerateHandlers = {
    "getAppSetting": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await getAppSetting({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "updateAppSetting": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await updateAppSetting({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "deleteAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = deleteAuthorValidator(args, { ...ctx, event });
                const result = await deleteAuthor({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "getAuthorDetail": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = getAuthorDetailValidator(args, { ...ctx, event });
                const result = await getAuthorDetail({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "registerAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = registerAuthorValidator(args, { ...ctx, event });
                const result = await registerAuthor({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "searchAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = searchAuthorValidator(args, { ...ctx, event });
                const result = await searchAuthor({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "updateAuthor": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = updateAuthorValidator(args, { ...ctx, event });
                const result = await updateAuthor({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "deleteContent": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = deleteContentValidator(args, { ...ctx, event });
                const result = await deleteContent({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "deleteDuplicateGroup": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = deleteDuplicateGroupValidator(args, { ...ctx, event });
                const result = await deleteDuplicateGroup({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "getDuplicateGroup": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = getDuplicateGroupValidator(args, { ...ctx, event });
                const result = await getDuplicateGroup({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "listDuplicateGroups": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await listDuplicateGroups({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "removeItemFromGroup": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = removeItemFromGroupValidator(args, { ...ctx, event });
                const result = await removeItemFromGroup({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "deleteIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = deleteIllustValidator(args, { ...ctx, event });
                const result = await deleteIllust({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "detailIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = detailIllustValidator(args, { ...ctx, event });
                const result = await detailIllust({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "pickupImage": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await pickupImage({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "registerIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = registerIllustValidator(args, { ...ctx, event });
                const result = await registerIllust({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "searchIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = searchIllustValidator(args, { ...ctx, event });
                const result = await searchIllust({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "updateIllust": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = updateIllustValidator(args, { ...ctx, event });
                const result = await updateIllust({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "openProject": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await openProject({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "getRecentProject": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await getRecentProject({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "registerProject": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await registerProject({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "selectProject": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await selectProject({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "autocompleteTags": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await autocompleteTags({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "suggestRelatedTags": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: any) => {
            try {
                const result = await suggestRelatedTags({ ...ctx, event }, args);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "detailVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = detailVideoValidator(args, { ...ctx, event });
                const result = await detailVideo({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "pickupVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, _: unknown) => {
            try {
                const result = await pickupVideo({ ...ctx, event });
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "registerVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = registerVideoValidator(args, { ...ctx, event });
                const result = await registerVideo({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
            }
        };
    },
    "searchVideo": (ctx: Omit<Context, "event">) => {
        return async (event: IpcMainInvokeEvent, args: unknown) => {
            try {
                const validatedArgs = searchVideoValidator(args, { ...ctx, event });
                const result = await searchVideo({ ...ctx, event }, validatedArgs);
                return success(result);
            } catch (e) {
                return customErrorHandler(e, { ...ctx, event });
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
