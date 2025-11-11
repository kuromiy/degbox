CREATE TABLE `illusts` (
	`id` text PRIMARY KEY NOT NULL
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
