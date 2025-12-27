import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export async function getRecentProject(ctx: Context) {
	const { container } = ctx;
	const [logger, database] = container.get(TOKENS.LOGGER, TOKENS.USER_DATABASE);

	logger.info("get recent project");

	// TODO: Service化すべき？
	const recentProjects = await database.query.PROJECTS.findMany({
		orderBy: (PROJECTS, { desc }) => [desc(PROJECTS.openedAt)],
		limit: 5,
	});

	return recentProjects;
}
