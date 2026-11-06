// Turns Item rows into quiz questions for one mode + level.
//
// Every question has the same outer shape so the client can render it with
// one of three answer widgets:
//
//   {
//     id, itemId,
//     kind: 'choice' | 'input' | 'build',
//     format,                 // e.g. 'kana-to-romaji', 'sentence-blank'
//     instruction,            // what to do, in English
//     prompt: { text, lang, size, caption?, highlight?: [start, end] },
//     hint?,                  // revealed on request (expert sentences)
//     choices?: [{ value, label, lang, sublabel?, note? }],   // kind 'choice'
//     tiles?: [{ id, text }],                                // kind 'build'
//     answer,                 // the choice value, kana word, or romaji to type
//     answerDisplay,          // how to show the correct answer
//     timeLimit?,             // seconds; present on timed drills
//     feedback: { explanation, reveal?, speak? },
//     source: { itemId, character, romaji, meaning },
//   }
//
// The builder is a pure function: pass `rng` from createRng(seed) for
// reproducible quizzes.

import { normalizeRomaji, stripReadingMarkers } from '@murasaki/shared/romaji';
import { splitMorae } from '@murasaki/shared/kana';
import { pick, sample, shuffle } from './random.js';

const CHOICES_PER_QUESTION = 4;
/** Rare or particle-only kana that make confusing distractor tiles. */
const RARE_TILES = new Set(['ぢ', 'づ', 'を', 'ヂ', 'ヅ', 'ヲ']);
const CONFUSABLE_TIME_LIMIT = 6;
const EXTRA_TILES = 3;

/**
 * @param {object} options
 * @param {'hiragana'|'katakana'|'kanji'} options.alphabet
 * @param {'beginner'|'intermediate'|'expert'} options.level
 * @param {object[]} options.items  items of this level (plain objects)
 * @param {object[]} [options.pool] every item of this alphabet, used for distractors
 * @param {number} [options.count]  number of questions wanted
 * @param {() => number} [options.rng]
 * @returns {object[]} questions
 */
export function buildQuiz({ alphabet, level, items, pool = items, count = 10, rng = Math.random }) {
  const wanted = Math.max(0, Math.min(count, items.length));
  if (wanted === 0) return [];

  const ctx = { pool, rng };
  if (alphabet === 'kanji') {
    if (level === 'beginner') return buildKanjiBeginner(items, wanted, ctx);
    if (level === 'intermediate') return buildKanjiIntermediate(items, wanted, ctx);
    return sample(items, wanted, rng).map((item) => sentenceBlankQuestion(item, ctx));
  }
  if (level === 'beginner') {
    return sample(items, wanted, rng).map((item) => kanaToRomajiQuestion(item, ctx));
  }
  if (level === 'intermediate') return buildKanaIntermediate(items, wanted, ctx);
  return buildKanaExpert(items, wanted, ctx);
}

// ---------------------------------------------------------------------------
// Selection helpers
// ---------------------------------------------------------------------------

/**
 * Pick `wanted` items split between two groups (e.g. characters vs words),
 * topping up from the other group when one runs short, then shuffle.
 */
function balancedSample(groupA, groupB, wanted, rng, shareA = 0.5) {
  let takeA = Math.min(groupA.length, Math.round(wanted * shareA));
  let takeB = Math.min(groupB.length, wanted - takeA);
  takeA = Math.min(groupA.length, wanted - takeB);
  return shuffle([...sample(groupA, takeA, rng), ...sample(groupB, takeB, rng)], rng);
}

const byCategory = (items, ...categories) => items.filter((item) => categories.includes(item.category));

