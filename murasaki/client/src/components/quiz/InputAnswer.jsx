import { useEffect, useRef, useState } from 'react';
import { isRomajiMatch } from '@murasaki/shared/romaji';

/**
 * Free typing in romaji. Hepburn and Kunrei spellings are both accepted
 * (shi/si, tsu/tu, ō/ou…), but long vowels and double consonants must be right.
 */
export default function InputAnswer({ question, result, onAnswer }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const answered = Boolean(result);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (answered || !value.trim()) return;
    onAnswer({ correct: isRomajiMatch(value, question.answer), given: value.trim(), givenLabel: value.trim() });
  };

  let state = 'border-murasaki-200 focus:border-murasaki-600 focus:ring-4 focus:ring-murasaki-100';
  if (answered && result.correct) state = 'border-murasaki-700 ring-4 ring-murasaki-200 animate-glow';
  if (answered && !result.correct) state = 'border-plum-500 bg-plum-50 text-plum-700 animate-shake';

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="romaji-input" className="sr-only">
        Romaji answer
      </label>
      <input
        id="romaji-input"
        ref={inputRef}
        value={answered ? (result.given ?? '') : value}
        onChange={(event) => setValue(event.target.value)}
        disabled={answered}
        placeholder="Type in romaji…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="done"
        lang="en"
        className={`min-w-0 flex-1 rounded-2xl border-2 bg-white px-5 py-4 text-center text-2xl font-semibold tracking-wide text-murasaki-950 outline-none transition placeholder:text-base placeholder:font-medium placeholder:text-murasaki-300 disabled:opacity-100 ${state} ${answered && !result.correct ? 'line-through decoration-2' : ''}`}
      />
      {!answered && (
        <button type="submit" className="btn-primary px-7 py-4 text-base" disabled={!value.trim()}>
          Check
        </button>
      )}
    </form>
  );
}
