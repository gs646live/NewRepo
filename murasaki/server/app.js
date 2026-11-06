import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { sequelize } from './config/db.js';
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
      await sequelize.authenticate();
      res.json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'degraded', database: 'unreachable' });
    }
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
