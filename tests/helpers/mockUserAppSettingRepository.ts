import type { UserAppSetting } from "../../features/appsetting/user.app.setting.model.js";
import type { UserAppSettingRepository } from "../../features/appsetting/user.app.setting.repository.js";

export class MockUserAppSettingRepository implements UserAppSettingRepository {
	async get(): Promise<UserAppSetting> {
		return { ffmpeg: "", ffprobe: "" };
	}
	async save(_setting: UserAppSetting): Promise<void> {}
}
