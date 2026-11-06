// Kanji content matrix.
//
// Readings are written in Hepburn romaji. Kun'yomi that need okurigana
// (trailing kana) show it in parentheses: 食 -> "ta(beru)" for 食べる.

// ---------------------------------------------------------------------------
// BEGINNER — JLPT N5: numbers, the five elements and basic concepts.
// Task: match the kanji to its English meaning and basic reading.
// ---------------------------------------------------------------------------
const N5 = [
  // Numbers 1–10
  { character: '一', meaning: 'one', romaji: 'ichi', onyomi: ['ichi', 'itsu'], kunyomi: ['hito(tsu)'] },
  { character: '二', meaning: 'two', romaji: 'ni', onyomi: ['ni'], kunyomi: ['futa(tsu)'] },
  { character: '三', meaning: 'three', romaji: 'san', onyomi: ['san'], kunyomi: ['mit(tsu)'] },
  {
    character: '四', meaning: 'four', romaji: 'yon', onyomi: ['shi'], kunyomi: ['yon', 'yot(tsu)'],
    note: '"Shi" also means death, so "yon" is often preferred.',
  },
  { character: '五', meaning: 'five', romaji: 'go', onyomi: ['go'], kunyomi: ['itsu(tsu)'] },
  { character: '六', meaning: 'six', romaji: 'roku', onyomi: ['roku'], kunyomi: ['mut(tsu)'] },
  {
    character: '七', meaning: 'seven', romaji: 'nana', onyomi: ['shichi'], kunyomi: ['nana', 'nana(tsu)'],
    note: 'Both "nana" and "shichi" are common when counting.',
  },
  { character: '八', meaning: 'eight', romaji: 'hachi', onyomi: ['hachi'], kunyomi: ['yat(tsu)'] },
  { character: '九', meaning: 'nine', romaji: 'kyuu', onyomi: ['kyuu', 'ku'], kunyomi: ['kokono(tsu)'] },
  { character: '十', meaning: 'ten', romaji: 'juu', onyomi: ['juu'], kunyomi: ['too'] },
  // Elements (also the days of the week Tue–Sat)
  {
    character: '火', meaning: 'fire', romaji: 'hi', onyomi: ['ka'], kunyomi: ['hi'],
    note: '火曜日 (kayoubi) is Tuesday.',
  },
  {
    character: '水', meaning: 'water', romaji: 'mizu', onyomi: ['sui'], kunyomi: ['mizu'],
    note: '水曜日 (suiyoubi) is Wednesday.',
  },
  {
    character: '木', meaning: 'tree; wood', romaji: 'ki', onyomi: ['moku', 'boku'], kunyomi: ['ki'],
    note: '木曜日 (mokuyoubi) is Thursday.',
  },
  {
    character: '金', meaning: 'gold; money', romaji: 'kin', onyomi: ['kin', 'kon'], kunyomi: ['kane'],
    note: '金曜日 (kin\'youbi) is Friday; お金 (okane) means money.',
  },
  {
    character: '土', meaning: 'earth; soil', romaji: 'tsuchi', onyomi: ['do', 'to'], kunyomi: ['tsuchi'],
    note: '土曜日 (doyoubi) is Saturday.',
  },
  // Basic concepts
  {
    character: '日', meaning: 'sun; day', romaji: 'nichi', onyomi: ['nichi', 'jitsu'], kunyomi: ['hi', 'ka'],
    note: '日本 (nihon) is Japan — "origin of the sun".',
  },
  {
    character: '月', meaning: 'moon; month', romaji: 'tsuki', onyomi: ['getsu', 'gatsu'], kunyomi: ['tsuki'],
    note: '月曜日 (getsuyoubi) is Monday.',
  },
  {
    character: '人', meaning: 'person', romaji: 'hito', onyomi: ['jin', 'nin'], kunyomi: ['hito'],
    note: '日本人 (nihonjin) means a Japanese person.',
  },
  { character: '山', meaning: 'mountain', romaji: 'yama', onyomi: ['san'], kunyomi: ['yama'] },
  { character: '川', meaning: 'river', romaji: 'kawa', onyomi: ['sen'], kunyomi: ['kawa'] },
  { character: '口', meaning: 'mouth', romaji: 'kuchi', onyomi: ['kou', 'ku'], kunyomi: ['kuchi'] },
  { character: '目', meaning: 'eye', romaji: 'me', onyomi: ['moku'], kunyomi: ['me'] },
  { character: '大', meaning: 'big', romaji: 'dai', onyomi: ['dai', 'tai'], kunyomi: ['oo(kii)'] },
  { character: '小', meaning: 'small', romaji: 'shou', onyomi: ['shou'], kunyomi: ['chii(sai)', 'ko'] },
  { character: '上', meaning: 'up; above', romaji: 'ue', onyomi: ['jou'], kunyomi: ['ue', 'a(geru)'] },
  { character: '下', meaning: 'down; below', romaji: 'shita', onyomi: ['ka', 'ge'], kunyomi: ['shita', 'sa(geru)'] },
  { character: '中', meaning: 'middle; inside', romaji: 'naka', onyomi: ['chuu'], kunyomi: ['naka'] },
  { character: '子', meaning: 'child', romaji: 'ko', onyomi: ['shi'], kunyomi: ['ko'] },
  { character: '女', meaning: 'woman', romaji: 'onna', onyomi: ['jo'], kunyomi: ['onna'] },
  { character: '男', meaning: 'man', romaji: 'otoko', onyomi: ['dan', 'nan'], kunyomi: ['otoko'] },
  { character: '百', meaning: 'hundred', romaji: 'hyaku', onyomi: ['hyaku'], kunyomi: [] },
  { character: '千', meaning: 'thousand', romaji: 'sen', onyomi: ['sen'], kunyomi: ['chi'] },
  { character: '円', meaning: 'yen; circle', romaji: 'en', onyomi: ['en'], kunyomi: ['maru(i)'] },
  { character: '本', meaning: 'book; origin', romaji: 'hon', onyomi: ['hon'], kunyomi: ['moto'] },
];

