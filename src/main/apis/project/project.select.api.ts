import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { BrowserWindow, dialog } from "electron";
import { z } from "zod";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import { PROJECTS } from "../../../../features/shared/database/user/schema.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { TOKENS } from "../../di/token.js";
import { startServer, stopServer } from "../../startServer.js";

const projectFileSchema = z.object({
	id: z.string(),
	name: z.string(),
	overview: z.string(),
});

export async function selectProject(ctx: Context) {
	const { container, event } = ctx;
	const [logger, database, appConfig, migrationsBasePath] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_DATABASE,
		TOKENS.APP_CONFIG,
		TOKENS.MIGRATIONS_BASE_PATH,
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

	let parsedContent: unknown;
	try {
		parsedContent = JSON.parse(projectFileContent);
	} catch (error) {
		logger.error("Failed to parse project.degbox as JSON", {
			foldPath,
			error,
		});
		return false;
	}

	const validationResult = projectFileSchema.safeParse(parsedContent);
	if (!validationResult.success) {
		logger.error("Invalid project.degbox file format", {
			foldPath,
			issues: validationResult.error.issues,
		});
		return false;
	}
	const projectData = validationResult.data;

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
	let db: Awaited<ReturnType<typeof createDatabase>>;
	try {
		db = await createDatabase(
			`file:${foldPath}/application.db`,
			migrationsBasePath,
		);
	} catch (err) {
		logger.error("Failed to create application database", { error: err });
		// upsert したレコードを削除してクリーンアップ
		await database.delete(PROJECTS).where(eq(PROJECTS.id, projectData.id));
		logger.info("cleaned up project record after database creation failure", {
			projectId: projectData.id,
		});
		return false;
	}

	// クリーンアップ用ヘルパー関数
	let serverStarted = false;
	const cleanup = async () => {
		// サーバーが起動していれば停止
		if (serverStarted) {
			try {
				await stopServer();
				logger.info("server stopped during cleanup");
			} catch (stopErr) {
				logger.warn("Failed to stop server during cleanup", {
					error: stopErr,
				});
			}
		}
		// コンテナ登録を解除
		container.unregister(TOKENS.DATABASE);
		container.unregister(TOKENS.PROJECT_PATH);
		// プロジェクトレコードを削除
		await database.delete(PROJECTS).where(eq(PROJECTS.id, projectData.id));
		logger.info("cleaned up after failure", { projectId: projectData.id });
	};

	container.register(TOKENS.DATABASE, () => db);
	container.register(TOKENS.PROJECT_PATH, () => foldPath);

	// サーバー起動
	logger.info("start server");
	try {
		await startServer(container, foldPath);
		serverStarted = true;
	} catch (err) {
		logger.error("Failed to start server", { error: err });
		await cleanup();
		return false;
	}

	logger.info("create window");
	const window = BrowserWindow.fromWebContents(event.sender);
	if (!window) {
		logger.error("failed to get original window from event sender");
		await cleanup();
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
		await cleanup();
		return false;
	}
}
