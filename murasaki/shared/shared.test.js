import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRomajiMatch, normalizeRomaji, stripReadingMarkers } from './romaji.js';
import { isKana, splitMorae } from './kana.js';

test('Hepburn and Kunrei spellings are treated as equal', () => {
  const pairs = [
    ['shi', 'si'],
    ['chi', 'ti'],
    ['tsu', 'tu'],
    ['fu', 'hu'],
    ['ji', 'zi'],
    ['sha', 'sya'],
    ['cho', 'tyo'],
    ['ja', 'zya'],
    ['jya', 'ja'],
    ['wo', 'o'],
  ];
  for (const [a, b] of pairs) assert.ok(isRomajiMatch(a, b), `${a} should match ${b}`);
});

test('long vowels, n and spacing variants are accepted', () => {
  assert.ok(isRomajiMatch('tōkyō', 'toukyou'));
  assert.ok(isRomajiMatch('Tookyoo', 'toukyou'));
  assert.ok(isRomajiMatch('shimbun', 'shinbun'));
  assert.ok(isRomajiMatch('kinnyoubi', "kin'youbi"));
  assert.ok(isRomajiMatch('  Kon Pyuu-taa ', 'konpyuutaa'));
  assert.ok(isRomajiMatch('maccha', 'matcha'));
  assert.ok(isRomajiMatch('chotto', 'tyotto'));
});

test('different words do not match', () => {
  assert.ok(!isRomajiMatch('shi', 'tsu'));
  assert.ok(!isRomajiMatch('tokyo', 'toukyou'), 'missing long vowels is still an error');
  assert.ok(!isRomajiMatch('', 'a'));
  assert.ok(!isRomajiMatch('gakko', 'gakkou'));
});

test('accepts any of several expected answers', () => {
  assert.ok(isRomajiMatch('yon', ['shi', 'yon']));
});

test('normalizeRomaji strips non-letters', () => {
  assert.equal(normalizeRomaji("Kin'-youbi!"), 'kinyoobi');
});

test('stripReadingMarkers removes okurigana parentheses', () => {
  assert.equal(stripReadingMarkers('ta(beru)'), 'taberu');
});

test('splitMorae keeps yōon together', () => {
  assert.deepEqual(splitMorae('でんしゃ'), ['で', 'ん', 'しゃ']);
  assert.deepEqual(splitMorae('コーヒー'), ['コ', 'ー', 'ヒ', 'ー']);
  assert.deepEqual(splitMorae('ざっし'), ['ざ', 'っ', 'し']);
  assert.deepEqual(splitMorae('メニュー'), ['メ', 'ニュ', 'ー']);
});

test('isKana', () => {
  assert.ok(isKana('ねこ'));
  assert.ok(isKana('コーヒー'));
  assert.ok(!isKana('水'));
  assert.ok(!isKana('neko'));
});