// ---------------------------------------------------------------------------
// INTERMEDIATE — JLPT N4/N3: time & directions, common verbs & adjectives,
// and compound words (jukugo).
// Task: choose the on'yomi or kun'yomi a kanji takes inside a real word.
// ---------------------------------------------------------------------------
const ex = (word, romaji, reading, type, meaning) => ({ word, romaji, reading, type, meaning });

const N4_N3_KANJI = [
  // Time & directions
  {
    character: '時', meaning: 'time; hour', onyomi: ['ji'], kunyomi: ['toki'],
    examples: [ex('時間', 'jikan', 'ji', 'on', 'time; hours'), ex('時々', 'tokidoki', 'toki', 'kun', 'sometimes')],
  },
  {
    character: '前', meaning: 'before; front', onyomi: ['zen'], kunyomi: ['mae'],
    examples: [ex('午前', 'gozen', 'zen', 'on', 'a.m.; morning'), ex('名前', 'namae', 'mae', 'kun', 'name')],
  },
  {
    character: '後', meaning: 'after; behind', onyomi: ['go', 'kou'], kunyomi: ['ato', 'ushi(ro)', 'nochi'],
    examples: [ex('午後', 'gogo', 'go', 'on', 'p.m.; afternoon'), ex('後ろ', 'ushiro', 'ushi(ro)', 'kun', 'behind')],
  },
  {
    character: '東', meaning: 'east', onyomi: ['tou'], kunyomi: ['higashi'],
    examples: [ex('東京', 'toukyou', 'tou', 'on', 'Tokyo'), ex('東口', 'higashiguchi', 'higashi', 'kun', 'east exit')],
  },
  {
    character: '西', meaning: 'west', onyomi: ['sei', 'sai'], kunyomi: ['nishi'],
    examples: [ex('西洋', 'seiyou', 'sei', 'on', 'the West'), ex('西口', 'nishiguchi', 'nishi', 'kun', 'west exit')],
  },
  {
    character: '南', meaning: 'south', onyomi: ['nan'], kunyomi: ['minami'],
    examples: [ex('南米', 'nanbei', 'nan', 'on', 'South America'), ex('南口', 'minamiguchi', 'minami', 'kun', 'south exit')],
  },
  {
    character: '北', meaning: 'north', onyomi: ['hoku'], kunyomi: ['kita'],
    examples: [ex('東北', 'touhoku', 'hoku', 'on', 'Tōhoku region; northeast'), ex('北口', 'kitaguchi', 'kita', 'kun', 'north exit')],
  },
  {
    character: '今', meaning: 'now', onyomi: ['kon', 'kin'], kunyomi: ['ima'],
    examples: [ex('今週', 'konshuu', 'kon', 'on', 'this week'), ex('今まで', 'imamade', 'ima', 'kun', 'until now')],
  },
  // Common verbs & adjectives
  {
    character: '食', meaning: 'eat; food', onyomi: ['shoku', 'jiki'], kunyomi: ['ta(beru)', 'ku(u)'],
    examples: [ex('食事', 'shokuji', 'shoku', 'on', 'meal'), ex('食べる', 'taberu', 'ta(beru)', 'kun', 'to eat')],
  },
  {
    character: '飲', meaning: 'drink', onyomi: ['in'], kunyomi: ['no(mu)'],
    examples: [ex('飲食', 'inshoku', 'in', 'on', 'food and drink'), ex('飲む', 'nomu', 'no(mu)', 'kun', 'to drink')],
  },
  {
    character: '新', meaning: 'new', onyomi: ['shin'], kunyomi: ['atara(shii)', 'ara(ta)'],
    examples: [ex('新聞', 'shinbun', 'shin', 'on', 'newspaper'), ex('新しい', 'atarashii', 'atara(shii)', 'kun', 'new')],
  },
  {
    character: '古', meaning: 'old', onyomi: ['ko'], kunyomi: ['furu(i)'],
    examples: [ex('中古', 'chuuko', 'ko', 'on', 'second-hand; used'), ex('古い', 'furui', 'furu(i)', 'kun', 'old')],
  },
  {
    character: '見', meaning: 'see; look', onyomi: ['ken'], kunyomi: ['mi(ru)'],
    examples: [ex('見学', 'kengaku', 'ken', 'on', 'study visit; field trip'), ex('見る', 'miru', 'mi(ru)', 'kun', 'to see')],
  },
  {
    character: '行', meaning: 'go; conduct', onyomi: ['kou', 'gyou'], kunyomi: ['i(ku)', 'okona(u)'],
    examples: [ex('旅行', 'ryokou', 'kou', 'on', 'travel; trip'), ex('行く', 'iku', 'i(ku)', 'kun', 'to go')],
  },
  {
    character: '来', meaning: 'come', onyomi: ['rai'], kunyomi: ['ku(ru)', 'ki(masu)'],
    examples: [ex('来週', 'raishuu', 'rai', 'on', 'next week'), ex('来る', 'kuru', 'ku(ru)', 'kun', 'to come')],
  },
  {
    character: '書', meaning: 'write', onyomi: ['sho'], kunyomi: ['ka(ku)'],
    examples: [ex('辞書', 'jisho', 'sho', 'on', 'dictionary'), ex('書く', 'kaku', 'ka(ku)', 'kun', 'to write')],
  },
  {
    character: '読', meaning: 'read', onyomi: ['doku'], kunyomi: ['yo(mu)'],
    examples: [ex('読書', 'dokusho', 'doku', 'on', 'reading books'), ex('読む', 'yomu', 'yo(mu)', 'kun', 'to read')],
  },
  {
    character: '話', meaning: 'talk; story', onyomi: ['wa'], kunyomi: ['hana(su)', 'hanashi'],
    examples: [ex('電話', 'denwa', 'wa', 'on', 'telephone'), ex('話す', 'hanasu', 'hana(su)', 'kun', 'to speak')],
  },
  {
    character: '高', meaning: 'tall; expensive', onyomi: ['kou'], kunyomi: ['taka(i)'],
    examples: [ex('高校', 'koukou', 'kou', 'on', 'high school'), ex('高い', 'takai', 'taka(i)', 'kun', 'tall; expensive')],
  },
  {
    character: '安', meaning: 'cheap; peaceful', onyomi: ['an'], kunyomi: ['yasu(i)'],
    examples: [ex('安心', 'anshin', 'an', 'on', 'relief; peace of mind'), ex('安い', 'yasui', 'yasu(i)', 'kun', 'cheap')],
  },
  {
    character: '長', meaning: 'long; chief', onyomi: ['chou'], kunyomi: ['naga(i)'],
    examples: [ex('社長', 'shachou', 'chou', 'on', 'company president'), ex('長い', 'nagai', 'naga(i)', 'kun', 'long')],
  },
  {
    character: '明', meaning: 'bright; clear', onyomi: ['mei', 'myou'], kunyomi: ['aka(rui)', 'a(keru)'],
    examples: [ex('説明', 'setsumei', 'mei', 'on', 'explanation'), ex('明るい', 'akarui', 'aka(rui)', 'kun', 'bright')],
  },
];

