// Thin wrapper around the Murasaki REST API.
// In development Vite proxies /api to Express; set VITE_API_URL to call a
// different host (e.g. when the API is deployed separately).

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the Murasaki server. Is the API running?', 0);
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error ?? `Request failed (${response.status})`, response.status);
  }
  return data;
}

let catalogPromise = null;

export const api = {
  /** Modes, levels, task descriptions and item counts. Cached for the session. */
  catalog() {
    catalogPromise ??= request('/api/lessons').catch((error) => {
      catalogPromise = null;
      throw error;
    });
    return catalogPromise;
  },

  /** Items plus a fresh set of questions for one mode + level. */
  lesson(alphabet, level, { count = 10, signal } = {}) {
    const params = new URLSearchParams({ count: String(count) });
    return request(`/api/lessons/${alphabet}/${level}?${params}`, { signal });
  },

  progress(username, { signal } = {}) {
    return request(`/api/progress/${encodeURIComponent(username)}`, { signal });
  },

  saveProgress(session) {
    return request('/api/progress', { method: 'POST', body: session });
  },

  resetProgress(username) {
    return request(`/api/progress/${encodeURIComponent(username)}`, { method: 'DELETE' });
  },
};
