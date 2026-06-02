// Authentication Manager for SmartLUKU

class AuthManager {
    constructor() {
        this.storageKey = 'smartluku_auth';
        this.tokenKey = 'smartluku_token';
        this.userKey = 'smartluku_user';
    }

    /**
     * Register a new user
     */
    async register(userData) {
        const { fullName, email, password, phone = null, meterNumber = null } = userData;

        // Validation
        const errors = [];
        const fields = [];

        if (!this.constructor.validateFullName(fullName)) {
            errors.push('Full name must be at least 2 characters');
            fields.push('fullName');
        }

        if (!SmartLUKU.Validator.isValidEmail(email)) {
            errors.push('Please enter a valid email address');
            fields.push('email');
        }

        if (!SmartLUKU.Validator.isValidPassword(password)) {
            errors.push('Password must have at least 8 characters, 1 uppercase letter, and 1 number');
            fields.push('password');
        }

        if (phone && !SmartLUKU.Validator.isValidPhone(phone)) {
            errors.push('Please enter a valid Tanzanian phone number');
            fields.push('phone');
        }

        if (meterNumber && !SmartLUKU.Validator.isValidMeterNumber(meterNumber)) {
            errors.push('Meter number must be at least 9 digits');
            fields.push('meterNumber');
        }

        // Check if email already exists
        if (this.constructor.emailExists(email)) {
            errors.push('Email address is already registered');
            fields.push('email');
        }

        if (errors.length > 0) {
            const error = new Error(errors[0]);
            error.fields = fields;
            throw error;
        }

        // Create user (simulated backend call)
        const user = {
            id: this.constructor.generateId(),
            fullName,
            email,
            phone: phone || '',
            meterNumber: meterNumber || '',
            createdAt: new Date().toISOString(),
            balance: 0,
            units: 0
        };

        // Store user data
        const token = this.constructor.generateToken();
        SmartLUKU.StorageManager.set(this.userKey, user);
        SmartLUKU.StorageManager.set(this.tokenKey, token);
        SmartLUKU.StorageManager.set('authUser', { user, token });

        // Store in mock database
        const users = SmartLUKU.StorageManager.get('smartluku_users') || [];
        users.push({
            ...user,
            password: this.constructor.hashPassword(password)
        });
        SmartLUKU.StorageManager.set('smartluku_users', users);

        SmartLUKU.Logger.log('User registered successfully', user);

        return user;
    }

    /**
     * Login user
     */
    async login(email, password, remember = false) {
        // Validation
        if (!SmartLUKU.Validator.isValidEmail(email)) {
            const error = new Error('Please enter a valid email address');
            error.fields = ['email'];
            throw error;
        }

        if (!password) {
            const error = new Error('Password is required');
            error.fields = ['password'];
            throw error;
        }

        // Get users from storage
        const users = SmartLUKU.StorageManager.get('smartluku_users') || [];

        // Find user by email
        const userData = users.find(u => u.email === email);

        if (!userData) {
            const error = new Error('Email or password is incorrect');
            error.fields = ['email', 'password'];
            throw error;
        }

        // Verify password (simplified - in real app use bcrypt on backend)
        if (userData.password !== this.constructor.hashPassword(password)) {
            const error = new Error('Email or password is incorrect');
            error.fields = ['email', 'password'];
            throw error;
        }

        // Create session
        const token = this.constructor.generateToken();
        const user = { ...userData };
        delete user.password;

        SmartLUKU.StorageManager.set(this.tokenKey, token);
        SmartLUKU.StorageManager.set(this.userKey, user);
        SmartLUKU.StorageManager.set('authUser', { user, token });

        if (remember) {
            SmartLUKU.StorageManager.set('rememberMe', email);
        }

        SmartLUKU.Logger.log('User logged in successfully', user);

        return user;
    }

    /**
     * Logout user
     */
    logout() {
        SmartLUKU.StorageManager.remove(this.tokenKey);
        SmartLUKU.StorageManager.remove(this.userKey);
        SmartLUKU.StorageManager.remove('authUser');
        SmartLUKU.Logger.log('User logged out');
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return SmartLUKU.StorageManager.get(this.userKey);
    }

