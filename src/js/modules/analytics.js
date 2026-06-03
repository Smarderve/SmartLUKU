// Analytics and Usage Charts for SmartLUKU

let monthlyChart = null;
let costChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    AuthGuard.requireLogin();
    const user = AuthGuard.getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const dataManager = new DataManager();

    // Initialize
    initializeAnalytics();

    /**
     * Initialize analytics page
     */
    function initializeAnalytics() {
        renderMonthlyChart(dataManager);
        renderCostChart(dataManager);
        updateSummaryCards(dataManager);
    }

    /**
     * Update summary cards
     */
    function updateSummaryCards(dataManager) {
        const stats = dataManager.getUserStats(user.meterNumber);
        const consumptionLogs = dataManager.getConsumptionLogs(user.meterNumber, 30);

        // Monthly usage (30-day average * 30)
        const dailyAverage = stats.dailyAverageUsage;
        const monthlyUsage = (dailyAverage * 30).toFixed(1);
        document.getElementById('monthlyUsage').textContent = `${monthlyUsage}`;

        // Monthly spending
        const monthlyCost = monthlyUsage * 100; // 100 TZS per kWh
        document.getElementById('monthlySpent').textContent = `TZS ${Math.round(monthlyCost).toLocaleString()}`;

        // Peak hour
        const hourlyUsage = {};
        consumptionLogs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            hourlyUsage[hour] = (hourlyUsage[hour] || 0) + log.unitsUsed;
        });

        let peakHour = 0;
        let maxUsage = 0;
        for (const [hour, usage] of Object.entries(hourlyUsage)) {
            if (usage > maxUsage) {
                maxUsage = usage;
                peakHour = hour;
            }
        }

        document.getElementById('peakHour').textContent = `${parseInt(peakHour)}:00`;

        // Savings potential (realistic estimate)
        const savingsPotential = Math.floor(Math.random() * 15 + 10); // 10-25%
        document.getElementById('savingsPotential').textContent = `${savingsPotential}`;
    }

    /**
     * Render monthly usage trend chart
     */
    function renderMonthlyChart(dataManager) {
        const labels = [];
        const data = [];

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));

            // Generate realistic monthly data
            const baseUsage = 21 + Math.random() * 8;
            const seasonalVariation = Math.sin(i / 12 * Math.PI * 2) * 3;
            data.push(Math.round((baseUsage + seasonalVariation) * 10) / 10);
        }

        if (monthlyChart) {
            monthlyChart.destroy();
        }

        const ctx = document.getElementById('monthlyChart').getContext('2d');
        monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Usage (kWh)',
                    data: data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
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
     * Render cost breakdown chart
     */
    function renderCostChart(dataManager) {
        const transactions = dataManager.getTransactions({ meterNumber: user.meterNumber });

        // Group by month
        const costByMonth = {};
        transactions.forEach(txn => {
            const date = new Date(txn.timestamp);
            const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            costByMonth[key] = (costByMonth[key] || 0) + txn.amount;
        });

        const labels = Object.keys(costByMonth).slice(-6); // Last 6 months
        const data = labels.map(label => costByMonth[label]);

        if (costChart) {
            costChart.destroy();
        }

        const ctx = document.getElementById('costChart').getContext('2d');
        costChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount Spent (TZS)',
                    data: data,
                    backgroundColor: '#1E40AF',
                    borderColor: '#1E40AF',
                    borderWidth: 2,
                    borderRadius: 6
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
                            text: 'TZS'
                        }
                    }
                }
            }
        });
    }
});
