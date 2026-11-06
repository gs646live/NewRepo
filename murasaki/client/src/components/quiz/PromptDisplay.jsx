import { useState } from 'react';
import { Lightbulb } from '../icons.jsx';

const BLANK = '＿＿';

const SIZE = {
  ja: {
    xl: 'font-jp text-8xl leading-none sm:text-9xl',
    lg: 'font-jp text-5xl leading-tight sm:text-7xl',
    md: 'font-jp text-2xl leading-relaxed sm:text-3xl',
  },
  en: {
    xl: 'font-sans text-6xl font-bold tracking-tight sm:text-7xl',
    lg: 'font-sans text-4xl font-bold tracking-tight sm:text-5xl',
    md: 'font-sans text-2xl font-semibold',
  },
};

/** The thing being asked about: a character, a word, or a sentence with a blank. */
export default function PromptDisplay({ question, answered }) {
  const { prompt } = question;
  const style = SIZE[prompt.lang]?.[prompt.size] ?? SIZE.ja.lg;

  return (
    <div className="flex flex-col items-center text-center">
      <p
        lang={prompt.lang === 'ja' ? 'ja' : 'en'}
        className={`${style} max-w-full break-words text-murasaki-950`}
      >
        {question.format === 'sentence-blank' ? (
          <Sentence text={prompt.text} fill={answered ? question.answer : null} />
        ) : prompt.highlight ? (
          <Highlighted text={prompt.text} range={prompt.highlight} />
        ) : (
          prompt.text
        )}
      </p>
      {prompt.caption && (
        <p className="mt-4 rounded-full bg-murasaki-50 px-4 py-1 text-sm font-medium text-murasaki-700">
          “{prompt.caption}”
        </p>
      )}
      {question.hint && !answered && <Hint text={question.hint} />}
    </div>
  );
}

function Highlighted({ text, range: [start, end] }) {
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-lg bg-murasaki-100 px-1 text-murasaki-800 underline decoration-murasaki-400 decoration-4 underline-offset-8">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

function Sentence({ text, fill }) {
  const [before, after] = text.split(BLANK);
  return (
    <>
      {before}
      {fill ? (
        <mark className="rounded-md bg-murasaki-100 px-1 text-murasaki-800 animate-pop">{fill}</mark>
      ) : (
        <span
          aria-label="blank"
          className="mx-1 inline-block w-[3.5em] translate-y-1 border-b-4 border-dashed border-murasaki-400 align-baseline"
        >
          &nbsp;
        </span>
      )}
      {after}
    </>
  );
}

function Hint({ text }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <p className="mt-5 max-w-md text-sm text-murasaki-600 italic animate-fade-up">{text}</p>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-murasaki-600 transition hover:bg-murasaki-50"
    >
      <Lightbulb width={14} height={14} /> Show English translation
    </button>
  );
}
