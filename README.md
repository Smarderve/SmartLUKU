# SmartLUKU - Electricity Payment & Monitoring Platform

A professional, user-friendly web platform for Tanzanian households to pay for electricity, monitor usage in real-time, and manage their TANESCO accounts efficiently.

## 📋 Project Overview

**Frontend**: The primary UI is a modern **React + Vite + TypeScript + Tailwind + shadcn/ui** app in [`frontend/`](frontend) (Swahili-first, tokenless). The original Vanilla-JS pages (`app.html`, `login.html`, `register.html`, etc.) are the legacy prototype, kept during migration. See [`frontend/README.md`](frontend/README.md) to run the new app.

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

**Frontend (primary — [`frontend/`](frontend))**

- **React + Vite + TypeScript**
- **Tailwind CSS + shadcn/ui** (Radix), `lucide-react` icons
- **Zustand** (auth, simulation, UI, settings) + **TanStack Query** (server data)
- **Recharts** (charts) · **react-leaflet** (grid map)
- **i18next** — Swahili-first bilingual (EN toggle)
- Mobile-first, dark mode, `localStorage` for client-side state

**Backend ([`server/`](server))**

- **Node.js / Express** REST API (`:3001`), **PostgreSQL**
- Africa's Talking SMS gateway, Claude AI advisor

**Legacy prototype (root `*.html` + `src/js/`)**

- Vanilla JS (ES6+), Tailwind (CDN), Font Awesome — kept during migration

## 📁 Project Structure

```
SmartLUKU/
├── index.html              # Landing page
├── login.html              # User login
├── register.html           # User registration
├── dashboard.html          # Main dashboard (Phase 1 complete)
├── payment.html            # Payment processing (Phase 2)
├── monitoring.html         # Real-time monitoring (Phase 2)
├── history.html            # Transaction history (Phase 2)
├── analytics.html          # Usage analytics (Phase 2)
├── settings.html           # User settings (Phase 2)
├── assets/
│   └── css/
│       └── custom.css      # Custom styles & utilities
├── js/
│   ├── utils.js            # Helper functions & managers
│   ├── auth.js             # Authentication system
│   ├── dashboard.js        # Dashboard logic (Phase 2)
│   ├── payment.js          # Payment logic (Phase 2)
│   ├── monitoring.js       # Monitoring logic (Phase 2)
│   └── data.js             # Mock data & API calls (Phase 2)
├── components/
│   ├── navbar.html         # Reusable navbar
│   ├── sidebar.html        # Reusable sidebar
│   └── footer.html         # Reusable footer
└── README.md               # This file
```

## 🎨 Design Guidelines

- **Primary Color**: `#1E40AF` (Deep Blue - Trust)
- **Accent Color**: `#10B981` (Emerald Green - Energy/Success)
- **Warning Color**: `#F59E0B` (Amber - Caution)
- **Dark Mode**: Gray-900 for dark backgrounds
- **Typography**: Segoe UI, Tahoma, Geneva for accessibility
- **Spacing**: Consistent padding/margins (4px base unit)
- **Shadows**: Subtle, professional
- **Transitions**: Smooth 300ms ease
- **Accessibility**: High contrast, keyboard navigation, ARIA labels

## 📱 Features Breakdown

### Phase 1 ✅ (Complete)
- [x] Landing page with hero section
- [x] Feature showcase
- [x] User testimonials
- [x] User registration with validation
- [x] User login with demo account
- [x] Dashboard home page
- [x] Basic authentication system
- [x] Session management
- [x] Responsive mobile design

### Phase 2 (In Progress)
- [ ] Payment processing page
- [ ] Real-time consumption monitoring
- [ ] Transaction history
- [ ] Usage analytics & charts
- [ ] Low balance alerts
- [ ] Tokenless auto-crediting (pay → meter credited → power flows)
- [ ] Settings & profile management
- [ ] Notification preferences

### Phase 3 (Planned)
- [ ] Budget creation & tracking
- [ ] Bill predictions
- [ ] Consumption optimization tips
- [ ] Multi-language support (Swahili)
- [ ] Dark mode
- [ ] Offline mode
- [ ] Export reports (PDF)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) PostgreSQL for backend persistence

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

### Legacy prototype (optional)

The original Vanilla-JS pages can still be served statically from the repo root:
```bash
python -m http.server 8000   # then open http://localhost:8000/app.html
```

## 🔐 Authentication System

### Features
- Secure password hashing (client-side demo)
- Session management with 30-minute timeout
- Remember me functionality
- Email validation
- Password strength requirements
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number

