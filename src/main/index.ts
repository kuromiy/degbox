import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { app, BrowserWindow, protocol } from "electron";
import {
	type AppSetting,
	AppSettingSchema,
} from "../../features/appsetting/app.setting.model.js";
import { Container } from "../../features/shared/container/index.js";
import {
	createJsonFileStoreWithFallback,
	type FileStoreValidationError,
} from "../../features/shared/filestore/index.js";
import { logger } from "../../features/shared/logger/index.js";
import { createServer } from "../server/server.js";
import { registerAPI, registerProtocol } from "./autogenerate/index.js";
import { depend, TOKENS } from "./depend.injection.js";

const IS_DEV =
	process.env.NODE_ENV === "development" ||
	(!app.isPackaged && !process.env.IS_TEST);

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadPath = join(__dirname, "../preload/index.js");
const rendererPath = join(__dirname, "../renderer/index.html");

// 動画を扱うプロトコルでは、以下のように情報を登録する必要あり
protocol.registerSchemesAsPrivileged([
	{
		scheme: "resources",
		privileges: {
			stream: true,
		},
	},
]);

app.whenReady().then(async () => {
	// D:\\tools\\ffmpeg-6.0-full_build\\ffmpeg-6.0-full_build\\bin\\ffmpeg.exe
	const init: AppSetting = {
		ffmpeg: "",
	};
	const appSettingFileStorePath = app.getPath("userData");
	const path = join(appSettingFileStorePath, "app_setting.json");
	const appSettingFileStore = await createJsonFileStoreWithFallback(
		path,
		init,
		AppSettingSchema,
		{
			onValidationError: async (error: FileStoreValidationError) => {
				logger.error(
					`App setting file is corrupted, resetting to default: ${error.message}`,
				);
				// TODO: 将来的にはダイアログでユーザーに確認を取る
				// const { response } = await dialog.showMessageBox({
				//   type: "warning",
				//   buttons: ["Reset to default", "Exit app"],
				//   message: "Settings file is corrupted",
				//   detail: error.message,
				// });
				// return response === 0;
				return true; // 初期値にリセット
			},
		},
	);

	const container = new Container();
	depend.forEach(({ token, provider }) => {
		container.register(token, provider);
	});
	// TODO: 別ファイルにわける？
	container.register(
		TOKENS.APPSETTING_FILE_STORE,
		(_: Container) => appSettingFileStore,
	);

	const application = createServer(container);
	serve({
		fetch: application.fetch,
		port: 8080,
	});

	const window = new BrowserWindow({
		width: 320 * 4,
		height: 320 * 3,
		webPreferences: {
			preload: preloadPath,
		},
	});

	if (IS_DEV) {
		window.loadURL("http://localhost:5173");
		window.webContents.openDevTools();
	} else {
		window.loadFile(rendererPath);
	}

	window.setMenuBarVisibility(false);

	registerAPI({
		container,
	});
	registerProtocol(container);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
