CREATE TABLE `providers` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `user_id` integer NOT NULL,
    `provider` text NOT NULL,
    `provider_user_id` text NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users_table`(`id`)
);
