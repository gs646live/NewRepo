// Thin wrapper around the Murasaki REST API.
// In development Vite proxies /api to Express; set VITE_API_URL to call a
// different host (e.g. when the API is deployed separately).

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const API_UNREACHABLE =
  'Can’t reach the Murasaki API. Check the terminal running "npm run dev" for [api] or [db] errors — ' +
  'usually PostgreSQL needs to be started first ("docker compose up -d db" in the murasaki folder).';

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
    throw new ApiError(API_UNREACHABLE, 0);
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    // A 5xx with no JSON body comes from the dev proxy or a gateway: the API itself isn't answering.
    if (response.status >= 500 && !data) throw new ApiError(API_UNREACHABLE, response.status);
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
