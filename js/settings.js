// Settings Management for SmartLUKU

document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    AuthGuard.requireLogin();
    const user = AuthGuard.getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const dataManager = new DataManager();
    const storage = SmartLUKU.StorageManager;

    // Initialize
    initializeSettings();

    /**
     * Initialize settings page
     */
    function initializeSettings() {
        loadProfileData();
        setupMenuNavigation();
        setupEventListeners();
    }

    /**
     * Load user profile data
     */
    function loadProfileData() {
        // Profile section
        document.getElementById('meterNumber').value = user.meterNumber || '';
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('email').value = user.email || '';

        // Security section
        document.getElementById('linkedMeter').textContent = user.meterNumber;

        // Account status
        const statusText = (user.units || 0) > 20 ? 'Active' : 'Low Balance';
        document.getElementById('accountStatus').textContent = statusText;

        // Load preferences
        const prefs = storage.get('smartluku_preferences') || {};
        document.getElementById('language').value = prefs.language || 'en';
        document.getElementById('currency').value = prefs.currency || 'TZS';
        document.getElementById('theme').value = prefs.theme || 'light';
        document.getElementById('sessionTimeout').value = prefs.sessionTimeout || '30';

        // Load notification settings
        const notifSettings = dataManager.getSettings(user.meterNumber);
        document.getElementById('alertThreshold').value = notifSettings.lowBalanceThreshold;
        document.getElementById('lowBalanceAlert').checked = notifSettings.notificationsEnabled;
        document.getElementById('emailNotif').checked = notifSettings.emailNotifications;
        document.getElementById('smsNotif').checked = notifSettings.smsNotifications;
    }

    /**
     * Setup menu navigation
     */
    function setupMenuNavigation() {
        const menuItems = document.querySelectorAll('.settings-menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                menuItems.forEach(m => m.classList.remove('active', 'bg-primary', 'text-white'));
                
                // Add active class to clicked item
                item.classList.add('active', 'bg-primary', 'text-white');
                
                // Hide all sections
                document.querySelectorAll('.settings-section').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show selected section
                const sectionId = item.dataset.section + 'Section';
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.remove('hidden');
                }
            });
        });
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile();
        });

        // Password form
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            changePassword();
        });

        // Password strength indicator
        document.getElementById('newPassword').addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });

        // Notification save
        document.getElementById('saveNotifications').addEventListener('click', saveNotifications);

        // Preferences save
        document.getElementById('savePreferences').addEventListener('click', savePreferences);

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', logoutAllDevices);

        // Delete account button
        document.getElementById('deleteBtn').addEventListener('click', deleteAccount);
    }

    /**
     * Save profile changes
     */
    function saveProfile() {
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        // Validation
        if (!fullName) {
            SmartLUKU.NotificationManager.show('error', 'Full name is required');
            return;
        }

        if (email && !SmartLUKU.Validator.email(email)) {
            SmartLUKU.NotificationManager.show('error', 'Invalid email address');
            return;
        }

        // Update user
        user.fullName = fullName;
        user.phone = phone;
        user.email = email;

        // Save to storage
        const users = storage.get('smartluku_users') || [];
        const userIndex = users.findIndex(u => u.meterNumber === user.meterNumber);
        if (userIndex >= 0) {
            users[userIndex] = user;
            storage.set('smartluku_users', users);
        }

        // Update current session
        storage.set('smartluku_user', user);

        SmartLUKU.NotificationManager.show('success', 'Profile updated successfully');
    }

    /**
     * Change password
     */
    function changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!currentPassword) {
            SmartLUKU.NotificationManager.show('error', 'Enter current password');
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            SmartLUKU.NotificationManager.show('error', 'New password must be at least 8 characters');
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            SmartLUKU.NotificationManager.show('error', 'Password must contain an uppercase letter');
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            SmartLUKU.NotificationManager.show('error', 'Password must contain a number');
            return;
        }

        if (newPassword !== confirmPassword) {
            SmartLUKU.NotificationManager.show('error', 'Passwords do not match');
            return;
        }

        // Verify current password
        const passwordHash = SmartLUKU.Validator.hashPassword(currentPassword);
        if (passwordHash !== user.passwordHash) {
            SmartLUKU.NotificationManager.show('error', 'Current password is incorrect');
            return;
        }

        // Update password
        user.passwordHash = SmartLUKU.Validator.hashPassword(newPassword);
        user.lastPasswordChange = new Date().toISOString();

        // Save to storage
        const users = storage.get('smartluku_users') || [];
        const userIndex = users.findIndex(u => u.meterNumber === user.meterNumber);
        if (userIndex >= 0) {
            users[userIndex] = user;
            storage.set('smartluku_users', users);
        }

        storage.set('smartluku_user', user);

        // Clear form
        document.getElementById('passwordForm').reset();

        SmartLUKU.NotificationManager.show('success', 'Password changed successfully');
    }

    /**
     * Check password strength
     */
    function checkPasswordStrength(password) {
        const strengthEl = document.getElementById('passwordStrength');
        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        const strengthLevels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'];

        if (password.length > 0) {
            feedback = `<span class="${strengthColors[strength]}">Strength: ${strengthLevels[strength]}</span>`;
        }

        strengthEl.innerHTML = feedback;
    }

    /**
     * Save notification preferences
     */
    function saveNotifications() {
        const settings = {
            lowBalanceThreshold: parseInt(document.getElementById('alertThreshold').value),
            notificationsEnabled: document.getElementById('lowBalanceAlert').checked,
            emailNotifications: document.getElementById('emailNotif').checked,
            smsNotifications: document.getElementById('smsNotif').checked
        };

        dataManager.updateSettings(user.meterNumber, settings);
        SmartLUKU.NotificationManager.show('success', 'Notification settings saved');
    }

    /**
     * Save general preferences
     */
    function savePreferences() {
        const prefs = {
            language: document.getElementById('language').value,
            currency: document.getElementById('currency').value,
            theme: document.getElementById('theme').value,
            sessionTimeout: document.getElementById('sessionTimeout').value
        };

        storage.set('smartluku_preferences', prefs);
        SmartLUKU.NotificationManager.show('success', 'Preferences saved');
    }

    /**
     * Logout from all devices
     */
    function logoutAllDevices() {
        if (!confirm('This will logout your account from all devices. Continue?')) {
            return;
        }

        // Clear all sessions and tokens
        storage.remove('smartluku_token');
        storage.remove('smartluku_user');
        storage.remove('smartluku_session');

        SmartLUKU.NotificationManager.show('success', 'Logged out from all devices');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    /**
     * Delete account
     */
    function deleteAccount() {
        if (!confirm('Are you sure? This action CANNOT be undone. All your data will be permanently deleted.')) {
            return;
        }

        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation !== 'DELETE') {
            SmartLUKU.NotificationManager.show('error', 'Deletion cancelled');
            return;
        }

        // Delete user account
        const users = storage.get('smartluku_users') || [];
        const filteredUsers = users.filter(u => u.meterNumber !== user.meterNumber);
        storage.set('smartluku_users', filteredUsers);

        // Clear session
        storage.remove('smartluku_token');
        storage.remove('smartluku_user');
        storage.remove('smartluku_session');

        SmartLUKU.NotificationManager.show('success', 'Account deleted. Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});
