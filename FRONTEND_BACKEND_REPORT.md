# Overthinker AI: Frontend-to-Backend Handoff

## 1. Executive summary

The repository currently contains a React 18 + Vite frontend prototype. It has no API client, router, database, server authentication, or real AI integration. All user data, history, analytics, agents, analysis progress, verdicts, settings, account details, and credit usage are hardcoded or held in React memory.

The backend should become the source of truth for:

- users, sessions, and plans/credits;
- decisions and their analysis runs;
- agent definitions, ordering, enabled state, and custom agents;
- streamed run progress, agent outputs, logs, and resource usage;
- saved history and aggregate analytics;
- user settings, export, and account deletion/data deletion.

The recommended MVP is a REST JSON API plus Server-Sent Events (SSE) for live run updates. SSE fits the current one-way progress UI and is simpler than WebSockets. A background job/queue is recommended for AI orchestration so an HTTP request does not remain open for the full multi-agent run.

## 2. What exists in the frontend

| Area | Current behavior | Backend requirement |
| --- | --- | --- |
| Login | Fake timer; `localStorage.ot_auth` is set to `1` | Real sign-in/session endpoint and current-user lookup |
| New decision | Question, category, and severity are local state | Validate and create an analysis run |
| Analysis | Six agents appear on fixed timers | Persist run state and stream real agent events |
| Final verdict | Always says “JUST. ORDER. THE. BIRYANI.” | Return decision-specific verdict and rationale |
| History | Six static rows; filtering is client-side | Paginated/searchable user history API |
| Analytics | All totals/charts are static | Aggregate analytics endpoint with a date range |
| Council | Static agents; reorder/disable is memory-only | Agent CRUD plus saved user ordering/enabled state |
| Settings | Most controls are visual only | Get/update settings, export, and delete-history APIs |
| Credits/profile | Hardcoded `742 / 1000`, name, initials, and plan | Current user, plan, allowance, and usage from API |

There is no frontend routing. The five pages (`new`, `history`, `analytics`, `lab`, and `settings`) are selected through local component state, so refresh/deep links do not preserve a page.

## 3. User-facing screens and required data

### Authentication

The login UI does not collect an email, password, or OAuth credential. Before implementing the backend, choose an actual authentication method. For the quickest product path, use OAuth or email magic links. The humorous “identity check” can remain as an animation after the server has authenticated the user, but it must not grant access itself.

Required frontend bootstrap data after login:

- user ID, display name, initials/avatar, and email;
- plan name;
- credits used, credit allowance, and reset date;
- saved settings;
- history count for the navigation badge.

### New decision

Inputs visible in the UI:

- `question`: free text;
- `category`: `Food | Career | College | Relationships | Money | Life | Other`, currently optional;
- `severity`: `NORMAL | SEVERE | EXISTENTIAL`, default currently `SEVERE`;
- implicitly selected provider, humor level, enabled agents, and agent order.

Suggested validation:

- trim the question and require 3–2,000 characters;
- accept only known category/severity enums;
- require at least one enabled analysis agent and one final judge/synthesizer;
- enforce the user’s available credits and server-side rate limits;
- use an idempotency key on run creation to prevent duplicate charged runs.

The current frontend substitutes “Should I order biryani?” when the text box is empty. Production should instead disable submission or show validation feedback.

### Live analysis

The screen needs:

- run ID, question, category, severity, status, timestamps, and progress;
- the ordered agent snapshot used for this run;
- per-agent status, analysis, verdict, confidence, and duration;
- activity log events;
- live usage: tokens, estimated cost, elapsed time, arguments/events, and agents completed;
- final verdict, explanation, overall confidence, vote summary, and run metrics;
- explicit failure/cancellation states.

Agent configuration must be snapshotted into a run. If a user later edits or deletes an agent, historical results must still render exactly as originally produced.

### History

The table currently displays question, verdict, severity, agent count, confidence, and relative date. Each row should also carry a stable `runId`, allowing a click to open the full saved run.

Filtering supported by the UI:

- severity: all/normal/severe/existential;
- text search against the question.

Add server pagination, stable sorting by `createdAt DESC`, and an absolute ISO timestamp; the frontend should create labels such as “Yesterday.”

### Analytics

The current page implies these aggregates:

- total decisions;
- decisions in the current week and daily counts;
- average agents per run;
- total/average tokens;
- total analysis time and estimated avoidant time;
- average confidence and trend percentage;
- category distribution;
- per-agent drama/usage metrics;
- average problem difficulty and compute per decision.

