import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = (env.VITE_APP_URL || '').replace(/\/+$/, '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:8000';
  if (command === 'build' && env.VITE_APP_ENV === 'production') {
    const missing = ['VITE_APP_URL', 'VITE_API_BASE_URL'].filter(key => !env[key]);
    if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
    for (const [name, value] of [['VITE_APP_URL', appUrl], ['VITE_API_BASE_URL', apiTarget]]) {
      const url = new URL(value);
      if (url.protocol !== 'https:') throw new Error(`${name} must use HTTPS in production`);
    }
  }
  return {
  plugins: [react(), {
    name: 'production-metadata',
    transformIndexHtml(html) {
      if (!appUrl) return html;
      return html
        .replace('<meta property="og:url" content="/">', `<meta property="og:url" content="${appUrl}/">`)
        .replace('<meta property="og:image" content="/og-image.png">', `<meta property="og:image" content="${appUrl}/og-image.png">`)
        .replace('<meta name="twitter:image" content="/og-image.png">', `<meta name="twitter:image" content="${appUrl}/og-image.png">`)
        .replace('<link rel="canonical" href="/">', `<link rel="canonical" href="${appUrl}/">`);
    },
  }],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true }
    }
  }
  };
});
