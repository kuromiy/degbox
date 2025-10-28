CREATE TABLE `tag_cooccurrences` (
	`tag1_id` text NOT NULL,
	`tag2_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`tag1_id`, `tag2_id`),
	FOREIGN KEY (`tag1_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag2_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
