ALTER TABLE `authors` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `authors` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `illusts` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `illusts` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;