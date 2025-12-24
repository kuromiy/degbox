import { z } from "zod";
import type { AppSetting } from "../../../../features/appsetting/app.setting.model.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const updateAppSettingSchema = z.object({
	ffmpegPath: z.string(),
});
export type updateAppSettingRequest = z.infer<typeof updateAppSettingSchema>;

export async function updateAppSetting(
	ctx: Context,
	request: updateAppSettingRequest,
) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.APPSETTING_REPOSITORY,
	);

	logger.info("update app settings", request);
	const valid = updateAppSettingSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid Request");
	}

	const { ffmpegPath } = valid.data;
	const value: AppSetting = {
		ffmpeg: ffmpegPath,
	};
	return await repository.save(value);
}
