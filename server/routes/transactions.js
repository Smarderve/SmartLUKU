const express = require('express');
const db = require('../db');

const router = express.Router();

function rowToTransaction(row) {
    return {
        id: row.id,
        meterNumber: row.meter_number,
        amount: parseFloat(row.amount),
        unitsAdded: parseFloat(row.units_added),
        paymentMethod: row.payment_method,
        type: row.type,
        status: row.status,
        reference: row.reference,
        fee: row.fee != null ? parseFloat(row.fee) : null,
        total: row.total != null ? parseFloat(row.total) : null,
        timestamp: row.timestamp instanceof Date
            ? row.timestamp.toISOString()
            : row.timestamp
    };
}

/** GET /api/transactions?meter=...&limit=... */
router.get('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const { meter, type, startDate, endDate } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (meter) {
        conditions.push(`meter_number = $${idx++}`);
        params.push(meter);
    }
    if (type) {
        conditions.push(`type = $${idx++}`);
        params.push(type);
    }
    if (startDate) {
        conditions.push(`timestamp >= $${idx++}`);
        params.push(startDate);
    }
    if (endDate) {
        conditions.push(`timestamp <= $${idx++}`);
        params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    try {
        const result = await db.query(
            `SELECT id, meter_number, amount, units_added, payment_method, type, status,
                    reference, fee, total, timestamp
             FROM transactions ${where}
             ORDER BY timestamp DESC
             LIMIT $${idx}`,
            params
        );
        res.json({ transactions: result.rows.map(rowToTransaction) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/transactions */
router.post('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const {
        meterNumber, amount, unitsAdded, paymentMethod, type, status,
        reference, fee, total, timestamp
    } = req.body;

    if (!meterNumber || amount === undefined) {
        return res.status(400).json({ error: 'meterNumber and amount are required' });
    }

    const id = req.body.id || `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ts = timestamp || new Date().toISOString();

    try {
        await db.query(
            `INSERT INTO transactions (
                id, meter_number, amount, units_added, payment_method, type, status,
                reference, fee, total, timestamp
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                id, meterNumber, amount, unitsAdded || null, paymentMethod || null,
                type || 'topup', status || 'completed', reference || null,
                fee || null, total || null, ts
            ]
        );
        res.status(201).json({
            id, meterNumber, amount, unitsAdded, paymentMethod,
            type: type || 'topup', status: status || 'completed',
            reference, fee, total, timestamp: ts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
