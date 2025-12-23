import type { Logger } from "winston";
import { AuthorDataSource } from "../../features/author/author.datasource.js";
import type { AuthorRepository } from "../../features/author/author.repository.js";
import { ContentAction } from "../../features/content/content.action.js";
import { ContentDataSource } from "../../features/content/content.datasource.js";
import type { ContentRepository } from "../../features/content/content.repository.js";
import { ContentServiceImpl } from "../../features/content/content.service.impl.js";
import type { ContentService } from "../../features/content/content.service.js";
import { IllustAction } from "../../features/illust/illust.action.js";
import { IllustDataSource } from "../../features/illust/illust.datasource.js";
import type { IllustRepository } from "../../features/illust/illust.repository.js";
import {
	type Container,
	InjectionToken,
} from "../../features/shared/container/index.js";
import { createDatabase } from "../../features/shared/database/index.js";
import type { Database } from "../../features/shared/database/type.js";
import {
	type FileSystem,
	FileSystemImpl,
} from "../../features/shared/filesystem/index.js";
import { JobQueue } from "../../features/shared/jobqueue/index.js";
import { logger } from "../../features/shared/logger/index.js";
import { TagAction } from "../../features/tag/tag.action.js";
import { TagCooccurrenceDataSource } from "../../features/tag/tag.cooccurrence.datasource.js";
import type { TagCooccurrenceRepository } from "../../features/tag/tag.cooccurrence.repository.js";
import { TagDataSource } from "../../features/tag/tag.datasource.js";
import type { TagRepository } from "../../features/tag/tag.repository.js";
import { TagSuggestionService } from "../../features/tag/tag.suggestion.service.js";
import { UnmanagedContentDataSource } from "../../features/unmanaged-content/unmanagedContent.datasource.js";
import type { UnmanagedContent } from "../../features/unmanaged-content/unmanagedContent.model.js";
import { VideoAction } from "../../features/video/video.action.js";
import { VideoDataSource } from "../../features/video/video.datasource.js";
import type { VideoRepository } from "../../features/video/video.repository.js";
import { VideoServiceImpl } from "../../features/video/video.service.impl.js";
import type { VideoService } from "../../features/video/video.service.js";

export const TOKENS = {
	// infra
	LOGGER: new InjectionToken<Logger>("logger"),
	FILE_SYSTEM: new InjectionToken<FileSystem>("FileSystem"),
	JOB_QUEUE: new InjectionToken<JobQueue>("JobQueue"),
	DATABASE: new InjectionToken<Database>("Database"),
	CACHE: new InjectionToken<Map<string, UnmanagedContent>>("Cache"),

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

type DependencyEntry = {
	token: InjectionToken<unknown>;
	provider: (container: Container) => unknown;
};

// TODO: 後で削除
const fileSystem = new FileSystemImpl((err) => console.error(err));
const jobQueue = new JobQueue();
const cache = new Map<string, UnmanagedContent>();
const database = createDatabase("file:local.db");

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
		token: TOKENS.DATABASE,
		provider: (_: Container) => database,
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

	// service
	{
		token: TOKENS.CONTENT_SERVICE,
		provider: (c: Container) =>
			new ContentServiceImpl(
				c.get(TOKENS.LOGGER),
				c.get(TOKENS.FILE_SYSTEM),
				process.env.CONTENT_BASE_PATH || "content",
			),
	},
	{
		token: TOKENS.VIDEO_SERVICE,
		provider: (c: Container) =>
			new VideoServiceImpl(c.get(TOKENS.LOGGER), c.get(TOKENS.FILE_SYSTEM)),
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
