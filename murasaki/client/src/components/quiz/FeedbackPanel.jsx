import { useEffect, useRef } from 'react';
import { hasJapanese } from '@murasaki/shared/kana';
import { ArrowRight, Check, Clock, Cross } from '../icons.jsx';
import { ListenButton } from '../ui.jsx';

/** Shown under the question once it has been answered. */
export default function FeedbackPanel({ question, result, isLast, onNext }) {
  const nextRef = useRef(null);

  useEffect(() => {
    // Focus Next so Enter / Space moves on.
    const timer = setTimeout(() => {
      // On small screens the panel can sit below the fold: bring it into view.
      nextRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      nextRef.current?.focus({ preventScroll: true });
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Enter continues even when focus isn't on the button (focused controls handle it themselves).
    const onKey = (event) => {
      if (event.key !== 'Enter' || event.repeat) return;
      if (['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      event.preventDefault();
      onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext]);

  const { correct, timedOut } = result;
  let title = 'Correct!';
  let jp = '正解';
  let Icon = Check;
  if (!correct) {
    title = timedOut ? "Time's up" : 'Not quite';
    jp = timedOut ? '時間切れ' : '残念';
    Icon = timedOut ? Clock : Cross;
  }

  return (
    <div
      role="status"
      className={`mt-6 rounded-2xl border p-5 animate-fade-up sm:p-6 ${
        correct ? 'border-murasaki-200 bg-murasaki-50' : 'border-plum-100 bg-plum-50'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
              correct ? 'bg-murasaki-800' : 'bg-plum-500'
            }`}
          >
            <Icon width={20} height={20} />
          </span>
          <div className="min-w-0">
            <p className={`font-bold ${correct ? 'text-murasaki-900' : 'text-plum-700'}`}>
              {title} <span className="ml-1 font-jp font-normal opacity-70">{jp}</span>
            </p>
            {!correct && (
              <p className="mt-0.5 text-sm text-murasaki-900">
                Answer:{' '}
                <strong className={hasJapanese(question.answerDisplay) ? 'font-jp text-base' : ''}>
                  {question.answerDisplay}
                </strong>
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-murasaki-700">{question.feedback.explanation}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          <ListenButton text={question.feedback.speak} />
          <button ref={nextRef} type="button" onClick={onNext} className="btn-primary ml-auto sm:ml-0">
            {isLast ? 'See results' : 'Next'} <ArrowRight width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
