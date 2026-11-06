import { fn, col } from 'sequelize';
import {
  ALPHABETS,
  LEVELS,
  ALPHABET_SLUGS,
  LEVEL_SLUGS,
  DEFAULT_QUESTION_COUNT,
  MAX_QUESTION_COUNT,
} from '@murasaki/shared/constants';
import { Item, serializeItem } from '../models/index.js';
import { buildQuiz } from '../services/quizBuilder.js';
import { createRng } from '../services/random.js';
import { MODES, TASKS } from '../services/tasks.js';
import { HttpError } from '../middleware/errors.js';

/** Validate :alphabet and :level, returning slugs and database values. */
function parseLessonParams(params) {
  const alphabet = String(params.alphabet ?? '').toLowerCase();
  const level = String(params.level ?? '').toLowerCase();
  if (!ALPHABETS[alphabet]) {
    throw new HttpError(400, `Unknown alphabet "${params.alphabet}". Use one of: ${ALPHABET_SLUGS.join(', ')}.`);
  }
  if (!LEVELS[level]) {
    throw new HttpError(400, `Unknown level "${params.level}". Use one of: ${LEVEL_SLUGS.join(', ')}.`);
  }
  return { alphabet, level, type: ALPHABETS[alphabet], dbLevel: LEVELS[level] };
}

function parseCount(raw) {
  if (raw === undefined || raw === '') return DEFAULT_QUESTION_COUNT;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new HttpError(400, '`count` must be a whole number of 0 or more.');
  }
  return Math.min(value, MAX_QUESTION_COUNT);
}

function parseSeed(raw) {
  if (raw === undefined || raw === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value)) throw new HttpError(400, '`seed` must be an integer.');
  return value;
}

/**
 * GET /api/lessons/:alphabet/:level?count=10&seed=123
 *
 * Returns every item of the level (for the study list) plus a freshly
 * generated set of quiz questions. `count=0` returns items only.
 */
export async function getLesson(req, res) {
  const { alphabet, level, type, dbLevel } = parseLessonParams(req.params);
  const count = parseCount(req.query.count);
  const seed = parseSeed(req.query.seed);

  const order = [['sortOrder', 'ASC'], ['id', 'ASC']];
  const items = (await Item.findAll({ where: { type, level: dbLevel }, order })).map(serializeItem);
  if (items.length === 0) {
    throw new HttpError(404, `No ${type} ${dbLevel} content found. Has the database been seeded?`);
  }

  // Kana questions borrow distractors from the whole script (e.g. gojūon
  // tiles for word building); kanji distractors stay within the level.
  const pool =
    alphabet === 'kanji'
      ? items
      : (await Item.findAll({ where: { type }, order })).map(serializeItem);

  const rng = seed === null ? Math.random : createRng(seed);
  const questions = buildQuiz({ alphabet, level, items, pool, count, rng });

  res.json({
    alphabet,
    level,
    mode: MODES[alphabet],
    task: TASKS[alphabet][level],
    itemCount: items.length,
    items,
    questions,
  });
}

/**
 * GET /api/lessons
 *
 * Catalogue for the dashboard: each mode with its levels, task copy and item counts.
 */
export async function getCatalog(req, res) {
  const rows = await Item.findAll({
    attributes: ['type', 'level', [fn('COUNT', col('id')), 'count']],
    group: ['type', 'level'],
    raw: true,
  });
  const counts = new Map(rows.map((row) => [`${row.type}:${row.level}`, Number(row.count)]));

  const modes = ALPHABET_SLUGS.map((alphabet) => ({
    slug: alphabet,
    ...MODES[alphabet],
    levels: LEVEL_SLUGS.map((level) => ({
      slug: level,
      name: LEVELS[level],
      itemCount: counts.get(`${ALPHABETS[alphabet]}:${LEVELS[level]}`) ?? 0,
      ...TASKS[alphabet][level],
    })),
  }));

  res.json({ modes });
}
