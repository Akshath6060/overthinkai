import { env } from './config/env.js';

export const API_URL = env.apiBaseUrl;
export const AUTH_EXPIRED_EVENT = 'overthinker:auth-expired';

const messages = {
  401: 'Your session has expired. Please enter again.',
  403: 'You do not have permission to do that.',
  404: 'We overthought it, but that resource could not be found.',
  429: 'Too many requests. Give the overthinking engine a moment.',
};

export class ApiError extends Error {
  constructor({ message, status = 0, code = 'NETWORK_ERROR', requestId = null, retryAfter = null, cause }) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}

function emitAuthExpired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export async function api(path, init = {}) {
  const { timeout = 15000, signal, ...requestInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeout);
  const abort = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(`${API_URL}/api/v1${path}`, {
      ...requestInit,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(requestInit.body ? { 'Content-Type': 'application/json' } : {}),
        ...requestInit.headers,
      },
    });
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
    if (!response.ok) {
      const retryAfter = response.headers.get('retry-after');
      const safeMessage = payload?.error?.message || messages[response.status]
        || (response.status >= 500 ? 'Our overthinking engine seems to be taking a break.' : `Request failed (${response.status}).`);
      if (response.status === 401 && !path.startsWith('/auth/')) emitAuthExpired();
      throw new ApiError({
        message: safeMessage,
        status: response.status,
        code: payload?.error?.code || `HTTP_${response.status}`,
        requestId: payload?.error?.requestId || response.headers.get('x-request-id'),
        retryAfter: retryAfter ? Number(retryAfter) || retryAfter : null,
      });
    }
    return response.status === 204 ? null : payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const timedOut = controller.signal.aborted && !signal?.aborted;
    throw new ApiError({
      message: timedOut
        ? 'The overthinking engine took too long to respond. Please try again.'
        : 'Unable to reach Overthinker AI. Check your internet connection and try again.',
      code: timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      cause: error,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function apiAssetUrl(path) {
  return `${API_URL}${path}`;
}
