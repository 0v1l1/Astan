// Every request to the backend must prove which Telegram user is making
// it, since the backend now scopes all data by user_id and rejects
// requests without a valid initData signature (see backend/auth.py).
// Route every fetch through here instead of calling fetch() directly so
// that header is never accidentally left off.

export const API_BASE = 'https://lftracker.onrender.com';

function authHeaders() {
  let initData = '';
  try {
    initData = window.Telegram?.WebApp?.initData || '';
  } catch {
    initData = '';
  }
  return initData ? { 'X-Telegram-Init-Data': initData } : {};
}

// Thin wrapper around fetch: same signature, same Response object back,
// just with the auth header merged in automatically.
export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { ...authHeaders(), ...(options.headers || {}) };
  return fetch(url, { ...options, headers });
}
