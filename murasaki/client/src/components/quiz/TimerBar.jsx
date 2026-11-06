import { useEffect, useRef, useState } from 'react';
import { Clock } from '../icons.jsx';

/** Countdown for timed drills. Calls onExpire once when it reaches zero. */
export default function TimerBar({ seconds, running, onExpire }) {
  const [remaining, setRemaining] = useState(seconds * 1000);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!running) return undefined;
    const endsAt = Date.now() + remaining;
    const timer = setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        expireRef.current?.();
      }
    }, 100);
    return () => clearInterval(timer);
    // Only (re)start when running toggles; `remaining` is read once on start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const fraction = remaining / (seconds * 1000);
  const urgent = fraction < 0.3;

  return (
    <div className="flex items-center gap-3" aria-label={`${Math.ceil(remaining / 1000)} seconds left`}>
      <Clock width={16} height={16} className={urgent && running ? 'text-plum-500' : 'text-murasaki-500'} />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-murasaki-100">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? 'bg-plum-500' : 'bg-murasaki-600'}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span
        className={`w-9 text-right text-sm font-semibold tabular-nums ${urgent && running ? 'text-plum-600' : 'text-murasaki-700'}`}
      >
        {Math.ceil(remaining / 1000)}s
      </span>
    </div>
  );
}
