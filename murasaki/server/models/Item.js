import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ITEM_TYPES = ['Hiragana', 'Katakana', 'Kanji'];
export const ITEM_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

/**
 * What kind of content an item is. Drives which question the quiz builder makes.
 *
 * Kana:  gojuon | dakuten | handakuten | yoon | word | confusable | typing
 * Kanji: kanji (single character) | jukugo (compound) | sentence (fill-in-the-blank)
 */
export const ITEM_CATEGORIES = [
  'gojuon',
  'dakuten',
  'handakuten',
  'yoon',
  'word',
  'confusable',
  'typing',
  'kanji',
  'jukugo',
  'sentence',
];

/**
 * One piece of practice content: a kana, a word, a kanji or a kanji compound.
 */
export const Item = sequelize.define(
  'Item',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM(...ITEM_TYPES), allowNull: false },
    level: { type: DataTypes.ENUM(...ITEM_LEVELS), allowNull: false },
    category: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [ITEM_CATEGORIES] },
    },
    /** What the learner sees: 'あ', 'ねこ', '水', '先生', '経済'. */
    character: { type: DataTypes.STRING(64), allowNull: false },
    /** Hepburn romanization: 'a', 'neko', 'mizu', 'sensei', 'keizai'. */
    romaji: { type: DataTypes.STRING(64), allowNull: false },
    /** English meaning for words, kanji and compounds. */
    meaning: { type: DataTypes.STRING(160), allowNull: true },

    // ---- Kanji readings -------------------------------------------------
    onyomi: { type: DataTypes.ARRAY(DataTypes.STRING(32)), allowNull: false, defaultValue: [] },
    kunyomi: { type: DataTypes.ARRAY(DataTypes.STRING(32)), allowNull: false, defaultValue: [] },
    /**
     * Context words for a single kanji (Intermediate):
     * [{ word, romaji, reading, type: 'on' | 'kun', meaning }]
     */
    examples: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },

    // ---- Expert kanji sentences ----------------------------------------
    /** Japanese sentence with ＿＿ where the item belongs. */
    sentence: { type: DataTypes.TEXT, allowNull: true },
    sentenceTranslation: { type: DataTypes.TEXT, allowNull: true },

    // ---- Distractors ---------------------------------------------------
    /** Look-alike characters for speed drills, e.g. シ -> ['ツ', 'ソ', 'ン']. */
    confusableWith: {
      type: DataTypes.ARRAY(DataTypes.STRING(8)),
      allowNull: false,
      defaultValue: [],
    },
    /** Hand-written wrong answers: [{ text, note }]. */
    distractors: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },

    /** Short teaching note shown after the learner answers. */
    note: { type: DataTypes.TEXT, allowNull: true },
    /** Keeps chart order (あいうえお…) when listing items. */
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    tableName: 'items',
    indexes: [{ fields: ['type', 'level'] }, { fields: ['type', 'category'] }],
  },
);

/** Shape returned by the API (drops timestamps). */
export function serializeItem(item) {
  const plain = typeof item.get === 'function' ? item.get({ plain: true }) : item;
  const { createdAt, updatedAt, ...rest } = plain;
  return rest;
}
