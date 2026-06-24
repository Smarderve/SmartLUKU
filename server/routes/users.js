const express = require('express');
const db = require('../db');

const router = express.Router();

function rowToUser(row) {
    return {
        meter: row.meter_number,
        meterNumber: row.meter_number,
        phone: row.phone,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: row.full_name || [row.first_name, row.last_name].filter(Boolean).join(' ') || null,
        region: row.region,
        regionName: row.region_name,
        district: row.district,
        districtName: row.district_name,
        street: row.street,
        balance: parseFloat(row.balance_tzs) || 0,
        units: parseFloat(row.units_kwh) || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/** GET /api/users/:meter — profile by meter number */
router.get('/:meter', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }
    try {
        const result = await db.query(
            `SELECT meter_number, phone, email, first_name, last_name, full_name,
                    region, region_name, district, district_name, street,
                    balance_tzs, units_kwh, created_at, updated_at
             FROM users WHERE meter_number = $1`,
            [req.params.meter]
        );
        if (!result.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rowToUser(result.rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** POST /api/users/:meter — create or update profile */
router.post('/:meter', async (req, res) => {
    if (!db.isEnabled()) {
        return res.status(503).json({ error: 'Database not configured', offline: true });
    }

    const meter = req.params.meter;
    const {
        phone, email, firstName, lastName, fullName,
        region, regionName, district, districtName, street,
        passwordHash, balance, units
    } = req.body;

    const resolvedFullName = fullName || [firstName, lastName].filter(Boolean).join(' ') || null;

    try {
        const result = await db.query(
            `INSERT INTO users (
                meter_number, phone, email, first_name, last_name, full_name,
                region, region_name, district, district_name, street,
                password_hash, balance_tzs, units_kwh, updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
             ON CONFLICT (meter_number) DO UPDATE SET
                phone = COALESCE(EXCLUDED.phone, users.phone),
                email = COALESCE(EXCLUDED.email, users.email),
                first_name = COALESCE(EXCLUDED.first_name, users.first_name),
                last_name = COALESCE(EXCLUDED.last_name, users.last_name),
                full_name = COALESCE(EXCLUDED.full_name, users.full_name),
                region = COALESCE(EXCLUDED.region, users.region),
                region_name = COALESCE(EXCLUDED.region_name, users.region_name),
                district = COALESCE(EXCLUDED.district, users.district),
                district_name = COALESCE(EXCLUDED.district_name, users.district_name),
                street = COALESCE(EXCLUDED.street, users.street),
                password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
                balance_tzs = COALESCE(EXCLUDED.balance_tzs, users.balance_tzs),
                units_kwh = COALESCE(EXCLUDED.units_kwh, users.units_kwh),
                updated_at = NOW()
             RETURNING meter_number, phone, email, first_name, last_name, full_name,
                       region, region_name, district, district_name, street,
                       balance_tzs, units_kwh, created_at, updated_at`,
            [
                meter,
                phone || null,
                email || null,
                firstName || null,
                lastName || null,
                resolvedFullName,
                region || null,
                regionName || null,
                district || null,
                districtName || null,
                street || null,
                passwordHash || null,
                balance != null ? balance : null,
                units != null ? units : null
            ]
        );
        res.json(rowToUser(result.rows[0]));
    } catch (err) {
        console.error('[users] POST error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
