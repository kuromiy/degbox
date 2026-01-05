CREATE TABLE `similarity_scan_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`content_hash_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`content_hash_id`) REFERENCES `content_hashs`(`id`) ON UPDATE no action ON DELETE cascade
);
