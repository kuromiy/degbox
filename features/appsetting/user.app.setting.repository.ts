import type { UserAppSetting } from "./user.app.setting.model.js";

export interface UserAppSettingRepository {
	get(): Promise<UserAppSetting>;
	save(setting: UserAppSetting): Promise<void>;
}
