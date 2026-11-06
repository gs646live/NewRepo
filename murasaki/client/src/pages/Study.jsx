import { Link, useParams } from 'react-router';
import { ALPHABETS, LEVELS } from '@murasaki/shared/constants';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { speak, useJapaneseVoice } from '../lib/speech.js';
import { BackLink, ErrorState, Pill, Spinner } from '../components/ui.jsx';
import { Play } from '../components/icons.jsx';
import NotFound from './NotFound.jsx';

const CATEGORY_LABELS = {
  gojuon: 'Gojūon — the 46 basic characters',
  dakuten: 'Dakuten ゛ — voiced sounds',
  handakuten: 'Handakuten ゜ — p sounds',
  yoon: 'Yōon — combined sounds',
  word: 'Words',
  confusable: 'Look-alike characters',
  typing: 'Typing words',
  kanji: 'Kanji',
  jukugo: 'Jukugo — compound words',
  sentence: 'Advanced vocabulary in context',
};

/** Reference list of every item in a level, grouped by category. */
export default function Study() {
  const { alphabet, level } = useParams();
  const valid = Boolean(ALPHABETS[alphabet] && LEVELS[level]);
  const { data, error, loading, reload } = useAsync(
    (signal) => (valid ? api.lesson(alphabet, level, { count: 0, signal }) : Promise.resolve(null)),
    [alphabet, level, valid],
  );
  const canSpeak = useJapaneseVoice();

  if (!valid) return <NotFound />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data) return <Spinner label="Loading study list…" />;

  const groups = [];
  for (const item of data.items) {
    let group = groups.find((g) => g.category === item.category);
    if (!group) groups.push((group = { category: item.category, items: [] }));
    group.items.push(item);
  }

  return (
    <div className="space-y-8">
      <BackLink to={`/${alphabet}`}>{data.mode.name}</BackLink>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Study list · {LEVELS[level]}</p>
          <h1 className="mt-1 text-3xl font-bold text-murasaki-900">{data.task.title}</h1>
          <p className="mt-1 max-w-xl text-sm text-murasaki-700">{data.task.summary}</p>
        </div>
        <Link to={`/${alphabet}/${level}`} className="btn-primary self-start sm:self-auto">
          <Play width={16} height={16} /> Practice this level
        </Link>
      </header>

      {groups.map((group) => (
        <section key={group.category} aria-labelledby={`group-${group.category}`}>
          <h2 id={`group-${group.category}`} className="mb-3 flex items-center gap-2 text-lg font-bold text-murasaki-900">
            {CATEGORY_LABELS[group.category] ?? group.category}
            <Pill>{group.items.length}</Pill>
          </h2>
          <ul className={gridFor(group.category)}>
            {group.items.map((item) => (
              <StudyCard key={item.id} item={item} canSpeak={canSpeak} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function gridFor(category) {
  if (['gojuon', 'dakuten', 'handakuten', 'yoon', 'confusable'].includes(category)) {
    return 'grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8';
  }
  if (category === 'sentence') return 'grid gap-3 md:grid-cols-2';
  return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4';
}

function StudyCard({ item, canSpeak }) {
  const spoken = item.category === 'sentence' ? item.sentence.replace('＿＿', item.character) : item.character;
  const listen = canSpeak && item.type !== 'Kanji' ? () => speak(spoken) : null;

  if (['gojuon', 'dakuten', 'handakuten', 'yoon', 'confusable'].includes(item.category)) {
    const Tag = listen ? 'button' : 'div';
    return (
      <li>
        <Tag
          type={listen ? 'button' : undefined}
          onClick={listen ?? undefined}
          title={item.note ?? undefined}
          className="card flex w-full flex-col items-center py-3 transition hover:bg-murasaki-50"
        >
          <span lang="ja" className="font-jp text-3xl text-murasaki-900">
            {item.character}
          </span>
          <span className="mt-1 text-xs font-semibold text-murasaki-600">{item.romaji}</span>
          {item.confusableWith?.length > 0 && (
            <span lang="ja" className="mt-1 font-jp text-xs text-murasaki-400">
              ≠ {item.confusableWith.join(' ')}
            </span>
          )}
        </Tag>
      </li>
    );
  }

  if (item.category === 'sentence') {
    return (
      <li className="card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span lang="ja" className="font-jp text-3xl text-murasaki-900">
            {item.character}
          </span>
          <span className="text-sm text-murasaki-600">
            {item.romaji} · {item.meaning}
          </span>
        </div>
        <p lang="ja" className="mt-3 font-jp text-lg text-murasaki-900">
          {spoken}
        </p>
        <p className="mt-1 text-sm text-murasaki-600">{item.sentenceTranslation}</p>
      </li>
    );
  }

  return (
    <li className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span lang="ja" className="font-jp text-4xl text-murasaki-900">
          {item.character}
        </span>
        {listen && (
          <button
            type="button"
            onClick={listen}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-murasaki-600 hover:bg-murasaki-100"
            aria-label={`Listen to ${item.character}`}
          >
            ▶
          </button>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-murasaki-800">
        {item.category === 'kanji' && item.level !== 'Beginner' ? item.meaning : item.romaji}
      </p>
      {item.category === 'kanji' && item.level === 'Beginner' && (
        <p className="text-sm text-murasaki-700">{item.meaning}</p>
      )}
      {item.category !== 'kanji' && item.meaning && <p className="text-sm text-murasaki-700">{item.meaning}</p>}
      {item.category === 'kanji' && (
        <dl className="mt-2 space-y-0.5 text-xs text-murasaki-600">
          <div className="flex gap-1">
            <dt className="font-semibold">On</dt>
            <dd>{item.onyomi.join(', ') || '—'}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-semibold">Kun</dt>
            <dd>{item.kunyomi.join(', ') || '—'}</dd>
          </div>
        </dl>
      )}
      {item.examples?.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-murasaki-100 pt-2 text-xs text-murasaki-700">
          {item.examples.map((example) => (
            <li key={example.word}>
              <span lang="ja" className="font-jp text-sm text-murasaki-900">
                {example.word}
              </span>{' '}
              {example.romaji} — {example.meaning}
            </li>
          ))}
        </ul>
      )}
      {item.note && item.category === 'jukugo' && <p className="mt-2 text-xs text-murasaki-500">{item.note}</p>}
    </li>
  );
}
