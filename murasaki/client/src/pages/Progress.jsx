import { useState } from 'react';
import { Link } from 'react-router';
import { COMPLETION_THRESHOLD, progressKey } from '@murasaki/shared/constants';
import { hasJapanese } from '@murasaki/shared/kana';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { useUser } from '../context/UserContext.jsx';
import { ErrorState, Pill, ProgressRing, Spinner } from '../components/ui.jsx';
import { Check } from '../components/icons.jsx';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Progress() {
  const { username, progress, status, openNameDialog, resetProgress, reloadProgress } = useUser();
  const catalog = useAsync(() => api.catalog(), []);
  const [confirming, setConfirming] = useState(false);

  if (!username) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center animate-fade-up sm:p-10">
        <p className="font-jp text-5xl text-murasaki-800">記録</p>
        <h1 className="mt-4 text-2xl font-bold text-murasaki-900">Track your progress</h1>
        <p className="mt-2 text-sm text-murasaki-700">
          Choose a nickname and every finished session will be saved: best accuracy, sessions played and the
          characters you missed most recently.
        </p>
        <button type="button" onClick={openNameDialog} className="btn-primary mt-6">
          Choose a nickname
        </button>
      </div>
    );
  }

  if (catalog.error) return <ErrorState error={catalog.error} onRetry={catalog.reload} />;
  if (status === 'error') {
    return <ErrorState error={{ message: 'Could not load your progress.' }} onRetry={reloadProgress} />;
  }
  if (!catalog.data || status === 'loading') return <Spinner label="Loading progress…" />;

  const levels = catalog.data.modes.flatMap((mode) => mode.levels.map((level) => ({ mode, level })));
  const completed = levels.filter(({ mode, level }) => progress[progressKey(mode.slug, level.slug)]?.completed).length;
  const sessions = Object.values(progress).reduce((sum, entry) => sum + entry.attempts, 0);
  const answered = Object.values(progress).reduce((sum, entry) => sum + entry.totalAnswered, 0);
  const correct = Object.values(progress).reduce((sum, entry) => sum + entry.totalCorrect, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your progress</p>
          <h1 className="mt-1 text-3xl font-bold text-murasaki-900">{username}</h1>
        </div>
        <p className="text-sm text-murasaki-600">
          A level is completed once you score {COMPLETION_THRESHOLD}% or more in a session.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Levels completed" value={`${completed}/${levels.length}`} />
        <Stat label="Sessions" value={sessions} />
        <Stat label="Answers" value={answered} />
        <Stat label="Overall accuracy" value={answered ? `${Math.round((correct / answered) * 100)}%` : '—'} />
      </section>

      {catalog.data.modes.map((mode) => (
        <section key={mode.slug} aria-labelledby={`progress-${mode.slug}`}>
          <h2 id={`progress-${mode.slug}`} className="mb-3 flex items-center gap-2 text-lg font-bold text-murasaki-900">
            <span className="font-jp text-2xl text-murasaki-700">{mode.glyph}</span> {mode.name}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {mode.levels.map((level) => (
              <LevelProgress
                key={level.slug}
                mode={mode}
                level={level}
                entry={progress[progressKey(mode.slug, level.slug)]}
              />
            ))}
          </div>
        </section>
      ))}

      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-murasaki-900">Start over</h2>
          <p className="text-sm text-murasaki-700">Erase every saved session for “{username}”. This can’t be undone.</p>
        </div>
        {confirming ? (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => setConfirming(false)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn bg-plum-500 text-white hover:bg-plum-600"
              onClick={async () => {
                await resetProgress();
                setConfirming(false);
              }}
            >
              Erase progress
            </button>
          </div>
        ) : (
          <button type="button" className="btn-secondary" onClick={() => setConfirming(true)}>
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-4 text-center sm:p-5">
      <p className="text-2xl font-bold text-murasaki-900 tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-semibold text-murasaki-500">{label}</p>
    </div>
  );
}

function LevelProgress({ mode, level, entry }) {
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-murasaki-900">{level.name}</p>
          <p className="text-xs text-murasaki-500">{level.title}</p>
        </div>
        <ProgressRing value={entry?.bestAccuracy ?? 0} size={52} label={`Best accuracy ${entry?.bestAccuracy ?? 0}%`} />
      </div>
      {entry ? (
        <div className="mt-4 space-y-2 text-sm text-murasaki-700">
          <div className="flex flex-wrap gap-1.5">
            {entry.completed ? (
              <Pill tone="solid">
                <Check width={12} height={12} /> Completed
              </Pill>
            ) : (
              <Pill tone="outline">In progress</Pill>
            )}
            <Pill>
              {entry.attempts} {entry.attempts === 1 ? 'session' : 'sessions'}
            </Pill>
            <Pill>Last {entry.lastAccuracy}%</Pill>
          </div>
          <p className="text-xs text-murasaki-500">Last played {formatDate(entry.lastPlayedAt)}</p>
          {entry.recentMissed?.length > 0 && (
            <p className="text-xs">
              <span className="text-murasaki-500">Recently missed: </span>
              {entry.recentMissed.map((ch) => (
                <span key={ch} lang="ja" className={`mr-1.5 ${hasJapanese(ch) ? 'font-jp text-sm' : ''} text-murasaki-900`}>
                  {ch}
                </span>
              ))}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-murasaki-500">Not started yet.</p>
      )}
      <Link to={`/${mode.slug}/${level.slug}`} className="btn-secondary mt-4">
        {entry ? 'Practice again' : 'Start'}
      </Link>
    </div>
  );
}
