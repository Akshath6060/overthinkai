# Frontend/backend status

The frontend and backend are integrated. The backend is the source of truth for guest sessions, account/credit data, decisions, streamed run events, verdicts, history, analytics, settings, agents, presets, export, and deletion.

The frontend now provides URL-backed SPA navigation, saved decision deep links, loading/error/empty states, session restoration, offline notification, retry actions, centralized API handling, production metadata, and deployment fallbacks. Static values remaining in `src/data.js` are visual definitions, example prompts, and approved humorous interface copy—not persisted user results.

Current API base path: `/api/v1`. Current health endpoints: `/health`, `/health/ready`, and `/api/v1/health`.

The production deployment procedure and current external blocker are tracked in [README.md](README.md) and [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md).
