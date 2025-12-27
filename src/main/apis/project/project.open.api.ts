import { dirname } from "node:path";
import { eq } from "drizzle-orm";
import { BrowserWindow } from "electron";
import { z } from "zod";
import { createDatabase } from "../../../../features/shared/database/application/index.js";
import { PROJECTS } from "../../../../features/shared/database/user/schema.js";
import type { Context } from "../../context.js";
import { createMainWindow } from "../../createMainWindow.js";
import { TOKENS } from "../../di/token.js";
import { startServer } from "../../startServer.js";

export const openProjectSchema = z.object({
	projectId: z.string(),
});
export type OpenProjectRequest = z.infer<typeof openProjectSchema>;

export async function openProject(ctx: Context, request: OpenProjectRequest) {
	const { container, event } = ctx;
	const [logger, database, appConfig] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_DATABASE,
		TOKENS.APP_CONFIG,
	);

	logger.info("open project by id", request);
	const valid = openProjectSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalidd request");
	}

	const { projectId } = valid.data;

	// DBからプロジェクトを取得
	const project = await database.query.PROJECTS.findFirst({
		where: eq(PROJECTS.id, projectId),
	});

	if (!project) {
		logger.warn("project not found", { projectId });
		return false;
	}

	// pathはproject.degboxファイルのパスなので、親ディレクトリを取得
	const foldPath = dirname(project.path);

	// openedAt を更新
	await database
		.update(PROJECTS)
		.set({ openedAt: new Date().toISOString() })
		.where(eq(PROJECTS.id, projectId));

	logger.info("updated openedAt", { projectId });

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
