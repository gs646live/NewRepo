#!/usr/bin/env node
// Populates the `items` table with the Murasaki content matrix:
//
//                 Beginner              Intermediate                       Expert
//   Hiragana   46 gojūon         dakuten, handakuten, yōon, words    look-alikes, typing
//   Katakana   46 gojūon         dakuten, handakuten, yōon, words    look-alikes, typing
//   Kanji      JLPT N5           JLPT N4/N3 kanji + jukugo            JLPT N2/N1 sentences
//
// Usage:
//   npm run seed              replace all items (user progress is kept)
//   npm run seed -- --reset   drop and recreate every table, including users
//
// The server also calls seedIfEmpty() on start-up when AUTO_SEED=true.

import { fileURLToPath } from 'node:url';
import { sequelize, connectDB, disconnectDB } from '../config/db.js';
import { Item } from '../models/index.js';
import { buildKanaItems } from './data/kana.js';
import { buildKanjiItems } from './data/kanji.js';

/** Every row that goes into the items table. */
export function buildSeedItems() {
  return [...buildKanaItems('Hiragana'), ...buildKanaItems('Katakana'), ...buildKanjiItems()];
}

/**
 * Replace the contents of the items table with the seed data.
 * @returns {Promise<number>} number of rows inserted
 */
export async function seedItems({ logger = console } = {}) {
  const rows = buildSeedItems();
  await sequelize.transaction(async (transaction) => {
    await Item.destroy({ where: {}, truncate: true, restartIdentity: true, transaction });
    await Item.bulkCreate(rows, { validate: true, transaction });
  });
  logger.info?.(`[seed] inserted ${rows.length} items`);
  logSummary(rows, logger);
  return rows.length;
}

/** Seed only when the table is empty (used at server start-up). */
export async function seedIfEmpty({ logger = console } = {}) {
  const count = await Item.count();
  if (count > 0) return 0;
  logger.info?.('[seed] items table is empty — seeding content matrix');
  return seedItems({ logger });
}

function logSummary(rows, logger) {
  const table = {};
  for (const row of rows) {
    table[row.type] ??= { Beginner: 0, Intermediate: 0, Expert: 0 };
    table[row.type][row.level] += 1;
  }
  logger.table?.(table);
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const reset = process.argv.includes('--reset');
  try {
    await connectDB();
    if (reset) {
      console.info('[seed] --reset: dropping and recreating all tables');
      await sequelize.sync({ force: true });
    }
    await seedItems();
    await disconnectDB();
  } catch (error) {
    console.error('[seed] failed:', error.message);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}
