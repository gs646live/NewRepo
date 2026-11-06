import { useEffect } from 'react';

/**
 * Multiple-choice answers. Keys 1–9 pick an option.
 * After answering: the right option glows violet, a wrong pick shakes in plum.
 */
export default function ChoiceAnswers({ question, result, onAnswer }) {
  const answered = Boolean(result);
  const { choices } = question;

  const choose = (choice) => {
    if (answered) return;
    onAnswer({ correct: choice.value === question.answer, given: choice.value, givenLabel: choice.label });
  };

  useEffect(() => {
    if (answered) return undefined;
    const onKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < choices.length) {
        event.preventDefault();
        choose(choices[index]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const compactJapanese = choices.every((c) => c.lang === 'ja' && [...c.label].length <= 2);
  const shortLabels = choices.every((c) => c.label.length <= 12);
  let grid = 'grid-cols-1 min-[420px]:grid-cols-2';
  if (compactJapanese) grid = 'grid-cols-2 sm:grid-cols-4';
  else if (shortLabels) grid = 'grid-cols-2';

  return (
    <div className={`grid gap-3 ${grid}`}>
      {choices.map((choice, index) => {
        const isAnswer = choice.value === question.answer;
        const isPicked = answered && result.given === choice.value;
        let state = 'border-murasaki-100 bg-white hover:-translate-y-0.5 hover:border-murasaki-400 hover:bg-murasaki-50';
        if (answered) {
          if (isAnswer) {
            state = `border-murasaki-700 bg-murasaki-50 text-murasaki-900 ring-4 ring-murasaki-200 ${isPicked ? 'animate-glow' : ''}`;
          } else if (isPicked) {
            state = 'border-plum-500 bg-plum-50 text-plum-700 animate-shake';
          } else {
            state = 'border-murasaki-100 bg-white opacity-45';
          }
        }
        const labelClass =
          choice.lang === 'ja'
            ? `font-jp ${compactJapanese ? 'text-4xl' : 'text-2xl sm:text-3xl'}`
            : 'text-lg font-semibold';

        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => choose(choice)}
            disabled={answered}
            aria-pressed={isPicked}
            className={`group relative flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl border-2 px-4 py-3 text-center transition duration-150 disabled:cursor-default ${state}`}
          >
            <span className="absolute top-2 left-3 text-[11px] font-semibold text-murasaki-300" aria-hidden>
              {index + 1}
            </span>
            <span lang={choice.lang} className={labelClass}>
              {choice.label}
            </span>
            {choice.sublabel && (
              <span className="mt-0.5 text-[11px] font-semibold tracking-wide text-murasaki-500 uppercase">
                {choice.sublabel}
              </span>
            )}
            {answered && choice.note && (
              <span className="mt-1 text-xs font-medium text-murasaki-600 animate-fade-up">{choice.note}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
