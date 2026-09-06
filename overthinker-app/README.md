# Overthinker AI frontend

React 18 + Vite client for Overthinker AI. It uses the real FastAPI endpoints for server-side guest sessions, decisions, SSE analysis progress, history, analytics, settings, account export, and agent management.

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

## Production

```bash
VITE_APP_ENV=production \
VITE_APP_URL=https://overthinker.example.com \
VITE_API_BASE_URL=https://api.overthinker.example.com \
npm run build
```

Deploy `dist/`. `VITE_API_BASE_URL` is the API origin without `/api/v1`. The prebuild step generates a one-route public sitemap from `VITE_APP_URL`. Vercel config and Netlify/Cloudflare Pages redirects and headers are included. See the repository [README](../README.md) and [production checklist](../PRODUCTION_CHECKLIST.md) for the complete deployment procedure.

Never place database credentials, provider keys, session secrets, or other private values in a `VITE_*` variable; Vite embeds them in browser assets.
