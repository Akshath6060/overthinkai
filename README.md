# Overthinker AI

Overthinker AI is a playful decision-analysis interface that sends an everyday question through a deliberately overqualified council of fictional experts. The current repository contains the responsive frontend prototype; a real backend and AI integration are planned next.

## Current status

- React 18 frontend powered by Vite
- Responsive views for decisions, analysis, history, analytics, experts, and settings
- Demo authentication and analysis sequences
- Mock data and browser-local state only
- No backend, database, or real authentication yet

> The current login and verdict flows are simulations. Do not treat them as security or production AI behavior.

## Repository structure

```text
.
├── overthinker-app/                 # Vite + React frontend
│   ├── src/
│   │   ├── components/              # UI screens and shared components
│   │   ├── lib/                     # UI helpers
│   │   ├── App.jsx
│   │   ├── data.js                  # Prototype/mock content
│   │   └── useOverthinker.js        # Prototype state and interactions
│   └── package.json
├── Overthinker AI Interface Mockup/ # Original interface reference files
└── README.md
```

When the API is added, keep it as a sibling directory so the repository remains easy to navigate:

```text
.
├── overthinker-app/  # Frontend
└── backend/          # API, business logic, AI providers, and persistence
```

## Run the frontend locally

Requirements:

- Node.js 18 or newer
- npm

```bash
cd overthinker-app
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

## Available scripts

Run these commands from `overthinker-app/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Backend integration plan

The frontend currently generates all results locally from mock data. A clean next step is to add a `backend/` service and move the following responsibilities into it:

1. Authentication and session management
2. Decision submission and validation
3. AI-agent orchestration and verdict generation
4. Streaming analysis progress to the frontend
5. Decision history and user settings persistence
6. Rate limiting, logging, and error handling

Keep secrets such as model API keys in backend environment variables only. Never expose provider keys through Vite variables, because every `VITE_*` value is included in the browser bundle.

Once the API exists, add a committed environment template such as:

```dotenv
# overthinker-app/.env.example
VITE_API_URL=http://localhost:3000/api
```

Put real values in `.env` files, which are ignored by Git. The backend should provide its own `.env.example` containing placeholder values and setup notes.

## Production checklist

Before deploying the full application:

- Replace simulated login with server-validated authentication
- Replace mock decisions, history, and analytics with API data
- Add loading, empty, and API error states
- Validate and rate-limit all backend inputs
- Keep AI/provider credentials server-side
- Add automated tests and continuous integration
- Configure allowed origins and production environment variables

## Git workflow

Generated builds, dependencies, local environment files, caches, and common backend artifacts are excluded by the root `.gitignore`.

```bash
git add .
git commit -m "chore: prepare project repository"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

If the remote already contains commits, synchronize it before pushing instead of overwriting its history.
