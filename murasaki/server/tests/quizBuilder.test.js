// Property-style checks: build many quizzes from the real seed data and make
// sure every question is answerable and well-formed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALPHABETS, LEVELS } from '@murasaki/shared/constants';
import { normalizeRomaji } from '@murasaki/shared/romaji';
import { splitMorae } from '@murasaki/shared/kana';
import { buildSeedItems } from '../seed/seed.js';
import { buildQuiz, devoice } from '../services/quizBuilder.js';
import { createRng } from '../services/random.js';

const allItems = buildSeedItems().map((item, index) => ({ id: index + 1, ...item }));

function lesson(alphabet, level) {
  const type = ALPHABETS[alphabet];
  const items = allItems.filter((i) => i.type === type && i.level === LEVELS[level]);
  const pool = alphabet === 'kanji' ? items : allItems.filter((i) => i.type === type);
  return { items, pool };
}

const COMBOS = Object.keys(ALPHABETS).flatMap((alphabet) =>
  Object.keys(LEVELS).map((level) => [alphabet, level]),
);

for (const [alphabet, level] of COMBOS) {
  test(`${alphabet}/${level}: 200 random quizzes are all well-formed`, () => {
    const { items, pool } = lesson(alphabet, level);
    for (let seed = 1; seed <= 200; seed += 1) {
      const questions = buildQuiz({ alphabet, level, items, pool, count: 10, rng: createRng(seed) });
      assert.equal(questions.length, 10);
      assert.equal(new Set(questions.map((q) => q.id)).size, 10, 'question ids are unique');
      assert.equal(new Set(questions.map((q) => q.itemId)).size, 10, 'no item is asked twice');

      for (const q of questions) {
        assert.ok(q.instruction, q.id);
        assert.ok(q.prompt?.text, q.id);
        assert.ok(q.answer, q.id);
        assert.ok(q.answerDisplay, q.id);
        assert.ok(q.feedback?.explanation, q.id);
        assert.equal(q.source.itemId, q.itemId);

        if (q.kind === 'choice') {
          const values = q.choices.map((c) => c.value);
          assert.ok(values.includes(q.answer), `${q.id}: answer is one of the choices`);
          assert.ok(values.length >= 3, `${q.id}: has at least 3 choices`);
          assert.equal(new Set(values).size, values.length, `${q.id}: choices are unique`);
          if (q.choices[0].lang === 'en') {
            const keys = values.map((v) => normalizeRomaji(v.replace(/[()]/g, '')) || v);
            assert.equal(new Set(keys).size, keys.length, `${q.id}: no two choices sound the same`);
          }
        } else if (q.kind === 'build') {
          const tiles = q.tiles.map((t) => t.text);
          for (const mora of splitMorae(q.answer)) {
            assert.ok(tiles.includes(mora), `${q.id}: tile ${mora} is available`);
          }
          assert.ok(tiles.length > splitMorae(q.answer).length, `${q.id}: has distractor tiles`);
          assert.equal(new Set(q.tiles.map((t) => t.id)).size, q.tiles.length);
        } else {
          assert.equal(q.kind, 'input');
          assert.ok(q.timeLimit > 0);
        }
      }
    }
  });
}

test('count is capped by the number of items and 0 returns nothing', () => {
  const { items, pool } = lesson('kanji', 'expert');
  assert.equal(buildQuiz({ alphabet: 'kanji', level: 'expert', items, pool, count: 999 }).length, items.length);
  assert.equal(buildQuiz({ alphabet: 'kanji', level: 'expert', items, pool, count: 0 }).length, 0);
});

test('the same seed produces the same quiz', () => {
  const { items, pool } = lesson('hiragana', 'intermediate');
  const a = buildQuiz({ alphabet: 'hiragana', level: 'intermediate', items, pool, rng: createRng(42) });
  const b = buildQuiz({ alphabet: 'hiragana', level: 'intermediate', items, pool, rng: createRng(42) });
  assert.deepEqual(a, b);
});

test('kana intermediate mixes character reading with word building', () => {
  const { items, pool } = lesson('katakana', 'intermediate');
  const quiz = buildQuiz({ alphabet: 'katakana', level: 'intermediate', items, pool, count: 10, rng: createRng(3) });
  const kinds = quiz.map((q) => q.kind);
  assert.equal(kinds.filter((k) => k === 'build').length, 5);
  assert.equal(kinds.filter((k) => k === 'choice').length, 5);
});

test('kana expert mixes timed look-alike drills with typing', () => {
  const { items, pool } = lesson('katakana', 'expert');
  const quiz = buildQuiz({ alphabet: 'katakana', level: 'expert', items, pool, count: 10, rng: createRng(5) });
  assert.ok(quiz.every((q) => q.timeLimit > 0), 'every expert question is timed');
  assert.equal(quiz.filter((q) => q.kind === 'input').length, 5);
  const speed = quiz.filter((q) => q.kind === 'choice');
  assert.ok(speed.some((q) => q.format === 'romaji-to-kana'));
  assert.ok(speed.some((q) => q.format === 'kana-to-romaji-speed'));
});

test('reading-in-context questions highlight the kanji and offer both reading types', () => {
  const { items, pool } = lesson('kanji', 'intermediate');
  for (let seed = 1; seed <= 50; seed += 1) {
    const quiz = buildQuiz({ alphabet: 'kanji', level: 'intermediate', items, pool, count: 10, rng: createRng(seed) });
    for (const q of quiz.filter((x) => x.format === 'reading-in-context')) {
      const [start, end] = q.prompt.highlight;
      const kanji = q.source.character;
      assert.equal(q.prompt.text.slice(start, end), kanji, q.id);
      const labels = new Set(q.choices.map((c) => c.sublabel));
      assert.ok(labels.has("On'yomi") && labels.has("Kun'yomi"), q.id);
    }
  }
});

test('expert sentences are revealed with the answer filled in', () => {
  const { items, pool } = lesson('kanji', 'expert');
  const [q] = buildQuiz({ alphabet: 'kanji', level: 'expert', items, pool, count: 1, rng: createRng(1) });
  assert.ok(q.feedback.reveal.includes(q.answer));
  assert.ok(!q.feedback.reveal.includes('＿'));
  assert.ok(q.hint, 'translation is available as a hint');
  assert.ok(q.choices.every((c) => c.note), 'every option explains itself after answering');
});

test('devoice maps voiced sounds to their plain partners', () => {
  assert.equal(devoice('ga'), 'ka');
  assert.equal(devoice('ji'), 'shi');
  assert.equal(devoice('ja'), 'sha');
  assert.equal(devoice('bu'), 'fu');
  assert.equal(devoice('pya'), 'hya');
  assert.equal(devoice('kya'), null);
});
