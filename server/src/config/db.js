import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from './env.js';
import { logger } from '../lib/logger.js';
import * as schema from '../db/schema/index.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

pool.on('error', (err) => logger.error({ err }, 'pg pool error'));

export const db = drizzle(pool, { schema });
export { pool };
