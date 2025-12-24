import type { AppSetting } from "./app.setting.model.js";

export interface AppSettingRepository {
	get(): Promise<AppSetting>;
	save(value: AppSetting): Promise<AppSetting>;
}
