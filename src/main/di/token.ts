import type { Logger } from "winston";
import type { AppSetting } from "../../../features/appsetting/app.setting.model.js";
import type { AppSettingRepository } from "../../../features/appsetting/app.setting.repository.js";
import type { AuthorRepository } from "../../../features/author/author.repository.js";
import type { ContentAction } from "../../../features/content/content.action.js";
import type { ContentRepository } from "../../../features/content/content.repository.js";
import type { ContentService } from "../../../features/content/content.service.js";
import type { IllustAction } from "../../../features/illust/illust.action.js";
import type { IllustRepository } from "../../../features/illust/illust.repository.js";
import type { ProjectRepository } from "../../../features/project/project.repository.js";
import { InjectionToken } from "../../../features/shared/container/index.js";
import type { Database } from "../../../features/shared/database/application/type.js";
import type { Database as UserDatabase } from "../../../features/shared/database/user/type.js";
import type { FileStore } from "../../../features/shared/filestore/index.js";
import type { FileSystem } from "../../../features/shared/filesystem/index.js";
import type { JobQueue } from "../../../features/shared/jobqueue/index.js";
import type { TagAction } from "../../../features/tag/tag.action.js";
import type { TagCooccurrenceRepository } from "../../../features/tag/tag.cooccurrence.repository.js";
import type { TagRepository } from "../../../features/tag/tag.repository.js";
import type { TagSuggestionService } from "../../../features/tag/tag.suggestion.service.js";
import type { UnmanagedContentDataSource } from "../../../features/unmanaged-content/unmanagedContent.datasource.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import type { VideoAction } from "../../../features/video/video.action.js";
import type { VideoRepository } from "../../../features/video/video.repository.js";
import type { VideoService } from "../../../features/video/video.service.js";
import type { AppConfig } from "../index.js";

export const TOKENS = {
	// infra
	APP_CONFIG: new InjectionToken<AppConfig>("AppConfig"),
	LOGGER: new InjectionToken<Logger>("logger"),
	FILE_SYSTEM: new InjectionToken<FileSystem>("FileSystem"),
	JOB_QUEUE: new InjectionToken<JobQueue>("JobQueue"),
	DATABASE: new InjectionToken<Database>("Database"),
	USER_DATABASE: new InjectionToken<UserDatabase>("UserDatabase"),
	CACHE: new InjectionToken<Map<string, UnmanagedContent>>("Cache"),
	APPSETTING_FILE_STORE: new InjectionToken<FileStore<AppSetting>>(
		"AppSettingFileStore",
	),
	PROJECT_PATH: new InjectionToken<string>("ProjectPath"),
	MIGRATIONS_BASE_PATH: new InjectionToken<string>("MigrationsBasePath"),

	// repository
	UNMANAGED_CONTENT_REPOSITORY: new InjectionToken<UnmanagedContentDataSource>(
		"UnmanagedContentRepository",
	),
	CONTENT_REPOSITORY: new InjectionToken<ContentRepository>(
		"ContentRepository",
	),
	TAG_REPOSITORY: new InjectionToken<TagRepository>("TagRepository"),
	TAG_COOCCURRENCE_REPOSITORY: new InjectionToken<TagCooccurrenceRepository>(
		"TagCooccurrenceRepository",
	),
	AUTHOR_REPOSITORY: new InjectionToken<AuthorRepository>("AuthorRepository"),
	VIDEO_REPOSITORY: new InjectionToken<VideoRepository>("VideoRepository"),
	ILLUST_REPOSITORY: new InjectionToken<IllustRepository>("IllustRepository"),
	APPSETTING_REPOSITORY: new InjectionToken<AppSettingRepository>(
		"AppSettingRepository",
	),
	PROJECT_REPOSITORY: new InjectionToken<ProjectRepository>(
		"ProjectRepository",
	),

	// service
	CONTENT_SERVICE: new InjectionToken<ContentService>("ContentService"),
	VIDEO_SERVICE: new InjectionToken<VideoService>("VideoService"),
	TAG_SUGGESTION_SERVICE: new InjectionToken<TagSuggestionService>(
		"TagSuggestionService",
	),

	// action
	CONTENT_ACTION: new InjectionToken<ContentAction>("ContentAction"),
	TAG_ACTION: new InjectionToken<TagAction>("TagAction"),
	VIDEO_ACTION: new InjectionToken<VideoAction>("VideoAction"),
	ILLUST_ACTION: new InjectionToken<IllustAction>("IllustAction"),
};