const wrong = (...texts) => texts.map((text) => ({ text }));

/** Compound words. Distractors mix in the kun'yomi a learner might wrongly use. */
const N4_N3_JUKUGO = [
  { character: '先生', romaji: 'sensei', meaning: 'teacher', note: '先 sen (on) + 生 sei (on)', distractors: wrong('sakisei', 'senshou', 'sakinama') },
  { character: '学生', romaji: 'gakusei', meaning: 'student', note: '学 gaku (on) + 生 sei (on)', distractors: wrong('manabisei', 'gakushou', 'gakunama') },
  { character: '大学', romaji: 'daigaku', meaning: 'university', note: '大 dai (on) + 学 gaku (on)', distractors: wrong('taigaku', 'oogaku', 'daimanabi') },
  { character: '電車', romaji: 'densha', meaning: 'train', note: '電 den (on) + 車 sha (on)', distractors: wrong('denkuruma', 'tensha', 'denja') },
  { character: '会社', romaji: 'kaisha', meaning: 'company', note: '会 kai (on) + 社 sha (on)', distractors: wrong('ayashiro', 'kaiyashiro', 'kaija') },
  { character: '時間', romaji: 'jikan', meaning: 'time; hours', note: '時 ji (on) + 間 kan (on)', distractors: wrong('tokikan', 'jiaida', 'tokima') },
  { character: '毎日', romaji: 'mainichi', meaning: 'every day', note: '毎 mai (on) + 日 nichi (on)', distractors: wrong('maihi', 'maijitsu', 'maika') },
  { character: '天気', romaji: 'tenki', meaning: 'weather', note: '天 ten (on) + 気 ki (on)', distractors: wrong('amaki', 'tenke', 'tengi') },
  { character: '外国', romaji: 'gaikoku', meaning: 'foreign country', note: '外 gai (on) + 国 koku (on)', distractors: wrong('sotokuni', 'gaikuni', 'gekoku') },
  { character: '勉強', romaji: 'benkyou', meaning: 'study', note: '勉 ben (on) + 強 kyou (on)', distractors: wrong('bentsuyo', 'bengou', 'benkou') },
  { character: '病院', romaji: 'byouin', meaning: 'hospital', note: '病 byou (on) + 院 in (on) — keep the long "ou".', distractors: wrong('yamaiin', 'byoin', 'heiin') },
  { character: '映画', romaji: 'eiga', meaning: 'movie', note: '映 ei (on) + 画 ga (on)', distractors: wrong('utsuga', 'eikaku', 'eika') },
  { character: '食堂', romaji: 'shokudou', meaning: 'cafeteria; dining hall', note: '食 shoku (on) + 堂 dou (on)', distractors: wrong('tabedou', 'jikidou', 'shokutou') },
  { character: '地下鉄', romaji: 'chikatetsu', meaning: 'subway', note: '地 chi (on) + 下 ka (on) + 鉄 tetsu (on)', distractors: wrong('jikatetsu', 'chishitatetsu', 'chigetetsu') },
];

