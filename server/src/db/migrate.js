import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '../config/db.js';
import { logger } from '../lib/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, 'migrations');

export async function runMigrations() {
  logger.info('running DB migrations…');
  await migrate(db, { migrationsFolder });
  logger.info('DB migrations complete');
}
