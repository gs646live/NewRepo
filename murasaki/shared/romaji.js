// Romaji comparison that forgives the spelling differences between
// romanization systems, so "shi" / "si", "tsu" / "tu", "jya" / "ja" / "zya",
// "shimbun" / "shinbun" and "tōkyō" / "toukyou" all count as the same answer.
//
// Both the expected answer and the learner's input are reduced to one
// canonical (Kunrei-like) spelling and then compared.

const MACRONS = [
  [/[āâ]/g, 'aa'],
  [/[īî]/g, 'ii'],
  [/[ūû]/g, 'uu'],
  [/[ēê]/g, 'ee'],
  [/[ōô]/g, 'ou'],
];

// Order matters: earlier rules feed later ones.
const RULES = [
  [/cch/g, 'tch'], // maccha -> matcha
  [/dz/g, 'z'], // dzu -> zu
  [/shi/g, 'si'],
  [/sh([aueo])/g, 'sy$1'],
  [/chi/g, 'ti'],
  [/ch([aueo])/g, 'ty$1'],
  [/tsu/g, 'tu'],
  [/fu/g, 'hu'],
  [/ji/g, 'zi'],
  [/jy?([aueo])/g, 'zy$1'],
  [/dy([aueo])/g, 'zy$1'],
  [/d([iu])/g, 'z$1'], // ぢ / づ in Nihon-shiki
  [/wo/g, 'o'], // を
  [/m(?=[bpm])/g, 'n'], // shimbun -> shinbun
  [/nn/g, 'n'], // konnichiwa / kon'nichiwa
  [/ou/g, 'oo'], // long o: toukyou / tookyoo / tōkyō
];

/**
 * Reduce a romaji string to a canonical form for comparison.
 * @param {string} value
 * @returns {string}
 */
export function normalizeRomaji(value) {
  let s = String(value ?? '').normalize('NFC').toLowerCase().trim();
  for (const [pattern, replacement] of MACRONS) s = s.replace(pattern, replacement);
  s = s.replace(/[^a-z]/g, '');
  for (const [pattern, replacement] of RULES) s = s.replace(pattern, replacement);
  return s;
}

/**
 * True when the learner's romaji matches the expected romaji.
 * @param {string} input what the learner typed
 * @param {string | string[]} expected one or more accepted spellings
 */
export function isRomajiMatch(input, expected) {
  const given = normalizeRomaji(input);
  if (!given) return false;
  const answers = Array.isArray(expected) ? expected : [expected];
  return answers.some((answer) => normalizeRomaji(answer) === given);
}

/**
 * Remove the okurigana marker from a reading such as "ta(beru)" -> "taberu".
 * @param {string} reading
 */
export function stripReadingMarkers(reading) {
  return String(reading).replace(/[()]/g, '');
}
