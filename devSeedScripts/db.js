import pg from 'pg';

const DB_URL = process.env.DATABASE_URL ?? 'postgresql://twirly:twirly@localhost:7432/twirly';

export const pool = new pg.Pool({ connectionString: DB_URL });
export const q = (text, params) => pool.query(text, params);
