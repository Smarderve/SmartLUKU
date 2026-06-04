// Theme Management System

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
        this.dispatchEvent();
    }

    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.theme = theme;
            localStorage.setItem('theme', this.theme);
            document.documentElement.setAttribute('data-theme', this.theme);
            this.updateThemeIcon();
            this.dispatchEvent();
        }
    }

    getTheme() {
        return this.theme;
    }

    updateThemeIcon() {
        const icons = document.querySelectorAll('[data-theme-icon]');
        icons.forEach(icon => {
            if (this.theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    dispatchEvent() {
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: this.theme } }));
    }
}

// Initialize theme manager globally
const themeManager = new ThemeManager();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