The API should return raw numeric values, not formatted strings such as `712k`, `38%`, or `4h 51m`. Formatting belongs in the frontend.

### Council of experts

Each agent card needs:

- ID, name, emoji/avatar, color, tagline, personality, and instructions/system prompt;
- enabled state and position/order;
- role/type (`analyst` or `judge`);
- drama, usefulness, confidence-profile scores, and knowledge label;
- ownership (`system` or `user`) and whether it can be edited/deleted.

Actions implied by the UI are list, enable/disable, reorder, create from scratch, and create from a preset. Editing/deleting custom agents should also be supported even though those controls are not yet drawn.

### Settings and data controls

Persist these fields:

```json
{
  "theme": "cream",
  "defaultSeverity": "SEVERE",
  "humorLevel": "Dry",
  "providerMode": "council",
  "streamAgentOutput": true,
  "verboseActivityLog": true,
  "notifyOnComplete": false,
  "consensusChime": false,
  "autoSave": true
}
```

“Bring Your Own Key” needs a separate secure design. Never return provider secrets to the browser after storage. Prefer encrypted server-side credentials, show only provider plus a masked suffix, and provide replace/delete actions.

“Export JSON” should return a downloadable user-data export. “Delete All Evidence” should require confirmation, delete or anonymize the user’s decisions/results according to policy, and return `204 No Content` only after completion.

## 4. Recommended API contract

Use a versioned base path such as `/api/v1`. JSON fields below use camelCase to match the React code.

### Authentication and account

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` or `/auth/magic-link` | Start/complete the chosen login flow |
| `POST` | `/auth/logout` | Revoke the session |
| `GET` | `/me` | User, plan, credits, settings, and history count |
| `GET` | `/me/export` | Download the user’s data as JSON |
| `DELETE` | `/me/decisions` | Delete all decision history |

Use secure, `HttpOnly`, `SameSite` cookies for a same-site web deployment. Protect state-changing cookie-authenticated routes against CSRF and rotate/revoke sessions correctly.

### Decisions and runs

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/decisions` | Create a decision and enqueue analysis |
| `GET` | `/decisions` | Paginated history with `q`, `severity`, `cursor`, `limit` |
| `GET` | `/decisions/:id` | Full saved decision/run result |
| `DELETE` | `/decisions/:id` | Delete one saved decision |
| `POST` | `/runs/:id/cancel` | Best-effort cancellation |
| `GET` | `/runs/:id/events` | SSE stream for progress |
| `POST` | `/runs/:id/share` | Optional share-link creation |

Create request:

```http
POST /api/v1/decisions
Idempotency-Key: 4a915df0-...
Content-Type: application/json

{
  "question": "Should I order biryani?",
  "category": "Food",
  "severity": "SEVERE",
  "humorLevel": "Dry",
  "providerMode": "council",
  "agentIds": ["agent_finance", "agent_risk", "agent_emotion", "agent_practical", "agent_devil", "agent_judge"],
  "autoSave": true
}
```

Create response (`202 Accepted`):

```json
{
  "decisionId": "dec_01J...",
  "runId": "run_01J...",
  "status": "queued",
  "eventsUrl": "/api/v1/runs/run_01J.../events",
  "createdAt": "2026-09-06T06:45:00.000Z"
}
```

Recommended run statuses:

`queued | running | completed | failed | cancelled`

Recommended per-agent statuses:

`queued | running | completed | failed | skipped`

SSE event types:

```text
run.started
run.progress
agent.started
agent.completed
activity.created
usage.updated
run.completed
run.failed
```

Every SSE event should include an event ID, run ID, event type, ISO timestamp, and typed payload. Store events so reconnecting clients can resume using `Last-Event-ID`. Do not stream hidden chain-of-thought. `activity.created` should contain short, backend-authored status summaries suitable for display; `agent.completed` should contain the final user-visible analysis.

Example completed-agent event:

```json
{
  "id": "evt_01J...",
  "runId": "run_01J...",
  "type": "agent.completed",
  "createdAt": "2026-09-06T06:45:03.100Z",
  "data": {
    "agentId": "agent_finance",
    "position": 0,
    "analysis": "The expense is affordable within the stated constraints...",
    "verdict": "PROBABLY FINE",
    "confidence": 87,
    "durationMs": 1900,
    "usage": { "inputTokens": 310, "outputTokens": 184, "estimatedCostMinor": 4, "currency": "INR" }
  }
}
```

