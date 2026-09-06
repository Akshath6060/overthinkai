export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(path, init = {}) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

