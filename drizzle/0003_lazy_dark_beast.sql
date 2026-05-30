CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`stripeCheckoutSessionId` varchar(255),
	`status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`enrollmentDate` timestamp NOT NULL DEFAULT (now()),
	`completionDate` timestamp,
	`certificateIssued` boolean NOT NULL DEFAULT false,
	`certificateUrl` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`stripeChargeId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'brl',
	`status` enum('pending','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paidAt` timestamp,
	`refundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
