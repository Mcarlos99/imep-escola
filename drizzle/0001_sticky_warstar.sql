CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(20),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`shortDescription` varchar(500),
	`categoryId` int NOT NULL,
	`duration` varchar(50),
	`modality` enum('presencial','ead','hibrido') NOT NULL DEFAULT 'presencial',
	`price` decimal(10,2),
	`originalPrice` decimal(10,2),
	`image` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`type` enum('text','number','boolean','json','html') NOT NULL DEFAULT 'text',
	`label` varchar(200),
	`description` text,
	`group` varchar(50),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`course` varchar(200),
	`content` text NOT NULL,
	`image` varchar(500),
	`rating` int DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
