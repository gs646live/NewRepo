import { Link } from 'react-router';
import { ArrowLeft, Refresh, Speaker } from './icons.jsx';
import { speak, useJapaneseVoice } from '../lib/speech.js';

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-murasaki-600" role="status">
      <span className="font-jp text-5xl animate-pulse">紫</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center animate-fade-up" role="alert">
      <p className="font-jp text-4xl text-plum-500">困</p>
      <h2 className="mt-3 text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-murasaki-700">{error?.message ?? 'Please try again.'}</p>
      {onRetry && (
        <button type="button" className="btn-primary mt-6" onClick={onRetry}>
          <Refresh width={16} height={16} /> Try again
        </button>
      )}
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-lg py-1 text-sm font-medium text-murasaki-600 transition hover:text-murasaki-900"
    >
      <ArrowLeft width={16} height={16} />
      {children}
    </Link>
  );
}

/** Circular progress indicator, value 0–100. */
export function ProgressRing({ value = 0, size = 56, stroke = 6, children, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={label ?? `${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="fill-none stroke-murasaki-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="fill-none stroke-murasaki-800 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-murasaki-800">
        {children ?? `${value}%`}
      </span>
    </div>
  );
}

export function Pill({ children, tone = 'soft' }) {
  const tones = {
    soft: 'bg-murasaki-100 text-murasaki-800',
    solid: 'bg-murasaki-800 text-white',
    outline: 'border border-murasaki-200 text-murasaki-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** "Listen" button using the device's Japanese voice; hidden when there is none. */
export function ListenButton({ text, className = '' }) {
  const available = useJapaneseVoice();
  if (!available || !text) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-murasaki-700 transition hover:bg-murasaki-100 ${className}`}
      aria-label={`Listen to ${text}`}
    >
      <Speaker width={16} height={16} /> Listen
    </button>
  );
}

export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-murasaki-100 p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              selected ? 'bg-white text-murasaki-900 shadow-sm' : 'text-murasaki-600 hover:text-murasaki-900'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
