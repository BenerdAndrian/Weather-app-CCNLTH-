# Requirement tracker

Source: instructor documents "0. Tầng 2 — Chuẩn kỹ nghệ phần mềm dùng chung",
"React 19 + Vite + TanStack" (Tier 1A, Tier 1B, minimum evidence, failure criteria,
self-check questions) and "Tầng 3 — Nâng cao chung cho Web Frontend", provided as screenshots on 2026-10-16.

Status values: Verified · Partial · Missing · Blocked · Unverified.
Last update: 2026-10-16 (Phase 3, first implementation pass). Demo steps: [DEMO.md](DEMO.md).

## Tier 1A — mandatory core

| ID | Expected outcome | Status | Evidence | Gap / next action |
|---|---|---|---|---|
| T1A-1 | Components, props, hooks, render; avoid redundant state | Verified | Old `DataContext` removed. Converted values, "is saved", active nav item and map position are derived during render (`Weather.jsx`, `Cities.jsx`, `Navbar.jsx`, `MapComponent.jsx`). Lists have `key`s. Lint clean incl. `react-hooks` rules | – |
| T1A-2 | Client state vs server state | Verified | Table in [DEMO.md §1](DEMO.md#1-client-state-và-server-state) | Be ready to explain it orally |
| T1A-3 | TanStack Query: keys, cache, loading/error/success, stale, invalidation after mutation | Verified | `src/queries/*`; tests `cityQueries.test.jsx`, `Weather.test.jsx`; browser check 2026-10-16 (network log shows cached forecasts not refetched) | – |
| T1A-4 | Vite role and config | Verified | `vite.config.js`: plugins, `/api` proxy (dev + preview), Vitest config; `import.meta.env.VITE_API_BASE_URL` | – |

## Tier 1B — selected items

| ID | Expected outcome | Status | Evidence | Gap / next action |
|---|---|---|---|---|
| T1B-1 | Router with route params | Verified | React Router 7 (user decision 2026-10-16): `/weather/:city`, `/weather/:city/air-conditions`, `*` | – |
| T1B-2 | Optimistic update, rollback on error, targeted refetch | Verified | `useAddCity`/`useDeleteCity`; tests for optimistic + rollback; browser: unknown city appears then rolls back | – |
| T1B-3 | Error boundary / Suspense | Partial | Route `errorElement` (`RouteError`), `<Suspense>` for lazy Map. 404 route checked in browser | Render-error boundary not exercised by a test |
| T1B-4 | Code splitting + bundle analysis | Verified | `React.lazy(MapPage)`; numbers in [DEMO.md §6](DEMO.md#6-code-splitting-số-liệu-đo) | – |
| T1B-5 | React Compiler + profiler | Not selected | – | – |
| T1B-6 | Form library | Not applicable | Only a search box | – |

## Minimum evidence

| ID | Expected outcome | Status | Evidence |
|---|---|---|---|
| EV-1 | One server-state datum and its cache lifecycle | Verified | `['weather', city]`, [DEMO.md §2](DEMO.md#2-vòng-đời-cache-của-weather-city) |
| EV-2 | A mutation changing data + cache handling | Verified | Saved cities (SQLite) via POST/DELETE, `invalidateQueries` + optimistic/rollback |
| EV-3 | Production build works; optimization backed by numbers | Verified | `npm run build` ok; 471.95 kB → 359.83 kB initial JS |

## Tier 2 — shared software-engineering standards

| ID | Expected outcome | Status | Evidence | Gap / next action |
|---|---|---|---|---|
| T2-1 | Branches, PR, cross review, meaningful commits | Partial | Work committed on `refactor` in small descriptive commits (2026-10-16), not on `main` | Not pushed; no PR yet. Needs a PR `refactor` → `main` with review |
| T2-2 | README, runtime versions, install/run commands; Docker when reasonable | Partial | README, `.nvmrc`, `engines`, `server/Dockerfile`, `docker-compose.yml` | Docker build **unverified** (Docker engine not running on 2026-10-16) |
| T2-3 | Secrets via env vars, `.env.example`, no real secret committed | Partial | Key only in `server/.env` (git-ignored); `server/.env.example`, `.env.example` | Old keys remain in git history (since `336dbf0`). **User must rotate the Visual Crossing key** |
| T2-4 | Unit / API / component tests | Verified | Frontend 16 tests (unit, hooks, component/flow), backend 19 tests (Supertest + service) | – |
| T2-5 | CI build/lint/test | Partial | `.github/workflows/ci.yml` | Not yet run on GitHub (needs push) |
| T2-6 | Basic security relevant to the project | Verified | Input validation, parameterized SQL, CORS allow-list (tested), JSON body limit, key server-side, `rel="noopener noreferrer"`, React escaping (no `dangerouslySetInnerHTML`) | No auth: single-user app, documented as a limitation |
| T2-7 | Error handling & observability | Verified | Uniform error JSON, request log line, `/api/health`, Docker `HEALTHCHECK`; UI loading/error/empty states | – |
| T2-8 | Technical docs | Verified | README: setup, env, API endpoints, data | – |

## Tier 3 — optional (needs user approval before any work)

| ID | Item | Status |
|---|---|---|
| T3-A11Y | Accessibility/performance (Lighthouse, keyboard/ARIA, fix ≥1 issue) | **Verified**: approved 2026-10-16; CLS 0.376 → 0, Accessibility 96 → 100, SEO 75 → 100; see [LIGHTHOUSE.md](LIGHTHOUSE.md) |
| T3-DND | Drag-and-drop reorder of saved cities | Not selected |
| Others (animation, 3D/viz, virtualization, realtime, rich editor, PWA) | Not proposed |

## Backend

| ID | Expected outcome | Status | Evidence |
|---|---|---|---|
| BE-1 | Minimal functional backend used by the frontend | Verified | Express + SQLite in `server/`; real Visual Crossing requests checked 2026-10-16 |
