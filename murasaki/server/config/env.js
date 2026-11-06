import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env no matter which directory the process was started from.
dotenv.config({ path: path.resolve(here, '..', '.env'), quiet: true });

const bool = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Not 5000: macOS uses that port for AirPlay Receiver.
  port: Number(process.env.PORT) || 3001,
  // 5433 = the Docker database from docker-compose.yml (kept off 5432 so it can't
  // clash with a PostgreSQL installed on the computer).
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://murasaki:murasaki@localhost:5433/murasaki',
  databaseSsl: bool(process.env.DATABASE_SSL, false),
  autoSeed: bool(process.env.AUTO_SEED, true),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  dbLogging: bool(process.env.DB_LOGGING, false),
};
