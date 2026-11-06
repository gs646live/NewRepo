// localStorage wrappers that never throw (private mode, blocked storage…).

export function readLocal(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeLocal(key, value) {
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works, it just won't remember */
  }
}
