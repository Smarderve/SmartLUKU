/**
 * SmartLUKU runtime config
 * API server must be running: cd server && npm install && npm start
 * PostgreSQL optional — frontend falls back to localStorage when API/DB offline
 */
const SmartLUKUConfig = {
    API_BASE: 'http://localhost:3001',
    API_TIMEOUT_MS: 5000,
    SMS_THRESHOLD_KWH: 20,
    SMS_COOLDOWN_MS: 5 * 60 * 1000,
    TARIFF_TZS_PER_KWH: 292,
    AVG_DAILY_KWH_FALLBACK: 6,
    OUTAGE_STORAGE_KEY: 'smartluku_outage_reports',
    SMS_LOG_KEY: 'smartluku_sms_log'
};
