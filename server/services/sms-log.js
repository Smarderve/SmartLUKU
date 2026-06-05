const db = require('../db');

/**
 * Persist SMS send result to PostgreSQL (non-blocking).
 */
async function logSmsSend({
    phone,
    meterNumber,
    balanceKwh,
    messageId,
    provider = 'smartluku_sms',
    status,
    demo = false,
    preview,
    messageType = 'low_balance'
}) {
    if (!db.isEnabled()) return null;

    try {
        const result = await db.query(
            `INSERT INTO sms_logs (phone, meter_number, balance_kwh, message_id, provider, status, demo, preview, message_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
                phone || null,
                meterNumber || null,
                balanceKwh != null ? balanceKwh : null,
                messageId || null,
                provider,
                status || (demo ? 'demo' : 'sent'),
                demo,
                preview || null,
                messageType
            ]
        );
        return result.rows[0]?.id;
    } catch (err) {
        console.error('[sms-log] Failed to persist:', err.message);
        return null;
    }
}

module.exports = { logSmsSend };
