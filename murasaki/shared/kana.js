// Small kana helpers shared by the server's quiz builder and the client.

/** Small kana that combine with the character before them (yōon / foreign sounds). */
const COMBINING_SMALL_KANA = new Set([
  'ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ',
  'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ヮ',
]);

/**
 * Split a kana word into the units a learner would read as one sound.
 * Yōon such as きゃ or シャ stay together; っ, ー and ん are their own tiles.
 *
 *   splitMorae('でんしゃ') -> ['で', 'ん', 'しゃ']
 *   splitMorae('コーヒー') -> ['コ', 'ー', 'ヒ', 'ー']
 *
 * @param {string} word
 * @returns {string[]}
 */
export function splitMorae(word) {
  const units = [];
  for (const ch of String(word)) {
    if (COMBINING_SMALL_KANA.has(ch) && units.length > 0) {
      units[units.length - 1] += ch;
    } else {
      units.push(ch);
    }
  }
  return units;
}

/** True if every character in the string is hiragana or katakana (incl. ー). */
export function isKana(text) {
  return /^[ぁ-ゖァ-ヺー]+$/u.test(String(text));
}

/** True if the text contains any kana or kanji. */
export function hasJapanese(text) {
  return /[\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF]/u.test(String(text));
}
