# Overthinker AI — React build

A React implementation of the **"Overthinker AI v2"** mockup in
`../Overthinker AI Interface Mockup/Overthinker AI v2.dc.html`.

The design is reproduced exactly: every colour, spacing value, shadow, border
radius, rotation, animation and string is transcribed verbatim from the mockup.
Nothing was redesigned, re-spaced or re-worded.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## How the design is preserved

The mockup expresses styling as inline CSS strings plus `style-hover` /
`style-active` attributes. Rather than hand-retyping those into React style
objects (which invites drift), the CSS strings are copied across as-is and
parsed at runtime:

- `src/lib/sx.jsx` — `css()` parses a design CSS string into a React style
  object (cached); `<Sx>` renders any element with its base style plus the
  `style-hover` / `style-active` variants the mockup declared.
- `src/index.css` — the mockup's `<helmet>` stylesheet, copied verbatim
  (resets, the seven `ot-*` keyframes, the 960px responsive rules).
- `index.html` — the same Google Fonts (Space Grotesk, Inter, Bangers).

## Structure

| File | Mirrors |
| --- | --- |
| `src/data.js` | the mockup's static data — agents, log script, login steps, history rows, stat cards, toggles |
| `src/useOverthinker.js` | the `DCLogic` class: state, timers, and everything `renderVals()` derived |
| `src/App.jsx` | the top-level `sc-if` split between the auth screen and the app shell |
| `src/components/LoginScreen.jsx` | auth screen + identity quiz modal |
| `src/components/Sidebar.jsx`, `MobileNav.jsx`, `Header.jsx`, `LogoutModal.jsx` | the shell chrome |
| `src/components/NewDecision.jsx` | New Decision input state |
| `src/components/Analysis.jsx` | running + verdict states, pipeline, agent cards, right panel |
| `src/components/History.jsx`, `Analytics.jsx`, `Lab.jsx`, `Settings.jsx` | the other four pages |

## Design props

`src/main.jsx` passes the three props the mockup exposed:

```jsx
<App accent="#8B5CF6" defaultLevel="SEVERE" humorLevel="Dry" />
```

`accent` also accepts `#FF4FA3`, `#FF8C42`, `#4CC9F0`; `defaultLevel` accepts
`NORMAL` / `SEVERE` / `EXISTENTIAL`; `humorLevel` accepts `Professional` /
`Dry` / `Unhinged`.

## Notes

- Auth state is kept in `localStorage` under `ot_auth`, exactly as the mockup
  did. Clear it to see the login screen again.
- All content is the mockup's demo data; there is no backend.
