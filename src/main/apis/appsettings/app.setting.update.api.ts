import { z } from "zod";
import type { UserAppSetting } from "../../../../features/appsetting/user.app.setting.model.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const updateAppSettingSchema = z.object({
	ffmpegPath: z.string().optional(),
	ffprobePath: z.string().optional(),
});
export type updateAppSettingRequest = z.infer<typeof updateAppSettingSchema>;

export async function updateAppSetting(
	ctx: Context,
	request: updateAppSettingRequest,
) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.USER_APPSETTING_REPOSITORY,
	);

	logger.info("update app settings", request);
	const valid = updateAppSettingSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid Request");
	}

	const { ffmpegPath, ffprobePath } = valid.data;
	const value: UserAppSetting = {
		ffmpeg: ffmpegPath,
		ffprobe: ffprobePath,
	};
	await repository.save(value);
	return value;
}