### Storage
- User data stored in browser LocalStorage
- Demo data auto-initialized on first load
- Sessions are user-specific

## 📊 Core Modules

### `utils.js`
Provides utility classes:
- **StorageManager**: LocalStorage operations
- **Validator**: Input validation functions
- **Notification**: Toast notifications
- **DateFormatter**: Date formatting utilities
- **CurrencyFormatter**: Currency formatting (TZS)
- **API**: HTTP request helpers
- **Logger**: Debug logging

### `auth.js`
Provides authentication classes:
- **AuthManager**: User registration, login, logout
- **AuthGuard**: Route protection middleware
- **SessionManager**: Session timeout handling

## 🎨 Styling System

### CSS Classes
- `.btn-primary`: Primary action button
- `.btn-secondary`: Secondary action button
- `.btn-accent`: Accent action button
- `.card`: Card/panel component
- `.badge-*`: Badge variants
- `.alert-*`: Alert variants
- `.shadow-*`: Shadow utilities

### Responsive Breakpoints
- Mobile: < 768px (default)
- Tablet: 768px - 1024px (md:)
- Desktop: > 1024px

## 🔌 Component Library

### Button Components
```html
<a href="#" class="btn-primary">Primary</a>
<a href="#" class="btn-secondary">Secondary</a>
<a href="#" class="btn-accent">Accent</a>
```

### Card Components
```html
<div class="card">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>
```

### Alert Components
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-danger">Error message</div>
<div class="alert alert-info">Info message</div>
```

### Badge Components
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-accent">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

## 📈 Usage Statistics (Mock Data)

The demo account comes pre-populated with:
- **Account Balance**: TZS 50,000
- **Remaining Units**: 125.5 kWh
- **Account Status**: Active
- **Meter Number**: 1234567890

## 🧪 Testing

### Manual Testing Checklist
- [ ] Landing page loads correctly
- [ ] All navigation links work
- [ ] Registration form validates input
- [ ] Login with demo account works
- [ ] Dashboard displays user data
- [ ] Logout functionality works
- [ ] Responsive design on mobile
- [ ] Session timeout works (30 min)
- [ ] Password visibility toggle works
- [ ] Remember me checkbox functions

### Known Limitations
- Password hashing is simplified (client-side only)
- Data persists only in browser LocalStorage
- No real payment processing
- No SMS/Email notifications
- No backend API integration

## 🔄 Data Flow

```
User Registration
    ↓
User Data + Password Hash → LocalStorage
    ↓
Redirect to Dashboard
    ↓
Session Created (30 min timeout)
    ↓
Dashboard loads User Profile
    ↓
User can navigate pages
    ↓
Logout → Clear Session & LocalStorage
```

## 🛣️ Navigation Structure

```
index.html (Landing)
├── login.html (Auth)
│   ├── Register link → register.html
│   └── Demo login → dashboard.html
├── register.html (Auth)
│   └── Success → dashboard.html
└── dashboard.html (Protected)
    ├── Buy Units → payment.html
    ├── Monitor Usage → monitoring.html
    ├── History → history.html
    ├── Analytics → analytics.html
    ├── Settings → settings.html
    └── Logout → index.html
```

## 📝 Best Practices

### For Developers
1. **Keep it DRY**: Reuse components and utilities
2. **Validate Input**: Always validate user input client-side
3. **Handle Errors**: Provide user-friendly error messages
4. **Use LocalStorage Wisely**: Don't store sensitive data
5. **Test Responsiveness**: Check mobile, tablet, desktop views
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Performance**: Lazy load images and optimize CSS/JS

### For Users
1. Use a strong, unique password
2. Don't share your login credentials
3. Log out when using shared devices
4. Update profile with correct meter number
5. Set up notifications for low balance

## 🤝 Contributing

To contribute to SmartLUKU:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- TANESCO for the inspiration
- Tanzanian community feedback
- Font Awesome for icons
- Tailwind CSS for styling utilities

## 📞 Support

For support, email support@smartluku.tz or open an issue on GitHub.

## 🔮 Future Roadmap

- [ ] Backend API integration (Node.js/Express)
- [ ] Database implementation (PostgreSQL)
- [ ] Mobile app (React Native)
- [ ] SMS payment reminders
- [ ] Email receipts
- [ ] Multi-language support
- [ ] AI-powered consumption predictions
- [ ] Community leaderboards
- [ ] Integration with other utilities

---

**Built with ❤️ for Tanzanian households**

**Last Updated**: June 2026