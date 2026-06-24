# SmartLUKU - Project Structure

SmartLUKU is a tokenless electricity payment & monitoring platform. The UI is a
modern **React + Vite + TypeScript + Tailwind + shadcn/ui** app in [`frontend/`](frontend)
(Swahili-first), talking to an **Express + PostgreSQL** REST API in [`server/`](server).

```
SmartLUKU/
├── frontend/          # React app (primary UI)
├── server/            # Express REST API + PostgreSQL
├── docker-compose.yml # local Postgres
├── .env.example       # backend environment template
├── README.md
└── STRUCTURE.md       # this file
```

## Frontend — `frontend/`

```
frontend/
├── index.html                       # Vite entry
├── vite.config.ts                   # dev/preview proxy /api -> :3001, vendor chunks
├── tailwind.config.ts               # design tokens (TANESCO emerald, tokenless)
├── components.json                  # shadcn config
├── serve.json                       # static hosting (SPA rewrites + caching)
└── src/
    ├── main.tsx  App.tsx            # bootstrap + routes (lazy-loaded screens)
    ├── components/ui/               # shadcn primitives
    ├── components/layout/           # AppShell, Sidebar, TopBar, NotificationsMenu
    ├── components/common/           # StatCard
    ├── features/                    # one folder per screen
    │   ├── auth/  dashboard/  payment/  monitoring/
    │   ├── history/  analytics/  network/  settings/  advisor/
    ├── lib/                         # api, config, tanzania-data, series, hooks, utils
    ├── store/                       # zustand: auth, simulation, ui, settings, transactions
    ├── i18n/                        # sw.json (default), en.json
    └── styles/globals.css           # CSS variable design tokens
```

State is split between **Zustand** (client state: auth, simulation, UI, settings,
transactions) and **TanStack Query** (server data). Routes are lazy-loaded and vendor
code is split (react, charts, map, i18n) for fast initial loads.

## Backend — `server/`

```
server/
├── index.js           # Express app, REST API on :3001
├── smartluku-sms.js   # Africa's Talking SMS helper
├── schema.sql         # PostgreSQL schema (users, transactions, ...)
└── package.json
```

Key endpoints (all under `/api`): `users`, `transactions`, `consumption`,
`simulation`, `outages`, `chat` (AI advisor), and `sms/*` (low-balance alerts).
Payments are **tokenless** — paying credits the meter directly (`balance_tzs`,
`units_kwh`); there is no 20-digit token anywhere in the system.

## Tokenless model

Pay → simulated STK push → units credited to the balance → confirmation
(units credited, new balance, auto-reconnect on a zero balance). No codes to copy,
no numbers to key into a meter.

## Getting started

See [`README.md`](README.md) for run instructions and [`frontend/README.md`](frontend/README.md)
for frontend build/preview details.
