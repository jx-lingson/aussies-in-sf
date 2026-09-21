ALTER TABLE `profiles` ADD `owner_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_owner_key_unique` ON `profiles` (`owner_key`);