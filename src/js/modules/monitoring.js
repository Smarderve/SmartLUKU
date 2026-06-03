// Real-time Consumption Monitoring for SmartLUKU

let dailyChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    AuthGuard.requireLogin();
    const user = AuthGuard.getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const dataManager = new DataManager();

    // Initialize monitoring
    initializeMonitoring();

    /**
     * Initialize all monitoring components
     */
    function initializeMonitoring() {
        updateHeaderInfo();
        generateMockConsumptionData();
        renderConsumptionCharts();
        renderPeakHours();
        updateStatistics();
        checkLowBalanceAlert();
        
        // Auto-update every 30 seconds
        setInterval(() => {
            updateRealTimeStatus();
        }, 30000);
    }

    /**
     * Update header information
     */
    function updateHeaderInfo() {
        document.getElementById('activeMeter').textContent = user.meterNumber;
        document.getElementById('remainingUnits').textContent = `${(user.units || 0).toFixed(1)}`;
        
        const todayUsage = getTodayConsumption();
        document.getElementById('todayUsage').textContent = `${todayUsage.toFixed(2)}`;
        
        const estimatedDays = dataManager.getEstimatedDaysUntilDepletion(user.units || 0, user.meterNumber);
        if (estimatedDays !== null) {
            document.getElementById('estimatedDays').textContent = Math.max(0, estimatedDays);
        } else {
            document.getElementById('estimatedDays').textContent = '∞';
        }
    }

    /**
     * Generate mock consumption data for demonstration
     */
    function generateMockConsumptionData() {
        const existing = SmartLUKU.StorageManager.get('smartluku_consumption') || [];
        
        // Check if we have data for today
        const today = new Date().toDateString();
        const hasToday = existing.some(log => new Date(log.timestamp).toDateString() === today);
        
        if (hasToday && existing.length > 7) {
            return; // Already have sufficient data
        }

        // Generate last 7 days of data
        const newData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(Math.floor(Math.random() * 24));
            date.setMinutes(Math.floor(Math.random() * 60));

            const baseUsage = 15 + Math.random() * 15;
            const variation = Math.sin(i / 7 * Math.PI) * 5;
            const usage = baseUsage + variation;
            const cost = usage * 100; // 100 TZS per kWh

            newData.push({
                id: `log_${date.getTime()}`,
                meterNumber: user.meterNumber,
                timestamp: date.toISOString(),
                unitsUsed: Math.round(usage * 10) / 10,
                cost: Math.round(cost)
            });
        }

        // Add hourly breakdowns for today
        const today2 = new Date();
        for (let hour = 0; hour < 24; hour++) {
            today2.setHours(hour);
            const hourlyUsage = 0.5 + Math.random() * 1.5;
            
            newData.push({
                id: `log_hourly_${hour}`,
                meterNumber: user.meterNumber,
                timestamp: today2.toISOString(),
                unitsUsed: Math.round(hourlyUsage * 10) / 10,
                cost: Math.round(hourlyUsage * 100),
                hourlyBreakdown: true
            });
        }

        // Store all data
        SmartLUKU.StorageManager.set('smartluku_consumption', [...existing, ...newData]);
    }

    /**
     * Get today's total consumption
     */
    function getTodayConsumption() {
        const logs = SmartLUKU.StorageManager.get('smartluku_consumption') || [];
        const today = new Date().toDateString();
        
        return logs
            .filter(log => {
                const logDate = new Date(log.timestamp).toDateString();
                return logDate === today && !log.hourlyBreakdown;
            })
            .reduce((sum, log) => sum + (log.unitsUsed || 0), 0);
    }

    /**
     * Render daily consumption chart
     */
    function renderConsumptionCharts() {
        const logs = SmartLUKU.StorageManager.get('smartluku_consumption') || [];
        
        // Aggregate by day (last 7 days)
        const dailyData = {};
        logs.forEach(log => {
            if (log.hourlyBreakdown) return;
            
            const date = new Date(log.timestamp);
            const key = date.toISOString().split('T')[0];
            dailyData[key] = (dailyData[key] || 0) + (log.unitsUsed || 0);
        });

        // Get last 7 days
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
            data.push(dailyData[key] || 0);
        }

        // Destroy existing chart if it exists
        if (dailyChart) {
            dailyChart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('dailyChart').getContext('2d');
        dailyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Consumption (kWh)',
                    data: data,
                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    borderWidth: 2,
                    borderRadius: 6,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'kWh'
                        }
                    }
                }
            }
        });
    }

    /**
     * Render peak hours chart
     */
    function renderPeakHours() {
        const logs = SmartLUKU.StorageManager.get('smartluku_consumption') || [];
        const today = new Date().toDateString();

        // Aggregate by hour (today only)
        const hourlyData = {};
        logs.forEach(log => {
            if (!log.hourlyBreakdown) return;
            
            const logDate = new Date(log.timestamp).toDateString();
            if (logDate !== today) return;

            const hour = new Date(log.timestamp).getHours();
            hourlyData[hour] = (hourlyData[hour] || 0) + (log.unitsUsed || 0);
        });

        // Render bars
        const container = document.getElementById('peakHoursContainer');
        container.innerHTML = '';

        for (let hour = 0; hour < 24; hour += 3) {
            const usage = hourlyData[hour] || 0;
            const maxUsage = 2;
            const percentage = (usage / maxUsage) * 100;

            const bar = document.createElement('div');
            bar.className = 'flex flex-col items-center gap-1 flex-1';
            bar.innerHTML = `
                <div class="w-full bg-gray-200 rounded-t relative" style="height: 100px;">
                    <div class="bg-accent rounded-t absolute bottom-0 w-full" 
                         style="height: ${Math.min(percentage, 100)}%;">
                    </div>
                </div>
                <span class="text-xs font-semibold text-gray-600">${hour}:00</span>
                <span class="text-xs text-gray-500">${usage.toFixed(1)}</span>
            `;
            container.appendChild(bar);
        }
    }

    /**
     * Update statistics
     */
    function updateStatistics() {
        const logs = SmartLUKU.StorageManager.get('smartluku_consumption') || [];
        const dailyLogs = logs.filter(log => !log.hourlyBreakdown);

        // Daily average
        if (dailyLogs.length > 0) {
            const avgDaily = dailyLogs.reduce((sum, log) => sum + (log.unitsUsed || 0), 0) / dailyLogs.length;
            document.getElementById('avgDaily').textContent = `${avgDaily.toFixed(1)}`;
        }

        // Weekly total
        const weeklyLogs = dailyLogs.slice(-7);
        const weeklyTotal = weeklyLogs.reduce((sum, log) => sum + (log.unitsUsed || 0), 0);
        document.getElementById('weeklyTotal').textContent = `${weeklyTotal.toFixed(1)}`;

        // Monthly estimate
        const monthlyEst = (weeklyTotal / 7) * 30;
        document.getElementById('monthlyEst').textContent = `${monthlyEst.toFixed(1)}`;

        // Cost per day
        const avgDaily = weeklyTotal / 7;
        const costPerDay = avgDaily * 100; // 100 TZS per kWh
        document.getElementById('costPerDay').textContent = `TZS ${Math.round(costPerDay).toLocaleString()}`;

        // Current rate
        const todayUsage = getTodayConsumption();
        const currentRate = todayUsage > 0 ? (todayUsage / 24).toFixed(2) : 0;
        document.getElementById('currentRate').textContent = `${currentRate}`;

        // Last updated
        const lastLog = dailyLogs[0];
        if (lastLog) {
            const diff = Date.now() - new Date(lastLog.timestamp).getTime();
            const minutes = Math.floor(diff / 60000);
            if (minutes < 1) {
                document.getElementById('lastUpdate').textContent = 'Just now';
            } else if (minutes < 60) {
                document.getElementById('lastUpdate').textContent = `${minutes}m ago`;
            } else {
                const hours = Math.floor(minutes / 60);
                document.getElementById('lastUpdate').textContent = `${hours}h ago`;
            }
        }

        // Month comparison
        document.getElementById('thisMonth').textContent = `${monthlyEst.toFixed(1)}`;
        document.getElementById('lastMonth').textContent = `${(monthlyEst * 0.9).toFixed(1)}`;

        const diff = ((monthlyEst - monthlyEst * 0.9) / (monthlyEst * 0.9) * 100).toFixed(0);
        const comparisonEl = document.getElementById('comparison');
        if (diff > 0) {
            comparisonEl.innerHTML = `<i class="fas fa-arrow-up text-orange-500 mr-2"></i>${diff}% higher than last month`;
        } else {
            comparisonEl.innerHTML = `<i class="fas fa-arrow-down text-accent mr-2"></i>${Math.abs(diff)}% lower than last month`;
        }
    }

    /**
     * Check for low balance and show alert
     */
    function checkLowBalanceAlert() {
        const settings = dataManager.getSettings(user.meterNumber);
        
        if (user.units <= settings.lowBalanceThreshold) {
            const alertContainer = document.getElementById('alertsContainer');
            
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning flex items-start gap-3';
            alert.innerHTML = `
                <i class="fas fa-exclamation-triangle flex-shrink-0 mt-1"></i>
                <div>
                    <h4 class="font-bold">Low Balance Alert</h4>
                    <p class="text-sm">You have ${user.units.toFixed(1)} kWh remaining. 
                    ${settings.lowBalanceThreshold > 0 ? 'Please top up soon to avoid disconnection.' : 'Please top up immediately.'}</p>
                    <a href="payment.html" class="btn btn-accent btn-sm mt-2 inline-block">Top Up Now</a>
                </div>
            `;
            alertContainer.appendChild(alert);
        }
    }

    /**
     * Update real-time status (called periodically)
     */
    function updateRealTimeStatus() {
        generateMockConsumptionData();
        updateHeaderInfo();
        renderConsumptionCharts();
        renderPeakHours();
        updateStatistics();
        checkLowBalanceAlert();
    }
});
