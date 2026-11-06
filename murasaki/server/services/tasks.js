// Human-readable description of what each mode/level practises.
// Returned by the API so the client never hard-codes lesson copy.

const KANA_TASKS = (script) => ({
  beginner: {
    title: 'Gojūon Recognition',
    summary: `The 46 basic ${script} characters.`,
    description: 'See a character, choose its romaji. Learn the chart row by row: a, ka, sa, ta, na…',
    skills: ['Character → romaji', 'Multiple choice'],
  },
  intermediate: {
    title: 'Dakuten, Yōon & First Words',
    summary: 'Voiced sounds (g, z, d, b, p), combined sounds (kya, sho…) and simple words.',
    description: 'Read the voiced and combined sounds, then build 2–3 sound words from character tiles.',
    skills: ['Dakuten & handakuten', 'Yōon', 'Word building'],
  },
  expert: {
    title: 'Speed & Precision',
    summary: 'Look-alike characters under a timer, plus full romaji typing.',
    description:
      script === 'katakana'
        ? 'Tell シ from ツ and ヌ from ス against the clock, then type out longer loanwords.'
        : 'Tell ね from れ and ぬ from め against the clock, then type out longer words.',
    skills: ['Timed drills', 'Look-alikes', 'Typing'],
  },
});

export const TASKS = {
  hiragana: KANA_TASKS('hiragana'),
  katakana: KANA_TASKS('katakana'),
  kanji: {
    beginner: {
      title: 'JLPT N5 Foundations',
      summary: 'Numbers 1–10, the five elements and everyday concepts.',
      description: 'Match each kanji to its English meaning and its basic reading.',
      skills: ['Meaning', 'Basic reading'],
      jlpt: 'N5',
    },
    intermediate: {
      title: "On'yomi vs Kun'yomi",
      summary: 'Time, directions, common verbs and adjectives, and compound words.',
      description:
        "Choose how a kanji is read inside a real word — the Chinese-derived on'yomi or the native kun'yomi — and read common jukugo.",
      skills: ['Readings in context', 'Jukugo'],
      jlpt: 'N4 / N3',
    },
    expert: {
      title: 'Sentences without Furigana',
      summary: 'Abstract nouns and advanced vocabulary in full sentences.',
      description: 'Complete each sentence with the correct kanji compound. No reading aids.',
      skills: ['Fill in the blank', 'Homophones', 'Look-alike compounds'],
      jlpt: 'N2 / N1',
    },
  },
};

export const MODES = {
  hiragana: {
    name: 'Hiragana',
    native: 'ひらがな',
    glyph: 'あ',
    description: 'The rounded script for native words and grammar. Start here.',
  },
  katakana: {
    name: 'Katakana',
    native: 'カタカナ',
    glyph: 'ア',
    description: 'The angular script for loanwords, names and emphasis.',
  },
  kanji: {
    name: 'Kanji',
    native: '漢字',
    glyph: '漢',
    description: 'Characters that carry meaning, from N5 basics to N1 sentences.',
  },
};
