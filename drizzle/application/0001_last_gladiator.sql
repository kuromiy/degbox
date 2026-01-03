CREATE TABLE `content_hashs` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`type` text NOT NULL,
	`value` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `duplicate_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`hash_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `duplicate_group_items` (
	`group_id` text NOT NULL,
	`content_id` text NOT NULL,
	`similarity` integer,
	PRIMARY KEY(`group_id`, `content_id`),
	FOREIGN KEY (`group_id`) REFERENCES `duplicate_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `contents` ADD `type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `contents` DROP COLUMN `hash`;