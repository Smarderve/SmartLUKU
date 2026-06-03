# SmartLUKU - Project Structure

## Directory Organization

```
SmartLUKU/
├── public/                          # Public-facing pages
│   ├── index.html                  # Landing page
│   └── pages/
│       ├── auth/                   # Authentication pages
│       │   ├── login.html         # Login with meter/email options
│       │   └── register.html       # Registration (meter-first)
│       └── app/                    # Main application pages
│           ├── dashboard.html      # Main dashboard
│           ├── payment.html        # Payment/buy units
│           ├── monitoring.html     # Real-time consumption tracking
│           ├── history.html        # Transaction history
│           ├── analytics.html      # Usage analytics & insights
│           └── settings.html       # Account settings
│
├── src/                             # Source code
│   ├── js/
│   │   ├── core/                  # Core functionality
│   │   │   ├── auth.js           # Authentication & session management
│   │   │   ├── utils.js          # Utility functions (storage, validation, etc)
│   │   │   └── data.js           # Data management (transactions, consumption)
│   │   ├── modules/              # Feature-specific logic
│   │   │   ├── payment.js        # Payment processing
│   │   │   ├── monitoring.js     # Consumption tracking
│   │   │   ├── history.js        # Transaction history
│   │   │   ├── analytics.js      # Analytics calculations
│   │   │   └── settings.js       # Settings management
│   │   └── components/           # Reusable components
│   │       └── sidebar.js        # Sidebar navigation component
│   └── css/
│       └── custom.css            # Custom styling & variables
│
├── docs/                            # Documentation
│   ├── DASHBOARD_REDESIGN.md      # Dashboard redesign notes
│   └── _TEST_PLAN.md              # Testing checklist
│
├── README.md                        # Project documentation
├── STRUCTURE.md                     # This file
└── .git/                            # Git repository

```

## File Hierarchy & Dependencies

### Authentication Flow
```
public/index.html
  ↓
  → pages/auth/login.html (src/js/core/auth.js, src/js/core/utils.js)
  → pages/auth/register.html (src/js/core/auth.js, src/js/core/utils.js)
  ↓
  pages/app/dashboard.html
```

### Application Pages (All require authentication)
```
pages/app/dashboard.html
  ├─ src/js/core/auth.js (guard check)
  ├─ src/js/core/utils.js
  ├─ src/js/core/data.js
  ├─ src/js/components/sidebar.js
  └─ src/css/custom.css

pages/app/payment.html
  ├─ src/js/modules/payment.js
  ├─ src/js/core/data.js
  ├─ src/js/components/sidebar.js
  └─ (same core dependencies)

pages/app/monitoring.html → src/js/modules/monitoring.js
pages/app/history.html → src/js/modules/history.js
pages/app/analytics.html → src/js/modules/analytics.js
pages/app/settings.html → src/js/modules/settings.js
```

## Path Reference Guide

### From Landing Page (public/index.html)
```javascript
// CSS
href="src/css/custom.css"

// Scripts
src="src/js/core/utils.js"
src="src/js/core/auth.js"

// Navigation
href="pages/auth/login.html"
href="pages/auth/register.html"
href="pages/app/dashboard.html"
```

### From Auth Pages (public/pages/auth/*.html)
```javascript
// CSS
href="../../src/css/custom.css"

// Scripts
src="../../src/js/core/utils.js"
src="../../src/js/core/auth.js"

// Navigation (same folder)
href="login.html" or "register.html"

// External
href="../../index.html" (logo/back)
href="../app/dashboard.html" (redirects)
```

### From App Pages (public/pages/app/*.html)
```javascript
// CSS
href="../../../src/css/custom.css"

// Core Scripts
src="../../../src/js/core/utils.js"
src="../../../src/js/core/auth.js"
src="../../../src/js/core/data.js"
src="../../../src/js/components/sidebar.js"

// Module Scripts (varies by page)
src="../../../src/js/modules/payment.js" (payment.html)
src="../../../src/js/modules/monitoring.js" (monitoring.html)
src="../../../src/js/modules/history.js" (history.html)
src="../../../src/js/modules/analytics.js" (analytics.html)
src="../../../src/js/modules/settings.js" (settings.html)

// Navigation (same folder)
href="dashboard.html"
href="payment.html"
href="monitoring.html"
href="history.html"
href="analytics.html"
href="settings.html"

// External
href="../../index.html" (logo click)
href="../auth/login.html" (redirects on auth failure)
```

## Key Modules

### Core Modules (src/js/core/)
- **auth.js** - AuthManager, AuthGuard, SessionManager
- **utils.js** - StorageManager, Validator, Notification, DateFormatter, CurrencyFormatter, API, Logger
- **data.js** - DataManager for all data persistence

### Feature Modules (src/js/modules/)
- **payment.js** - Payment form submission, fee calculation
- **monitoring.js** - Real-time consumption charts (Chart.js)
- **history.js** - Transaction filtering, pagination, export
- **analytics.js** - Monthly/yearly trends, cost breakdown
- **settings.js** - Account management, preferences, security

### UI Components (src/js/components/)
- **sidebar.js** - Navigation component (injected into all app pages)

## Data Persistence

All data stored in localStorage under:
- `smartluku_users` - User accounts (indexed by meter number)
- `smartluku_transactions` - Payment history
- `smartluku_consumption` - Usage logs
- `smartluku_preferences` - User preferences
- `smartluku_token` - Session token
- `smartluku_session` - Session data

## Development Notes

1. **Relative Paths**: All paths use relative references for portability
2. **Script Order**: Auth modules must load before utils to avoid conflicts
3. **Sidebar Injection**: Dynamic injection prevents code duplication
4. **localStorage**: All data is client-side only (demo/prototype)
5. **Demo Account**: meter: `1234567890`, password: `Demo@123`

## Testing

See `_TEST_PLAN.md` for comprehensive testing checklist covering:
- Authentication flows
- All feature pages
- Data persistence
- Chart rendering
- Responsive design
- Navigation and redirects

## Next Steps

1. Backend API integration (replace localStorage)
2. Real payment gateway integration
3. TANESCO meter API integration
4. SMS/Email notification system
5. Mobile app development
6. Progressive Web App (PWA) support
