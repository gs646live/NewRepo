import { Sequelize } from 'sequelize';
import { env } from './env.js';

/**
 * Single Sequelize instance shared by every model.
 * PostgreSQL is required: the Item model uses ARRAY and JSONB columns.
 */
export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: env.dbLogging ? (sql) => console.log(`[sql] ${sql}`) : false,
  dialectOptions: env.databaseSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  pool: { max: 10, min: 0, idle: 10_000 },
  define: { underscored: true },
});

/**
 * Open the connection and make sure the tables exist.
 * Retries a few times so `docker compose up` ordering doesn't matter.
 */
export async function connectDB({ retries = 5, delayMs = 2000 } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await sequelize.authenticate();
      // Models must be imported before sync so Sequelize knows about them.
      await import('../models/index.js');
      await sequelize.sync();
      return sequelize;
    } catch (error) {
      if (attempt >= retries) {
        error.message = `Could not connect to PostgreSQL at ${redact(env.databaseUrl)}: ${error.message}`;
        throw error;
      }
      console.warn(
        `[db] connection attempt ${attempt}/${retries} failed (${error.message}); retrying in ${delayMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDB() {
  await sequelize.close();
}

/** Hide the password when printing a connection string. */
function redact(url) {
  return url.replace(/\/\/([^:/@]+):[^@]*@/, '//$1:****@');
}
