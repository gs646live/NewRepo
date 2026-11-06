// Values used by both the API and the React client.

/** URL slug -> database value for each practice mode. */
export const ALPHABETS = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji: 'Kanji',
};

/** URL slug -> database value for each difficulty level. */
export const LEVELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

export const ALPHABET_SLUGS = Object.keys(ALPHABETS);
export const LEVEL_SLUGS = Object.keys(LEVELS);

/** Accuracy (0–100) a learner needs in one session to mark a level completed. */
export const COMPLETION_THRESHOLD = 80;

export const DEFAULT_QUESTION_COUNT = 10;
export const MAX_QUESTION_COUNT = 50;

/** Key used for a mode/level pair inside a user's progress object. */
export const progressKey = (alphabet, level) => `${alphabet}:${level}`;
