import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BrowserWindow, dialog } from "electron";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import { PROJECTS } from "../../../../features/shared/database/user/schema.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { TOKENS } from "../../di/token.js";
import { startServer } from "../../startServer.js";

export async function selectProject(ctx: Context) {
	const { container, event } = ctx;
	const [logger, database, appConfig] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_DATABASE,
		TOKENS.APP_CONFIG,
	);

	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	if (canceled) {
		return false;
	}
	const foldPath = filePaths[0];
	if (!foldPath) {
		return false;
	}

	// project.degbox ファイルを読み込み
	const projectFilePath = join(foldPath, "project.degbox");
	let projectFileContent: string;
	try {
		projectFileContent = await readFile(projectFilePath, "utf-8");
	} catch {
		logger.warn("project.degbox not found", { foldPath });
		return false;
	}

	logger.info("open existing project", { foldPath });

	const projectData = JSON.parse(projectFileContent) as {
		id: string;
		name: string;
		overview: string;
	};

	// openedAt を更新して DB に upsert
	const result = await database
		.insert(PROJECTS)
		.values({
			id: projectData.id,
			name: projectData.name,
			overview: projectData.overview,
			path: projectFilePath,
			openedAt: new Date().toISOString(),
		})
		.onConflictDoUpdate({
			target: PROJECTS.id,
			set: {
				openedAt: new Date().toISOString(),
			},
		});

	logger.info("upsert result", { result });

	// アプリケーション用 DB 接続
	logger.info("connect to database");
	try {
		const db = await createDatabase(`file:${foldPath}/application.db`, "./");
		container.register(TOKENS.DATABASE, () => db);
	} catch (err) {
		logger.error(err);
		return false;
	}

	// PROJECT_PATH をコンテナに登録
	container.register(TOKENS.PROJECT_PATH, () => foldPath);

	// サーバー起動
	logger.info("start server");
	await startServer(container, foldPath);

	logger.info("create window");
	const window = BrowserWindow.fromWebContents(event.sender);
	window?.hide();

	// メインウィンドウ開く
	await createMainWindow(
		appConfig.isDev,
		appConfig.preloadPath,
		appConfig.rendererPath,
	);

	window?.destroy();
}
