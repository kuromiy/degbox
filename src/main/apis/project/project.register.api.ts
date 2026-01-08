import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { BrowserWindow, dialog } from "electron";
import { toProjectPath } from "../../../../features/project/project.model.js";
import { createScopedContainer } from "../../../../features/shared/container/index.js";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import { FileSystemImpl } from "../../../../features/shared/filesystem/index.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { openDbViewerWindow } from "../../dbviewer.window.js";
import { TOKENS } from "../../di/token.js";
import { startServer } from "../../startServer.js";

export async function registerProject(ctx: Context) {
	const { container, event } = ctx;
	const [logger, database, appConfig, projectContext] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_DATABASE,
		TOKENS.APP_CONFIG,
		TOKENS.PROJECT_CONTEXT,
	);
	// 新規プロジェクト登録時はProjectContextがまだ開かれていないため、
	// DIコンテナからFILE_SYSTEMを取得せず、直接FileSystemImplを作成
	const fileSystem = new FileSystemImpl((err) => logger.error(err));
	const projectRepository = container.get(TOKENS.PROJECT_REPOSITORY);
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
			const scopedContainer = createScopedContainer(
				container,
				[TOKENS.USER_DATABASE, tx],
				[TOKENS.FILE_SYSTEM, fs],
			);
			const scopedProjectRepository = scopedContainer.get(
				TOKENS.PROJECT_REPOSITORY,
			);

			const projectId = await projectRepository.generateId();
			const projectPath = join(foldPath, "project.degbox");
			const now = new Date().toISOString();
			const project = {
				id: projectId,
				name: basename(foldPath),
				overview: "",
				path: toProjectPath(foldPath),
				openedAt: now,
				createdAt: now,
			};
			await fs.create(projectPath, JSON.stringify(project, null, 2));
			await scopedProjectRepository.save(project);

			return project;
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

	// ProjectContextにプロジェクトを設定
	projectContext.open(result);

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

		// 開発モード時はDB Viewerウィンドウを自動起動
		if (appConfig.isDev) {
			try {
				openDbViewerWindow(appConfig.preloadPath, appConfig.isDev);
			} catch (dbViewerErr) {
				logger.warn("Failed to open DB viewer", { error: dbViewerErr });
			}
		}

		return true;
	} catch (err) {
		logger.error("failed to create main window", { error: err });
		window.show();
		return false;
	}
}
