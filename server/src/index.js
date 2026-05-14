import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { runMigrations } from './db/migrate.js';

async function start() {
  await runMigrations();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT}`);
  });

  function shutdown(signal) {
    logger.info({ signal }, 'Received shutdown signal');
    server.close(() => process.exit(0));
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
