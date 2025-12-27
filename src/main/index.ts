import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import { app, protocol } from "electron";
import { Container } from "../../features/shared/container/index.js";
import { createDatabase as createUserDatabase } from "../../features/shared/database/user/index.js";
import { registerAPI, registerProtocol } from "./autogenerate/index.js";
import { createSubWindow } from "./createSubWindow.js";
import { depend } from "./di/dependencies.js";
import { TOKENS } from "./di/token.js";

export type AppConfig = {
	isDev: boolean;
	preloadPath: string;
	rendererPath: string;
};

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

// TODO:
// ひとまず毎回プロジェクト選択画面を表示させるよう
// 今後改善する

app.whenReady().then(async () => {
	const userDatabasePath = IS_DEV
		? join(cwd(), "user.db")
		: join(app.getPath("userData"), "user.db");
	const userDatabase = await createUserDatabase(
		`file:${userDatabasePath}`,
		"./",
	);
	const container = new Container();
	depend.forEach(({ token, provider }) => {
		container.register(token, provider);
	});
	container.register(TOKENS.USER_DATABASE, () => userDatabase);
	container.register(TOKENS.APP_CONFIG, () => {
		return {
			isDev: IS_DEV,
			preloadPath: preloadPath,
			rendererPath: rendererPath,
		};
	});

	createSubWindow(IS_DEV, preloadPath, rendererPath);

	registerAPI({
		container,
	});
	registerProtocol(container);

	// // D:\\tools\\ffmpeg-6.0-full_build\\ffmpeg-6.0-full_build\\bin\\ffmpeg.exe
	// const init: AppSetting = {
	// 	ffmpeg: "",
	// };
	// const appSettingFileStorePath = app.getPath("userData");
	// const path = join(appSettingFileStorePath, "app_setting.json");
	// const appSettingFileStore = await createJsonFileStoreWithFallback(
	// 	path,
	// 	init,
	// 	AppSettingSchema,
	// 	{
	// 		onValidationError: async (error: FileStoreValidationError) => {
	// 			logger.error(
	// 				`App setting file is corrupted, resetting to default: ${error.message}`,
	// 			);
	// 			// TODO: 将来的にはダイアログでユーザーに確認を取る
	// 			// const { response } = await dialog.showMessageBox({
	// 			//   type: "warning",
	// 			//   buttons: ["Reset to default", "Exit app"],
	// 			//   message: "Settings file is corrupted",
	// 			//   detail: error.message,
	// 			// });
	// 			// return response === 0;
	// 			return true; // 初期値にリセット
	// 		},
	// 	},
	// );

	// // データベースを初期化
	// const userDataPath = app.getPath("userData");
	// const { database, userDatabase } = await initializeDatabases(userDataPath);

	// const container = new Container();
	// const dependencies = createDependencies(database, userDatabase);
	// dependencies.forEach(({ token, provider }) => {
	// 	container.register(token, provider);
	// });
	// // TODO: 別ファイルにわける？
	// container.register(
	// 	TOKENS.APPSETTING_FILE_STORE,
	// 	(_: Container) => appSettingFileStore,
	// );

	// const application = createServer(container);
	// serve({
	// 	fetch: application.fetch,
	// 	port: 8080,
	// });

	// const window = new BrowserWindow({
	// 	width: 320 * 4,
	// 	height: 320 * 3,
	// 	webPreferences: {
	// 		preload: preloadPath,
	// 	},
	// });

	// if (IS_DEV) {
	// 	window.loadURL("http://localhost:5173/project-select.html");
	// 	// window.loadURL("http://localhost:5173");
	// 	window.webContents.openDevTools();
	// } else {
	// 	window.loadFile(rendererPath);
	// }

	// window.setMenuBarVisibility(false);

	// registerAPI({
	// 	container,
	// });
	// registerProtocol(container);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
