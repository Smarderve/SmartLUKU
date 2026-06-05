/**
 * SmartLUKU API Server
 * SmartLUKU SMS + Anthropic Claude proxy + PostgreSQL persistence
 *
 * ─── Quick start ───────────────────────────────────────────────────
 * 1. Copy ../.env.example → ../.env and set DATABASE_URL (and API keys).
 * 2. Start PostgreSQL:
 *      docker-compose up -d          # from project root
 *    Or use an existing Postgres instance.
 * 3. Install & migrate:
 *      cd server && npm install
 *      npm run migrate               # applies server/schema.sql
 * 4. Run API:
 *      npm start                     # http://localhost:3001
 * 5. Serve frontend (separate terminal):
 *      npx serve . -p 8000           # from project root
 *
 * Without DATABASE_URL the server runs in demo mode (SMS/chat still work;
 * outage/user/transaction endpoints return 503; frontend falls back to localStorage).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const SmartLukuSMS = require('./smartluku-sms');
const db = require('./db');
const { migrate } = require('./migrate');
const { logSmsSend } = require('./services/sms-log');

const outageRoutes = require('./routes/outages');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const consumptionRoutes = require('./routes/consumption');
const simulationRoutes = require('./routes/simulation');
const smsCallbackRoutes = require('./routes/sms-callbacks');

const app = express();
const PORT = process.env.PORT || 3001;
const APP_URL = process.env.APP_URL || 'http://localhost:8000';

const SMS_USERNAME = process.env.SMS_USERNAME || 'sandbox';
const SMS_API_KEY = process.env.SMS_API_KEY || '';
const SMS_SENDER = process.env.SMS_SENDER || '';
const SMS_ENV = process.env.SMS_ENV || (SMS_USERNAME === 'sandbox' ? 'sandbox' : 'production');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const smsInit = SmartLukuSMS.init({
    username: SMS_USERNAME,
    apiKey: SMS_API_KEY,
    senderId: SMS_SENDER,
    environment: SMS_ENV
});

app.use(cors());
app.use(express.json());
// SMS gateway posts callbacks as form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
    const smsStatus = SmartLukuSMS.getStatus();
    const dbStatus = await db.healthCheck();
    res.json({
        ok: true,
        sms: smsStatus.configured,
        smsProvider: 'SmartLUKU SMS',
        smsEnvironment: smsStatus.environment,
        smsReady: smsStatus.ready,
        chat: !!ANTHROPIC_API_KEY,
        database: dbStatus,
        db: dbStatus.ok,
        mode: smsStatus.ready ? 'live' : 'demo'
    });
});

/** PostgreSQL-backed data routes */
app.use('/api/outages', outageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/simulation', simulationRoutes);

/** SmartLUKU SMS delivery-report + incoming-SMS callbacks (+ /api/sms/viewer) */
app.use('/api/sms', smsCallbackRoutes);

/** SmartLUKU SMS connection status */
app.get('/api/sms/status', (req, res) => {
    res.json(SmartLukuSMS.getStatus());
});

/** SmartLUKU SMS — low balance LUKU SMS alert */
app.post('/api/sms/low-balance', async (req, res) => {
    const { phone, meterNumber, balanceKwh, topUpUrl } = req.body;

    if (!phone || balanceKwh === undefined) {
        return res.status(400).json({ error: 'phone and balanceKwh are required' });
    }

    const normalized = SmartLukuSMS.normalizePhone(phone);
    const link = topUpUrl || `${APP_URL}/app.html`;
    const preview = SmartLukuSMS.buildLowBalanceMessage({
        meterNumber: meterNumber || 'Unknown',
        balanceKwh,
        topUpUrl: link
    });

    try {
        const result = await SmartLukuSMS.sendLowBalanceAlert({
            phone: normalized,
            meterNumber,
            balanceKwh,
            topUpUrl: link
        });

        if (result.demo) {
            console.log('[SmartLUKU SMS DEMO]', normalized, preview);
            logSmsSend({
                phone: normalized,
                meterNumber,
                balanceKwh,
                provider: 'smartluku_sms',
                status: 'demo',
                demo: true,
                preview
            });
            return res.json({
                demo: true,
                provider: 'smartluku_sms',
                preview,
                to: normalized,
                message: result.message
            });
        }

        if (!result.success) {
            console.error('[SmartLUKU SMS] Delivery issue:', result);
            logSmsSend({
                phone: normalized,
                meterNumber,
                balanceKwh,
                provider: 'smartluku_sms',
                status: result.status || 'failed',
                demo: false,
                preview
            });
            return res.status(422).json({
                error: 'SMS delivery failed',
                provider: 'smartluku_sms',
                status: result.status,
                statusCode: result.statusCode,
                details: result.recipients,
                hint: SMS_ENV === 'sandbox'
                    ? 'Add this phone number to your SMS gateway sandbox test numbers'
                    : 'Verify sender ID and account balance with your SMS gateway'
            });
        }

        console.log('[SmartLUKU SMS] Sent →', normalized, result.messageId);
        logSmsSend({
            phone: result.number || normalized,
            meterNumber,
            balanceKwh,
            messageId: result.messageId,
            provider: 'smartluku_sms',
            status: result.status,
            demo: false,
            preview
        });
        res.json({
            success: true,
            provider: 'smartluku_sms',
            to: result.number || normalized,
            messageId: result.messageId,
            status: result.status,
            cost: result.cost,
            preview,
            environment: result.environment
        });
    } catch (err) {
        console.error('[SmartLUKU SMS] Error:', err);
        res.status(500).json({
            error: err.message || 'SMS request failed',
            provider: 'smartluku_sms',
            hint: 'Check SMS_API_KEY and SMS_USERNAME in .env'
        });
    }
});

/** Generic SMS send (SmartLUKU SMS) */
app.post('/api/sms/send', async (req, res) => {
    const { phone, message, meterNumber } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'phone and message required' });
    }
    try {
        const normalized = SmartLukuSMS.normalizePhone(phone);
        const result = await SmartLukuSMS.sendSMS({
            to: normalized,
            message
        });
        if (result.demo) {
            logSmsSend({
                phone: normalized,
                meterNumber,
                provider: 'smartluku_sms',
                status: 'demo',
                demo: true,
                preview: message,
                messageType: 'generic'
            });
            return res.json({ demo: true, preview: message, to: result.to });
        }
        logSmsSend({
            phone: result.number || normalized,
            meterNumber,
            messageId: result.messageId,
            provider: 'smartluku_sms',
            status: result.status,
            demo: false,
            preview: message,
            messageType: 'generic'
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** Claude — AI Energy Advisor */
app.post('/api/chat', async (req, res) => {
    const { messages, usageContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array required' });
    }

    const systemPrompt = buildAdvisorPrompt(usageContext);

    if (!ANTHROPIC_API_KEY) {
        const reply = demoAdvisorReply(usageContext, messages[messages.length - 1]?.content);
        return res.json({ demo: true, reply });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages.map(m => ({ role: m.role, content: m.content }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Anthropic error:', data);
            return res.status(response.status).json({ error: data.error?.message || 'Chat failed' });
        }

        const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
        res.json({ reply });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

function buildAdvisorPrompt(ctx) {
    if (!ctx) ctx = {};
    return `You are SmartLUKU Energy Advisor, an AI assistant for Tanzanian TANESCO prepaid electricity users.

Current user data:
- Meter: ${ctx.meterNumber || 'N/A'}
- Balance: ${ctx.balanceKwh ?? 'N/A'} kWh
- Usage today: ${ctx.usageTodayKwh ?? 'N/A'} kWh
- Current load: ${ctx.currentPowerKw ?? 'N/A'} kW
- Active appliances: ${(ctx.appliances || []).filter(a => a.active).map(a => `${a.name} (${a.power}W)`).join(', ') || 'None'}
- Region: ${ctx.region || 'Dar es Salaam'}

Give concise, actionable advice in plain English (users may speak Swahili — you can mix simple Swahili greetings). Reference their actual numbers. Suggest peak-hour savings, appliance-specific tips, and when to top up. Keep responses under 150 words unless asked for detail. Be warm and practical like a helpful neighbour, not corporate.`;
}

function demoAdvisorReply(ctx, userMsg) {
    const bal = ctx?.balanceKwh ?? 285;
    const today = ctx?.usageTodayKwh ?? 4.5;
    const load = ctx?.currentPowerKw ?? 1.2;
    const active = (ctx?.appliances || []).filter(a => a.active);

    if (/thursday|day|week/i.test(userMsg || '')) {
        return `Based on your usage pattern, you're averaging about ${(today * 1.3).toFixed(1)} kWh on busy days. Your ${active.find(a => a.power > 500)?.name || 'high-draw appliances'} is likely the main driver — it accounts for roughly 40% of your load when running.\n\nTip: Run heavy appliances after 10pm when grid demand drops. In Dar es Salaam, that can save ~12% on your monthly bill. You currently have ${bal.toFixed(1)} kWh — enough for about ${Math.floor(bal / (today || 5))} days at today's pace.`;
    }
    if (/save|tip|reduce|bill/i.test(userMsg || '')) {
        return `Habari! With ${bal.toFixed(1)} kWh left and ${load.toFixed(2)} kW draw right now:\n\n1. Turn off ${active.length ? active.sort((a,b) => b.power - a.power)[0].name : 'unused appliances'} when not needed — saves ~${active.length ? Math.round(active[0].power * 0.3) : 200}W.\n2. Your peak usage is likely 6–9 PM. Shift laundry or water heater to late night.\n3. Top up before you hit 20 kWh to avoid disconnection fees.\n\nWant me to analyse a specific appliance?`;
    }
    return `Hello! I'm your SmartLUKU Energy Advisor. You have **${bal.toFixed(1)} kWh** remaining and used **${today.toFixed(1)} kWh** today at **${load.toFixed(2)} kW** current load.\n\n${active.length ? `Active now: ${active.map(a => a.name).join(', ')}.` : 'No heavy appliances running — good!'} Ask me about saving tips, peak hours, or when to top up. (Demo mode — add ANTHROPIC_API_KEY for live Claude responses.)`;
}

async function start() {
    const dbInit = db.init();

    if (dbInit.enabled) {
        try {
            await migrate({ close: false });
            console.log('[DB] PostgreSQL connected and schema ready');
        } catch (err) {
            console.error('[DB] Migration failed:', err.message);
            console.error('       Fix DATABASE_URL or run: npm run migrate');
        }
    }

    app.listen(PORT, () => {
        console.log(`SmartLUKU API → http://localhost:${PORT}`);
        console.log(`  SMS: ${smsInit.ready ? `LIVE via SmartLUKU SMS (${SMS_ENV})` : 'DEMO — set SMS_API_KEY in .env'}`);
        console.log(`  Chat: ${ANTHROPIC_API_KEY ? 'LIVE (Claude)' : 'DEMO mode'}`);
        console.log(`  DB: ${db.isEnabled() ? 'PostgreSQL enabled' : 'OFFLINE — set DATABASE_URL in .env'}`);
        console.log('  SMS callbacks:');
        console.log(`    Delivery report : http://localhost:${PORT}/api/sms/delivery-report`);
        console.log(`    Incoming SMS    : http://localhost:${PORT}/api/sms/incoming`);
        console.log(`    Live SMS viewer : http://localhost:${PORT}/api/sms/viewer`);
        if (SMS_ENV === 'sandbox' && smsInit.ready) {
            console.log(`  Sandbox tip: add your test phone numbers in your SMS gateway dashboard`);
        }
    });
}

start();
