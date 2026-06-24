/**
 * SmartLUKU SMS callback endpoints
 * Configure these URLs in your SMS gateway dashboard (SMS → Callback URLs):
 *   Delivery Reports : https://<ngrok-domain>/api/sms/delivery-report
 *   Incoming Messages: https://<ngrok-domain>/api/sms/incoming
 */
const express = require('express');
const router = express.Router();

let db = null;
try { db = require('../db'); } catch { db = null; }

// In-memory store (always works, even without PostgreSQL)
const inbox = {
    incoming: [],   // messages sent TO your SmartLUKU SMS number
    delivery: []    // delivery reports for messages you sent
};
const MAX = 200;

function pushCapped(arr, item) {
    arr.unshift(item);
    if (arr.length > MAX) arr.length = MAX;
}

/** Delivery report callback (the SMS gateway POSTs here after each SMS) */
router.post('/delivery-report', async (req, res) => {
    const body = req.body || {};
    const report = {
        id: body.id || null,
        status: body.status || 'Unknown',
        phoneNumber: body.phoneNumber || null,
        networkCode: body.networkCode || null,
        failureReason: body.failureReason || null,
        retryCount: body.retryCount || null,
        receivedAt: new Date().toISOString()
    };

    console.log('[SmartLUKU SMS Delivery Report]', report.phoneNumber, '→', report.status, report.id || '');
    pushCapped(inbox.delivery, report);
    await persistDelivery(report);

    // Gateway expects a 200 to stop retrying
    res.status(200).json({ received: true });
});

/** Incoming SMS callback (two-way SMS — the gateway POSTs received messages here) */
router.post('/incoming', async (req, res) => {
    const body = req.body || {};
    const message = {
        id: body.id || null,
        from: body.from || null,
        to: body.to || null,
        text: body.text || '',
        linkId: body.linkId || null,
        date: body.date || null,
        receivedAt: new Date().toISOString()
    };

    console.log('[SmartLUKU SMS Incoming]', message.from, '→', message.text);
    pushCapped(inbox.incoming, message);
    await persistIncoming(message);

    res.status(200).json({ received: true });
});

/** JSON inbox — used by the live SMS viewer page */
router.get('/inbox', (req, res) => {
    res.json({
        incoming: inbox.incoming,
        delivery: inbox.delivery,
        counts: { incoming: inbox.incoming.length, delivery: inbox.delivery.length }
    });
});

/** Simple live SMS viewer (open in browser to watch SMS arrive) */
router.get('/viewer', (req, res) => {
    res.type('html').send(VIEWER_HTML);
});

async function persistDelivery(report) {
    if (!db || !db.isEnabled || !db.isEnabled()) return;
    try {
        await db.query(
            `INSERT INTO sms_logs (phone, message_id, provider, status, demo, preview)
             VALUES ($1, $2, 'smartluku_sms', $3, false, $4)`,
            [report.phoneNumber, report.id, `delivery:${report.status}`, report.failureReason || 'delivery report']
        );
    } catch (e) { console.error('[SmartLUKU SMS] persist delivery failed:', e.message); }
}

async function persistIncoming(message) {
    if (!db || !db.isEnabled || !db.isEnabled()) return;
    try {
        await db.query(
            `INSERT INTO sms_logs (phone, message_id, provider, status, demo, preview)
             VALUES ($1, $2, 'smartluku_sms', 'incoming', false, $3)`,
            [message.from, message.id, message.text]
        );
    } catch (e) { console.error('[SmartLUKU SMS] persist incoming failed:', e.message); }
}

const VIEWER_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SmartLUKU SMS Inbox</title>
<style>
 body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0f172a;color:#f1f5f9;margin:0;padding:1.5rem}
 h1{font-size:1.2rem;color:#fbbf24}h1 i{margin-right:.5rem}
 .sub{color:#94a3b8;font-size:.85rem;margin-bottom:1.5rem}
 .grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
 @media(max-width:800px){.grid{grid-template-columns:1fr}}
 .col h2{font-size:.9rem;text-transform:uppercase;color:#10b981;border-bottom:1px solid #334155;padding-bottom:.5rem}
 .card{background:#1e293b;border:1px solid #334155;border-radius:.6rem;padding:.85rem;margin-bottom:.6rem}
 .card .meta{font-size:.7rem;color:#94a3b8;margin-bottom:.3rem}
 .card .text{font-size:.9rem}
 .badge{display:inline-block;font-size:.65rem;font-weight:700;padding:.15rem .5rem;border-radius:1rem;margin-left:.4rem}
 .ok{background:rgba(16,185,129,.2);color:#10b981}.fail{background:rgba(239,68,68,.2);color:#ef4444}.pend{background:rgba(245,158,11,.2);color:#f59e0b}
 .empty{color:#64748b;font-size:.85rem;padding:1rem;text-align:center}
 .live{display:inline-flex;align-items:center;gap:.4rem;font-size:.75rem;color:#10b981}
 .dot{width:8px;height:8px;border-radius:50%;background:#10b981;animation:p 1.5s infinite}
 @keyframes p{0%,100%{opacity:1}50%{opacity:.4}}
</style></head>
<body>
 <h1>⚡ SmartLUKU SMS Inbox</h1>
 <div class="sub"><span class="live"><span class="dot"></span>Live</span> · Delivery reports & incoming SMS via your ngrok callback URL · auto-refresh 3s</div>
 <div class="grid">
   <div class="col"><h2>📥 Incoming SMS</h2><div id="incoming"></div></div>
   <div class="col"><h2>📤 Delivery Reports</h2><div id="delivery"></div></div>
 </div>
<script>
 function badge(s){const t=(s||'').toLowerCase();let c='pend';if(/success|delivered/.test(t))c='ok';else if(/fail|reject|invalid/.test(t))c='fail';return '<span class="badge '+c+'">'+(s||'?')+'</span>';}
 async function load(){
   try{const r=await fetch('/api/sms/inbox');const d=await r.json();
     const inc=document.getElementById('incoming');
     inc.innerHTML=d.incoming.length?d.incoming.map(m=>'<div class="card"><div class="meta">From '+(m.from||'?')+' → '+(m.to||'?')+' · '+new Date(m.receivedAt).toLocaleString()+'</div><div class="text">'+(m.text||'')+'</div></div>').join(''):'<div class="empty">No incoming SMS yet. Send an SMS to your SmartLUKU SMS number.</div>';
     const del=document.getElementById('delivery');
     del.innerHTML=d.delivery.length?d.delivery.map(r=>'<div class="card"><div class="meta">'+(r.phoneNumber||'?')+' · '+new Date(r.receivedAt).toLocaleString()+'</div><div class="text">Status: '+badge(r.status)+(r.failureReason?'<br>Reason: '+r.failureReason:'')+'</div></div>').join(''):'<div class="empty">No delivery reports yet. Send an SMS from the app.</div>';
   }catch(e){}
 }
 load();setInterval(load,3000);
</script>
</body></html>`;

module.exports = router;
