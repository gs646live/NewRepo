import { Link } from 'react-router';
import { COMPLETION_THRESHOLD } from '@murasaki/shared/constants';
import { hasJapanese } from '@murasaki/shared/kana';
import { useUser } from '../../context/UserContext.jsx';
import { ProgressRing } from '../ui.jsx';
import { Book, Check, Refresh } from '../icons.jsx';

function verdict(accuracy) {
  if (accuracy === 100) return { jp: '完璧', en: 'Perfect score!' };
  if (accuracy >= 90) return { jp: '素晴らしい', en: 'Excellent work!' };
  if (accuracy >= COMPLETION_THRESHOLD) return { jp: 'よくできました', en: 'Well done — level passed!' };
  if (accuracy >= 50) return { jp: 'いいね', en: 'Good effort, keep going!' };
  return { jp: 'がんばって', en: 'Keep practising — you’ve got this.' };
}

function formatDuration(ms) {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}

const jpClass = (text) => (hasJapanese(text) ? 'font-jp' : '');

export default function Results({
  alphabet,
  level,
  results,
  durationMs,
  saveState,
  isRetry,
  onRestart,
  onRetryMissed,
}) {
  const { openNameDialog } = useUser();
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const missed = results.filter((r) => !r.correct);
  const { jp, en } = verdict(accuracy);

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <section className="card overflow-hidden">
        <div className="bg-murasaki-800 px-6 py-8 text-center text-white sm:px-10">
          <p className="font-jp text-3xl">{jp}</p>
          <p className="mt-1 text-murasaki-100">{en}</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-murasaki-100 px-2 py-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={accuracy} size={64} stroke={6} label={`Accuracy ${accuracy}%`} />
            <span className="text-xs font-semibold text-murasaki-500">Accuracy</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-murasaki-900 tabular-nums">
              {correct}
              <span className="text-lg text-murasaki-400">/{total}</span>
            </span>
            <span className="mt-1 text-xs font-semibold text-murasaki-500">Correct</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-murasaki-900 tabular-nums">{formatDuration(durationMs)}</span>
            <span className="mt-1 text-xs font-semibold text-murasaki-500">Time</span>
          </div>
        </div>
        <div className="border-t border-murasaki-100 px-6 py-4 text-center text-sm">
          <SaveStatus state={saveState} isRetry={isRetry} onSetName={openNameDialog} />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onRestart} className="btn-primary flex-1">
          <Refresh width={16} height={16} /> New session
        </button>
        {missed.length > 0 && (
          <button type="button" onClick={onRetryMissed} className="btn-secondary flex-1">
            Retry {missed.length} missed
          </button>
        )}
        <Link to={`/${alphabet}/${level}/study`} className="btn-secondary flex-1">
          <Book width={16} height={16} /> Study list
        </Link>
      </div>

      {missed.length > 0 ? (
        <section className="card p-6">
          <h2 className="text-lg font-bold text-murasaki-900">Review what you missed</h2>
          <ul className="mt-4 divide-y divide-murasaki-100">
            {missed.map(({ question, given, timedOut }) => (
              <li key={question.id} className="flex items-center gap-4 py-3">
                <span
                  lang="ja"
                  className="flex h-14 min-w-14 shrink-0 items-center justify-center rounded-xl bg-murasaki-50 px-2 font-jp text-2xl text-murasaki-900"
                >
                  {question.source.character}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-murasaki-900">
                    <span className="text-murasaki-500">Answer </span>
                    <strong className={jpClass(question.answerDisplay)}>{question.answerDisplay}</strong>
                  </p>
                  <p className="truncate text-plum-600">
                    {timedOut ? (
                      'Ran out of time'
                    ) : (
                      <>
                        You chose <span className={jpClass(given)}>{given}</span>
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="card flex items-center justify-center gap-2 p-5 text-sm font-semibold text-murasaki-800">
          <Check width={18} height={18} /> Nothing missed — every answer was right.
        </p>
      )}

      <p className="text-center">
        <Link to={`/${alphabet}`} className="text-sm font-semibold text-murasaki-600 hover:text-murasaki-900">
          Choose another level
        </Link>
      </p>
    </div>
  );
}

function SaveStatus({ state, isRetry, onSetName }) {
  if (isRetry) return <p className="text-murasaki-600">Review rounds aren’t counted towards your progress.</p>;
  switch (state) {
    case 'saving':
      return <p className="text-murasaki-600">Saving your progress…</p>;
    case 'saved':
      return <p className="font-semibold text-murasaki-800">Progress saved.</p>;
    case 'error':
      return <p className="text-plum-600">Couldn’t save progress — check your connection.</p>;
    default:
      return (
        <p className="text-murasaki-600">
          Playing as a guest.{' '}
          <button type="button" onClick={onSetName} className="font-semibold text-murasaki-800 underline underline-offset-4">
            Set a nickname
          </button>{' '}
          to save future sessions.
        </p>
      );
  }
}
