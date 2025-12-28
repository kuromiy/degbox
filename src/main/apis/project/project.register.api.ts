import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { BrowserWindow, dialog } from "electron";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import { PROJECTS } from "../../../../features/shared/database/user/schema.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { TOKENS } from "../../di/token.js";
import { startServer } from "../../startServer.js";

export async function registerProject(ctx: Context) {
	const { container, event } = ctx;
	const [logger, database, fileSystem, appConfig] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_DATABASE,
		TOKENS.FILE_SYSTEM,
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
	const files = await readdir(foldPath);
	if (files.length > 0) {
		return false;
	}

	logger.info("open folder", { foldPath });

	// 選択されたフォルダ内にコンテンツフォルダやログ、dbファイル作成
	// サブウィンドウを閉じて、メインウィンドウを開く

	const result = await database.transaction(async (tx) => {
		return await fileSystem.transaction(async (fs) => {
			const projectPath = join(foldPath, "project.degbox");
			const project = {
				id: randomUUID().toString(),
				name: basename(foldPath),
				overview: "",
				path: projectPath,
				openedAt: new Date().toISOString(),
			};
			await fs.create(projectPath, JSON.stringify(project, null, 2));
			await tx.insert(PROJECTS).values(project);

			return true;
		});
	});

	logger.info("result", { result });

	if (!result) {
		logger.info("return false");
		return false;
	}

	// アプリケーション用db作成後コンテナに登録
	logger.info("create database");
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
