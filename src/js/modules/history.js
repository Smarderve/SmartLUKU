// Transaction History for SmartLUKU

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let filteredTransactions = [];

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
    initializeHistory();

    /**
     * Initialize history page
     */
    function initializeHistory() {
        // Generate demo transactions if needed
        generateDemoTransactions(dataManager);
        
        // Load initial data
        updateSummary();
        renderTransactions();
        
        // Set up event listeners
        setupEventListeners();
    }

    /**
     * Generate demo transactions for first-time users
     */
    function generateDemoTransactions(dataManager) {
        const existing = dataManager.getTransactions();
        
        if (existing.length > 0) {
            return; // Already have transactions
        }

        // Create demo transactions
        const amounts = [10000, 15000, 20000, 25000, 50000, 5000];
        const methods = ['card', 'mpesa', 'airtel', 'bank'];
        
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            dataManager.addTransaction({
                meterNumber: user.meterNumber,
                type: 'payment',
                amount: amounts[i],
                paymentMethod: methods[i % methods.length],
                unitsAdded: dataManager.calculateUnitsFromAmount(amounts[i]),
                status: 'success',
                reference: `REF${(1000 + i).toString()}`
            });
        }
    }

    /**
     * Update summary statistics
     */
    function updateSummary() {
        const dataManager = new DataManager();
        const stats = dataManager.getUserStats(user.meterNumber);

        document.getElementById('totalPaid').textContent = 
            `TZS ${stats.totalPaid.toLocaleString()}`;
        document.getElementById('totalPayments').textContent = 
            `${stats.transactionCount}`;
        document.getElementById('avgPayment').textContent = 
            `TZS ${Math.round(stats.averageTransaction).toLocaleString()}`;
        
        if (stats.lastPayment) {
            const date = new Date(stats.lastPayment);
            document.getElementById('lastPaymentDate').textContent = 
                date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        }
    }

    /**
     * Render transactions table
     */
    function renderTransactions() {
        const dataManager = new DataManager();
        const transactions = dataManager.getTransactions({ meterNumber: user.meterNumber });
        filteredTransactions = transactions;

        const tbody = document.getElementById('transactionTableBody');
        const emptyState = document.getElementById('emptyState');

        if (filteredTransactions.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Paginate
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

        // Render rows
        tbody.innerHTML = pageTransactions.map(txn => `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm">
                    ${new Date(txn.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: '2-digit', 
                        hour: '2-digit', minute: '2-digit' 
                    })}
                </td>
                <td class="px-6 py-4 text-sm font-mono font-bold text-primary">
                    ${txn.reference || txn.id.slice(0, 8)}
                </td>
                <td class="px-6 py-4 text-sm font-bold">
                    TZS ${txn.amount.toLocaleString()}
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="badge badge-accent">${getMethodLabel(txn.paymentMethod)}</span>
                </td>
                <td class="px-6 py-4 text-sm">
                    +${txn.unitsAdded ? txn.unitsAdded.toFixed(1) : 0} kWh
                </td>
                <td class="px-6 py-4 text-sm">
                    <span class="badge badge-success">${txn.status}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button class="text-primary hover:text-accent transition view-receipt-btn" data-txn-id="${txn.id}">
                        <i class="fas fa-receipt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update pagination info
        document.getElementById('recordCount').textContent = filteredTransactions.length;
        updatePaginationButtons();

        // Attach event listeners to receipt buttons
        document.querySelectorAll('.view-receipt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const txnId = btn.dataset.txnId;
                showReceiptModal(dataManager, txnId);
            });
        });
    }

    /**
     * Update pagination buttons
     */
    function updatePaginationButtons() {
        const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
        
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }

    /**
     * Get payment method label
     */
    function getMethodLabel(method) {
        const labels = {
            'card': 'Card',
            'mpesa': 'M-Pesa',
            'airtel': 'Airtel',
            'bank': 'Bank'
        };
        return labels[method] || method;
    }

    /**
     * Show receipt modal
     */
    function showReceiptModal(dataManager, txnId) {
        const receipt = dataManager.generateReceipt(txnId);
        if (!receipt) return;

        const receiptContent = document.getElementById('receiptContent');
        receiptContent.innerHTML = `
            <div class="border-b pb-3">
                <p class="text-gray-600">Receipt #</p>
                <p class="font-bold text-lg">${receipt.receiptNumber.slice(0, 16)}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-600">Meter Number</p>
                    <p class="font-semibold">${receipt.meterNumber}</p>
                </div>
                <div>
                    <p class="text-gray-600">Date</p>
                    <p class="font-semibold">${receipt.date}</p>
                </div>
            </div>
            <div class="border-t pt-3">
                <p class="text-gray-600 text-xs mb-2">PAYMENT DETAILS</p>
                <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                        <span>Amount</span>
                        <span class="font-semibold">TZS ${receipt.amount.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Fee</span>
                        <span class="font-semibold">TZS ${(receipt.fee || 0).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between border-t pt-1">
                        <span class="font-bold">Total</span>
                        <span class="font-bold">TZS ${(receipt.total || receipt.amount).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="border-t pt-3">
                <p class="text-gray-600 text-xs mb-2">UNITS</p>
                <div class="flex justify-between">
                    <span>Units Added</span>
                    <span class="font-semibold">${receipt.unitsAdded.toFixed(1)} kWh</span>
                </div>
            </div>
            <div class="border-t pt-3">
                <p class="text-gray-600">Method</p>
                <p class="font-semibold">${getMethodLabel(receipt.method)}</p>
            </div>
        `;

        // Store current transaction for print/download
        window.currentReceipt = receipt;

        document.getElementById('receiptModal').classList.remove('hidden');
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Filter buttons
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('clearFilters').addEventListener('click', clearFilters);
        document.getElementById('downloadCSV').addEventListener('click', downloadCSV);

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTransactions();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderTransactions();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Modal
        document.getElementById('closeReceiptModal').addEventListener('click', () => {
            document.getElementById('receiptModal').classList.add('hidden');
        });

        document.getElementById('printReceipt').addEventListener('click', printReceipt);
        document.getElementById('downloadReceipt').addEventListener('click', downloadReceipt);

        // Set default date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);

        document.getElementById('endDate').valueAsDate = endDate;
        document.getElementById('startDate').valueAsDate = startDate;
    }

    /**
     * Apply filters
     */
    function applyFilters() {
        const dataManager = new DataManager();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const method = document.getElementById('methodFilter').value;
        const minAmount = parseInt(document.getElementById('minAmount').value) || 0;
        const searchRef = document.getElementById('searchRef').value.toLowerCase();

        let transactions = dataManager.getTransactions({ meterNumber: user.meterNumber });

        // Apply filters
        if (startDate && endDate) {
            transactions = transactions.filter(t => {
                const txDate = new Date(t.timestamp);
                return txDate >= new Date(startDate) && txDate <= new Date(endDate);
            });
        }

        if (method) {
            transactions = transactions.filter(t => t.paymentMethod === method);
        }

        if (minAmount > 0) {
            transactions = transactions.filter(t => t.amount >= minAmount);
        }

        if (searchRef) {
            transactions = transactions.filter(t => 
                (t.reference || t.id).toLowerCase().includes(searchRef)
            );
        }

        filteredTransactions = transactions;
        currentPage = 1;
        renderTransactions();
    }

    /**
     * Clear filters
     */
    function clearFilters() {
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('methodFilter').value = '';
        document.getElementById('minAmount').value = '';
        document.getElementById('searchRef').value = '';

        const dataManager = new DataManager();
        filteredTransactions = dataManager.getTransactions({ meterNumber: user.meterNumber });
        currentPage = 1;
        renderTransactions();
    }

    /**
     * Download transactions as CSV
     */
    function downloadCSV() {
        if (filteredTransactions.length === 0) {
            alert('No transactions to download');
            return;
        }

        const csv = [
            ['Date', 'Reference', 'Amount (TZS)', 'Fee (TZS)', 'Total (TZS)', 'Method', 'Units', 'Status'],
            ...filteredTransactions.map(t => [
                new Date(t.timestamp).toLocaleDateString(),
                t.reference || t.id.slice(0, 8),
                t.amount,
                t.fee || 0,
                (t.total || t.amount),
                getMethodLabel(t.paymentMethod),
                t.unitsAdded ? t.unitsAdded.toFixed(1) : 0,
                t.status
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartluku-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    /**
     * Print receipt
     */
    function printReceipt() {
        if (!window.currentReceipt) return;

        const receipt = window.currentReceipt;
        const printWindow = window.open('', '', 'width=600,height=800');
        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt ${receipt.receiptNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .section { margin-bottom: 15px; }
                    .row { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>SmartLUKU Receipt</h2>
                    <p>${receipt.receiptNumber}</p>
                </div>
                <div class="section">
                    <div class="row"><span>Date:</span><span>${receipt.date}</span></div>
                    <div class="row"><span>Meter:</span><span>${receipt.meterNumber}</span></div>
                </div>
                <div class="section">
                    <div class="row"><span>Amount:</span><span>TZS ${receipt.amount.toLocaleString()}</span></div>
                    <div class="row"><span>Fee:</span><span>TZS ${(receipt.fee || 0).toLocaleString()}</span></div>
                    <div class="row total"><span>Total:</span><span>TZS ${(receipt.total || receipt.amount).toLocaleString()}</span></div>
                </div>
                <div class="section">
                    <div class="row"><span>Units:</span><span>${receipt.unitsAdded.toFixed(1)} kWh</span></div>
                    <div class="row"><span>Method:</span><span>${receipt.method}</span></div>
                </div>
            </body>
            </html>
        `);
        printWindow.print();
    }

    /**
     * Download receipt as text/PDF
     */
    function downloadReceipt() {
        if (!window.currentReceipt) return;

        const receipt = window.currentReceipt;
        const text = `SmartLUKU Payment Receipt\n\n` +
            `Receipt Number: ${receipt.receiptNumber}\n` +
            `Date: ${receipt.date}\n` +
            `Meter: ${receipt.meterNumber}\n\n` +
            `PAYMENT DETAILS\n` +
            `Amount: TZS ${receipt.amount.toLocaleString()}\n` +
            `Fee: TZS ${(receipt.fee || 0).toLocaleString()}\n` +
            `Total: TZS ${(receipt.total || receipt.amount).toLocaleString()}\n\n` +
            `UNITS\n` +
            `Units Added: ${receipt.unitsAdded.toFixed(1)} kWh\n\n` +
            `Payment Method: ${receipt.method}`;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receiptNumber.slice(0, 8)}.txt`;
        a.click();
    }
});
