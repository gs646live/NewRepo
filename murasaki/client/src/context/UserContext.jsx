import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { readLocal, writeLocal } from '../lib/storage.js';

const STORAGE_KEY = 'murasaki:username';
const UserContext = createContext(null);

/**
 * Holds the learner's nickname (remembered in localStorage) and their saved
 * progress from the API. Without a nickname the app runs in guest mode and
 * nothing is saved.
 */
export function UserProvider({ children }) {
  const [username, setUsernameState] = useState(() => readLocal(STORAGE_KEY));
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [nameDialogOpen, setNameDialogOpen] = useState(false);

  const loadProgress = useCallback(async (name, signal) => {
    if (!name) {
      setProgress({});
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const data = await api.progress(name, { signal });
      setProgress(data.progress ?? {});
      setStatus('ready');
    } catch (error) {
      if (error.name === 'AbortError') return;
      // 404 just means this learner hasn't finished a session yet.
      setProgress({});
      setStatus(error.status === 404 ? 'ready' : 'error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProgress(username, controller.signal);
    return () => controller.abort();
  }, [username, loadProgress]);

  const setUsername = useCallback((name) => {
    const clean = name ? name.trim().toLowerCase() : null;
    writeLocal(STORAGE_KEY, clean);
    setUsernameState(clean);
  }, []);

  /** Save a finished quiz. Returns the saved entry, or null in guest mode. */
  const recordSession = useCallback(
    async (session) => {
      if (!username) return null;
      const data = await api.saveProgress({ username, ...session });
      setProgress(data.progress ?? {});
      setStatus('ready');
      return data.saved?.entry ?? null;
    },
    [username],
  );

  const resetProgress = useCallback(async () => {
    if (!username) return;
    await api.resetProgress(username).catch((error) => {
      if (error.status !== 404) throw error;
    });
    setProgress({});
  }, [username]);

  const openNameDialog = useCallback(() => setNameDialogOpen(true), []);
  const closeNameDialog = useCallback(() => setNameDialogOpen(false), []);
  const reloadProgress = useCallback(() => loadProgress(username), [loadProgress, username]);

  const value = useMemo(
    () => ({
      username,
      setUsername,
      progress,
      status,
      recordSession,
      resetProgress,
      reloadProgress,
      nameDialogOpen,
      openNameDialog,
      closeNameDialog,
    }),
    [
      username,
      setUsername,
      progress,
      status,
      recordSession,
      resetProgress,
      reloadProgress,
      nameDialogOpen,
      openNameDialog,
      closeNameDialog,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used inside <UserProvider>');
  return context;
}
