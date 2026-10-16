# Breeze Weather

Weather app for the **Modern Programming Technologies** course (profile: React 19 + Vite + TanStack).

- **Frontend:** React 19, Vite 6, TanStack Query 5, React Router 7, Tailwind CSS 4, React Leaflet
- **Backend:** Node.js + Express 5 + SQLite (`node:sqlite`), in [`server/`](server)
- **Weather data:** [Visual Crossing Timeline API](https://www.visualcrossing.com/), called only by the backend

```
Browser ──/api──▶ Vite dev server (proxy) ──▶ Express API ──▶ Visual Crossing
                                                   │
                                                   └──▶ SQLite (saved cities)
```

## Requirements

- Node.js **24** (any version ≥ 22.13 works; see `.nvmrc`). npm 10+.
- A Visual Crossing API key (free account).

## Setup

```bash
npm ci                      # frontend dependencies
npm ci --prefix server      # backend dependencies
cp server/.env.example server/.env   # then put your key in WEATHER_API_KEY
```

## Run (development)

Two terminals:

```bash
npm run dev:server   # API on http://localhost:3001
npm run dev          # app on http://localhost:5173 (proxies /api to :3001)
```

Node prints `ExperimentalWarning: SQLite is an experimental feature` when the API starts. That is expected (`node:sqlite` is built into Node and needs no native build).

### Backend with Docker (optional)

```bash
docker compose up --build   # API on http://localhost:3001, data in a named volume
```

## Scripts

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | Vite dev server with HMR and `/api` proxy |
| root | `npm run build` | Production build to `dist/` |
| root | `npm run preview` | Serve `dist/` (also proxies `/api`) |
| root | `npm run lint` | ESLint (frontend + backend) |
| root | `npm test` | Frontend tests (Vitest + Testing Library, jsdom) |
| server | `npm start` / `npm run dev` | Start the API (`dev` restarts on change) |
| server | `npm test` | Backend tests (Vitest + Supertest, in-memory SQLite) |

CI (`.github/workflows/ci.yml`) runs lint, tests and build on every push to `main`/`refactor` and on pull requests.

## Configuration

| Variable | File | Default | Purpose |
|---|---|---|---|
| `WEATHER_API_KEY` | `server/.env` | – (required) | Visual Crossing key. Never put it in frontend code. |
| `PORT` | `server/.env` | `3001` | API port |
| `DB_PATH` | `server/.env` | `./data/weather.db` | SQLite file, created automatically |
| `CORS_ORIGIN` | `server/.env` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `VITE_API_BASE_URL` | `.env` | empty | Only if the API is on another origin; empty = use the proxy |
| `API_PROXY_TARGET` | shell | `http://localhost:3001` | Where the Vite proxy forwards `/api` |

`.env` files are git-ignored; only the `.env.example` files are committed.

## API

All errors use the same shape: `{ "error": { "code": "CITY_NOT_FOUND", "message": "..." } }`.

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | – | `200 { status: "ok", uptimeSeconds }` | – |
| GET | `/api/weather/:city` | – | `200` forecast (metric units: °C, km/h, hPa, km) | `400 INVALID_CITY`, `404 CITY_NOT_FOUND`, `502 UPSTREAM_*`, `503 UPSTREAM_RATE_LIMITED`, `500 MISSING_API_KEY` |
| GET | `/api/cities` | – | `200 [{ id, name, address, createdAt }]` (newest first) | – |
| POST | `/api/cities` | `{ "name": "Da Nang" }` | `201` created city | `400 INVALID_CITY` / `INVALID_JSON`, `404 CITY_NOT_FOUND`, `409 CITY_ALREADY_SAVED`, `422 CITY_LIMIT_REACHED` (max 10) |
| DELETE | `/api/cities/:id` | – | `204` | `400 INVALID_ID`, `404 CITY_NOT_FOUND` |

City names: 1–80 characters, letters (any language), spaces and `, . ' -`. A city is saved only if Visual Crossing knows it.

Forecast shape: `{ address, resolvedAddress, latitude, longitude, timezone, current: { temp, feelslike, humidity, precipprob, windspeed, pressure, visibility, uvindex, sunset, icon, datetimeEpoch }, days: [{ datetime, temp, tempmax, tempmin, precipprob, icon, hours: [{ datetime, temp, icon }] }] }` (max 7 days).

### Data

`saved_cities(id, name UNIQUE NOCASE, address, created_at)` in SQLite. The table is created on start-up; there is no seed data. Delete the `.db` file to reset.

## Project structure

```
src/
  api/          fetch wrapper (ApiError) and API functions
  queries/      TanStack Query: QueryClient defaults, query keys, useQuery/useMutation hooks
  settings/     unit/time settings (client state, saved in localStorage)
  components/   pages and UI components
  utils/        unit conversion
  routes.jsx    React Router routes (lazy Map page, error boundary)
server/
  src/app.js    Express routes, CORS, logging, error handler
  src/services/ weather (Visual Crossing) and saved-cities logic
  test/         API + service tests
docs/           requirement tracker, progress log, handoff, demo guide
```

## Course documentation

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): requirement tracker (Tier 1A/1B/2/3)
- [docs/DEMO.md](docs/DEMO.md): demo checklist and explanations (state, cache, mutation)
- [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md): Tier 3 accessibility/performance measurements and fixes
- [docs/PROGRESS.md](docs/PROGRESS.md): progress log
- [docs/HANDOFF.md](docs/HANDOFF.md): current state for the next session
