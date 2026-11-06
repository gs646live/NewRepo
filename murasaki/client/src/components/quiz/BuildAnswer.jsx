import { useEffect, useState } from 'react';
import { Backspace } from '../icons.jsx';

/**
 * Word building: tap kana tiles in order to spell the word.
 * Backspace removes the last tile, Enter checks.
 */
export default function BuildAnswer({ question, result, onAnswer }) {
  const [picked, setPicked] = useState([]); // tile ids in order
  const answered = Boolean(result);
  const tileById = new Map(question.tiles.map((tile) => [tile.id, tile]));
  const built = picked.map((id) => tileById.get(id).text).join('');

  const add = (id) => !answered && setPicked((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const removeAt = (index) => !answered && setPicked((prev) => prev.filter((_, i) => i !== index));
  const undo = () => !answered && setPicked((prev) => prev.slice(0, -1));
  const clear = () => !answered && setPicked([]);
  const check = () => {
    if (answered || picked.length === 0) return;
    onAnswer({ correct: built === question.answer, given: built, givenLabel: built });
  };

  useEffect(() => {
    if (answered) return undefined;
    const onKey = (event) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        undo();
      } else if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
        event.preventDefault();
        check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  let slotState = 'border-murasaki-200 bg-murasaki-50';
  if (answered && result.correct) slotState = 'border-murasaki-700 bg-murasaki-50 ring-4 ring-murasaki-200 animate-glow';
  if (answered && !result.correct) slotState = 'border-plum-500 bg-plum-50 animate-shake';

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <div
        className={`flex min-h-[5.5rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 transition ${slotState}`}
        aria-live="polite"
        aria-label={`Your word: ${built || 'empty'}`}
      >
        {picked.length === 0 && <span className="text-sm text-murasaki-400">Tap the tiles below in order</span>}
        {picked.map((id, index) => (
          <button
            key={id}
            type="button"
            onClick={() => removeAt(index)}
            disabled={answered}
            className={`flex h-14 min-w-14 items-center justify-center rounded-xl px-2 font-jp text-3xl shadow-sm transition animate-pop disabled:cursor-default ${
              answered && !result.correct ? 'bg-white text-plum-700' : 'bg-murasaki-800 text-white'
            }`}
            aria-label={`Remove ${tileById.get(id).text}`}
          >
            {tileById.get(id).text}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {question.tiles.map((tile) => {
          const used = picked.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => add(tile.id)}
              disabled={used || answered}
              className={`flex h-16 min-w-16 items-center justify-center rounded-2xl border-2 px-2 font-jp text-3xl transition ${
                used
                  ? 'border-dashed border-murasaki-200 bg-transparent text-transparent'
                  : 'border-murasaki-100 bg-white text-murasaki-900 shadow-sm hover:-translate-y-0.5 hover:border-murasaki-400 disabled:opacity-45'
              }`}
              aria-label={used ? `${tile.text} (used)` : tile.text}
            >
              {tile.text}
            </button>
          );
        })}
      </div>

      {!answered && (
        <div className="flex justify-center gap-2">
          <button type="button" className="btn-ghost" onClick={undo} disabled={picked.length === 0}>
            <Backspace width={16} height={16} /> Undo
          </button>
          <button type="button" className="btn-ghost" onClick={clear} disabled={picked.length === 0}>
            Clear
          </button>
          <button type="button" className="btn-primary px-8" onClick={check} disabled={picked.length === 0}>
            Check
          </button>
        </div>
      )}
    </div>
  );
}