// ---------------------------------------------------------------------------
// EXPERT — JLPT N2/N1: abstract nouns and advanced verbs.
// Task: fill in the blank with the correct kanji compound, no furigana.
// ---------------------------------------------------------------------------
const alt = (text, note) => ({ text, note });

const N2_N1 = [
  {
    character: '経済', romaji: 'keizai', meaning: 'economy',
    sentence: '日本の＿＿は少しずつ回復している。',
    sentenceTranslation: "Japan's economy is gradually recovering.",
    distractors: [alt('経験', 'keiken — experience'), alt('決済', 'kessai — payment settlement'), alt('救済', 'kyuusai — relief, rescue')],
  },
  {
    character: '複雑', romaji: 'fukuzatsu', meaning: 'complicated',
    sentence: 'この問題は思ったより＿＿だ。',
    sentenceTranslation: 'This problem is more complicated than I thought.',
    distractors: [alt('複数', 'fukusuu — plural, several'), alt('混雑', 'konzatsu — congestion, crowding'), alt('雑音', 'zatsuon — noise')],
  },
  {
    character: '環境', romaji: 'kankyou', meaning: 'environment',
    sentence: 'プラスチックごみは＿＿に大きな影響を与える。',
    sentenceTranslation: 'Plastic waste has a big impact on the environment.',
    distractors: [alt('環状', 'kanjou — ring-shaped, loop'), alt('境界', 'kyoukai — boundary'), alt('還元', 'kangen — return, reduction')],
  },
  {
    character: '責任', romaji: 'sekinin', meaning: 'responsibility',
    sentence: '事故の＿＿は会社にあると判断された。',
    sentenceTranslation: 'It was ruled that the company is responsible for the accident.',
    distractors: [alt('任務', 'ninmu — mission, duty'), alt('積極', 'sekkyoku — proactive, positive'), alt('資格', 'shikaku — qualification')],
  },
  {
    character: '影響', romaji: 'eikyou', meaning: 'influence; effect',
    sentence: '台風の＿＿で電車が止まった。',
    sentenceTranslation: 'The trains stopped because of the typhoon.',
    distractors: [alt('映像', 'eizou — image, footage'), alt('景気', 'keiki — business conditions'), alt('反響', 'hankyou — echo, response')],
  },
  {
    character: '解決', romaji: 'kaiketsu', meaning: 'solution; resolution',
    sentence: '話し合いで問題を＿＿した。',
    sentenceTranslation: 'We resolved the problem by talking it over.',
    distractors: [alt('快適', 'kaiteki — comfortable'), alt('解散', 'kaisan — breaking up, dissolution'), alt('決心', 'kesshin — determination')],
  },
  {
    character: '判断', romaji: 'handan', meaning: 'judgment; decision',
    sentence: '最終的な＿＿は社長に任せる。',
    sentenceTranslation: 'We will leave the final decision to the company president.',
    distractors: [alt('横断', 'oudan — crossing'), alt('半分', 'hanbun — half'), alt('診断', 'shindan — diagnosis')],
  },
  {
    character: '維持', romaji: 'iji', meaning: 'maintenance; upkeep',
    sentence: '健康を＿＿するために毎日運動している。',
    sentenceTranslation: 'I exercise every day to maintain my health.',
    distractors: [alt('意地', 'iji — stubbornness, pride (same reading!)'), alt('支持', 'shiji — support, backing'), alt('維新', 'ishin — restoration')],
  },
  {
    character: '構造', romaji: 'kouzou', meaning: 'structure',
    sentence: 'この建物の＿＿は地震に強い。',
    sentenceTranslation: "This building's structure is strong against earthquakes.",
    distractors: [alt('講座', 'kouza — course, lecture series'), alt('製造', 'seizou — manufacturing'), alt('構想', 'kousou — concept, plan')],
  },
  {
    character: '状況', romaji: 'joukyou', meaning: 'situation; circumstances',
    sentence: '現在の＿＿を詳しく説明してください。',
    sentenceTranslation: 'Please explain the current situation in detail.',
    distractors: [alt('上京', 'joukyou — moving to Tokyo (same reading!)'), alt('招待', 'shoutai — invitation'), alt('賞状', 'shoujou — certificate of merit')],
  },
  {
    character: '尊重', romaji: 'sonchou', meaning: 'respect; esteem',
    sentence: 'お互いの意見を＿＿することが大切だ。',
    sentenceTranslation: "It is important to respect each other's opinions.",
    distractors: [alt('村長', 'sonchou — village mayor (same reading!)'), alt('貴重', 'kichou — precious, valuable'), alt('慎重', 'shinchou — careful, cautious')],
  },
  {
    character: '把握', romaji: 'haaku', meaning: 'grasp; understanding',
    sentence: 'まず全体の状況を＿＿する必要がある。',
    sentenceTranslation: 'First, we need to grasp the overall situation.',
    distractors: [alt('握手', 'akushu — handshake'), alt('拍手', 'hakushu — applause'), alt('波紋', 'hamon — ripple')],
  },
  {
    character: '抽象', romaji: 'chuushou', meaning: 'abstraction',
    sentence: '彼の説明は＿＿的で、よく分からなかった。',
    sentenceTranslation: "His explanation was abstract, so I didn't really understand it.",
    distractors: [alt('中傷', 'chuushou — slander (same reading!)'), alt('抽選', 'chuusen — lottery, drawing'), alt('現象', 'genshou — phenomenon')],
  },
  {
    character: '促進', romaji: 'sokushin', meaning: 'promotion; acceleration',
    sentence: '政府は地域経済の発展を＿＿する政策を発表した。',
    sentenceTranslation: 'The government announced a policy to promote regional economic development.',
    distractors: [alt('催促', 'saisoku — urging, a reminder to pay'), alt('前進', 'zenshin — moving forward'), alt('昇進', 'shoushin — promotion in rank')],
  },
  {
    character: '矛盾', romaji: 'mujun', meaning: 'contradiction',
    sentence: '彼の話には＿＿がある。',
    sentenceTranslation: 'There is a contradiction in what he says.',
    distractors: [alt('矛先', 'hokosaki — spearhead, brunt'), alt('単純', 'tanjun — simple'), alt('予定', 'yotei — plan, schedule')],
  },
  {
    character: '衝突', romaji: 'shoutotsu', meaning: 'collision; clash',
    sentence: '交差点で車同士が＿＿した。',
    sentenceTranslation: 'Two cars collided at the intersection.',
    distractors: [alt('衝動', 'shoudou — impulse'), alt('突破', 'toppa — breakthrough'), alt('突然', 'totsuzen — suddenly')],
  },
  {
    character: '依頼', romaji: 'irai', meaning: 'request',
    sentence: '専門家に調査を＿＿した。',
    sentenceTranslation: 'We asked an expert to carry out an investigation.',
    distractors: [alt('以来', 'irai — since (same reading!)'), alt('信頼', 'shinrai — trust'), alt('依存', 'izon — dependence')],
  },
  {
    character: '貢献', romaji: 'kouken', meaning: 'contribution',
    sentence: '彼女は医学の発展に大きく＿＿した。',
    sentenceTranslation: 'She contributed greatly to the advancement of medicine.',
    distractors: [alt('献立', 'kondate — menu'), alt('効果', 'kouka — effect'), alt('後見', 'kouken — guardianship (same reading!)')],
  },
  {
    character: '慎重', romaji: 'shinchou', meaning: 'careful; cautious',
    sentence: '大事な決定なので、＿＿に考えたい。',
    sentenceTranslation: 'It is an important decision, so I want to think it over carefully.',
    distractors: [alt('身長', 'shinchou — height (same reading!)'), alt('貴重', 'kichou — precious, valuable'), alt('尊重', 'sonchou — respect')],
  },
  {
    character: '傾向', romaji: 'keikou', meaning: 'tendency; trend',
    sentence: '最近、若者の読書離れの＿＿が見られる。',
    sentenceTranslation: 'Recently there is a trend of young people reading less.',
    distractors: [alt('携行', 'keikou — carrying (same reading!)'), alt('傾斜', 'keisha — slope, incline'), alt('意向', 'ikou — intention')],
  },
  {
    character: '削減', romaji: 'sakugen', meaning: 'reduction; cut',
    sentence: '会社はコストの＿＿に取り組んでいる。',
    sentenceTranslation: 'The company is working on cutting costs.',
    distractors: [alt('添削', 'tensaku — correcting written work'), alt('増減', 'zougen — rise and fall'), alt('減点', 'genten — deducting points')],
  },
  {
    character: '普及', romaji: 'fukyuu', meaning: 'spread; becoming widespread',
    sentence: 'スマートフォンの＿＿で生活が大きく変わった。',
    sentenceTranslation: 'Life changed dramatically with the spread of smartphones.',
    distractors: [alt('不朽', 'fukyuu — everlasting (same reading!)'), alt('普通', 'futsuu — ordinary'), alt('追及', 'tsuikyuu — pursuit, inquiry')],
  },
  {
    character: '推測', romaji: 'suisoku', meaning: 'guess; conjecture',
    sentence: '彼の表情から、答えを＿＿した。',
    sentenceTranslation: 'I guessed the answer from his expression.',
    distractors: [alt('推薦', 'suisen — recommendation'), alt('観測', 'kansoku — observation'), alt('測定', 'sokutei — measurement')],
  },
  {
    character: '偏見', romaji: 'henken', meaning: 'prejudice',
    sentence: '外国人に対する＿＿をなくしたい。',
    sentenceTranslation: 'I want to get rid of prejudice against foreigners.',
    distractors: [alt('編集', 'henshuu — editing'), alt('発見', 'hakken — discovery'), alt('返事', 'henji — reply')],
  },
];

// ---------------------------------------------------------------------------
// Build Item rows
// ---------------------------------------------------------------------------

/** @returns {object[]} rows ready for Item.bulkCreate */
export function buildKanjiItems() {
  const rows = [];
  let order = 0;
  const push = (row) => rows.push({ type: 'Kanji', sortOrder: order++, ...row });

  for (const kanji of N5) {
    push({ level: 'Beginner', category: 'kanji', note: null, ...kanji });
  }
  for (const kanji of N4_N3_KANJI) {
    push({
      level: 'Intermediate',
      category: 'kanji',
      romaji: kanji.onyomi[0],
      note: null,
      ...kanji,
    });
  }
  for (const jukugo of N4_N3_JUKUGO) {
    push({ level: 'Intermediate', category: 'jukugo', ...jukugo });
  }
  for (const entry of N2_N1) {
    push({ level: 'Expert', category: 'sentence', note: null, ...entry });
  }
  return rows;
}

export const KANJI_COUNTS = {
  beginner: N5.length,
  intermediateKanji: N4_N3_KANJI.length,
  intermediateJukugo: N4_N3_JUKUGO.length,
  expert: N2_N1.length,
};
