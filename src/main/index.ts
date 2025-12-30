import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import { app, protocol } from "electron";
import { UserAppSettingDataSource } from "../../features/appsetting/user.app.setting.datasource.js";
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

	let userDatabase: Awaited<ReturnType<typeof createUserDatabase>>;
	const migrationsBasePath = join(__dirname, "../../");
	try {
		userDatabase = await createUserDatabase(
			`file:${userDatabasePath}`,
			migrationsBasePath,
		);
	} catch (error) {
		console.error("Failed to initialize user database:", error);
		if (error && typeof error === "object" && "details" in error) {
			console.error("Details:", (error as { details: unknown }).details);
		}
		app.quit();
		return;
	}
	const container = new Container();
	depend.forEach(({ token, provider }) => {
		container.register(token, provider);
	});
	container.register(TOKENS.USER_DATABASE, () => userDatabase);
	container.register(TOKENS.MIGRATIONS_BASE_PATH, () => migrationsBasePath);
	container.register(
		TOKENS.USER_APPSETTING_REPOSITORY,
		() => new UserAppSettingDataSource(userDatabase),
	);
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
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
