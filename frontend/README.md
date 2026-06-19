# SmartLUKU Frontend (React)

Modern, tokenless SmartLUKU UI built with **React + Vite + TypeScript + Tailwind + shadcn/ui**.
This is the primary frontend; it talks to the existing Express backend in [`../server`](../server).

## Stack

- **Build:** Vite + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives), `lucide-react` icons
- **State:** Zustand (auth, simulation, UI, settings) + TanStack Query (server data)
- **Charts:** Recharts · **Maps:** react-leaflet
- **i18n:** i18next + react-i18next — **Swahili-first**, English toggle

## Getting started

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 (proxies /api -> http://localhost:3001)
```

Run the backend separately so API calls resolve:

```bash
cd ../server
npm install
npm start            # http://localhost:3001
```

The app degrades gracefully if the backend/DB is offline (outages and history fall
back to `localStorage`, the AI advisor returns an offline reply).

## Build & preview

```bash
npm run build        # tsc -b && vite build  ->  dist/
npm run preview      # serve dist/ on :4173 (also proxies /api -> :3001)
```

For static hosting use [`serve.json`](serve.json) (SPA rewrites + asset caching):

```bash
npx serve            # reads serve.json, serves dist/
```

## Structure

```
src/
  components/ui/        shadcn primitives (button, card, dialog, ...)
  components/layout/    AppShell, Sidebar, TopBar, NotificationsMenu
  components/common/    shared widgets (StatCard)
  features/             one folder per screen
    auth/ dashboard/ payment/ monitoring/ history/
    analytics/ network/ settings/ advisor/
  lib/                  api client, config, tanzania-data, series, utils, hooks
  store/                zustand stores (auth, simulation, ui, settings, transactions)
  i18n/                 sw.json (default), en.json
  styles/globals.css    design tokens (TANESCO emerald, tokenless)
```

## Tokenless model

Payment credits the meter directly: pay -> simulated STK push -> units added to the
balance -> confirmation (units credited, new balance, auto-reconnect). There is **no
20-digit token** anywhere in the flow.

## Notes / follow-ups

- Backend has no real auth yet; auth is client-side (meter-keyed) for now.
- The IoT 3D lab (`../simulation.html`) is kept as a separate legacy page; porting it to
  `@react-three/fiber` is a later phase.
