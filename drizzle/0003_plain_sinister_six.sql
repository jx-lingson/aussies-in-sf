CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`website` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`area` text NOT NULL,
	`owner_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_website_unique` ON `companies` (`website`);--> statement-breakpoint
CREATE UNIQUE INDEX `companies_owner_key_unique` ON `companies` (`owner_key`);