# SmartLUKU - Electricity Payment & Monitoring Platform

A modern, Swahili-first web platform for Tanzanian households to pay for electricity,
monitor usage in real-time, and manage their TANESCO accounts — **without tokens**.

## 📋 Project Overview

The UI is a modern **React + Vite + TypeScript + Tailwind + shadcn/ui** app in
[`frontend/`](frontend), talking to an **Express + PostgreSQL** REST API in
[`server/`](server). See [`frontend/README.md`](frontend/README.md) to run the app.

### Problem Statement
- Buying power means receiving a 20-digit token and manually keying it into the meter — slow, error-prone, and often impossible (meters are mounted high/outdoors, out of reach for the elderly, disabled, or children)
- No real-time monitoring of remaining units
- Sudden power disconnections due to lack of alerts
- Limited digital access for many users

### Proposed Solution
A platform that removes tokens entirely — you pay and electricity keeps flowing:
- ✅ Seamless payments via mobile money, banks, cards
- ✅ Tokenless top-ups — paying credits the meter directly and instantly (no codes to copy, no numbers to key in)
- ✅ Automatic reconnection the moment a payment lands on a zero balance
- ✅ Real-time balance and consumption tracking
- ✅ Low balance alerts (in-app and SMS) so power never cuts off by surprise
- ✅ Usage analytics and budgeting tools

## 🎯 Core Objectives

1. **Enhance Convenience**: Reduce payment errors and time spent on transactions
2. **Provide Visibility**: Real-time monitoring to prevent outages
3. **Promote Inclusion**: Digital literacy while maintaining hybrid support
4. **Actionable Insights**: Analytics and budgeting tools
5. **Scalability**: Foundation for future utility integrations

## 👥 Target Users

- **Primary**: Tanzanian households using TANESCO electricity
- **Secondary**: TANESCO staff and partners

## 🛠️ Technical Stack

**Frontend ([`frontend/`](frontend))**

- **React + Vite + TypeScript**
- **Tailwind CSS + shadcn/ui** (Radix), `lucide-react` icons
- **Zustand** (auth, simulation, UI, settings, transactions) + **TanStack Query** (server data)
- **Recharts** (charts) · **react-leaflet** (national grid map)
- **i18next** — Swahili-first bilingual (EN toggle)
- Mobile-first, dark mode, lazy-loaded routes + vendor code-splitting

**Backend ([`server/`](server))**

- **Node.js / Express** REST API (`:3001`), **PostgreSQL**
- Africa's Talking SMS gateway, Claude AI advisor

## 📁 Project Structure

```
SmartLUKU/
├── frontend/          # React app (primary UI)
├── server/            # Express REST API + PostgreSQL
├── docker-compose.yml # local Postgres
├── .env.example       # backend environment template
├── README.md          # this file
└── STRUCTURE.md       # detailed structure guide
```

See [`STRUCTURE.md`](STRUCTURE.md) for a full breakdown of the frontend and backend.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) PostgreSQL for backend persistence — `docker compose up -d postgres`

### Running Locally (React frontend + backend)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SmartLUKU.git
   cd SmartLUKU
   ```

2. **Start the backend API** (`:3001`)
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Start the frontend** (`:5173`, proxies `/api` to the backend)
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Open** http://localhost:5173 and sign in with any meter number, or click
   **"Try with a demo account"**. See [`frontend/README.md`](frontend/README.md) for build/preview.

## 🔌 Backend API

REST API on `:3001`, all routes under `/api`:

- `users`, `transactions`, `consumption`, `simulation`
- `outages` — grid incident reports for the network map
- `chat` — AI energy advisor
- `sms/*` — low-balance SMS alerts (Africa's Talking)

Payments are **tokenless**: a payment credits the meter directly (`balance_tzs`,
`units_kwh`) — there is no 20-digit token anywhere in the system. The frontend
degrades gracefully when the backend/DB is offline (outages and history fall back
to `localStorage`).

## 🔮 Future Roadmap

- [ ] Real payment gateway + TANESCO meter API integration
- [ ] Server-side authentication (auth is currently client-side, meter-keyed)
- [ ] Port the IoT 3D lab to `@react-three/fiber`
- [ ] AI-powered consumption predictions
- [ ] Export reports (PDF)
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for Tanzanian households**
