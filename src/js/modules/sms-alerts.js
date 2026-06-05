/**
 * Low balance SMS alerts via SmartLUKU SMS
 */
const SMSAlerts = (function () {
    let lastSentAt = 0;
    let lastSentBalance = null;
    let apiStatus = { ok: false, mode: 'offline' };
    let onNotify = null;

    function getProfile() {
        try {
            return JSON.parse(localStorage.getItem('smartluku-profile') || 'null');
        } catch { return null; }
    }

    function getPhone() {
        const settingsPhone = document.getElementById('smsPhoneInput')?.value?.trim();
        if (settingsPhone) return settingsPhone;
        const profile = getProfile();
        return profile?.phone || null;
    }

    function getMeterNumber() {
        const profile = getProfile();
        return profile?.meter || localStorage.getItem('smartluku-user') || 'TZ-001234';
    }

    async function checkApiHealth() {
        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/health`, { signal: AbortSignal.timeout(4000) });
            const data = await res.json();
            apiStatus = data;
            return data;
        } catch {
            apiStatus = { ok: false, mode: 'offline' };
            return apiStatus;
        }
    }

    async function getProviderStatus() {
        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/sms/status`, { signal: AbortSignal.timeout(4000) });
            return await res.json();
        } catch {
            return null;
        }
    }

    async function sendLowBalanceAlert(balanceKwh, force = false) {
        const phone = getPhone();
        const threshold = SmartLUKUConfig.SMS_THRESHOLD_KWH;
        const now = Date.now();

        if (!phone) {
            const notification = {
                type: 'warning',
                title: 'No Phone Number',
                message: 'Register with a phone number or add one in Settings → Low Balance SMS.',
                balanceKwh
            };
            if (onNotify) onNotify(notification);
            return notification;
        }

        if (balanceKwh > threshold && !force) return null;

        if (!force && now - lastSentAt < SmartLUKUConfig.SMS_COOLDOWN_MS) return null;
        if (!force && lastSentBalance !== null && Math.abs(lastSentBalance - balanceKwh) < 2) return null;

        const payload = {
            phone,
            meterNumber: getMeterNumber(),
            balanceKwh,
            topUpUrl: `${window.location.origin}/app.html`
        };

        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/sms/low-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.hint || data.error || 'SmartLUKU SMS failed');
            }

            lastSentAt = now;
            lastSentBalance = balanceKwh;

            const log = JSON.parse(localStorage.getItem(SmartLUKUConfig.SMS_LOG_KEY) || '[]');
            log.unshift({
                timestamp: new Date().toISOString(),
                phone: data.to || phone,
                balanceKwh,
                provider: 'smartluku_sms',
                demo: !!data.demo,
                messageId: data.messageId,
                status: data.status,
                preview: data.preview
            });
            localStorage.setItem(SmartLUKUConfig.SMS_LOG_KEY, JSON.stringify(log.slice(0, 20)));

            let notification;
            if (data.demo) {
                notification = {
                    type: 'info',
                    title: 'SmartLUKU SMS (Demo)',
                    message: data.preview || `Would send to ${data.to || phone}`,
                    phone: data.to || phone,
                    balanceKwh
                };
            } else {
                notification = {
                    type: 'success',
                    title: 'SMS Sent via SmartLUKU SMS!',
                    message: `Your meter has ${balanceKwh.toFixed(1)} kWh. Message delivered to ${data.to || phone}${data.messageId ? ' (ID: ' + data.messageId + ')' : ''}.`,
                    phone: data.to || phone,
                    balanceKwh,
                    messageId: data.messageId
                };
            }

            if (onNotify) onNotify(notification);
            return notification;
        } catch (err) {
            const notification = {
                type: 'warning',
                title: 'SmartLUKU SMS Failed',
                message: err.message + '. Run: cd server && npm install && npm start',
                balanceKwh
            };
            if (onNotify) onNotify(notification);
            return notification;
        }
    }

    async function sendTopUpConfirmation({ amountTzs, unitsKwh, newBalanceKwh, estDays }) {
        const phone = getPhone();
        const meter = getMeterNumber();
        const est = formatDuration(estDays);
        const message =
            `SmartLUKU: Payment received. TZS ${Number(amountTzs).toLocaleString()} = ${unitsKwh.toFixed(1)} kWh. ` +
            `New balance: ${newBalanceKwh.toFixed(1)} kWh on meter ${meter}. ` +
            `Estimated supply: ~${est} at your current usage. Asante!`;

        const notification = {
            type: 'success',
            title: 'Payment Confirmed — SMS Sent',
            message,
            phone,
            balanceKwh: newBalanceKwh
        };

        if (!phone) {
            notification.type = 'info';
            notification.title = 'Payment Confirmed';
            notification.message = message + ' (Add a phone number in Settings to receive this by SMS.)';
            if (onNotify) onNotify(notification);
            return notification;
        }

        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/sms/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, message, meterNumber: meter }),
                signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS)
            });
            const data = await res.json();
            if (data.demo) {
                notification.title = 'Payment Confirmed (SMS Demo)';
            }
            notification.phone = data.to || phone;
        } catch {
            // API offline — still show the confirmation locally (SMS preview)
            notification.title = 'Payment Confirmed (SMS preview)';
        }

        if (onNotify) onNotify(notification);
        return notification;
    }

    function formatDuration(days) {
        if (!isFinite(days) || days <= 0) return 'N/A';
        if (days >= 1) {
            const d = Math.floor(days);
            const h = Math.round((days - d) * 24);
            return h > 0 ? `${d} day${d > 1 ? 's' : ''} ${h} hr` : `${d} day${d > 1 ? 's' : ''}`;
        }
        return `${Math.round(days * 24)} hours`;
    }

    function monitor(snapshot) {
        if (!snapshot || snapshot.balanceKwh === undefined) return;
        const enabled = document.getElementById('smsAlertsEnabled')?.checked !== false;
        if (!enabled) return;
        if (snapshot.balanceKwh <= SmartLUKUConfig.SMS_THRESHOLD_KWH) {
            sendLowBalanceAlert(snapshot.balanceKwh);
        }
    }

    function setNotifyCallback(fn) { onNotify = fn; }

    return {
        checkApiHealth,
        getProviderStatus,
        sendLowBalanceAlert,
        sendTopUpConfirmation,
        monitor,
        setNotifyCallback,
        getPhone,
        getMeterNumber,
        getApiStatus: () => apiStatus
    };
})();
