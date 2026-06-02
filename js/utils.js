// Utility Functions for SmartLUKU

/**
 * Local Storage Manager
 * Handles all local storage operations
 */
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }

    static get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
}

/**
 * Validation Functions
 */
class Validator {
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static isValidPassword(password) {
        // Min 8 chars, 1 uppercase, 1 number
        return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    }

    static isValidPhone(phone) {
        // Basic validation for Tanzanian phone numbers
        const regex = /^(\+255|0)[67]\d{8}$/;
        return regex.test(phone.replace(/\s/g, ''));
    }

    static isValidMeterNumber(meterNumber) {
        return meterNumber.length >= 9 && /^\d+$/.test(meterNumber);
    }

    static isNotEmpty(value) {
        return value.trim().length > 0;
    }
}

/**
 * Notification System
 */
class Notification {
    static show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in`;
        
        const icons = {
            success: 'fas fa-check-circle text-green-500',
            error: 'fas fa-exclamation-circle text-red-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            info: 'fas fa-info-circle text-blue-500'
        };

        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span class="text-gray-800">${message}</span>
            <button class="ml-auto text-gray-600 hover:text-gray-800">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    static success(message, duration) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

/**
 * Date Formatter
 */
class DateFormatter {
    static format(date, format = 'DD/MM/YYYY') {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const formatMap = {
            'DD/MM/YYYY': `${day}/${month}/${year}`,
            'YYYY-MM-DD': `${year}-${month}-${day}`,
            'DD MMM YYYY': `${day} ${this.getMonthName(date.getMonth())} ${year}`,
            'DD MMM YYYY HH:mm': `${day} ${this.getMonthName(date.getMonth())} ${year} ${hours}:${minutes}`
        };

        return formatMap[format] || formatMap['DD/MM/YYYY'];
    }

    static getMonthName(monthIndex) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthIndex];
    }

    static getTimeAgo(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return this.format(date, 'DD MMM YYYY');
    }
}

/**
 * Currency Formatter
 */
class CurrencyFormatter {
    static format(amount, currency = 'TZS') {
        const formatter = new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    static parse(value) {
        return parseFloat(value.replace(/[^\d.-]/g, ''));
    }
}

/**
 * API Helper
 */
class API {
    static async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    static async post(url, data, options = {}) {
        return this.request(url, { ...options, method: 'POST', body: JSON.stringify(data) });
    }

    static async put(url, data, options = {}) {
        return this.request(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
    }

    static async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    static async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${StorageManager.get('authToken')}`
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
}

/**
 * Debug Logger
 */
class Logger {
    static log(message, data = null) {
        console.log(`[SmartLUKU] ${message}`, data || '');
    }

    static error(message, data = null) {
        console.error(`[SmartLUKU ERROR] ${message}`, data || '');
    }

    static warn(message, data = null) {
        console.warn(`[SmartLUKU WARNING] ${message}`, data || '');
    }

    static info(message, data = null) {
        console.info(`[SmartLUKU INFO] ${message}`, data || '');
    }
}

/**
 * Export for use in other modules
 */
window.SmartLUKU = {
    StorageManager,
    Validator,
    Notification,
    DateFormatter,
    CurrencyFormatter,
    API,
    Logger
};
