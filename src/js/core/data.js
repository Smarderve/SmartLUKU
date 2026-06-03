// Data Management for SmartLUKU
// Handles transaction storage, consumption logs, and user data persistence

class DataManager {
    constructor() {
        this.transactionsKey = 'smartluku_transactions';
        this.consumptionKey = 'smartluku_consumption';
        this.settingsKey = 'smartluku_settings';
    }

    /**
     * Add a transaction to history
     */
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        
        const newTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...transaction
        };
        
        transactions.unshift(newTransaction); // Add to beginning
        SmartLUKU.StorageManager.set(this.transactionsKey, transactions);
        
        // Update user balance
        const auth = new AuthManager();
        const user = auth.getCurrentUser();
        if (user) {
            const unitsToAdd = this.calculateUnitsFromAmount(transaction.amount);
            user.balance = (user.balance || 0) + transaction.amount;
            user.units = (user.units || 0) + unitsToAdd;
            user.lastPayment = newTransaction.timestamp;
            auth.updateProfile(user);
        }
        
        return newTransaction;
    }

    /**
     * Get all transactions
     */
    getTransactions(filters = {}) {
        let transactions = SmartLUKU.StorageManager.get(this.transactionsKey) || [];
        
        // Apply filters
        if (filters.meterNumber) {
            transactions = transactions.filter(t => t.meterNumber === filters.meterNumber);
        }
        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            transactions = transactions.filter(t => {
                const txDate = new Date(t.timestamp);
                return txDate >= start && txDate <= end;
            });
        }
        if (filters.minAmount) {
            transactions = transactions.filter(t => t.amount >= filters.minAmount);
        }
        if (filters.maxAmount) {
            transactions = transactions.filter(t => t.amount <= filters.maxAmount);
        }
        
        return transactions;
    }

    /**
     * Get a single transaction by ID
     */
    getTransaction(id) {
        const transactions = this.getTransactions();
        return transactions.find(t => t.id === id);
    }

    /**
     * Log consumption data
     */
    logConsumption(meterNumber, unitsUsed, cost) {
        const logs = SmartLUKU.StorageManager.get(this.consumptionKey) || [];
        
        logs.push({
            id: `log_${Date.now()}`,
            meterNumber,
            timestamp: new Date().toISOString(),
            unitsUsed,
            cost,
            rate: cost > 0 ? unitsUsed / cost : 0
        });
        
        SmartLUKU.StorageManager.set(this.consumptionKey, logs);
    }

    /**
     * Get consumption logs (for analytics)
     */
    getConsumptionLogs(meterNumber, daysBack = 30) {
        const logs = SmartLUKU.StorageManager.get(this.consumptionKey) || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        return logs.filter(log => 
            log.meterNumber === meterNumber && 
            new Date(log.timestamp) >= cutoffDate
        );
    }

    /**
     * Calculate units from amount
     * 1 TZS ≈ 0.01 units (rate may vary)
     */
    calculateUnitsFromAmount(amount) {
        const rate = 0.01; // Simplified: 1 TZS = 0.01 kWh
        return Math.floor(amount * rate * 100) / 100; // Round to 2 decimals
    }

    /**
     * Calculate cost from units
     */
    calculateCostFromUnits(units) {
        const rate = 100; // Simplified: 1 kWh = 100 TZS
        return Math.floor(units * rate);
    }

    /**
     * Get user statistics
     */
    getUserStats(meterNumber) {
        const transactions = this.getTransactions({ meterNumber });
        const consumptionLogs = this.getConsumptionLogs(meterNumber, 30);
        
        const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalUnitsAdded = transactions.reduce((sum, t) => sum + (t.unitsAdded || 0), 0);
        const totalUnitsUsed = consumptionLogs.reduce((sum, log) => sum + (log.unitsUsed || 0), 0);
        const transactionCount = transactions.length;
        const averageTransaction = transactionCount > 0 ? totalPaid / transactionCount : 0;
        
        return {
            totalPaid,
            totalUnitsAdded,
            totalUnitsUsed,
            transactionCount,
            averageTransaction,
            lastPayment: transactions[0]?.timestamp || null,
            dailyAverageUsage: consumptionLogs.length > 0 ? totalUnitsUsed / 30 : 0
        };
    }

    /**
     * Get monthly consumption trend
     */
    getMonthlySummary(meterNumber, month = null) {
        const date = month ? new Date(month) : new Date();
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const transactions = this.getTransactions({ 
            meterNumber,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        
        return {
            month: startDate.toISOString().slice(0, 7),
            totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
            totalPayments: transactions.length,
            transactions: transactions
        };
    }

    /**
     * Get settings for a user
     */
    getSettings(meterNumber) {
        const settings = SmartLUKU.StorageManager.get(this.settingsKey) || {};
        return settings[meterNumber] || {
            lowBalanceThreshold: 20,
            notificationsEnabled: true,
            emailNotifications: false,
            smsNotifications: false,
            currency: 'TZS'
        };
    }

    /**
     * Update settings
     */
    updateSettings(meterNumber, updates) {
        const settings = SmartLUKU.StorageManager.get(this.settingsKey) || {};
        settings[meterNumber] = {
            ...this.getSettings(meterNumber),
            ...updates
        };
        SmartLUKU.StorageManager.set(this.settingsKey, settings);
        return settings[meterNumber];
    }

    /**
     * Check if low balance alert should trigger
     */
    shouldShowLowBalanceAlert(currentUnits, meterNumber) {
        const settings = this.getSettings(meterNumber);
        return currentUnits <= settings.lowBalanceThreshold && settings.notificationsEnabled;
    }

    /**
     * Get estimated days until balance depleted
     */
    getEstimatedDaysUntilDepletion(currentUnits, meterNumber) {
        const consumptionLogs = this.getConsumptionLogs(meterNumber, 7);
        if (consumptionLogs.length === 0) return null;
        
        const dailyAverage = consumptionLogs.reduce((sum, log) => sum + log.unitsUsed, 0) / 7;
        if (dailyAverage <= 0) return null;
        
        return Math.floor(currentUnits / dailyAverage);
    }

    /**
     * Generate receipt
     */
    generateReceipt(transactionId) {
        const transaction = this.getTransaction(transactionId);
        if (!transaction) return null;
        
        const auth = new AuthManager();
        const user = auth.getCurrentUser();
        
        return {
            receiptNumber: transaction.id,
            meterNumber: transaction.meterNumber,
            accountHolder: user?.fullName,
            amount: transaction.amount,
            method: transaction.paymentMethod,
            unitsAdded: transaction.unitsAdded,
            date: new Date(transaction.timestamp).toLocaleString(),
            reference: transaction.reference,
            fee: transaction.fee,
            total: transaction.total,
            status: transaction.status
        };
    }
}

/**
 * Export DataManager globally
 */
window.DataManager = DataManager;
