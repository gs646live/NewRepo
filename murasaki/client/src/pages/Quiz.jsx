import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import {
  ALPHABETS,
  LEVELS,
  DEFAULT_QUESTION_COUNT,
  MAX_QUESTION_COUNT,
} from '@murasaki/shared/constants';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import { useUser } from '../context/UserContext.jsx';
import { BackLink, ErrorState, Spinner } from '../components/ui.jsx';
import PromptDisplay from '../components/quiz/PromptDisplay.jsx';
import ChoiceAnswers from '../components/quiz/ChoiceAnswers.jsx';
import InputAnswer from '../components/quiz/InputAnswer.jsx';
import BuildAnswer from '../components/quiz/BuildAnswer.jsx';
import TimerBar from '../components/quiz/TimerBar.jsx';
import FeedbackPanel from '../components/quiz/FeedbackPanel.jsx';
import Results from '../components/quiz/Results.jsx';
import NotFound from './NotFound.jsx';

const ANSWER_WIDGETS = { choice: ChoiceAnswers, input: InputAnswer, build: BuildAnswer };

function parseCount(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return DEFAULT_QUESTION_COUNT;
  return Math.min(value, MAX_QUESTION_COUNT);
}

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function Quiz() {
  const { alphabet, level } = useParams();
  const [searchParams] = useSearchParams();
  const count = parseCount(searchParams.get('count'));
  const valid = Boolean(ALPHABETS[alphabet] && LEVELS[level]);
  const { recordSession, username } = useUser();

  const { data, error, loading, reload } = useAsync(
    (signal) => (valid ? api.lesson(alphabet, level, { count, signal }) : Promise.resolve(null)),
    [alphabet, level, count, valid],
  );

  // A "run" is one pass through a list of questions: a full session, or a
  // review round of the questions missed in the previous run.
  const [run, setRun] = useState(null);
  const runIdRef = useRef(0);

  const startRun = useCallback((questions, isRetry) => {
    runIdRef.current += 1;
    setRun({
      id: runIdRef.current,
      questions,
      isRetry,
      index: 0,
      results: [],
      startedAt: Date.now(),
      finishedAt: null,
      saveState: 'idle',
    });
  }, []);

  useEffect(() => {
    if (data?.questions) startRun(data.questions, false);
  }, [data, startRun]);

  const answer = useCallback((outcome) => {
    setRun((current) => {
      if (!current || current.finishedAt || current.results[current.index]) return current;
      const results = [...current.results];
      results[current.index] = { question: current.questions[current.index], ...outcome };
      return { ...current, results };
    });
  }, []);

  const next = useCallback(() => {
    setRun((current) => {
      if (!current) return current;
      if (current.index + 1 < current.questions.length) return { ...current, index: current.index + 1 };
      return { ...current, finishedAt: Date.now() };
    });
  }, []);

  // Save each finished full session exactly once (review rounds don't count).
  const savedRunIdRef = useRef(0);
  useEffect(() => {
    if (!run?.finishedAt || run.isRetry || savedRunIdRef.current === run.id) return;
    savedRunIdRef.current = run.id;
    const setSaveState = (saveState) =>
      setRun((current) => (current?.id === run.id ? { ...current, saveState } : current));

    if (!username) {
      setSaveState('guest');
      return;
    }
    setSaveState('saving');
    recordSession({
      alphabet,
      level,
      correct: run.results.filter((r) => r.correct).length,
      total: run.results.length,
      durationMs: run.finishedAt - run.startedAt,
      missed: run.results.filter((r) => !r.correct).map((r) => r.question.source.character),
    })
      .then(() => setSaveState('saved'))
      .catch(() => setSaveState('error'));
  }, [run, username, recordSession, alphabet, level]);

  if (!valid) return <NotFound />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !data || !run) return <Spinner label="Preparing your session…" />;
  if (run.questions.length === 0) {
    return <ErrorState error={{ message: 'This level has no questions yet.' }} />;
  }

  const header = (
    <div className="mb-5 flex items-center justify-between gap-4">
      <BackLink to={`/${alphabet}`}>{data.mode.name}</BackLink>
      <p className="text-right text-sm font-semibold text-murasaki-700">
        {data.mode.name} · {LEVELS[level]}
        {run.isRetry && <span className="ml-2 rounded-full bg-murasaki-100 px-2 py-0.5 text-xs">Review</span>}
      </p>
    </div>
  );

  if (run.finishedAt) {
    return (
      <>
        {header}
        <Results
          alphabet={alphabet}
          level={level}
          results={run.results}
          durationMs={run.finishedAt - run.startedAt}
          saveState={run.saveState}
          isRetry={run.isRetry}
          onRestart={reload}
          onRetryMissed={() =>
            startRun(
              shuffle(run.results.filter((r) => !r.correct).map((r) => r.question)),
              true,
            )
          }
        />
      </>
    );
  }

  const question = run.questions[run.index];
  const result = run.results[run.index];
  const score = run.results.filter((r) => r?.correct).length;
  const Widget = ANSWER_WIDGETS[question.kind];
  const progress = ((run.index + (result ? 1 : 0)) / run.questions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl">
      {header}

      <div className="mb-4 flex items-center gap-4">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-white"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={run.questions.length}
          aria-valuenow={run.index + 1}
          aria-label="Session progress"
        >
          <div className="h-full rounded-full bg-murasaki-800 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm font-semibold text-murasaki-700 tabular-nums">
          {run.index + 1}/{run.questions.length}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-murasaki-800 tabular-nums shadow-sm">
          ★ {score}
        </span>
      </div>

      <article
        key={`${run.id}:${question.id}`}
        className={`card p-5 sm:p-8 animate-fade-up transition-shadow ${
          result?.correct ? 'ring-2 ring-murasaki-300 animate-glow' : ''
        }`}
        aria-live="polite"
      >
        <p className="eyebrow text-center">{question.instruction}</p>

        {question.timeLimit && (
          <div className="mx-auto mt-4 max-w-sm">
            <TimerBar
              key={`${run.id}:${question.id}`}
              seconds={question.timeLimit}
              running={!result}
              onExpire={() => answer({ correct: false, given: null, timedOut: true })}
            />
          </div>
        )}

        <div className="py-6 sm:py-12">
          <PromptDisplay question={question} answered={Boolean(result)} />
        </div>

        <Widget key={`${run.id}:${question.id}`} question={question} result={result} onAnswer={answer} />

        {!result && question.kind === 'choice' && (
          <p className="mt-5 hidden text-center text-xs text-murasaki-400 sm:block">
            Tip: press 1–{question.choices.length} to answer, Enter to continue.
          </p>
        )}

        {result && (
          <FeedbackPanel
            question={question}
            result={result}
            isLast={run.index + 1 === run.questions.length}
            onNext={next}
          />
        )}
      </article>
    </div>
  );
}
