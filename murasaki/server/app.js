import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { dbState, sequelize } from './config/db.js';
import lessonRoutes from './routes/lessonRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(here, '..', 'client', 'dist');

/** Build the Express app (without listening) so tests can use it directly. */
export function createApp({ serveClient = true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', async (req, res) => {
    try {
      if (!dbState.ready) throw new Error(dbState.lastError ?? 'not connected yet');
      await sequelize.authenticate();
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      res.status(503).json({ status: 'degraded', database: 'unreachable', detail: error.message });
    }
  });

  // Until PostgreSQL is reachable, answer with an explanation instead of crashing.
  app.use('/api', (req, res, next) => {
    if (dbState.ready) return next();
    res.status(503).json({
      code: 'DB_UNAVAILABLE',
      error:
        'The Murasaki API is running but cannot reach its PostgreSQL database. ' +
        'Start it from the murasaki folder with "docker compose up -d db" (or fix DATABASE_URL in server/.env), ' +
        'then try again.',
    });
  });

  app.use('/api/lessons', lessonRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api', notFound);

  // In production the API also serves the built React app (npm run build).
  if (serveClient && fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
    app.use(express.static(CLIENT_DIST, { index: false, maxAge: '1h' }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
