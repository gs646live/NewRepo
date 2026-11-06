import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ALPHABETS, progressKey } from '@murasaki/shared/constants';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { readLocal, writeLocal } from '../lib/storage.js';
import { useUser } from '../context/UserContext.jsx';
import { BackLink, ErrorState, Pill, ProgressRing, SegmentedControl, Spinner } from '../components/ui.jsx';
import { Book, Check, Play } from '../components/icons.jsx';
import NotFound from './NotFound.jsx';

const COUNT_KEY = 'murasaki:question-count';
const COUNT_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
];
const LEVEL_GLYPHS = { beginner: '初', intermediate: '中', expert: '上' };

export default function LevelSelect() {
  const { alphabet } = useParams();
  const { data, error, loading, reload } = useAsync(() => api.catalog(), []);
  const { progress } = useUser();
  const [count, setCount] = useState(() => readLocal(COUNT_KEY, 10));

  if (!ALPHABETS[alphabet]) return <NotFound />;
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const mode = data.modes.find((m) => m.slug === alphabet);

  const chooseCount = (value) => {
    setCount(value);
    writeLocal(COUNT_KEY, value);
  };

  return (
    <div className="space-y-8">
      <BackLink to="/">All modes</BackLink>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-murasaki-800 font-jp text-5xl text-white shadow-lift">
            {mode.glyph}
          </span>
          <div>
            <p className="eyebrow">Practice mode</p>
            <h1 className="text-3xl font-bold text-murasaki-900 sm:text-4xl">
              {mode.name} <span className="font-jp text-2xl font-normal text-murasaki-500">{mode.native}</span>
            </h1>
            <p className="mt-1 text-sm text-murasaki-700">{mode.description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-xs font-semibold text-murasaki-600">Questions per session</span>
          <SegmentedControl options={COUNT_OPTIONS} value={count} onChange={chooseCount} label="Questions per session" />
        </div>
      </header>

      <ol className="grid gap-4 lg:grid-cols-3">
        {mode.levels.map((level, index) => (
          <LevelCard
            key={level.slug}
            alphabet={alphabet}
            level={level}
            index={index}
            count={count}
            entry={progress[progressKey(alphabet, level.slug)]}
          />
        ))}
      </ol>
    </div>
  );
}

function LevelCard({ alphabet, level, index, count, entry }) {
  return (
    <li
      className="card flex flex-col p-6 animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-murasaki-100 font-jp text-2xl text-murasaki-800">
            {LEVEL_GLYPHS[level.slug]}
          </span>
          <div>
            <p className="text-xs font-semibold text-murasaki-500">Level {index + 1}</p>
            <h2 className="text-lg font-bold text-murasaki-900">{level.name}</h2>
          </div>
        </div>
        {entry ? (
          <ProgressRing value={entry.bestAccuracy} size={52} label={`Best accuracy ${entry.bestAccuracy}%`} />
        ) : (
          level.jlpt && <Pill tone="outline">JLPT {level.jlpt}</Pill>
        )}
      </div>

      <h3 className="mt-5 font-semibold text-murasaki-900">{level.title}</h3>
      <p className="mt-1 text-sm text-murasaki-700">{level.description}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills practised">
        {level.skills.map((skill) => (
          <li key={skill}>
            <Pill>{skill}</Pill>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="mb-4 flex items-center justify-between text-xs text-murasaki-500">
          <span>{level.itemCount} items</span>
          {entry && (
            <span className="inline-flex items-center gap-1">
              {entry.completed && <Check width={14} height={14} className="text-murasaki-700" />}
              {entry.completed ? 'Completed' : 'In progress'} · {entry.attempts}{' '}
              {entry.attempts === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/${alphabet}/${level.slug}?count=${count}`} className="btn-primary flex-1">
            <Play width={16} height={16} /> Start
          </Link>
          <Link to={`/${alphabet}/${level.slug}/study`} className="btn-secondary" aria-label={`Study ${level.name} list`}>
            <Book width={16} height={16} /> Study
          </Link>
        </div>
      </div>
    </li>
  );
}
