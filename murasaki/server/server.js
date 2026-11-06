import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedIfEmpty } from './seed/seed.js';
import { createApp } from './app.js';

async function start() {
  await connectDB();
  console.info('[db] connected to PostgreSQL');

  if (env.autoSeed) await seedIfEmpty();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.info(`[api] 紫 Murasaki API listening on http://localhost:${env.port}`);
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
}

start().catch((error) => {
  console.error('[api] failed to start:', error.message);
  process.exit(1);
});
