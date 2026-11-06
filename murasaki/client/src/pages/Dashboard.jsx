import { Link } from 'react-router';
import { progressKey } from '@murasaki/shared/constants';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { useUser } from '../context/UserContext.jsx';
import { ErrorState, ProgressRing, Spinner } from '../components/ui.jsx';
import { ArrowRight } from '../components/icons.jsx';

export default function Dashboard() {
  const { data, error, loading, reload } = useAsync(() => api.catalog(), []);
  const { username, progress, openNameDialog } = useUser();

  return (
    <div className="space-y-10 sm:space-y-14">
      <Hero username={username} onSetName={openNameDialog} />

      <section aria-labelledby="modes-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Step 1</p>
            <h2 id="modes-heading" className="mt-1 text-2xl font-bold text-murasaki-900">
              Choose a practice mode
            </h2>
          </div>
        </div>

        {loading && !data && <Spinner label="Loading lessons…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {data.modes.map((mode, index) => (
              <ModeCard key={mode.slug} mode={mode} progress={progress} index={index} />
            ))}
          </div>
        )}
      </section>

      <HowItWorks />
    </div>
  );
}

function Hero({ username, onSetName }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-murasaki-800 px-6 py-10 text-white shadow-lift sm:px-12 sm:py-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-6 font-jp text-[14rem] leading-none text-white/[0.07] select-none sm:-top-16 sm:right-6 sm:text-[20rem]"
      >
        紫
      </span>
      <div className="relative max-w-xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-murasaki-200 uppercase">
          {username ? `おかえり, ${username}` : 'ようこそ · Welcome'}
        </p>
        <h1 className="mt-3 text-3xl leading-tight font-bold sm:text-5xl">
          Learn Japanese,
          <br />
          one character at a time.
        </h1>
        <p className="mt-4 text-base text-murasaki-100 sm:text-lg">
          Read the 46 kana, master voiced sounds and look-alikes, then take on kanji from JLPT N5 to N1 — with
          instant feedback on every answer.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/hiragana" className="btn bg-white text-murasaki-800 hover:bg-murasaki-50">
            Start with Hiragana <ArrowRight width={16} height={16} />
          </Link>
          {!username && (
            <button
              type="button"
              onClick={onSetName}
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              Save my progress
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ModeCard({ mode, progress, index }) {
  const completed = mode.levels.filter((level) => progress[progressKey(mode.slug, level.slug)]?.completed).length;
  const total = mode.levels.reduce((sum, level) => sum + level.itemCount, 0);

  return (
    <Link
      to={`/${mode.slug}`}
      className="card group relative flex flex-col p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-murasaki-100 font-jp text-5xl text-murasaki-800 transition group-hover:bg-murasaki-800 group-hover:text-white">
          {mode.glyph}
        </span>
        <ProgressRing value={Math.round((completed / 3) * 100)} size={48} stroke={5} label={`${completed} of 3 levels completed`}>
          {completed}/3
        </ProgressRing>
      </div>
      <h3 className="mt-5 text-xl font-bold text-murasaki-900">
        {mode.name} <span className="ml-1 font-jp text-base font-normal text-murasaki-500">{mode.native}</span>
      </h3>
      <p className="mt-2 flex-1 text-sm text-murasaki-700">{mode.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-murasaki-100 pt-4 text-sm">
        <span className="text-murasaki-500">{total} items · 3 levels</span>
        <span className="inline-flex items-center gap-1 font-semibold text-murasaki-800">
          Practice <ArrowRight width={16} height={16} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function HowItWorks() {
  const steps = [
    { glyph: '初', name: 'Beginner', text: 'Recognise characters and their sounds or meanings with multiple choice.' },
    { glyph: '中', name: 'Intermediate', text: 'Voiced sounds, combined sounds, word building and readings in context.' },
    { glyph: '上', name: 'Expert', text: 'Timed look-alike drills, full typing and kanji sentences without furigana.' },
  ];
  return (
    <section aria-labelledby="how-heading" className="card p-6 sm:p-8">
      <p className="eyebrow">Step 2</p>
      <h2 id="how-heading" className="mt-1 text-2xl font-bold text-murasaki-900">
        Climb three levels in every mode
      </h2>
      <ol className="mt-6 grid gap-5 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.name} className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-murasaki-200 font-jp text-2xl text-murasaki-800">
              {step.glyph}
            </span>
            <div>
              <p className="text-sm font-bold text-murasaki-900">
                {index + 1}. {step.name}
              </p>
              <p className="mt-1 text-sm text-murasaki-700">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl bg-murasaki-50 px-4 py-3 text-sm text-murasaki-700">
        Score <strong className="text-murasaki-900">80% or more</strong> in a session to mark a level as completed.
      </p>
    </section>
  );
}
