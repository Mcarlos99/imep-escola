CREATE TABLE `curriculum` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`duration` varchar(50),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `curriculum_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `videoUrl` varchar(500);