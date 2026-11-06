// Kana content matrix for the Hiragana and Katakana modes.
//
// The character tables list each sound once as [hiragana, katakana, romaji]
// so the two scripts can never drift apart. Words and look-alike sets differ
// per script and are listed separately.

// ---------------------------------------------------------------------------
// BEGINNER — Gojūon: the 46 basic characters
// ---------------------------------------------------------------------------
export const GOJUON = [
  ['あ', 'ア', 'a'], ['い', 'イ', 'i'], ['う', 'ウ', 'u'], ['え', 'エ', 'e'], ['お', 'オ', 'o'],
  ['か', 'カ', 'ka'], ['き', 'キ', 'ki'], ['く', 'ク', 'ku'], ['け', 'ケ', 'ke'], ['こ', 'コ', 'ko'],
  ['さ', 'サ', 'sa'], ['し', 'シ', 'shi'], ['す', 'ス', 'su'], ['せ', 'セ', 'se'], ['そ', 'ソ', 'so'],
  ['た', 'タ', 'ta'], ['ち', 'チ', 'chi'], ['つ', 'ツ', 'tsu'], ['て', 'テ', 'te'], ['と', 'ト', 'to'],
  ['な', 'ナ', 'na'], ['に', 'ニ', 'ni'], ['ぬ', 'ヌ', 'nu'], ['ね', 'ネ', 'ne'], ['の', 'ノ', 'no'],
  ['は', 'ハ', 'ha'], ['ひ', 'ヒ', 'hi'], ['ふ', 'フ', 'fu'], ['へ', 'ヘ', 'he'], ['ほ', 'ホ', 'ho'],
  ['ま', 'マ', 'ma'], ['み', 'ミ', 'mi'], ['む', 'ム', 'mu'], ['め', 'メ', 'me'], ['も', 'モ', 'mo'],
  ['や', 'ヤ', 'ya'], ['ゆ', 'ユ', 'yu'], ['よ', 'ヨ', 'yo'],
  ['ら', 'ラ', 'ra'], ['り', 'リ', 'ri'], ['る', 'ル', 'ru'], ['れ', 'レ', 're'], ['ろ', 'ロ', 'ro'],
  ['わ', 'ワ', 'wa'], ['を', 'ヲ', 'wo'],
  ['ん', 'ン', 'n'],
];

/** Teaching notes for characters that trip learners up. Keyed by romaji. */
export const GOJUON_NOTES = {
  shi: 'Irregular: the s-row gives "shi", not "si".',
  chi: 'Irregular: the t-row gives "chi", not "ti".',
  tsu: 'Irregular: the t-row gives "tsu", not "tu".',
  fu: 'Sounds between "fu" and "hu" — lips barely touch.',
  wo: 'Pronounced "o". Today it is used almost only as the object particle.',
  n: 'The only consonant that stands alone as its own sound.',
};

// ---------------------------------------------------------------------------
// INTERMEDIATE — Dakuten (゛), Handakuten (゜) and Yōon (small ゃゅょ)
// ---------------------------------------------------------------------------
export const DAKUTEN = [
  ['が', 'ガ', 'ga'], ['ぎ', 'ギ', 'gi'], ['ぐ', 'グ', 'gu'], ['げ', 'ゲ', 'ge'], ['ご', 'ゴ', 'go'],
  ['ざ', 'ザ', 'za'], ['じ', 'ジ', 'ji'], ['ず', 'ズ', 'zu'], ['ぜ', 'ゼ', 'ze'], ['ぞ', 'ゾ', 'zo'],
  ['だ', 'ダ', 'da'], ['ぢ', 'ヂ', 'ji'], ['づ', 'ヅ', 'zu'], ['で', 'デ', 'de'], ['ど', 'ド', 'do'],
  ['ば', 'バ', 'ba'], ['び', 'ビ', 'bi'], ['ぶ', 'ブ', 'bu'], ['べ', 'ベ', 'be'], ['ぼ', 'ボ', 'bo'],
];

export const DAKUTEN_NOTES = {
  ぢ: 'Rare. Sounds the same as じ (ji); appears in words like はなぢ (nosebleed).',
  づ: 'Rare. Sounds the same as ず (zu); appears in words like つづく (to continue).',
  ヂ: 'Rare. Sounds the same as ジ (ji).',
  ヅ: 'Rare. Sounds the same as ズ (zu).',
};

export const HANDAKUTEN = [
  ['ぱ', 'パ', 'pa'], ['ぴ', 'ピ', 'pi'], ['ぷ', 'プ', 'pu'], ['ぺ', 'ペ', 'pe'], ['ぽ', 'ポ', 'po'],
];

