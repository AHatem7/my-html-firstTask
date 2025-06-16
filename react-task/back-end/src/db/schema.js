import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

// Habits table
export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }), // ✅ auto-increment ID
  name: text('name').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  completed: integer('completed', { mode: 'boolean' }).default(false),
});
