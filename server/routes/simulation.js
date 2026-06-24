const express = require('express');
const db = require('../db');

const router = express.Router();

/** GET /api/simulation/:meter */
router.get('/:meter', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }
    try {
        const result = await db.query(
            'SELECT meter_number, state_json, updated_at FROM simulation_state WHERE meter_number = $1',
            [req.params.meter]
        );
        if (!result.rows.length) {
            return res.status(404).json({ error: 'No simulation state found' });
        }
        const row = result.rows[0];
        res.json({
            meterNumber: row.meter_number,
            state: row.state_json,
            updatedAt: row.updated_at
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/simulation/:meter — upsert simulation state */
router.post('/:meter', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const state = req.body.state || req.body;
    if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'state object is required' });
    }

    try {
        await db.query(
            `INSERT INTO simulation_state (meter_number, state_json, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (meter_number) DO UPDATE SET
                state_json = EXCLUDED.state_json,
                updated_at = NOW()`,
            [req.params.meter, JSON.stringify(state)]
        );
        res.json({ meterNumber: req.params.meter, saved: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