    /**
     * Get auth token
     */
    getToken() {
        return SmartLUKU.StorageManager.get(this.tokenKey);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    /**
     * Refresh token
     */
    refreshToken() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const token = this.constructor.generateToken();
        SmartLUKU.StorageManager.set(this.tokenKey, token);
        return token;
    }

    /**
     * Update user profile
     */
    updateProfile(updates) {
        const user = this.getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const updatedUser = { ...user, ...updates };

        // Update in users list
        const users = SmartLUKU.StorageManager.get('smartluku_users') || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex > -1) {
            users[userIndex] = updatedUser;
            SmartLUKU.StorageManager.set('smartluku_users', users);
        }

        SmartLUKU.StorageManager.set(this.userKey, updatedUser);
        SmartLUKU.Logger.log('User profile updated', updatedUser);

        return updatedUser;
    }

    /**
     * Change password
     */
    changePassword(oldPassword, newPassword) {
        const users = SmartLUKU.StorageManager.get('smartluku_users') || [];
        const user = this.getCurrentUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const userData = users.find(u => u.id === user.id);

        if (!userData) {
            throw new Error('User not found');
        }

        // Verify old password
        if (userData.password !== this.constructor.hashPassword(oldPassword)) {
            const error = new Error('Current password is incorrect');
            error.fields = ['oldPassword'];
            throw error;
        }

        // Validate new password
        if (!SmartLUKU.Validator.isValidPassword(newPassword)) {
            const error = new Error('Password must have at least 8 characters, 1 uppercase letter, and 1 number');
            error.fields = ['newPassword'];
            throw error;
        }

        // Update password
        userData.password = this.constructor.hashPassword(newPassword);
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = userData;
        SmartLUKU.StorageManager.set('smartluku_users', users);

        SmartLUKU.Logger.log('Password changed successfully');

        return true;
    }

    // Static Utility Methods

    static validateFullName(name) {
        return name && name.trim().length >= 2;
    }

    static emailExists(email) {
        const users = SmartLUKU.StorageManager.get('smartluku_users') || [];
        return users.some(u => u.email === email);
    }

    static generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static generateToken() {
        return `token_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
    }

    static hashPassword(password) {
        // Simple hash for demo (in production, use bcrypt on server)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `hashed_${Math.abs(hash)}_${password.length}`;
    }
}

/**
 * Authentication Guard - Middleware for protected pages
 */
class AuthGuard {
    static requireLogin(redirectUrl = 'login.html') {
        const auth = new AuthManager();
        if (!auth.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    static requireLogout(redirectUrl = 'dashboard.html') {
        const auth = new AuthManager();
        if (auth.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    static getCurrentUser() {
        const auth = new AuthManager();
        return auth.getCurrentUser();
    }
}

/**
 * Session Manager - Handle user sessions
 */
class SessionManager {
    static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    static sessionTimer = null;

    static startSession() {
        this.resetSessionTimer();
        document.addEventListener('mousemove', () => this.resetSessionTimer());
        document.addEventListener('keypress', () => this.resetSessionTimer());
    }

    static resetSessionTimer() {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = setTimeout(() => {
            this.expireSession();
        }, this.SESSION_TIMEOUT);
    }

    static expireSession() {
        const auth = new AuthManager();
        auth.logout();
        SmartLUKU.Notification.warning('Your session has expired. Please log in again.');
        window.location.href = 'login.html';
    }

    static endSession() {
        clearTimeout(this.sessionTimer);
    }
}

// Initialize demo data on first load
if (!SmartLUKU.StorageManager.get('smartluku_users')) {
    const demoUser = {
        id: 'demo_user_001',
        fullName: 'Demo User',
        email: 'demo@smartluku.tz',
        password: AuthManager.hashPassword('Demo@123'),
        phone: '+255 67X XXX XXX',
        meterNumber: '1234567890',
        createdAt: new Date().toISOString(),
        balance: 50000,
        units: 125.5,
        lastPayment: new Date().toISOString()
    };

    SmartLUKU.StorageManager.set('smartluku_users', [demoUser]);
    SmartLUKU.Logger.log('Demo data initialized');
}
