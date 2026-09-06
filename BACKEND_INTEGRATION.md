# Vercel frontend → Render API integration

Set this in the Vercel project (without a trailing slash):

```dotenv
VITE_API_URL=https://overthinker-api.onrender.com
```

All fetch requests must use `credentials: "include"`. On first load, call `GET /api/v1/me`; on `401`, let the existing humorous verification animation finish and then call `POST /api/v1/auth/guest`. The animation never grants access by itself.

```js
const API = import.meta.env.VITE_API_URL;
const api = (path, init = {}) => fetch(`${API}/api/v1${path}`, {
  ...init,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', ...init.headers },
});
```

Create a decision with a newly generated `crypto.randomUUID()` as `Idempotency-Key`. Reuse that key when retrying the same submit; generate another key only for a genuinely new decision. The `202` response supplies `decisionId`, `runId`, and `eventsUrl`.

Open live events with native `EventSource` and `withCredentials: true`. Listen for `run.started`, `run.progress`, `agent.started`, `agent.completed`, `agent.failed`, `activity.created`, `usage.updated`, `run.completed`, `run.failed`, and `run.cancelled`. EventSource automatically sends its last event ID on reconnect. After refresh, call `GET /api/v1/runs/{runId}` first, then reopen the stream if the run is active. Never store or put the session in a URL.

Use these calls for the remaining screens:

- History: `GET /decisions?q=&severity=&cursor=&limit=20`; open a row with `GET /decisions/{decisionId}`.
- Settings: `GET /settings`, partial `PATCH /settings`.
- Council: `GET /agents`, `POST /agents`, `PATCH /agents/{id}`, `DELETE /agents/{id}`, and atomic `PUT /agents/order`.
- Presets: `GET /agent-presets` (copy a selected preset into the create-agent request).
- Analytics: `GET /analytics?from=YYYY-MM-DD&to=YYYY-MM-DD&timezone=Asia%2FKolkata`.
- Export: navigate/download `GET /me/export` through a credentialed fetch and Blob URL.
- Delete all evidence: `DELETE /me/decisions` after UI confirmation.
- Logout: `POST /auth/logout`, then clear only non-authoritative UI cache and show login.

Render must set `FRONTEND_URL`/`ALLOWED_ORIGINS` to the exact Vercel origins, `COOKIE_SECURE=true`, and `COOKIE_SAMESITE=none`. Local development uses `http://localhost:5173`, `COOKIE_SECURE=false`, and `COOKIE_SAMESITE=lax`.

