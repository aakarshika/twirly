// Provide safe defaults so env.js parses cleanly in test runs.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:7432/test';
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? 'test-secret-must-be-at-least-32-characters-long';
process.env.BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:8734';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5734';
process.env.PORT = process.env.PORT ?? '8734';
