const express = require('express');
const db = require('../db');

const router = express.Router();

function rowToLog(row) {
    return {
        id: row.id,
        meterNumber: row.meter_number,
        unitsUsed: parseFloat(row.units_used),
        cost: row.cost != null ? parseFloat(row.cost) : null,
        rate: row.rate != null ? parseFloat(row.rate) : null,
        powerKw: row.power_kw != null ? parseFloat(row.power_kw) : null,
        timestamp: row.timestamp instanceof Date
            ? row.timestamp.toISOString()
            : row.timestamp
    };
}

/** GET /api/consumption?meter=...&days=30 */
router.get('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const { meter } = req.query;
    if (!meter) {
        return res.status(400).json({ error: 'meter query parameter is required' });
    }

    const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
    const limit = Math.min(parseInt(req.query.limit, 10) || 1000, 5000);

    try {
        const result = await db.query(
            `SELECT id, meter_number, units_used, cost, rate, power_kw, timestamp
             FROM consumption_logs
             WHERE meter_number = $1
               AND timestamp >= NOW() - ($2 || ' days')::INTERVAL
             ORDER BY timestamp DESC
             LIMIT $3`,
            [meter, String(days), limit]
        );
        res.json({ logs: result.rows.map(rowToLog) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/consumption */
router.post('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const { meterNumber, unitsUsed, cost, rate, powerKw, timestamp } = req.body;

    if (!meterNumber || unitsUsed === undefined) {
        return res.status(400).json({ error: 'meterNumber and unitsUsed are required' });
    }

    const id = req.body.id || `log_${Date.now()}`;
    const ts = timestamp || new Date().toISOString();
    const computedRate = rate != null ? rate : (cost > 0 ? unitsUsed / cost : 0);

    try {
        await db.query(
            `INSERT INTO consumption_logs (id, meter_number, units_used, cost, rate, power_kw, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, meterNumber, unitsUsed, cost || null, computedRate, powerKw || null, ts]
        );
        res.status(201).json({
            id, meterNumber, unitsUsed, cost, rate: computedRate, powerKw, timestamp: ts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
