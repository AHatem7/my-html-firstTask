import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database('./src/db/habitforge.sqlite');
export const db = drizzle(sqlite, { schema });