Example full completed result:

```json
{
  "id": "dec_01J...",
  "run": {
    "id": "run_01J...",
    "status": "completed",
    "progress": 100,
    "createdAt": "2026-09-06T06:45:00.000Z",
    "startedAt": "2026-09-06T06:45:00.240Z",
    "completedAt": "2026-09-06T06:45:11.800Z"
  },
  "question": "Should I order biryani?",
  "category": "Food",
  "severity": "SEVERE",
  "agents": [
    {
      "agentId": "agent_finance",
      "name": "Financial Analyst",
      "emoji": "🤑",
      "color": "#FFD84D",
      "position": 0,
      "status": "completed",
      "analysis": "...",
      "verdict": "PROBABLY FINE",
      "confidence": 87,
      "durationMs": 1900
    }
  ],
  "finalVerdict": {
    "headline": "JUST ORDER THE BIRYANI.",
    "explanation": "...",
    "confidence": 94,
    "approveCount": 5,
    "disapproveCount": 1,
    "dissentingAgentIds": ["agent_devil"]
  },
  "usage": {
    "inputTokens": 2310,
    "outputTokens": 2511,
    "totalTokens": 4821,
    "estimatedCostMinor": 37,
    "currency": "INR",
    "durationMs": 11800
  },
  "metrics": {
    "actualDifficulty": 2,
    "necessityScore": 0.4,
    "mentalGymnasticsScore": 98,
    "argumentCount": 18
  }
}
```

Keep monetary values as integers in minor currency units or as precise decimal strings; do not store floating-point currency.

### Agents

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/agents` | List system and custom agents in user order |
| `POST` | `/agents` | Create a custom agent |
| `PATCH` | `/agents/:id` | Edit or enable/disable an agent |
| `DELETE` | `/agents/:id` | Delete a user-owned custom agent |
| `PUT` | `/agents/order` | Save the complete ordered ID list atomically |
| `GET` | `/agent-presets` | List “Mom”, “Friend”, etc. presets |

Example reorder request:

```json
{ "agentIds": ["agent_risk", "agent_finance", "agent_emotion", "agent_practical", "agent_devil", "agent_judge"] }
```

Validate ownership, reject duplicate/missing IDs, and update the ordering in one transaction.

### Settings and analytics

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/settings` | Fetch saved settings |
| `PATCH` | `/settings` | Partially update saved settings |
| `GET` | `/analytics?from=...&to=...&timezone=Asia/Kolkata` | Dashboard aggregates |

Suggested analytics response shape:

```json
{
  "range": { "from": "2026-08-31", "to": "2026-09-06", "timezone": "Asia/Kolkata" },
  "summary": {
    "decisionCount": 147,
    "decisionCountDelta": 12,
    "averageAgentCount": 6.4,
    "totalTokens": 712000,
    "totalDurationMs": 17460000,
    "averageConfidence": 88,
    "averageDifficulty": 2
  },
  "daily": [{ "date": "2026-08-31", "count": 4 }],
  "categories": [{ "category": "Food", "count": 56, "percentage": 38 }],
  "agents": [{ "agentId": "agent_devil", "name": "Devil’s Advocate", "dramaScore": 97, "runCount": 120 }]
}
```

## 5. Suggested persistence model

Minimum relational tables/collections:

- `users`: identity and profile;
- `sessions`: revocable server sessions;
- `plans` and `credit_ledger`: allowances and append-only debits/credits;
- `user_settings`: one row/document per user;
- `agents`: system and custom agent definitions;
- `user_agent_preferences`: enabled flag and position;
- `decisions`: submitted question/category/severity and save state;
- `analysis_runs`: lifecycle, provider/model metadata, progress, errors, usage, and final verdict;
- `run_agents`: immutable agent snapshots plus output/status/usage;
- `run_events`: ordered resumable activity/SSE events;
- optionally `share_links` and `provider_credentials`.

Important constraints and indexes:

- every user-owned lookup must be scoped by authenticated `userId`;
- unique `(userId, idempotencyKey)` for decision creation;
- index decisions by `(userId, createdAt DESC)` and `(userId, severity, createdAt DESC)`;
- unique `(runId, position)` for run agents and `(runId, sequence)` for events;
- retain model/provider/version and prompt-template version on every run for auditability;
- keep an append-only credit ledger and charge idempotently.

