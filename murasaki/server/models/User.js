import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

/** Letters (any script), digits, underscore and hyphen; 2–32 characters. */
export const USERNAME_PATTERN = /^[\p{L}\p{N}_-]{2,32}$/u;

/**
 * A learner. There is no password: the username is a nickname that lets
 * someone keep their progress between visits.
 *
 * `progress` is keyed by "<alphabet>:<level>", e.g. "hiragana:beginner":
 * {
 *   attempts, totalCorrect, totalAnswered,
 *   bestAccuracy, lastAccuracy,   // 0–100
 *   completed,                    // reached COMPLETION_THRESHOLD at least once
 *   lastPlayedAt, recentMissed    // characters missed in the latest session
 * }
 */
export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      validate: { is: USERNAME_PATTERN },
      set(value) {
        this.setDataValue('username', normalizeUsername(value));
      },
    },
    progress: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  },
  { tableName: 'users' },
);

/** Usernames are case-insensitive: "Hana" and "hana" are the same learner. */
export function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}
