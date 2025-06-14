import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
});

export const userAccountsTable = sqliteTable("user_accounts", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
  provider: text("provider").notNull(), // e.g., "google", "apple"
  providerUserId: text("provider_user_id").notNull(), // e.g., Google `sub`
  email: text("email").notNull(), // <- added field
});
