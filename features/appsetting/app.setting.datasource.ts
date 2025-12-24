import type { FileStore } from "../shared/filestore/index.js";
import type { AppSetting } from "./app.setting.model.js";
import type { AppSettingRepository } from "./app.setting.repository.js";

export class AppSettingDataSource implements AppSettingRepository {
	constructor(private readonly fileStore: FileStore<AppSetting>) {}

	async save(value: AppSetting): Promise<AppSetting> {
		await this.fileStore.save(value);
		return value;
	}

	async get(): Promise<AppSetting> {
		return await this.fileStore.get();
	}
}
