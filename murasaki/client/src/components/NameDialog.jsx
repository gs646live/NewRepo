import { useEffect, useRef, useState } from 'react';
import { useUser } from '../context/UserContext.jsx';

const PATTERN = /^[\p{L}\p{N}_-]{2,32}$/u;

/** Modal for choosing the nickname that progress is saved under. */
export default function NameDialog() {
  const { username, setUsername, nameDialogOpen, closeNameDialog } = useUser();
  const [value, setValue] = useState(username ?? '');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  // Reset the field each time the dialog opens.
  useEffect(() => {
    if (!nameDialogOpen) return undefined;
    setValue(username ?? '');
    setTouched(false);
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameDialogOpen]);

  useEffect(() => {
    if (!nameDialogOpen) return undefined;
    const onKey = (event) => event.key === 'Escape' && closeNameDialog();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nameDialogOpen, closeNameDialog]);

  if (!nameDialogOpen) return null;

  const valid = PATTERN.test(value.trim());

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!valid) return;
    setUsername(value);
    closeNameDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-murasaki-950/40 p-4 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={closeNameDialog} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-dialog-title"
        className="card relative w-full max-w-md p-6 animate-pop sm:p-8"
      >
        <p className="eyebrow">Save your progress</p>
        <h2 id="name-dialog-title" className="mt-2 text-2xl font-bold text-murasaki-900">
          What should we call you?
        </h2>
        <p className="mt-2 text-sm text-murasaki-700">
          Pick a nickname — no password needed. Use the same one on any device to pick up where you left off.
        </p>
        <label className="mt-6 block text-sm font-semibold text-murasaki-800" htmlFor="nickname">
          Nickname
        </label>
        <input
          ref={inputRef}
          id="nickname"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => setTouched(true)}
          autoComplete="nickname"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={32}
          placeholder="e.g. hana"
          aria-invalid={touched && !valid}
          aria-describedby="nickname-help"
          className="mt-2 w-full rounded-xl border border-murasaki-200 bg-murasaki-50 px-4 py-3 text-base text-murasaki-950 outline-none transition placeholder:text-murasaki-300 focus:border-murasaki-600 focus:bg-white focus:ring-4 focus:ring-murasaki-100"
        />
        <p id="nickname-help" className={`mt-2 text-xs ${touched && !valid ? 'text-plum-600' : 'text-murasaki-500'}`}>
          2–32 characters: letters (any script), numbers, “_” or “-”.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {username && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setUsername(null);
                closeNameDialog();
              }}
            >
              Continue as guest
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={closeNameDialog}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save nickname
          </button>
        </div>
      </form>
    </div>
  );
}
