import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
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
			path: foldPath,
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
		// upsert したレコードを削除してクリーンアップ
		await database.delete(PROJECTS).where(eq(PROJECTS.id, projectData.id));
		logger.info("cleaned up project record after database creation failure", {
			projectId: projectData.id,
		});
		return false;
	}

	// PROJECT_PATH をコンテナに登録
	container.register(TOKENS.PROJECT_PATH, () => foldPath);

	// サーバー起動
	logger.info("start server");
	await startServer(container, foldPath);

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
	} catch (err) {
		logger.error("failed to create main window", { error: err });
		window.show();
		return false;
	}
}