## 6. AI orchestration behavior

A practical pipeline is:

1. API validates the request, checks quota, creates the decision/run, snapshots agents, and enqueues a job.
2. Worker marks the run `running` and emits `run.started`.
3. Worker runs enabled analysts either sequentially (matching the current animation) or concurrently (lower latency), saving each completed result and emitting events.
4. The final judge receives the question plus normalized analyst outputs and creates a structured verdict.
5. Server validates the model output against a JSON schema, computes trusted usage/cost metrics, saves the result, and emits `run.completed`.
6. On errors, save a safe public error code/message and emit `run.failed`; keep sensitive provider details only in server logs.

Use structured model output for `analysis`, `verdict`, `confidence`, vote, and final summary. Treat confidence as a display score, not a factual probability. Cap output lengths and sanitize/escape user-controlled content. Do not let custom-agent prompts override system safety rules or expose other users’ data.

Severity currently advertises 4, 6, or 8 experts, but only six agents exist in the UI. Decide one consistent rule before integration. Recommended MVP: severity changes token/time budgets while the enabled council determines agent count. Later, add server-defined presets that explicitly select 4/6/8 agents.

## 7. Errors the frontend must support

Use a consistent error envelope:

```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You do not have enough credits for this run.",
    "requestId": "req_01J...",
    "details": {}
  }
}
```

At minimum handle:

- `400` malformed JSON;
- `401` signed out/session expired;
- `403` resource not owned or plan restriction;
- `404` decision/run not found;
- `409` duplicate/conflicting action;
- `422` question/settings validation failure;
- `429` rate limit or quota exhausted;
- `502/503` AI provider unavailable;
- interrupted SSE with reconnect and fallback polling;
- partial agent failures and full run failure.

## 8. Frontend changes needed during integration

- Add an API module using `VITE_API_URL`; keep all secrets server-side.
- Replace `localStorage.ot_auth` with `/me` session bootstrap and real logout.
- Split the large `useOverthinker` hook into auth, decision/run, history, analytics, agents, and settings data hooks.
- Add client-side routes such as `/decisions/new`, `/decisions/:id`, `/history`, `/analytics`, `/agents`, and `/settings`.
- Replace timers and `logScript` with SSE events; fetch the latest run snapshot after reconnect.
- Replace all hardcoded final-verdict text, agent outputs, telemetry, credits, account data, history, and analytics.
- Add submit-disabled, validation, loading, empty, retry, failed, cancelled, and partial-failure states.
- Add optimistic updates with rollback for toggles/reordering, or wait for server confirmation.
- Wire currently inactive buttons: share, save, history row open, retry, provider selection, theme selection, hire/deploy agent, export, and delete.
- Add accessible labels/focus behavior and confirmation dialogs for destructive actions.

## 9. Recommended implementation order

1. Define shared request/response schemas and enums (OpenAPI is ideal).
2. Implement authentication, `/me`, session handling, and user settings.
3. Implement agents and saved agent preferences.
4. Implement decision creation, persistence, worker execution, and run retrieval.
5. Implement SSE, event replay, failure states, and credit accounting.
6. Connect history and individual saved-run pages.
7. Implement analytics aggregates.
8. Implement export, deletion, sharing, notifications, and BYOK only after the core flow is stable.

## 10. MVP acceptance criteria

- A signed-in user can submit a non-empty decision exactly once even after a double-click/retry.
- The created run belongs only to that user and survives refresh/reconnect.
- Agent progress and safe activity summaries appear live.
- The final verdict and every analysis are specific to the submitted question.
- A completed auto-saved run appears in history and affects analytics/credits exactly once.
- Disabled agents are excluded and saved order is respected.
- Settings survive sign-out/sign-in.
- Users cannot read or mutate another user’s decisions, agents, settings, events, or exports.
- Provider keys and internal prompts never appear in browser bundles, public errors, or streamed events.
- Failed runs provide a retryable state and do not create duplicate charges.

## 11. Decisions still required

These are product choices, not details visible in the current frontend:

- authentication method and whether guest sessions are supported;
- backend language/framework and SQL vs. document database;
- model provider(s), fallback policy, and whether BYOK ships in MVP;
- credit unit/pricing and refund behavior for failed or cancelled runs;
- sequential vs. parallel analyst execution;
- whether all runs are stored when `autoSave` is off;
- retention/deletion policy and whether share links are public;
- notification channel (browser push, email, or in-app only).

