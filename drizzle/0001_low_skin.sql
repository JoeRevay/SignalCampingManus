CREATE TABLE `signal_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campgroundId` varchar(255) NOT NULL,
	`carrier` enum('Verizon','AT&T','T-Mobile') NOT NULL,
	`rating` enum('Strong','Usable','No Signal') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_reports_id` PRIMARY KEY(`id`)
);
