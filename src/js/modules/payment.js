// Payment Processing Logic for SmartLUKU

document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    AuthGuard.requireLogin();
    const user = AuthGuard.getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize
    const dataManager = new DataManager();
    const form = document.getElementById('paymentForm');
    const amountInput = document.getElementById('amount');
    const methodSelect = document.getElementById('paymentMethod');
    const phoneField = document.getElementById('phoneField');
    const phoneInput = document.getElementById('phone');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');

    // Load user data
    loadUserData();

    /**
     * Load and display current user data
     */
    function loadUserData() {
        document.getElementById('currentBalance').textContent = `TZS ${(user.balance || 0).toLocaleString()}`;
        document.getElementById('remainingUnits').textContent = `${(user.units || 0).toFixed(1)}`;
        document.getElementById('accountStatus').textContent = user.units > 20 ? 'Active' : 'Low Balance';
    }

    /**
     * Quick pay button clicks
     */
    document.querySelectorAll('.quick-pay-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const amount = btn.dataset.amount;
            
            if (amount === 'custom') {
                amountInput.focus();
                amountInput.value = '';
            } else {
                amountInput.value = amount;
                updateFeeDisplay();
            }
        });
    });

    /**
     * Show/hide phone field based on payment method
     */
    methodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'mpesa' || e.target.value === 'airtel') {
            phoneField.classList.remove('hidden');
            phoneInput.required = true;
        } else {
            phoneField.classList.add('hidden');
            phoneInput.required = false;
        }
    });

    /**
     * Update fee display when amount changes
     */
    amountInput.addEventListener('input', updateFeeDisplay);

    function updateFeeDisplay() {
        const amount = parseInt(amountInput.value) || 0;
        const fee = Math.ceil(amount * 0.01); // 1% fee, rounded up
        const total = amount + fee;

        document.getElementById('feeAmount').textContent = `TZS ${amount.toLocaleString()}`;
        document.getElementById('transactionFee').textContent = `TZS ${fee.toLocaleString()}`;
        document.getElementById('totalAmount').textContent = `TZS ${total.toLocaleString()}`;
    }

    /**
     * Form submission
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amount = parseInt(amountInput.value);
        const method = methodSelect.value;
        const phone = phoneInput.value.trim();
        const termsAccepted = document.getElementById('terms').checked;

        // Validation
        const errors = clearErrors();

        if (!amount || amount < 1000) {
            errors.push('Minimum payment is TZS 1,000');
        }
        if (!method) {
            errors.push('Please select a payment method');
        }
        if ((method === 'mpesa' || method === 'airtel') && !phone) {
            errors.push('Phone number is required for this payment method');
        }
        if (!termsAccepted) {
            errors.push('Please accept the terms to continue');
        }

        if (errors.length > 0) {
            showError(errors[0]);
            return;
        }

        // Process payment
        processPayment(amount, method, phone);
    });

    /**
     * Process payment (simulated)
     */
    async function processPayment(amount, method, phone) {
        const spinner = document.getElementById('spinner');
        const submitBtn = document.querySelector('button[type="submit"]');
        const submitText = document.getElementById('submitText');

        // Show loading state
        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        submitText.textContent = 'Processing...';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate fee and units
        const fee = Math.ceil(amount * 0.01);
        const total = amount + fee;
        const unitsAdded = dataManager.calculateUnitsFromAmount(amount);

        // Create transaction
        const transaction = {
            meterNumber: user.meterNumber,
            type: 'payment',
            amount,
            paymentMethod: method,
            phone: phone || null,
            fee,
            total,
            unitsAdded,
            status: 'success',
            reference: `REF${Date.now().toString().slice(-6).toUpperCase()}`
        };

        // Save transaction
        const savedTransaction = dataManager.addTransaction(transaction);

        // Show success modal
        showSuccessModal(amount, unitsAdded, savedTransaction);

        // Reset form
        form.reset();
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        submitText.textContent = 'Confirm Payment';
    }

    /**
     * Show success modal
     */
    function showSuccessModal(amount, units, transaction) {
        document.getElementById('successMessage').innerHTML = 
            `Your payment of <strong>TZS ${amount.toLocaleString()}</strong> has been processed successfully.`;
        document.getElementById('refNumber').textContent = transaction.reference;
        document.getElementById('unitsAdded').textContent = `${units.toFixed(1)} kWh`;
        
        successModal.classList.remove('hidden');
    }

    /**
     * Close modal and redirect
     */
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        
        // Update user data
        user.balance = (user.balance || 0) + parseInt(amountInput.value);
        user.units = (user.units || 0) + dataManager.calculateUnitsFromAmount(parseInt(amountInput.value));
        
        loadUserData();
    });

    /**
     * Error handling
     */
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.add('hidden');
        });
        document.getElementById('generalError').classList.add('hidden');
        return [];
    }

    function showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('generalError').classList.remove('hidden');
        document.getElementById('generalError').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
