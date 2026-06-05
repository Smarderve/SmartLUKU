/**
 * PostgreSQL connection pool and query helpers
 */
const { Pool } = require('pg');

let pool = null;
let enabled = false;

function init() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.warn('[DB] DATABASE_URL not set — running without PostgreSQL');
        return { enabled: false };
    }

    pool = new Pool({
        connectionString: url,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
        console.error('[DB] Unexpected pool error:', err.message);
    });

    enabled = true;
    return { enabled: true };
}

async function query(text, params) {
    if (!pool) throw new Error('Database not initialized');
    return pool.query(text, params);
}

async function healthCheck() {
    if (!enabled || !pool) {
        return { ok: false, configured: false, message: 'DATABASE_URL not set' };
    }
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        return { ok: true, configured: true, latencyMs: Date.now() - start };
    } catch (err) {
        return { ok: false, configured: true, message: err.message };
    }
}

function isEnabled() {
    return enabled;
}

async function close() {
    if (pool) {
        await pool.end();
        pool = null;
        enabled = false;
    }
}

module.exports = { init, query, healthCheck, isEnabled, close };
