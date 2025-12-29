CREATE TABLE `authors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`urls` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`name` text NOT NULL,
	`hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `illusts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `illusts_authors` (
	`illust_id` text NOT NULL,
	`author_id` text NOT NULL,
	PRIMARY KEY(`illust_id`, `author_id`),
	FOREIGN KEY (`illust_id`) REFERENCES `illusts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `illusts_contents` (
	`illust_id` text NOT NULL,
	`content_id` text NOT NULL,
	`order` integer NOT NULL,
	PRIMARY KEY(`illust_id`, `content_id`),
	FOREIGN KEY (`illust_id`) REFERENCES `illusts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `illusts_tags` (
	`illust_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`illust_id`, `tag_id`),
	FOREIGN KEY (`illust_id`) REFERENCES `illusts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tag_cooccurrences` (
	`tag1_id` text NOT NULL,
	`tag2_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`tag1_id`, `tag2_id`),
	FOREIGN KEY (`tag1_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag2_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos_authors` (
	`video_id` text NOT NULL,
	`author_id` text NOT NULL,
	PRIMARY KEY(`video_id`, `author_id`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `videos_contents` (
	`video_id` text NOT NULL,
	`content_id` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`video_id`, `content_id`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `videos_tags` (
	`video_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`video_id`, `tag_id`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
