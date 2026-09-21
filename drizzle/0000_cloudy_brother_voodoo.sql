CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`email` text NOT NULL,
	`linkedin` text NOT NULL,
	`area` text NOT NULL,
	`status` text NOT NULL,
	`arrival` text,
	`departure` text,
	`suspended_until` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`target` text NOT NULL,
	`reporter` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`target`, `reporter`)
);
