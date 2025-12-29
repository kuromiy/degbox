import { AppSettingDataSource } from "../../../features/appsetting/app.setting.datasource.js";
import { AuthorDataSource } from "../../../features/author/author.datasource.js";
import { ContentAction } from "../../../features/content/content.action.js";
import { ContentDataSource } from "../../../features/content/content.datasource.js";
import { ContentServiceImpl } from "../../../features/content/content.service.impl.js";
import { IllustAction } from "../../../features/illust/illust.action.js";
import { IllustDataSource } from "../../../features/illust/illust.datasource.js";
import { ProjectDataSource } from "../../../features/project/project.datasource.js";
import type {
	Container,
	InjectionToken,
} from "../../../features/shared/container/index.js";
import { FileSystemImpl } from "../../../features/shared/filesystem/index.js";
import { JobQueue } from "../../../features/shared/jobqueue/index.js";
import { logger } from "../../../features/shared/logger/index.js";
import { TagAction } from "../../../features/tag/tag.action.js";
import { TagCooccurrenceDataSource } from "../../../features/tag/tag.cooccurrence.datasource.js";
import { TagDataSource } from "../../../features/tag/tag.datasource.js";
import { TagSuggestionService } from "../../../features/tag/tag.suggestion.service.js";
import { UnmanagedContentDataSource } from "../../../features/unmanaged-content/unmanagedContent.datasource.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { VideoAction } from "../../../features/video/video.action.js";
import { VideoDataSource } from "../../../features/video/video.datasource.js";
import { VideoServiceImpl } from "../../../features/video/video.service.impl.js";
import { TOKENS } from "./token.js";

export type DependencyEntry = {
	token: InjectionToken<unknown>;
	provider: (container: Container) => unknown;
};

const fileSystem = new FileSystemImpl((err) => console.error(err));
const jobQueue = new JobQueue();
const cache = new Map<string, UnmanagedContent>();

export const depend: DependencyEntry[] = [
	// infra
	{
		token: TOKENS.LOGGER,
		provider: (_: Container) => logger,
	},
	{
		token: TOKENS.FILE_SYSTEM,
		provider: (_: Container) => fileSystem,
	},
	{
		token: TOKENS.JOB_QUEUE,
		provider: (_: Container) => jobQueue,
	},
	{
		token: TOKENS.CACHE,
		provider: (_: Container) => cache,
	},

	// repository
	{
		token: TOKENS.UNMANAGED_CONTENT_REPOSITORY,
		provider: (c: Container) =>
			new UnmanagedContentDataSource(c.get(TOKENS.CACHE)),
	},
	{
		token: TOKENS.CONTENT_REPOSITORY,
		provider: (c: Container) => new ContentDataSource(c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.TAG_REPOSITORY,
		provider: (c: Container) => new TagDataSource(c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.TAG_COOCCURRENCE_REPOSITORY,
		provider: (c: Container) =>
			new TagCooccurrenceDataSource(c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.AUTHOR_REPOSITORY,
		provider: (c: Container) => new AuthorDataSource(c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.VIDEO_REPOSITORY,
		provider: (c: Container) =>
			new VideoDataSource(c.get(TOKENS.LOGGER), c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.ILLUST_REPOSITORY,
		provider: (c: Container) =>
			new IllustDataSource(c.get(TOKENS.LOGGER), c.get(TOKENS.DATABASE)),
	},
	{
		token: TOKENS.APPSETTING_REPOSITORY,
		provider: (c: Container) =>
			new AppSettingDataSource(c.get(TOKENS.APPSETTING_FILE_STORE)),
	},
	{
		token: TOKENS.PROJECT_REPOSITORY,
		provider: (c: Container) =>
			new ProjectDataSource(c.get(TOKENS.USER_DATABASE)),
	},

	// service
	{
		token: TOKENS.CONTENT_SERVICE,
		provider: (c: Container) =>
			new ContentServiceImpl(
				c.get(TOKENS.LOGGER),
				c.get(TOKENS.FILE_SYSTEM),
				c.get(TOKENS.PROJECT_PATH),
			),
	},
	{
		token: TOKENS.VIDEO_SERVICE,
		provider: (c: Container) =>
			new VideoServiceImpl(
				c.get(TOKENS.LOGGER),
				c.get(TOKENS.FILE_SYSTEM),
				c.get(TOKENS.APPSETTING_REPOSITORY),
			),
	},
	{
		token: TOKENS.TAG_SUGGESTION_SERVICE,
		provider: (c: Container) =>
			new TagSuggestionService(
				c.get(TOKENS.TAG_REPOSITORY),
				c.get(TOKENS.TAG_COOCCURRENCE_REPOSITORY),
			),
	},

	// action
	{
		token: TOKENS.CONTENT_ACTION,
		provider: (c: Container) =>
			new ContentAction(
				c.get(TOKENS.CONTENT_REPOSITORY),
				c.get(TOKENS.CONTENT_SERVICE),
				c.get(TOKENS.PROJECT_PATH),
			),
	},
	{
		token: TOKENS.TAG_ACTION,
		provider: (c: Container) =>
			new TagAction(
				c.get(TOKENS.TAG_REPOSITORY),
				c.get(TOKENS.TAG_COOCCURRENCE_REPOSITORY),
			),
	},
	{
		token: TOKENS.VIDEO_ACTION,
		provider: (c: Container) =>
			new VideoAction(
				c.get(TOKENS.VIDEO_REPOSITORY),
				c.get(TOKENS.VIDEO_SERVICE),
			),
	},
	{
		token: TOKENS.ILLUST_ACTION,
		provider: (c: Container) =>
			new IllustAction(
				c.get(TOKENS.LOGGER),
				c.get(TOKENS.ILLUST_REPOSITORY),
				c.get(TOKENS.CONTENT_ACTION),
				c.get(TOKENS.UNMANAGED_CONTENT_REPOSITORY),
				c.get(TOKENS.CONTENT_SERVICE),
			),
	},
];
