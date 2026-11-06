import { env } from './config/env.js';
import { connectDB, dbState, disconnectDB, redact } from './config/db.js';
import { seedIfEmpty } from './seed/seed.js';
import { createApp } from './app.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Keep trying to reach PostgreSQL. The API stays up meanwhile and answers
 * with a clear 503 message, so the web app can say what's wrong instead of
 * failing with a bare proxy error.
 */
async function connectInBackground() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      // Only accept API requests once the tables exist and the content is seeded.
      await connectDB({ retries: 1, markReady: false });
      if (env.autoSeed) await seedIfEmpty();
      dbState.ready = true;
      console.info('[db] connected to PostgreSQL — ready');
      return;
    } catch (error) {
      if (attempt === 1) {
        // A PostgreSQL answered but doesn't know us: almost always one installed on
        // the computer rather than the Docker one.
        const wrongServer = /(role|database) ".*" does not exist|password authentication failed/i.test(
          dbState.lastError ?? '',
        );
        console.error(
          [
            '',
            `[db] Cannot connect to PostgreSQL at ${redact(env.databaseUrl)}`,
            `[db]   ${dbState.lastError}`,
            ...(wrongServer
              ? [
                  "[db]   A PostgreSQL server answered, but it isn't set up for Murasaki (user, password or database).",
                  '[db]   Use the Docker one instead (DATABASE_URL on port 5433, see server/.env.example)',
                  '[db]   or create the user and database in yours (README → Troubleshooting).',
                ]
              : [
                  '[db]   Fix: start the database from the murasaki/ folder with  docker compose up -d db',
                  '[db]        or set DATABASE_URL in server/.env to a PostgreSQL you already run.',
                ]),
            '[db]   The API keeps running and retries every few seconds.',
            '',
          ].join('\n'),
        );
      } else if (attempt % 10 === 0) {
        console.warn(`[db] still waiting for PostgreSQL (${dbState.lastError})`);
      }
      await sleep(Math.min(3000 * attempt, 15000));
    }
  }
}

const app = createApp();
// Express 5 also calls this callback with the error when listening fails (handled below).
const server = app.listen(env.port, (error) => {
  if (error) return;
  console.info(`[api] 紫 Murasaki API listening on http://localhost:${env.port}`);
  connectInBackground().catch((error) => console.error('[db] setup failed:', error.message));
});
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const mac = process.platform === 'darwin' && env.port === 5000
      ? ' On macOS, port 5000 is used by AirPlay Receiver — use PORT=3001.'
      : '';
    console.error(`[api] Port ${env.port} is already in use. Set a different PORT in server/.env.${mac}`);
  } else {
    console.error('[api] failed to start:', error.message);
  }
  process.exit(1);
});

const shutdown = (signal) => {
  console.info(`[api] ${signal} received, shutting down`);
  server.close(async () => {
    await disconnectDB().catch(() => {});
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