const YOON_BASES = [
  // [hiragana, katakana, romaji prefix]
  ['き', 'キ', 'ky'], ['し', 'シ', 'sh'], ['ち', 'チ', 'ch'], ['に', 'ニ', 'ny'],
  ['ひ', 'ヒ', 'hy'], ['み', 'ミ', 'my'], ['り', 'リ', 'ry'], ['ぎ', 'ギ', 'gy'],
  ['じ', 'ジ', 'j'], ['び', 'ビ', 'by'], ['ぴ', 'ピ', 'py'],
];
const YOON_SMALL = [
  ['ゃ', 'ャ', 'a'], ['ゅ', 'ュ', 'u'], ['ょ', 'ョ', 'o'],
];

/** 33 yōon combinations: きゃ kya … ぴょ pyo. */
export const YOON = YOON_BASES.flatMap(([hBase, kBase, prefix]) =>
  YOON_SMALL.map(([hSmall, kSmall, vowel]) => [hBase + hSmall, kBase + kSmall, prefix + vowel]),
);

// Simple 2–3 sound words used for the tile-building task.
export const HIRAGANA_WORDS = [
  ['ねこ', 'neko', 'cat'],
  ['いぬ', 'inu', 'dog'],
  ['さかな', 'sakana', 'fish'],
  ['やま', 'yama', 'mountain'],
  ['みず', 'mizu', 'water'],
  ['ごはん', 'gohan', 'rice; meal'],
  ['かぎ', 'kagi', 'key'],
  ['ぶた', 'buta', 'pig'],
  ['でんわ', 'denwa', 'telephone'],
  ['かぜ', 'kaze', 'wind; a cold'],
  ['はな', 'hana', 'flower; nose'],
  ['くつ', 'kutsu', 'shoes'],
  ['そら', 'sora', 'sky'],
  ['うみ', 'umi', 'sea'],
  ['たまご', 'tamago', 'egg'],
  ['おちゃ', 'ocha', 'green tea'],
  ['しゃしん', 'shashin', 'photograph'],
  ['でんしゃ', 'densha', 'train'],
  ['えき', 'eki', 'station'],
  ['くるま', 'kuruma', 'car'],
  ['りんご', 'ringo', 'apple'],
  ['かばん', 'kaban', 'bag'],
  ['じしょ', 'jisho', 'dictionary'],
  ['ひゃく', 'hyaku', 'one hundred'],
  ['きょう', 'kyou', 'today'],
];

export const KATAKANA_WORDS = [
  ['サクラ', 'sakura', 'cherry blossom', 'Usually written 桜 or さくら; katakana gives it a stylised look.'],
  ['パン', 'pan', 'bread', 'From Portuguese "pão".'],
  ['テレビ', 'terebi', 'television'],
  ['カメラ', 'kamera', 'camera'],
  ['ペン', 'pen', 'pen'],
  ['バス', 'basu', 'bus'],
  ['ピアノ', 'piano', 'piano'],
  ['ゲーム', 'geemu', 'game', 'ー lengthens the vowel before it: ge-e-mu.'],
  ['ノート', 'nooto', 'notebook', 'ー lengthens the vowel before it: no-o-to.'],
  ['ホテル', 'hoteru', 'hotel'],
  ['ドア', 'doa', 'door'],
  ['ベッド', 'beddo', 'bed', 'Small ッ doubles the next consonant: be-d-do.'],
  ['シャツ', 'shatsu', 'shirt'],
  ['ジャム', 'jamu', 'jam'],
  ['メニュー', 'menyuu', 'menu'],
  ['ケーキ', 'keeki', 'cake'],
  ['ギター', 'gitaa', 'guitar'],
  ['ラジオ', 'rajio', 'radio'],
  ['ビル', 'biru', 'building', 'Short for ビルディング (building).'],
  ['アイス', 'aisu', 'ice cream'],
  ['パンダ', 'panda', 'panda'],
  ['サラダ', 'sarada', 'salad'],
  ['タクシー', 'takushii', 'taxi'],
  ['コーヒー', 'koohii', 'coffee'],
];

// ---------------------------------------------------------------------------
// EXPERT — look-alike characters (speed drills) and longer words (typing)
// ---------------------------------------------------------------------------

