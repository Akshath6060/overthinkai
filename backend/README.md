# Overthinker AI API

Production-oriented FastAPI backend for Overthinker AI / ULP 3.0. It uses MongoDB Atlas, server-side guest sessions, OpenAI structured outputs, persisted SSE events, immutable agent snapshots, and an append-only internal credit ledger.

## Local development

Python 3.11–3.13 is recommended (production uses 3.11 in Docker).

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The template deliberately selects `MONGODB_URI=memory://` and `AI_PROVIDER=mock` for a zero-credential local demo. Neither is permitted when `APP_ENV=production`. Set a MongoDB URI and `AI_PROVIDER=openai` to exercise production integrations.

Run tests:

```bash
cd backend
.venv/bin/pytest -q
```

Health and API documentation are at `/health`, `/api/v1/health`, `/docs`, `/redoc`, and `/openapi.json`.

## Configuration

Required production variables: `APP_ENV`, `MONGODB_URI`, `MONGODB_DATABASE`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_JUDGE_MODEL`, `SESSION_SECRET`, `SESSION_EXPIRE_DAYS`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `DEFAULT_CREDIT_ALLOWANCE`, `AI_PROVIDER`, `LOG_LEVEL`, `COOKIE_SECURE`, `COOKIE_SAMESITE`, and `DOCS_ENABLED`.

For Vercel → Render, set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none`. The API validates production mutation origins against the configured CORS allowlist. Cookies are HttpOnly and never returned in JSON. A same-site custom API domain is preferable when available.

## MongoDB Atlas

1. Create an Atlas M0 cluster and a least-privilege database user.
2. Add Render's required network access (Atlas does not support a stable Render egress IP on every plan; use the narrowest option your deployment permits).
3. Copy the `mongodb+srv://...` driver URI into Render as `MONGODB_URI`; do not commit it.
4. Set `MONGODB_DATABASE=overthinker`.

Startup pings MongoDB and fails clearly if it cannot connect. Credentials are not logged. Indexes are created automatically, including TTL session expiry, unique idempotency, event sequence, snapshot position, preferences, and credit-accounting constraints.

Collections: `users`, `sessions`, `user_settings`, `agents`, `user_agent_preferences`, `user_agent_order`, `decisions`, `analysis_runs`, `run_agents`, `run_events`, and `credit_ledger`.

## Authentication and CSRF posture

`POST /api/v1/auth/guest` creates an anonymous account and a random 384-bit session token. Only an HMAC-SHA-256 token digest is stored. The browser receives an expiring HttpOnly cookie. Logout revokes its server record. Every protected lookup includes the authenticated `userId`; client-provided user IDs are ignored. Production state-changing requests additionally require an allowed `Origin`.

## AI execution

Routes depend only on the `AIProvider` interface. `OpenAIProvider` owns all SDK calls and validates structured analyst/judge outputs with Pydantic. Analysts run concurrently; the judge receives only successful, user-visible outputs. One analyst may fail without aborting the council; all-analyst or judge failure fails the run. OpenAI transient retries are bounded at two. No chain-of-thought, server prompts, provider keys, or internal instructions are exposed.

In-process jobs are claimed idempotently and persist each state transition. A Render restart can interrupt them; the worker boundary is intentionally isolated so it can later become FastAPI → Redis → worker without changing the API.

## SSE

`GET /api/v1/runs/{runId}/events` is cookie-authenticated, user-scoped, and emits persisted events with monotonically increasing per-run sequences. `Last-Event-ID` may contain a prior event ID (or sequence number); missed events are replayed before live polling resumes. Heartbeat comments are sent during idle periods. Completed streams replay and close.

Native browser setup:

```js
const stream = new EventSource(`${API}/api/v1/runs/${runId}/events`, {
  withCredentials: true,
});
```

## Credits and retention

MVP cost is deterministic: 10 credits per selected analyst plus 5 for the judge. A unique negative reservation is created after decision/run/snapshot persistence. Completion keeps that charge. Failed and cancelled runs receive a unique append-only full refund; retries cannot duplicate either entry. Credits are internal units, not INR billing.

Runs with `autoSave=false` remain retrievable and streamable but are excluded from history. Production should add a scheduled retention job for old unsaved completed runs; no premature TTL deletion is configured in this version.

## Render

The included `render.yaml` uses the Dockerfile. Manual settings:

- Root directory: repository root
- Runtime: Docker
- Dockerfile: `backend/Dockerfile`
- Docker context: `backend`
- Health check: `/health`
- Start command (if not using Docker): `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

One web worker is recommended for the in-process MVP queue and rate limiter. The limiter is explicitly per-process, not distributed.

## API routes

- `POST /api/v1/auth/guest`, `POST /api/v1/auth/logout`
- `GET /api/v1/me`, `GET /api/v1/me/export`, `DELETE /api/v1/me/decisions`
- `GET/PATCH /api/v1/settings`
- `GET/POST /api/v1/agents`, `PATCH/DELETE /api/v1/agents/{agentId}`, `PUT /api/v1/agents/order`, `GET /api/v1/agent-presets`
- `POST/GET /api/v1/decisions`, `GET/DELETE /api/v1/decisions/{decisionId}`
- `GET /api/v1/runs/{runId}`, `POST /api/v1/runs/{runId}/cancel`, `GET /api/v1/runs/{runId}/events`
- `GET /api/v1/analytics`

All validation and application errors use `{ "error": { "code", "message", "requestId", "details" } }` and responses include `X-Request-ID`.