/** Values from `candidates` that are not equivalent to anything in `taken`. */
function distinctRomaji(candidates, taken) {
  const seen = new Set(taken.map(normalizeRomaji));
  const out = [];
  for (const value of candidates) {
    const key = normalizeRomaji(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function distinctText(candidates, taken) {
  const seen = new Set(taken);
  const out = [];
  for (const value of candidates) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

const source = (item) => ({
  itemId: item.id,
  character: item.character,
  romaji: item.romaji,
  meaning: item.meaning ?? null,
});

const latin = (value, extra = {}) => ({ value, label: value, lang: 'en', ...extra });
const japanese = (value, extra = {}) => ({ value, label: value, lang: 'ja', ...extra });

const withNote = (text, note) => (note ? `${text} ${note}` : text);

// ---------------------------------------------------------------------------
// Kana
// ---------------------------------------------------------------------------

/** が -> か, じゃ -> しゃ, ぶ -> ふ: the un-voiced partner is a great distractor. */
export function devoice(romaji) {
  if (romaji.startsWith('j')) return `sh${romaji.slice(1)}`;
  const map = { g: 'k', z: 's', d: 't', b: 'h', p: 'h' };
  const head = map[romaji[0]];
  if (!head) return null;
  const out = head + romaji.slice(1);
  return out === 'hu' ? 'fu' : out;
}

/** Which items supply wrong answers for a kana character question. */
function kanaDistractorPool(item, pool) {
  switch (item.category) {
    case 'dakuten':
    case 'handakuten':
      return byCategory(pool, 'dakuten', 'handakuten');
    case 'yoon':
      return byCategory(pool, 'yoon');
    default:
      return byCategory(pool, 'gojuon');
  }
}

function kanaToRomajiQuestion(item, { pool, rng }) {
  const preferred = [];
  const voiceless = ['dakuten', 'handakuten', 'yoon'].includes(item.category) ? devoice(item.romaji) : null;
  if (voiceless) preferred.push(voiceless);

  const candidates = shuffle(
    kanaDistractorPool(item, pool).map((other) => other.romaji),
    rng,
  );
  const wrong = distinctRomaji([...preferred, ...candidates], [item.romaji]).slice(
    0,
    CHOICES_PER_QUESTION - 1,
  );

  return {
    id: `${item.id}:kana-to-romaji`,
    itemId: item.id,
    kind: 'choice',
    format: 'kana-to-romaji',
    instruction: 'Choose the romaji for this character.',
    prompt: { text: item.character, lang: 'ja', size: 'xl' },
    choices: shuffle([item.romaji, ...wrong], rng).map((value) => latin(value)),
    answer: item.romaji,
    answerDisplay: item.romaji,
    feedback: {
      explanation: withNote(`${item.character} is read "${item.romaji}".`, item.note),
      speak: item.character,
    },
    source: source(item),
  };
}

function wordBuildQuestion(item, { pool, rng }) {
  const morae = splitMorae(item.character);
  const used = new Set(morae);
  const singles = byCategory(pool, 'gojuon', 'dakuten', 'handakuten')
    .map((other) => other.character)
    .filter((ch) => !RARE_TILES.has(ch));
  const extras = sample(distinctText(singles, [...used]), EXTRA_TILES, rng);
  const tiles = shuffle([...morae, ...extras], rng).map((text, index) => ({ id: `t${index}`, text }));

  return {
    id: `${item.id}:word-build`,
    itemId: item.id,
    kind: 'build',
    format: 'word-build',
    instruction: 'Build the word by tapping the tiles in order.',
    prompt: { text: item.romaji, lang: 'en', size: 'lg', caption: item.meaning },
    tiles,
    answer: item.character,
    answerDisplay: `${item.character} (${item.romaji})`,
    feedback: {
      explanation: withNote(`${item.character} (${item.romaji}) means "${item.meaning}".`, item.note),
      speak: item.character,
    },
    source: source(item),
  };
}

function buildKanaIntermediate(items, wanted, ctx) {
  const characters = byCategory(items, 'dakuten', 'handakuten', 'yoon');
  const words = byCategory(items, 'word');
  return balancedSample(characters, words, wanted, ctx.rng).map((item) =>
    item.category === 'word' ? wordBuildQuestion(item, ctx) : kanaToRomajiQuestion(item, ctx),
  );
}

function confusableQuestion(item, { pool, rng }, direction) {
  const group = [item.character, ...item.confusableWith];
  const romajiOf = new Map(byCategory(pool, 'gojuon').map((other) => [other.character, other.romaji]));
  const note = item.note ?? `Look closely: ${group.join(' · ')}`;
  const base = {
    itemId: item.id,
    kind: 'choice',
    timeLimit: CONFUSABLE_TIME_LIMIT,
    feedback: { explanation: note, speak: item.character },
    source: source(item),
  };

  if (direction === 'romaji-to-kana') {
    return {
      ...base,
      id: `${item.id}:romaji-to-kana`,
      format: 'romaji-to-kana',
      instruction: 'Quick! Which character is this?',
      prompt: { text: item.romaji, lang: 'en', size: 'xl' },
      choices: shuffle(group, rng).map((value) => japanese(value)),
      answer: item.character,
      answerDisplay: `${item.character} (${item.romaji})`,
    };
  }

  const romajiChoices = distinctRomaji(
    [item.romaji, ...item.confusableWith.map((ch) => romajiOf.get(ch)).filter(Boolean)],
    [],
  );
  return {
    ...base,
    id: `${item.id}:kana-to-romaji-speed`,
    format: 'kana-to-romaji-speed',
    instruction: 'Quick! Choose the romaji.',
    prompt: { text: item.character, lang: 'ja', size: 'xl' },
    choices: shuffle(romajiChoices, rng).map((value) => latin(value)),
    answer: item.romaji,
    answerDisplay: item.romaji,
  };
}

function typingQuestion(item) {
  const morae = splitMorae(item.character);
  return {
    id: `${item.id}:kana-typing`,
    itemId: item.id,
    kind: 'input',
    format: 'kana-typing',
    instruction: 'Type this word in romaji.',
    prompt: { text: item.character, lang: 'ja', size: 'lg', caption: item.meaning },
    answer: item.romaji,
    answerDisplay: item.romaji,
    timeLimit: Math.min(30, 8 + morae.length * 2),
    feedback: {
      explanation: `${item.character} is typed "${item.romaji}" and means "${item.meaning}".`,
      speak: item.character,
    },
    source: source(item),
  };
}

function buildKanaExpert(items, wanted, ctx) {
  const confusables = byCategory(items, 'confusable');
  const typing = byCategory(items, 'typing');
  let speedIndex = 0;
  return balancedSample(confusables, typing, wanted, ctx.rng).map((item) => {
    if (item.category === 'typing') return typingQuestion(item);
    speedIndex += 1;
    return confusableQuestion(item, ctx, speedIndex % 2 ? 'romaji-to-kana' : 'kana-to-romaji');
  });
}

// ---------------------------------------------------------------------------
// Kanji
// ---------------------------------------------------------------------------

function readingSummary(item) {
  const on = item.onyomi?.length ? item.onyomi.join(', ') : '—';
  const kun = item.kunyomi?.length ? item.kunyomi.join(', ') : '—';
  return `On'yomi: ${on} · Kun'yomi: ${kun}.`;
}

function kanjiMeaningQuestion(item, { pool, rng }) {
  const wrong = sample(
    distinctText(pool.map((other) => other.meaning), [item.meaning]),
    CHOICES_PER_QUESTION - 1,
    rng,
  );
  return {
    id: `${item.id}:kanji-meaning`,
    itemId: item.id,
    kind: 'choice',
    format: 'kanji-meaning',
    instruction: 'What does this kanji mean?',
    prompt: { text: item.character, lang: 'ja', size: 'xl' },
    choices: shuffle([item.meaning, ...wrong], rng).map((value) => latin(value)),
    answer: item.meaning,
    answerDisplay: item.meaning,
    feedback: {
      explanation: withNote(`${item.character} means "${item.meaning}". ${readingSummary(item)}`, item.note),
    },
    source: source(item),
  };
}

function kanjiReadingQuestion(item, { pool, rng }) {
  const wrong = distinctRomaji(
    shuffle(pool.map((other) => other.romaji), rng),
    [item.romaji, ...item.onyomi.map(stripReadingMarkers), ...item.kunyomi.map(stripReadingMarkers)],
  ).slice(0, CHOICES_PER_QUESTION - 1);
  return {
    id: `${item.id}:kanji-reading`,
    itemId: item.id,
    kind: 'choice',
    format: 'kanji-reading',
    instruction: `Choose a reading of this kanji (“${item.meaning}”).`,
    prompt: { text: item.character, lang: 'ja', size: 'xl' },
    choices: shuffle([item.romaji, ...wrong], rng).map((value) => latin(value)),
    answer: item.romaji,
    answerDisplay: item.romaji,
    feedback: {
      explanation: withNote(`${item.character} (${item.meaning}) is read "${item.romaji}". ${readingSummary(item)}`, item.note),
    },
    source: source(item),
  };
}

function buildKanjiBeginner(items, wanted, ctx) {
  return sample(items, wanted, ctx.rng).map((item, index) =>
    index % 2 === 0 ? kanjiMeaningQuestion(item, ctx) : kanjiReadingQuestion(item, ctx),
  );
}

const READING_LABEL = { on: "On'yomi", kun: "Kun'yomi" };

function readingInContextQuestion(item, { pool, rng }) {
  const example = pick(item.examples, rng);
  const own = [
    ...item.onyomi.map((value) => ({ value, type: 'on' })),
    ...item.kunyomi.map((value) => ({ value, type: 'kun' })),
  ];
  const answer = own.find((choice) => choice.value === example.reading) ?? {
    value: example.reading,
    type: example.type,
  };
  const others = own.filter((choice) => choice.value !== answer.value);

  // Always offer at least one reading of the opposite type: that contrast is the lesson.
  const opposite = others.filter((choice) => choice.type !== answer.type);
  const picked = opposite.length ? [pick(opposite, rng)] : [];
  picked.push(...shuffle(others.filter((choice) => !picked.includes(choice)), rng));
  let wrong = picked.slice(0, CHOICES_PER_QUESTION - 1);

  if (wrong.length < CHOICES_PER_QUESTION - 1) {
    // Top up with readings of other kanji.
    const taken = [answer, ...wrong].map((choice) => stripReadingMarkers(choice.value));
    const foreign = shuffle(
      byCategory(pool, 'kanji')
        .filter((other) => other.id !== item.id)
        .flatMap((other) => [
          ...other.onyomi.map((value) => ({ value, type: 'on' })),
          ...other.kunyomi.map((value) => ({ value, type: 'kun' })),
        ]),
      rng,
    );
    const seen = new Set(taken.map(normalizeRomaji));
    for (const choice of foreign) {
      if (wrong.length >= CHOICES_PER_QUESTION - 1) break;
      const key = normalizeRomaji(stripReadingMarkers(choice.value));
      if (seen.has(key)) continue;
      seen.add(key);
      wrong = [...wrong, choice];
    }
  }

  const start = Math.max(0, example.word.indexOf(item.character));
  const kind = answer.type === 'on' ? "on'yomi" : "kun'yomi";
  const why =
    answer.type === 'on'
      ? "On'yomi come from Chinese and are typical in compound words."
      : "Kun'yomi are native Japanese readings — used for kanji on their own, with okurigana, and in some native compounds.";

  return {
    id: `${item.id}:reading-in-context:${example.word}`,
    itemId: item.id,
    kind: 'choice',
    format: 'reading-in-context',
    instruction: `How is ${item.character} read in this word?`,
    prompt: {
      text: example.word,
      lang: 'ja',
      size: 'lg',
      caption: example.meaning,
      highlight: [start, start + item.character.length],
    },
    choices: shuffle([answer, ...wrong], rng).map((choice) =>
      latin(choice.value, { sublabel: READING_LABEL[choice.type] }),
    ),
    answer: answer.value,
    answerDisplay: `${answer.value} (${READING_LABEL[answer.type]})`,
    feedback: {
      explanation: `In ${example.word} (${example.romaji}, "${example.meaning}"), ${item.character} takes its ${kind} "${answer.value}". ${why}`,
      speak: example.word,
    },
    source: source(item),
  };
}

function jukugoQuestion(item, { rng }) {
  const wrong = distinctRomaji(
    shuffle(item.distractors.map((d) => d.text), rng),
    [item.romaji],
  ).slice(0, CHOICES_PER_QUESTION - 1);
  return {
    id: `${item.id}:jukugo-reading`,
    itemId: item.id,
    kind: 'choice',
    format: 'jukugo-reading',
    instruction: 'Choose the reading of this compound word.',
    prompt: { text: item.character, lang: 'ja', size: 'lg', caption: item.meaning },
    choices: shuffle([item.romaji, ...wrong], rng).map((value) => latin(value)),
    answer: item.romaji,
    answerDisplay: item.romaji,
    feedback: {
      explanation: withNote(`${item.character} is read "${item.romaji}" (${item.meaning}).`, item.note ? `${item.note}.` : null),
      speak: item.character,
    },
    source: source(item),
  };
}

function buildKanjiIntermediate(items, wanted, ctx) {
  const single = byCategory(items, 'kanji');
  const compounds = byCategory(items, 'jukugo');
  return balancedSample(single, compounds, wanted, ctx.rng, 0.6).map((item) =>
    item.category === 'jukugo' ? jukugoQuestion(item, ctx) : readingInContextQuestion(item, ctx),
  );
}

export const BLANK = '＿＿';

function sentenceBlankQuestion(item, { rng }) {
  const notes = new Map(item.distractors.map((d) => [d.text, d.note]));
  notes.set(item.character, `${item.romaji} — ${item.meaning}`);
  const options = [item.character, ...item.distractors.map((d) => d.text)];
  const completed = item.sentence.replace(BLANK, item.character);

  return {
    id: `${item.id}:sentence-blank`,
    itemId: item.id,
    kind: 'choice',
    format: 'sentence-blank',
    instruction: 'Complete the sentence. No furigana — read it as a native would.',
    prompt: { text: item.sentence, lang: 'ja', size: 'md' },
    hint: item.sentenceTranslation,
    choices: shuffle(options, rng).map((value) => japanese(value, { note: notes.get(value) })),
    answer: item.character,
    answerDisplay: `${item.character} (${item.romaji})`,
    feedback: {
      explanation: `${item.character} (${item.romaji}) means "${item.meaning}". ${item.sentenceTranslation}`,
      reveal: completed,
      speak: completed,
    },
    source: source(item),
  };
}
