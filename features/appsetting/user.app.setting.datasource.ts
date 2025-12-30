import { eq } from "drizzle-orm";
import { APP_SETTINGS } from "../shared/database/user/schema.js";
import type { Database } from "../shared/database/user/type.js";
import type { UserAppSetting } from "./user.app.setting.model.js";
import type { UserAppSettingRepository } from "./user.app.setting.repository.js";

const FFMPEG_KEY = "ffmpeg";

export class UserAppSettingDataSource implements UserAppSettingRepository {
	constructor(private readonly db: Database) {}

	async get(): Promise<UserAppSetting> {
		const result = await this.db
			.select()
			.from(APP_SETTINGS)
			.where(eq(APP_SETTINGS.key, FFMPEG_KEY));
		const ffmpegRow = result[0];
		return {
			ffmpeg: ffmpegRow?.value,
		};
	}

	async save(setting: UserAppSetting): Promise<void> {
		if (setting.ffmpeg !== undefined) {
			await this.db
				.insert(APP_SETTINGS)
				.values({ key: FFMPEG_KEY, value: setting.ffmpeg })
				.onConflictDoUpdate({
					target: APP_SETTINGS.key,
					set: { value: setting.ffmpeg },
				});
		} else {
			await this.db
				.delete(APP_SETTINGS)
				.where(eq(APP_SETTINGS.key, FFMPEG_KEY));
		}
	}
}
