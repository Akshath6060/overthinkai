# Overthinker AI Production Checklist

## Configuration and infrastructure

- [ ] Production frontend URL configured (`VITE_APP_URL`)
- [ ] Production API URL configured (`VITE_API_BASE_URL`)
- [ ] `VITE_APP_ENV=production`
- [ ] Database connection and least-privilege database user configured
- [ ] Required AI provider key configured only on the backend
- [ ] Strong JWT/auth session secret configured
- [ ] CORS contains only expected HTTPS frontend origins
- [ ] `COOKIE_SECURE=true` and `COOKIE_SAMESITE` matches the domain layout
- [ ] HTTPS active for frontend and API
- [ ] Backend runs one worker while jobs/rate limits remain in process
- [ ] Provider/CDN compression enabled

## Build and routing

- [ ] Frontend build passes
- [ ] Backend starts with production environment validation
- [ ] `/health` returns `{"status":"ok"}`
- [ ] `/health/ready` returns `{"status":"ready"}`
- [ ] SPA refresh works on `/dashboard`, `/history`, `/analytics`, `/agents`, and `/settings`
- [ ] `/api/*` is not rewritten to frontend HTML
- [ ] Custom 404 page works
- [ ] React error boundary fallback and all three recovery actions work

## Product flows

- [ ] Guest authentication and session restoration work
- [ ] Expired sessions return to the entry flow without a redirect loop
- [ ] API requests work with credentials
- [ ] Analysis creation prevents duplicate submissions
- [ ] Live analysis updates reconnect after a transient connection loss
- [ ] Results load and contain real provider output
- [ ] History persists, searches, filters, retries, and shows an empty state
- [ ] Analytics uses persisted decisions and shows loading/error/empty states
- [ ] Agent enablement, ordering, and custom creation persist
- [ ] Settings persist and report failures
- [ ] JSON export works
- [ ] History deletion requires confirmation and persists
- [ ] Logout revokes the session
- [ ] Offline banner appears and requests can be retried after reconnection

## Quality and security

- [ ] Mobile layout checked at 320, 375, 430, 768, 1024, 1440, and 1920 px
- [ ] Keyboard-only core-flow check passes
- [ ] Focus indicators, form labels, switches, and dialogs are accessible
- [ ] SEO metadata and canonical URL use the production domain
- [ ] `robots.txt` is reachable and private routes are disallowed
- [ ] `sitemap.xml` exists and contains only the public `/` route
- [ ] Favicon and web manifest load
- [ ] Open Graph image and metadata pass a social-card validator
- [ ] Security headers are present on deployed responses
- [ ] No secrets are exposed in frontend source or built assets
- [ ] Production logs contain no authorization headers, cookies, keys, or decision text
- [ ] Browser smoke test passes on current Chrome, Edge, Firefox, Safari, mobile Chrome, and mobile Safari
- [ ] Database backup/retention policy is configured
- [ ] External uptime and error monitoring are configured
