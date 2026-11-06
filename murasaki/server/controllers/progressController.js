import {
  ALPHABETS,
  LEVELS,
  COMPLETION_THRESHOLD,
  progressKey,
} from '@murasaki/shared/constants';
import { sequelize } from '../config/db.js';
import { User, USERNAME_PATTERN, normalizeUsername } from '../models/index.js';
import { HttpError } from '../middleware/errors.js';

const MAX_MISSED_STORED = 20;

function parseUsername(raw) {
  const username = normalizeUsername(raw);
  if (!USERNAME_PATTERN.test(username)) {
    throw new HttpError(
      400,
      'Username must be 2–32 characters: letters, numbers, "_" or "-".',
    );
  }
  return username;
}

/** Validate the body of POST /api/progress. */
function parseSession(body = {}) {
  const username = parseUsername(body.username);
  const alphabet = String(body.alphabet ?? '').toLowerCase();
  const level = String(body.level ?? '').toLowerCase();
  if (!ALPHABETS[alphabet]) throw new HttpError(400, '`alphabet` must be hiragana, katakana or kanji.');
  if (!LEVELS[level]) throw new HttpError(400, '`level` must be beginner, intermediate or expert.');

  const total = Number(body.total);
  const correct = Number(body.correct);
  if (!Number.isInteger(total) || total < 1 || total > 500) {
    throw new HttpError(400, '`total` must be a whole number between 1 and 500.');
  }
  if (!Number.isInteger(correct) || correct < 0 || correct > total) {
    throw new HttpError(400, '`correct` must be a whole number between 0 and `total`.');
  }

  const durationMs = Number.isFinite(Number(body.durationMs)) ? Math.max(0, Math.round(Number(body.durationMs))) : null;
  const missed = Array.isArray(body.missed)
    ? [...new Set(body.missed.map((value) => String(value).slice(0, 64)))].slice(0, MAX_MISSED_STORED)
    : [];

  return { username, alphabet, level, total, correct, durationMs, missed };
}

/** Merge one finished session into a progress entry. */
export function applySession(entry, session, now = new Date()) {
  const accuracy = Math.round((session.correct / session.total) * 100);
  const previous = entry ?? {
    attempts: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    bestAccuracy: 0,
    lastAccuracy: 0,
    completed: false,
    bestTimeMs: null,
  };
  const fasterRun =
    session.durationMs !== null &&
    accuracy >= COMPLETION_THRESHOLD &&
    (previous.bestTimeMs === null || session.durationMs < previous.bestTimeMs);

  return {
    attempts: previous.attempts + 1,
    totalCorrect: previous.totalCorrect + session.correct,
    totalAnswered: previous.totalAnswered + session.total,
    bestAccuracy: Math.max(previous.bestAccuracy, accuracy),
    lastAccuracy: accuracy,
    completed: previous.completed || accuracy >= COMPLETION_THRESHOLD,
    bestTimeMs: fasterRun ? session.durationMs : previous.bestTimeMs,
    lastPlayedAt: now.toISOString(),
    recentMissed: session.missed,
  };
}

function serializeUser(user) {
  return {
    username: user.username,
    progress: user.progress,
    completionThreshold: COMPLETION_THRESHOLD,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * POST /api/progress
 * Body: { username, alphabet, level, correct, total, durationMs?, missed?: string[] }
 * Creates the user on first save. Responds with the user's updated progress.
 */
export async function saveProgress(req, res) {
  const session = parseSession(req.body);
  const key = progressKey(session.alphabet, session.level);

  const { user, created } = await sequelize.transaction(async (transaction) => {
    const [record, wasCreated] = await User.findOrCreate({
      where: { username: session.username },
      defaults: { username: session.username, progress: {} },
      transaction,
    });
    // Lock the row so two tabs finishing at once can't lose an update.
    await record.reload({ lock: transaction.LOCK.UPDATE, transaction });
    record.progress = { ...record.progress, [key]: applySession(record.progress[key], session) };
    await record.save({ transaction });
    return { user: record, created: wasCreated };
  });

  res.status(created ? 201 : 200).json({
    ...serializeUser(user),
    saved: { key, entry: user.progress[key] },
  });
}

/** GET /api/progress/:username */
export async function getProgress(req, res) {
  const username = parseUsername(req.params.username);
  const user = await User.findOne({ where: { username } });
  if (!user) throw new HttpError(404, `No progress saved yet for "${username}".`);
  res.json(serializeUser(user));
}

/** DELETE /api/progress/:username — forget a learner's progress. */
export async function resetProgress(req, res) {
  const username = parseUsername(req.params.username);
  const removed = await User.destroy({ where: { username } });
  if (!removed) throw new HttpError(404, `No progress saved yet for "${username}".`);
  res.status(204).end();
}
