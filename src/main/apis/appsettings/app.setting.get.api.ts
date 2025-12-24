import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export async function getAppSetting(ctx: Context) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.APPSETTING_REPOSITORY,
	);

	logger.info("get app settings");

	return await repository.get();
}
