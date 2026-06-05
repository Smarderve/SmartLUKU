/**
 * SmartLUKU SMS integration
 * Handles low-balance LUKU alerts and generic SMS delivery for Tanzania.
 */
// Underlying SMS gateway SDK (required to actually deliver messages to the carrier)
const SmsGateway = require('sms-gateway');

let smsClient = null;
let config = {};

function init(options = {}) {
    config = {
        username: options.username || 'sandbox',
        apiKey: options.apiKey || '',
        senderId: options.senderId || '',
        environment: options.environment || 'sandbox'
    };

    if (!config.apiKey) {
        return { ready: false, mode: 'demo' };
    }

    const gateway = SmsGateway({
        apiKey: config.apiKey,
        username: config.username
    });

    smsClient = gateway.SMS;

    return {
        ready: true,
        mode: config.environment,
        username: config.username
    };
}

/**
 * Normalize Tanzanian phone numbers to E.164 (+255...)
 */
function normalizePhone(phone) {
    let p = String(phone).replace(/[\s\-()]/g, '');
    if (p.startsWith('00')) p = '+' + p.slice(2);
    if (p.startsWith('0') && p.length === 10) p = '+255' + p.slice(1);
    if (p.startsWith('255') && !p.startsWith('+')) p = '+' + p;
    if (!p.startsWith('+')) p = '+255' + p;
    return p;
}

/**
 * Build low-balance alert message
 */
function buildLowBalanceMessage({ meterNumber, balanceKwh, topUpUrl }) {
    const meter = meterNumber || 'N/A';
    const balance = Number(balanceKwh).toFixed(1);
    const link = topUpUrl || 'https://smartluku.app/pay';

    return (
        `SmartLUKU Alert: Your meter ${meter} has ${balance} kWh remaining. ` +
        `Top up now to avoid disconnection: ${link}\n\n` +
        `Tahadhari: Mita ${meter} ina kWh ${balance} tu. Ongeza LUKU sasa: ${link}`
    );
}

/**
 * Send SMS via SmartLUKU SMS
 */
async function sendSMS({ to, message, enqueue = true }) {
    if (!smsClient) {
        return {
            demo: true,
            preview: message,
            to: normalizePhone(to),
            message: 'Demo mode — set SMS_API_KEY in .env for live SmartLUKU SMS delivery'
        };
    }

    const recipients = Array.isArray(to) ? to.map(normalizePhone) : [normalizePhone(to)];

    const options = {
        to: recipients,
        message,
        enqueue
    };

    // Sender ID only for production (sandbox uses default shortcode)
    if (config.senderId && config.environment === 'production') {
        options.from = config.senderId;
    }

    const result = await smsClient.send(options);

    const entry = result?.SMSMessageData?.Recipients?.[0] || {};
    const success = entry.status === 'Success' || entry.statusCode === 101;

    return {
        success,
        provider: 'smartluku_sms',
        environment: config.environment,
        recipients: result?.SMSMessageData?.Recipients || [],
        messageId: entry.messageId,
        status: entry.status,
        statusCode: entry.statusCode,
        cost: entry.cost,
        number: entry.number || recipients[0],
        raw: result
    };
}

/**
 * Send low-balance LUKU alert
 */
async function sendLowBalanceAlert({ phone, meterNumber, balanceKwh, topUpUrl }) {
    const message = buildLowBalanceMessage({ meterNumber, balanceKwh, topUpUrl });
    return sendSMS({ to: phone, message });
}

function getStatus() {
    return {
        configured: !!config.apiKey,
        ready: !!smsClient,
        provider: 'SmartLUKU SMS',
        environment: config.environment,
        username: config.username,
        senderId: config.senderId || '(default)'
    };
}

module.exports = {
    init,
    sendSMS,
    sendLowBalanceAlert,
    buildLowBalanceMessage,
    normalizePhone,
    getStatus
};
