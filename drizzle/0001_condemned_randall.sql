CREATE TABLE `game_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_room_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_room_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(12) NOT NULL,
	`name` varchar(120) NOT NULL,
	`status` enum('open','playing','finished') NOT NULL DEFAULT 'open',
	`stateJson` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `game_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`playerName` varchar(120) NOT NULL,
	`points` int NOT NULL,
	`turns` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_scores_id` PRIMARY KEY(`id`)
);
