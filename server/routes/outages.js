const express = require('express');
const db = require('../db');

const router = express.Router();

function rowToReport(row) {
    return {
        id: row.id,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        description: row.description,
        region: row.region,
        meterNumber: row.meter_number,
        reporterPhone: row.reporter_phone,
        timestamp: row.timestamp instanceof Date
            ? row.timestamp.toISOString()
            : row.timestamp
    };
}

/** GET /api/outages — list recent outage reports */
router.get('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
        const result = await db.query(
            `SELECT id, lat, lng, description, region, meter_number, reporter_phone, timestamp
             FROM outage_reports
             ORDER BY timestamp DESC
             LIMIT $1`,
            [limit]
        );
        res.json({ reports: result.rows.map(rowToReport) });
    } catch (err) {
        console.error('[outages] GET error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/** GET /api/outages/:id */
router.get('/:id', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }
    try {
        const result = await db.query(
            `SELECT id, lat, lng, description, region, meter_number, reporter_phone, timestamp
             FROM outage_reports WHERE id = $1`,
            [req.params.id]
        );
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(rowToReport(result.rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/outages — create outage report */
router.post('/', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const { lat, lng, description, region, meterNumber, reporterPhone, timestamp } = req.body;

    if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'lat and lng are required' });
    }

    const id = req.body.id || `outage_${Date.now()}`;
    const ts = timestamp || new Date().toISOString();

    try {
        await db.query(
            `INSERT INTO outage_reports (id, lat, lng, description, region, meter_number, reporter_phone, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, lat, lng, description || null, region || null, meterNumber || null, reporterPhone || null, ts]
        );
        res.status(201).json({
            id, lat, lng, description, region,
            meterNumber, reporterPhone, timestamp: ts
        });
    } catch (err) {
        console.error('[outages] POST error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/** DELETE /api/outages/:id */
router.delete('/:id', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }
    try {
        const result = await db.query('DELETE FROM outage_reports WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ deleted: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
