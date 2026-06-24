/**
 * Run schema migration: node migrate.js
 * Also invoked automatically on server start when DATABASE_URL is set.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function applySchema() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.query(sql);
}

/** @param {{ close?: boolean }} opts */
async function migrate(opts = {}) {
    const url = process.env.DATABASE_URL;
    if (!url) {
        const msg = 'DATABASE_URL is not set in .env';
        if (require.main === module) {
            console.error('[migrate]', msg);
            process.exit(1);
        }
        throw new Error(msg);
    }

    if (!db.isEnabled()) db.init();

    try {
        await applySchema();
        if (require.main === module) {
            console.log('[migrate] Schema applied successfully');
        }
    } catch (err) {
        if (require.main === module) {
            console.error('[migrate] Failed:', err.message);
            process.exit(1);
        }
        throw err;
    } finally {
        if (opts.close !== false && require.main === module) {
            await db.close();
        }
    }
}

if (require.main === module) {
    migrate({ close: true });
}

module.exports = { migrate, applySchema };
