PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tag_cooccurrences` (
	`tag1_id` text NOT NULL,
	`tag2_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`tag1_id`, `tag2_id`),
	FOREIGN KEY (`tag1_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag2_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tag_cooccurrences`("tag1_id", "tag2_id", "count") SELECT "tag1_id", "tag2_id", "count" FROM `tag_cooccurrences`;--> statement-breakpoint
DROP TABLE `tag_cooccurrences`;--> statement-breakpoint
ALTER TABLE `__new_tag_cooccurrences` RENAME TO `tag_cooccurrences`;--> statement-breakpoint
PRAGMA foreign_keys=ON;