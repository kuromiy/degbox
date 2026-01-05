import { BrowserWindow } from "electron";
import { z } from "zod";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { openDbViewerWindow } from "../../dbviewer.window.js";
import { TOKENS } from "../../di/token.js";
import { startServer } from "../../startServer.js";

export const openProjectSchema = z.object({
	projectId: z.string(),
});
export type OpenProjectRequest = z.infer<typeof openProjectSchema>;

export async function openProject(ctx: Context, request: OpenProjectRequest) {
	const { container, event } = ctx;
	const [
		logger,
		appConfig,
		migrationsBasePath,
		projectRepository,
		projectContext,
	] = container.get(
		TOKENS.LOGGER,
		TOKENS.APP_CONFIG,
		TOKENS.MIGRATIONS_BASE_PATH,
		TOKENS.PROJECT_REPOSITORY,
		TOKENS.PROJECT_CONTEXT,
	);

	logger.info("open project by id", request);
	const valid = openProjectSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	const { projectId } = valid.data;

	// DBからプロジェクトを取得
	const project = await projectRepository.findById(projectId);

	if (!project) {
		logger.warn("project not found", { projectId });
		return false;
	}

	const foldPath = project.path;

	// openedAt を更新
	await projectRepository.save({
		...project,
		openedAt: new Date().toISOString(),
	});

	logger.info("updated openedAt", { projectId });

	// アプリケーション用 DB 接続
	logger.info("connect to database");
	try {
		const db = await createDatabase(
			`file:${foldPath}/application.db`,
			migrationsBasePath,
		);
		container.register(TOKENS.DATABASE, () => db);
	} catch (err) {
		logger.error(err);
		return false;
	}

	// ProjectContextにプロジェクトを設定
	projectContext.open(project);

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

	// 開発モード時はDB Viewerウィンドウを自動起動
	if (appConfig.isDev) {
		try {
			openDbViewerWindow(appConfig.preloadPath, appConfig.isDev);
		} catch (dbViewerErr) {
			logger.warn("Failed to open DB viewer", { error: dbViewerErr });
		}
	}
}
