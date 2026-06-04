# SmartLUKU: Professional Theme System & Responsive Design

## 🎨 Light/Dark Theme System

### How It Works
- **CSS Variables**: All colors defined in `:root` for light mode
- **Data Attribute**: `[data-theme="dark"]` overrides colors for dark mode
- **Persistence**: Theme preference saved to `localStorage`
- **JavaScript Manager**: `ThemeManager` class handles toggle and persistence

### Color Variables
```css
:root {
  /* Light Mode */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --border-color: #e5e7eb;
  
  /* Dark Mode Override */
  [data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border-color: #475569;
  }
}
```

### Theme Toggle
- Button with moon/sun icon appears on all pages
- Positioned in top-right corner (desktop) or top bar (mobile)
- Uses `data-theme-icon` attribute to auto-update icon
- Smooth transitions when switching themes

### Using Theme System
1. Import `theme.js` on any page
2. Add theme toggle button with `id="themeToggle"` and `data-theme-icon`
3. Theme manager auto-initializes on page load
4. CSS automatically respects `data-theme` attribute

## 📱 Responsive Design Approach

### Mobile-First Strategy
- Desktop default: 1200px+ breakpoints
- Tablet: 769px-1024px
- Mobile: 480px-768px
- Extra small: <480px

### Breakpoint Strategy
```css
/* Default: Desktop */
.sidebar { width: 280px; position: fixed; }
.main-content { margin-left: 280px; }

/* Tablet and Mobile */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    transform: translateY(100%);
    border-radius: 1rem 1rem 0 0;
  }
  
  .main-content {
    margin-left: 0;
    padding-bottom: 6rem;
  }
}
```

### Navigation Layout
**Desktop:**
- Fixed left sidebar (280px wide)
- Full navigation menu visible
- Logo and user profile at top

**Mobile:**
- Hamburger menu icon
- Floating bottom navigation sheet
- Slides up from bottom
- Closes on navigation

### Responsive Grid System
```css
/* Responsive Grid */
.grid-cols-1 { grid-template-columns: 1fr; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Auto-responsive */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
```

## 📄 Page-by-Page Design

### Dashboard
- **Desktop**: 4-column stat grid, sidebar menu, quick actions
- **Tablet**: 2-column stat grid, narrow sidebar
- **Mobile**: 1-column stacked layout, bottom menu
- Features: Live alerts, transaction table, balance display

### Payment Page
- **Desktop**: 2-column layout (form + summary)
- **Mobile**: Stacked layout, sticky summary card
- Features: Amount calculator, payment method selector, cost display

### Monitoring Page
- **Desktop**: 3 stat boxes + 2 charts side by side
- **Mobile**: Stacked stat boxes and charts
- Features: Real-time metrics, Chart.js charts with theme support

### History Page
- **Desktop**: Full-width transaction table
- **Mobile**: Responsive table with horizontal scroll
- Features: Sortable columns, date filtering, status badges

### Analytics Page
- **Desktop**: 4 metric cards + 2 charts
- **Mobile**: Stacked cards and single chart
- Features: Usage trends, cost breakdown, energy tips

### Settings Page
- **Desktop**: 2-column layout (menu + content)
- **Mobile**: Single column with tab-like navigation
- Features: Profile editing, theme toggle, notifications, security

## 🛠️ Technical Implementation

### Theme.js Usage
```javascript
// Auto-initializes globally
const themeManager = new ThemeManager();

// Toggle theme
document.getElementById('themeToggle').addEventListener('click', () => {
  themeManager.toggle();
});

// Get current theme
const currentTheme = themeManager.getTheme(); // 'light' or 'dark'

// Set specific theme
themeManager.setTheme('dark');
```

### Responsive Classes
```html
<!-- Shows only on mobile -->
@media (max-width: 768px) { .menu-icon { display: block; } }

<!-- Responsive grid -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">

<!-- Flexible layout -->
<div style="display: flex; flex-direction: column; gap: 1rem;">
```

### Mobile-Friendly Inputs
```css
input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem; /* Prevents zoom on iOS */
  border-radius: 0.5rem;
}

/* Focus states for accessibility */
input:focus {
  outline: none;
  border-color: var(--green-main);
  box-shadow: 0 0 0 3px rgba(31, 90, 61, 0.1);
}
```

## ✅ Tested Responsive Breakpoints

- ✓ Extra Large (1440px+) - Full desktop layout
- ✓ Desktop (1024px-1439px) - Optimized columns
- ✓ Tablet (768px-1023px) - Sidebar on bottom, single column
- ✓ Mobile (480px-767px) - Full-width stacked
- ✓ Small Mobile (320px-479px) - Compact layout

## 🎯 Key Features

### Professional Design Elements
- Gradient buttons with hover effects
- Smooth transitions and animations
- Consistent color scheme throughout
- Professional typography
- Proper spacing and alignment
- Card-based layouts
- Shadow effects for depth

### Accessibility Features
- High contrast text
- Focus states on inputs
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Touch-friendly buttons (minimum 44px)

### Performance Optimizations
- CSS variables for fast theme switching
- Minimal JavaScript
- CSS Grid for responsive layouts
- Efficient media queries
- No heavy libraries (except Chart.js)

## 📋 Quick Reference

### Theme Toggle Button
```html
<button class="theme-toggle" id="themeToggle" data-theme-icon>
  <i class="fas fa-moon"></i>
</button>
```

### Theme Script
```html
<script src="src/js/core/theme.js"></script>
<script>
  document.getElementById('themeToggle').addEventListener('click', () => {
    themeManager.toggle();
  });
</script>
```

### Responsive Container
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
  <!-- Cards will automatically adjust -->
</div>
```

## 🚀 Browser Support

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support (CSS variables since iOS 12.2)
- Mobile browsers: ✓ Full support
- Internet Explorer: ✗ Not supported (CSS variables not supported)

## 📞 Common Tasks

### To add a page with theme support:
1. Import theme.js
2. Add theme toggle button
3. Use CSS variables for colors
4. Use responsive media queries
5. Add mobile hamburger menu

### To customize colors:
Edit `/src/css/custom.css` and update CSS variables in `:root` and `[data-theme="dark"]`

### To change breakpoints:
Modify media query values in CSS (currently 768px for desktop/mobile)

## 🎓 Design Philosophy

**Professional + Modern + Accessible**
- Clean, minimal aesthetic
- Dark green primary color reflects trust and energy
- Yellow accents for attention
- Smooth interactions
- Responsive to all devices
- Accessible to all users
- Performance optimized
