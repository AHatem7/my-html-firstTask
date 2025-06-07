import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

// Define tables
const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  hashed_password: text('hashed_password').notNull(),
  created_at: text('created_at').notNull(),
});

const links = sqliteTable('links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  original_url: text('original_url').notNull(),
  short_slug: text('short_slug').notNull().unique(),
  created_by: integer('created_by').references(() => users.id),
  created_at: text('created_at').notNull(),
  expires_at: text('expires_at'),
  click_count: integer('click_count').default(0),
  password_hash: text('password_hash'),
});

const visits = sqliteTable('visits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  link_id: integer('link_id').references(() => links.id),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  referrer: text('referrer'),
  country: text('country'),
  clicked_at: text('clicked_at').notNull(),
});

// Setup DB
const sqlite = new Database('linknest.sqlite');
const db = drizzle(sqlite);

export { db, users, links, visits };