/** [character, romaji, look-alikes] — every look-alike is a gojūon character. */
export const HIRAGANA_CONFUSABLES = [
  ['あ', 'a', ['お', 'め', 'ぬ']],
  ['お', 'o', ['あ', 'む', 'す']],
  ['ぬ', 'nu', ['め', 'ね', 'あ']],
  ['め', 'me', ['ぬ', 'あ', 'の']],
  ['ね', 'ne', ['れ', 'わ', 'ぬ']],
  ['れ', 're', ['ね', 'わ', 'る']],
  ['わ', 'wa', ['ね', 'れ', 'る']],
  ['る', 'ru', ['ろ', 'れ', 'ら']],
  ['ろ', 'ro', ['る', 'ら', 'そ']],
  ['い', 'i', ['り', 'こ', 'け']],
  ['り', 'ri', ['い', 'け', 'ら']],
  ['さ', 'sa', ['ち', 'き', 'そ']],
  ['ち', 'chi', ['さ', 'ら', 'ろ']],
  ['き', 'ki', ['さ', 'ま', 'ち']],
  ['は', 'ha', ['ほ', 'ま', 'け']],
  ['ほ', 'ho', ['は', 'ま', 'け']],
  ['ま', 'ma', ['は', 'ほ', 'も']],
  ['た', 'ta', ['な', 'に', 'こ']],
  ['な', 'na', ['た', 'に', 'は']],
  ['う', 'u', ['ら', 'つ', 'こ']],
  ['ら', 'ra', ['う', 'ろ', 'ち']],
  ['こ', 'ko', ['い', 'に', 'り']],
  ['に', 'ni', ['こ', 'た', 'け']],
  ['け', 'ke', ['は', 'に', 'い']],
  ['し', 'shi', ['つ', 'い', 'も']],
  ['つ', 'tsu', ['し', 'う', 'そ']],
  ['く', 'ku', ['へ', 'し', 'て']],
  ['へ', 'he', ['く', 'て', 'つ']],
];

export const KATAKANA_CONFUSABLES = [
  ['シ', 'shi', ['ツ', 'ソ', 'ン']],
  ['ツ', 'tsu', ['シ', 'ソ', 'ン']],
  ['ソ', 'so', ['ン', 'ツ', 'シ']],
  ['ン', 'n', ['ソ', 'シ', 'ツ']],
  ['ヌ', 'nu', ['ス', 'メ', 'フ']],
  ['ス', 'su', ['ヌ', 'ラ', 'フ']],
  ['ク', 'ku', ['ケ', 'タ', 'ワ']],
  ['ケ', 'ke', ['ク', 'タ', 'ナ']],
  ['タ', 'ta', ['ク', 'ケ', 'ヌ']],
  ['ワ', 'wa', ['ウ', 'フ', 'ク']],
  ['ウ', 'u', ['ワ', 'フ', 'ラ']],
  ['フ', 'fu', ['ワ', 'ヌ', 'ラ']],
  ['コ', 'ko', ['ユ', 'ロ', 'ヨ']],
  ['ユ', 'yu', ['コ', 'ヨ', 'エ']],
  ['ロ', 'ro', ['コ', 'ヨ', 'ユ']],
  ['ヨ', 'yo', ['ヲ', 'ユ', 'コ']],
  ['チ', 'chi', ['テ', 'ナ', 'ケ']],
  ['テ', 'te', ['チ', 'ラ', 'ナ']],
  ['マ', 'ma', ['ム', 'ア', 'ヤ']],
  ['ム', 'mu', ['マ', 'ア', 'ヌ']],
  ['ア', 'a', ['マ', 'ヤ', 'ム']],
  ['ヤ', 'ya', ['セ', 'ア', 'マ']],
  ['セ', 'se', ['ヤ', 'サ', 'ヒ']],
  ['ヲ', 'wo', ['ラ', 'ヨ', 'フ']],
  ['ラ', 'ra', ['ヲ', 'ウ', 'テ']],
  ['ル', 'ru', ['レ', 'ハ', 'リ']],
  ['レ', 're', ['ル', 'ノ', 'リ']],
  ['ノ', 'no', ['メ', 'ソ', 'レ']],
  ['メ', 'me', ['ノ', 'ナ', 'ヌ']],
  ['ナ', 'na', ['メ', 'チ', 'ト']],
];

/** Notes shown after a look-alike drill. Keyed by character. */
export const CONFUSABLE_NOTES = {
  シ: 'シ (shi): strokes slant up from the lower left, like a smile.',
  ツ: 'ツ (tsu): strokes fall from the top, like rain.',
  ソ: 'ソ (so): the long stroke falls from the top right.',
  ン: 'ン (n): the long stroke rises from the lower left.',
  ヌ: 'ヌ (nu): a フ shape with a short stroke crossing through it.',
  ス: 'ス (su): a フ shape with a little tail kicking out to the right — nothing crosses it.',
  ね: 'ね (ne) ends in a loop; れ (re) kicks out; わ (wa) curves round.',
  れ: 'れ (re) ends with a kick to the right.',
  わ: 'わ (wa) ends in a round curve, no loop.',
  る: 'る (ru) has a loop at the bottom; ろ (ro) does not.',
  ろ: 'ろ (ro) is open at the bottom; る (ru) closes with a loop.',
  ぬ: 'ぬ (nu) has a loop at the end; め (me) does not.',
  め: 'め (me) has no loop; ぬ (nu) does.',
  は: 'は (ha) has one horizontal bar; ほ (ho) has two.',
  ほ: 'ほ (ho) has two horizontal bars on the right; は (ha) has one.',
  さ: 'さ (sa): the bottom is a separate stroke that bulges to the left.',
  ち: 'ち (chi): one stroke comes down and bulges to the right, a bit like a 5.',
};

