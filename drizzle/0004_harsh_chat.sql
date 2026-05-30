CREATE TABLE `preEnrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`cpf` varchar(14),
	`birthDate` date,
	`courseId` int NOT NULL,
	`message` text,
	`preferredShift` enum('morning','afternoon','evening','flexible'),
	`howDidYouHear` varchar(100),
	`status` enum('new','contacted','converted','lost') NOT NULL DEFAULT 'new',
	`contactedAt` timestamp,
	`convertedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preEnrollments_id` PRIMARY KEY(`id`)
);
