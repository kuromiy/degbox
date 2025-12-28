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
	const IGNORED_FILES = [".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep"];
	const files = await readdir(foldPath);
	const visibleFiles = files.filter(
		(file) => !file.startsWith(".") && !IGNORED_FILES.includes(file),
	);
	if (visibleFiles.length > 0) {
		logger.warn("folder is not empty", { foldPath, visibleFiles });
		await dialog.showErrorBox(
			"フォルダが空ではありません",
			"新規プロジェクトを作成するには空のフォルダを選択してください。",
		);
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
	try {
		await startServer(container, foldPath);
	} catch (err) {
		logger.error("failed to start server", { error: err });
		await dialog.showErrorBox(
			"サーバー起動エラー",
			"サーバーの起動に失敗しました。プロジェクトを開けません。",
		);
		return false;
	}

	logger.info("create window");
	const window = BrowserWindow.fromWebContents(event.sender);
	if (!window) {
		logger.error("failed to get original window from event sender");
		return false;
	}

	window.hide();

	// メインウィンドウ開く
	try {
		await createMainWindow(
			appConfig.isDev,
			appConfig.preloadPath,
			appConfig.rendererPath,
		);
		window.destroy();
		return true;
	} catch (err) {
		logger.error("failed to create main window", { error: err });
		window.show();
		return false;
	}
}
