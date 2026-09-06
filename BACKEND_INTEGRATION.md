# Frontend/backend integration

The React client is connected to the FastAPI backend through the centralized client in `overthinker-app/src/api.js` and configuration in `overthinker-app/src/config/env.js`.

Set the public API origin without a trailing slash or `/api/v1`:

```dotenv
VITE_API_BASE_URL=https://api.overthinker.example.com
```

All JSON calls include cookies, safe error parsing, a 15-second timeout, and session-expiry handling. Decision creation uses a UUID idempotency key. Analysis progress uses credentialed `EventSource` against the backend-provided `eventsUrl`; no token or decision text is placed in a URL.

The backend must set `FRONTEND_URL` and any additional `ALLOWED_ORIGINS` to exact frontend HTTPS origins. For a cross-site frontend/API deployment, use `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none`. A same-site custom API subdomain is preferable. Local development values may use `http://localhost` with secure cookies disabled.

See [README.md](README.md) for all variables and hosting instructions, and [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for deployment verification.