/** [word, romaji, meaning] — full typing drills. */
export const HIRAGANA_TYPING = [
  ['がっこう', 'gakkou', 'school'],
  ['きって', 'kitte', 'postage stamp'],
  ['しゅくだい', 'shukudai', 'homework'],
  ['りょこう', 'ryokou', 'travel'],
  ['ちょっと', 'chotto', 'a little'],
  ['べんきょう', 'benkyou', 'study'],
  ['じてんしゃ', 'jitensha', 'bicycle'],
  ['ひこうき', 'hikouki', 'airplane'],
  ['しんぶん', 'shinbun', 'newspaper'],
  ['ともだち', 'tomodachi', 'friend'],
  ['とうきょう', 'toukyou', 'Tokyo'],
  ['ぎゅうにゅう', 'gyuunyuu', 'milk'],
  ['きっぷ', 'kippu', 'ticket'],
  ['びょういん', 'byouin', 'hospital'],
  ['おかあさん', 'okaasan', 'mother'],
  ['きんようび', "kin'youbi", 'Friday'],
];

export const KATAKANA_TYPING = [
  ['コンピューター', 'konpyuutaa', 'computer'],
  ['チョコレート', 'chokoreeto', 'chocolate'],
  ['レストラン', 'resutoran', 'restaurant'],
  ['パスポート', 'pasupooto', 'passport'],
  ['エレベーター', 'erebeetaa', 'elevator'],
  ['ジュース', 'juusu', 'juice'],
  ['ニュース', 'nyuusu', 'news'],
  ['チケット', 'chiketto', 'ticket'],
  ['スーパー', 'suupaa', 'supermarket'],
  ['アメリカ', 'amerika', 'America'],
  ['インターネット', 'intaanetto', 'internet'],
  ['キャンプ', 'kyanpu', 'camping'],
  ['シャワー', 'shawaa', 'shower'],
  ['ヨーロッパ', 'yooroppa', 'Europe'],
  ['フランス', 'furansu', 'France'],
];

// ---------------------------------------------------------------------------
// Build Item rows
// ---------------------------------------------------------------------------

/**
 * @param {'Hiragana' | 'Katakana'} type
 * @returns {object[]} rows ready for Item.bulkCreate
 */
export function buildKanaItems(type) {
  const col = type === 'Hiragana' ? 0 : 1;
  const rows = [];
  let order = 0;
  const push = (row) => rows.push({ type, sortOrder: order++, ...row });

  for (const entry of GOJUON) {
    push({
      level: 'Beginner',
      category: 'gojuon',
      character: entry[col],
      romaji: entry[2],
      note: GOJUON_NOTES[entry[2]] ?? null,
    });
  }

  for (const entry of DAKUTEN) {
    push({
      level: 'Intermediate',
      category: 'dakuten',
      character: entry[col],
      romaji: entry[2],
      note: DAKUTEN_NOTES[entry[col]] ?? 'Dakuten (゛) voices the sound.',
    });
  }
  for (const entry of HANDAKUTEN) {
    push({
      level: 'Intermediate',
      category: 'handakuten',
      character: entry[col],
      romaji: entry[2],
      note: 'Handakuten (゜) turns the h-row into a "p" sound.',
    });
  }
  for (const entry of YOON) {
    push({
      level: 'Intermediate',
      category: 'yoon',
      character: entry[col],
      romaji: entry[2],
      note: `Yōon: ${entry[col][0]} + small ${entry[col][1]} blend into one sound.`,
    });
  }
  const words = type === 'Hiragana' ? HIRAGANA_WORDS : KATAKANA_WORDS;
  for (const [character, romaji, meaning, note] of words) {
    push({ level: 'Intermediate', category: 'word', character, romaji, meaning, note: note ?? null });
  }

  const confusables = type === 'Hiragana' ? HIRAGANA_CONFUSABLES : KATAKANA_CONFUSABLES;
  for (const [character, romaji, lookAlikes] of confusables) {
    push({
      level: 'Expert',
      category: 'confusable',
      character,
      romaji,
      confusableWith: lookAlikes,
      note: CONFUSABLE_NOTES[character] ?? null,
    });
  }
  const typing = type === 'Hiragana' ? HIRAGANA_TYPING : KATAKANA_TYPING;
  for (const [character, romaji, meaning] of typing) {
    push({ level: 'Expert', category: 'typing', character, romaji, meaning });
  }

  return rows;
}
