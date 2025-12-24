import { z } from "zod";

export const AppSettingSchema = z.object({
	ffmpeg: z.string(),
});

export type AppSetting = z.infer<typeof AppSettingSchema>;
