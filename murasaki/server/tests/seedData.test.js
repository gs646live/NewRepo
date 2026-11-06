// Integrity checks on the content matrix itself (no database needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSeedItems } from '../seed/seed.js';
import { BLANK } from '../services/quizBuilder.js';
import { ITEM_CATEGORIES, ITEM_LEVELS, ITEM_TYPES } from '../models/Item.js';
import { isKana } from '@murasaki/shared/kana';

const items = buildSeedItems();
const of = (type, level, category) =>
  items.filter((i) => i.type === type && (!level || i.level === level) && (!category || i.category === category));

test('every item has a valid type, level, category, character and romaji', () => {
  for (const item of items) {
    assert.ok(ITEM_TYPES.includes(item.type), item.character);
    assert.ok(ITEM_LEVELS.includes(item.level), item.character);
    assert.ok(ITEM_CATEGORIES.includes(item.category), item.character);
    assert.ok(item.character?.length > 0);
    assert.match(item.romaji, /^[a-z'()]+$/, `${item.character} romaji "${item.romaji}"`);
  }
});

test('beginner kana covers exactly the 46 gojūon in each script', () => {
  for (const type of ['Hiragana', 'Katakana']) {
    const gojuon = of(type, 'Beginner', 'gojuon');
    assert.equal(gojuon.length, 46);
    assert.equal(new Set(gojuon.map((i) => i.character)).size, 46);
    assert.equal(new Set(gojuon.map((i) => i.romaji)).size, 46);
  }
});

test('hiragana items are hiragana and katakana items are katakana', () => {
  const hira = /^[ぁ-ゖ]+$/u;
  const kata = /^[ァ-ヺー]+$/u;
  for (const item of of('Hiragana')) assert.match(item.character, hira, item.character);
  for (const item of of('Katakana')) assert.match(item.character, kata, item.character);
});

test('intermediate kana includes dakuten, handakuten, all 33 yōon and words', () => {
  for (const type of ['Hiragana', 'Katakana']) {
    assert.equal(of(type, 'Intermediate', 'dakuten').length, 20);
    assert.equal(of(type, 'Intermediate', 'handakuten').length, 5);
    assert.equal(of(type, 'Intermediate', 'yoon').length, 33);
    const words = of(type, 'Intermediate', 'word');
    assert.ok(words.length >= 20);
    for (const word of words) {
      assert.ok(word.meaning, `${word.character} needs a meaning`);
      assert.ok(isKana(word.character));
    }
  }
  assert.ok(of('Hiragana', 'Intermediate', 'word').some((w) => w.character === 'ねこ'));
  assert.ok(of('Katakana', 'Intermediate', 'word').some((w) => w.character === 'サクラ'));
});

test('look-alikes point at real gojūon characters of the same script', () => {
  for (const type of ['Hiragana', 'Katakana']) {
    const gojuon = new Set(of(type, 'Beginner', 'gojuon').map((i) => i.character));
    for (const item of of(type, 'Expert', 'confusable')) {
      assert.ok(gojuon.has(item.character), item.character);
      assert.equal(item.confusableWith.length, 3, item.character);
      for (const other of item.confusableWith) {
        assert.ok(gojuon.has(other), `${item.character} -> ${other}`);
        assert.notEqual(other, item.character);
      }
      assert.equal(new Set(item.confusableWith).size, 3, item.character);
    }
  }
  const shi = of('Katakana', 'Expert', 'confusable').find((i) => i.character === 'シ');
  assert.ok(shi.confusableWith.includes('ツ'), 'シ vs ツ is in the matrix');
  const nu = of('Katakana', 'Expert', 'confusable').find((i) => i.character === 'ヌ');
  assert.ok(nu.confusableWith.includes('ス'), 'ヌ vs ス is in the matrix');
});

test('beginner kanji include numbers 1–10, the elements and 日 月 人', () => {
  const chars = new Set(of('Kanji', 'Beginner').map((i) => i.character));
  for (const ch of '一二三四五六七八九十火水木金土日月人') assert.ok(chars.has(ch), ch);
  for (const item of of('Kanji', 'Beginner')) {
    assert.ok(item.meaning);
    assert.ok(item.onyomi.length + item.kunyomi.length > 0, item.character);
  }
  const meanings = of('Kanji', 'Beginner').map((i) => i.meaning);
  assert.equal(new Set(meanings).size, meanings.length, 'meanings are unique');
});

test('intermediate kanji examples contain the kanji and use one of its readings', () => {
  const kanji = of('Kanji', 'Intermediate', 'kanji');
  for (const ch of '時前後東西食飲新古') assert.ok(kanji.some((k) => k.character === ch), ch);
  for (const item of kanji) {
    assert.ok(item.examples.length >= 2, item.character);
    const types = new Set(item.examples.map((e) => e.type));
    assert.ok(types.has('on') && types.has('kun'), `${item.character} has on and kun examples`);
    for (const example of item.examples) {
      assert.ok(example.word.includes(item.character), `${example.word} contains ${item.character}`);
      const readings = example.type === 'on' ? item.onyomi : item.kunyomi;
      assert.ok(readings.includes(example.reading), `${example.word}: ${example.reading}`);
    }
  }
});

test('jukugo include 先生 and 学生 and their distractors differ from the answer', () => {
  const jukugo = of('Kanji', 'Intermediate', 'jukugo');
  assert.ok(jukugo.some((j) => j.character === '先生' && j.romaji === 'sensei'));
  assert.ok(jukugo.some((j) => j.character === '学生' && j.romaji === 'gakusei'));
  for (const item of jukugo) {
    assert.equal(item.distractors.length, 3, item.character);
    for (const d of item.distractors) assert.notEqual(d.text, item.romaji, item.character);
  }
});

test('expert kanji sentences have one blank and four distinct options', () => {
  const sentences = of('Kanji', 'Expert', 'sentence');
  assert.ok(sentences.some((s) => s.character === '経済' && s.romaji === 'keizai'));
  assert.ok(sentences.some((s) => s.character === '複雑' && s.romaji === 'fukuzatsu'));
  for (const item of sentences) {
    assert.equal(item.sentence.split(BLANK).length, 2, item.character);
    assert.ok(item.sentenceTranslation);
    const options = [item.character, ...item.distractors.map((d) => d.text)];
    assert.equal(new Set(options).size, 4, item.character);
    for (const d of item.distractors) assert.ok(d.note, `${d.text} needs a note`);
  }
});
