-- SmartLUKU PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    meter_number    VARCHAR(50) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    full_name       VARCHAR(200),
    region          VARCHAR(100),
    region_name     VARCHAR(100),
    district        VARCHAR(100),
    district_name   VARCHAR(100),
    street          VARCHAR(255),
    password_hash   VARCHAR(255),
    balance_tzs     NUMERIC(12, 2) DEFAULT 0,
    units_kwh       NUMERIC(10, 3) DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id              VARCHAR(64) PRIMARY KEY,
    meter_number    VARCHAR(50) NOT NULL,
    amount          NUMERIC(12, 2),
    units_added     NUMERIC(10, 3),
    payment_method  VARCHAR(50),
    type            VARCHAR(50) DEFAULT 'topup',
    status          VARCHAR(50) DEFAULT 'completed',
    reference       VARCHAR(100),
    fee             NUMERIC(12, 2),
    total           NUMERIC(12, 2),
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_meter ON transactions (meter_number);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions (timestamp DESC);

CREATE TABLE IF NOT EXISTS consumption_logs (
    id              VARCHAR(64) PRIMARY KEY,
    meter_number    VARCHAR(50) NOT NULL,
    units_used      NUMERIC(10, 3),
    cost            NUMERIC(12, 2),
    rate            NUMERIC(10, 4),
    power_kw        NUMERIC(10, 3),
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consumption_meter ON consumption_logs (meter_number);
CREATE INDEX IF NOT EXISTS idx_consumption_timestamp ON consumption_logs (timestamp DESC);

CREATE TABLE IF NOT EXISTS outage_reports (
    id              VARCHAR(64) PRIMARY KEY,
    lat             NUMERIC(10, 7) NOT NULL,
    lng             NUMERIC(10, 7) NOT NULL,
    description     TEXT,
    region          VARCHAR(100),
    meter_number    VARCHAR(50),
    reporter_phone  VARCHAR(20),
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outage_timestamp ON outage_reports (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_outage_region ON outage_reports (region);

CREATE TABLE IF NOT EXISTS sms_logs (
    id              SERIAL PRIMARY KEY,
    phone           VARCHAR(20),
    meter_number    VARCHAR(50),
    balance_kwh     NUMERIC(10, 3),
    message_id      VARCHAR(100),
    provider        VARCHAR(50) DEFAULT 'smartluku_sms',
    status          VARCHAR(50),
    demo            BOOLEAN DEFAULT FALSE,
    preview         TEXT,
    message_type    VARCHAR(50) DEFAULT 'low_balance',
    timestamp       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_meter ON sms_logs (meter_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_timestamp ON sms_logs (timestamp DESC);

CREATE TABLE IF NOT EXISTS simulation_state (
    meter_number    VARCHAR(50) PRIMARY KEY,
    state_json      JSONB NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
