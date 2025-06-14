import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
});

export const providersTable = sqliteTable("providers", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  provider: text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
});

