import { z } from "zod/v4";

export const UserAppSettingSchema = z.object({
	ffmpeg: z.string().optional(),
});

export type UserAppSetting = z.infer<typeof UserAppSettingSchema>;
