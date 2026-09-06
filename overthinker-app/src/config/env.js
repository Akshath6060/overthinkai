const trimTrailingSlash = value => value.replace(/\/+$/, '');

const appEnv = import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? 'development' : 'staging');
const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '');
const browserOrigin = typeof window === 'undefined' ? '' : window.location.origin;
const appUrl = trimTrailingSlash(import.meta.env.VITE_APP_URL || browserOrigin);

if (appEnv === 'production') {
  const missing = [];
  if (!import.meta.env.VITE_API_BASE_URL) missing.push('VITE_API_BASE_URL');
  if (!import.meta.env.VITE_APP_URL) missing.push('VITE_APP_URL');
  if (missing.length) {
    throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  }
}

if (apiBaseUrl && !/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error('VITE_API_BASE_URL must be an absolute HTTP(S) URL or empty for same-origin development.');
}

export const env = Object.freeze({
  apiBaseUrl,
  appUrl,
  appEnv,
  isProduction: appEnv === 'production',
  isDevelopment: appEnv === 'development',
});
