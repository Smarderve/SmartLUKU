/**
 * Claude-powered AI Energy Advisor chat
 */
const EnergyAdvisor = (function () {
    let isOpen = false;
    let messages = [];
    let usageContext = {};

    function init() {
        injectStyles();
        injectHTML();
        bindEvents();
        messages = [{
            role: 'assistant',
            content: 'Habari! I\'m your SmartLUKU Energy Advisor. Ask me about your usage, how to save on your bill, or when to top up. I can see your live meter data.'
        }];
        renderMessages();
    }

    function injectStyles() {
        if (document.getElementById('advisor-styles')) return;
        const style = document.createElement('style');
        style.id = 'advisor-styles';
        style.textContent = `
            .advisor-fab {
                position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 2000;
                width: 56px; height: 56px; border-radius: 50%;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white; border: none; cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.25);
                font-size: 1.4rem; display: flex; align-items: center; justify-content: center;
                transition: transform 0.2s;
            }
            .advisor-fab:hover { transform: scale(1.08); }
            .advisor-fab .badge {
                position: absolute; top: -2px; right: -2px;
                background: var(--accent); color: #111;
                font-size: 0.6rem; font-weight: 700;
                padding: 2px 6px; border-radius: 10px;
            }
            .advisor-panel {
                position: fixed; bottom: 5.5rem; right: 1.5rem; z-index: 1999;
                width: 380px; max-width: calc(100vw - 2rem);
                height: 480px; max-height: calc(100vh - 8rem);
                background: var(--card-bg); border: 1px solid var(--border);
                border-radius: 1rem; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                display: none; flex-direction: column; overflow: hidden;
            }
            .advisor-panel.open { display: flex; }
            .advisor-header {
                padding: 0.85rem 1rem; border-bottom: 1px solid var(--border);
                display: flex; align-items: center; justify-content: space-between;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
            }
            .advisor-header h3 { font-size: 0.95rem; margin: 0; }
            .advisor-header p { font-size: 0.7rem; opacity: 0.85; margin: 0; }
            .advisor-close { background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem; }
            .advisor-messages {
                flex: 1; overflow-y: auto; padding: 1rem;
                display: flex; flex-direction: column; gap: 0.75rem;
            }
            .advisor-msg {
                max-width: 88%; padding: 0.65rem 0.85rem;
                border-radius: 0.75rem; font-size: 0.85rem; line-height: 1.45;
                white-space: pre-wrap;
            }
            .advisor-msg.user {
                align-self: flex-end;
                background: var(--primary); color: white;
                border-bottom-right-radius: 0.2rem;
            }
            .advisor-msg.assistant {
                align-self: flex-start;
                background: var(--input-bg); color: var(--text);
                border: 1px solid var(--border);
                border-bottom-left-radius: 0.2rem;
            }
            .advisor-msg.typing { opacity: 0.6; font-style: italic; }
            .advisor-input-row {
                padding: 0.75rem; border-top: 1px solid var(--border);
                display: flex; gap: 0.5rem;
            }
            .advisor-input-row input {
                flex: 1; padding: 0.55rem 0.75rem;
                border: 1px solid var(--border); border-radius: 0.5rem;
                background: var(--input-bg); color: var(--text); font-size: 0.85rem;
            }
            .advisor-input-row button {
                padding: 0.55rem 0.9rem; border: none; border-radius: 0.5rem;
                background: var(--primary); color: white; cursor: pointer; font-weight: 600;
            }
            .advisor-suggestions {
                display: flex; flex-wrap: wrap; gap: 0.35rem;
                padding: 0 1rem 0.5rem;
            }
            .advisor-chip {
                font-size: 0.7rem; padding: 0.3rem 0.6rem;
                border-radius: 1rem; border: 1px solid var(--border);
                background: var(--input-bg); color: var(--text-light);
                cursor: pointer;
            }
            .advisor-chip:hover { border-color: var(--primary); color: var(--primary); }
            @media (max-width: 480px) {
                .advisor-panel { right: 0.5rem; left: 0.5rem; width: auto; }
            }
        `;
        document.head.appendChild(style);
    }

    function injectHTML() {
        const wrap = document.createElement('div');
        wrap.id = 'energyAdvisorRoot';
        wrap.innerHTML = `
            <button class="advisor-fab" id="advisorFab" title="AI Energy Advisor">
                <i class="fas fa-robot"></i>
                <span class="badge">AI</span>
            </button>
            <div class="advisor-panel" id="advisorPanel">
                <div class="advisor-header">
                    <div>
                        <h3><i class="fas fa-bolt"></i> Energy Advisor</h3>
                        <p>Powered by Claude · Live usage data</p>
                    </div>
                    <button class="advisor-close" id="advisorClose"><i class="fas fa-times"></i></button>
                </div>
                <div class="advisor-suggestions">
                    <span class="advisor-chip" data-q="How can I reduce my electricity bill?">Save tips</span>
                    <span class="advisor-chip" data-q="Why is my usage high on Thursdays?">Peak days</span>
                    <span class="advisor-chip" data-q="When should I top up my meter?">Top up advice</span>
                </div>
                <div class="advisor-messages" id="advisorMessages"></div>
                <div class="advisor-input-row">
                    <input type="text" id="advisorInput" placeholder="Ask about your energy usage..." maxlength="500" />
                    <button id="advisorSend"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);
    }

    function bindEvents() {
        document.getElementById('advisorFab').addEventListener('click', toggle);
        document.getElementById('advisorClose').addEventListener('click', () => setOpen(false));
        document.getElementById('advisorSend').addEventListener('click', sendMessage);
        document.getElementById('advisorInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') sendMessage();
        });
        document.querySelectorAll('.advisor-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.getElementById('advisorInput').value = chip.dataset.q;
                sendMessage();
            });
        });
    }

    function toggle() { setOpen(!isOpen); }

    function setOpen(open) {
        isOpen = open;
        document.getElementById('advisorPanel').classList.toggle('open', open);
    }

    function updateContext(ctx) {
        usageContext = ctx || {};
        const profile = JSON.parse(localStorage.getItem('smartluku-profile') || 'null');
        if (profile) usageContext.region = profile.regionName || profile.region;
    }

    function renderMessages() {
        const el = document.getElementById('advisorMessages');
        if (!el) return;
        el.innerHTML = messages.map(m =>
            `<div class="advisor-msg ${m.role}">${escapeHtml(m.content)}</div>`
        ).join('');
        el.scrollTop = el.scrollHeight;
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    async function sendMessage() {
        const input = document.getElementById('advisorInput');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        messages.push({ role: 'user', content: text });
        messages.push({ role: 'assistant', content: 'Analysing your usage data...' });
        renderMessages();

        const apiMessages = messages
            .filter(m => m.content !== 'Analysing your usage data...')
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, usageContext })
            });
            const data = await res.json();
            messages.pop();
            messages.push({
                role: 'assistant',
                content: data.reply || data.error || 'Sorry, something went wrong.'
            });
        } catch (err) {
            messages.pop();
            messages.push({
                role: 'assistant',
                content: localAdvisorReply(text)
            });
        }
        renderMessages();
    }

    function localAdvisorReply(userMsg) {
        const ctx = usageContext || {};
        const bal = ctx.balanceKwh ?? 285;
        const today = ctx.usageTodayKwh ?? 4.5;
        const load = ctx.currentPowerKw ?? 1.2;
        const active = (ctx.appliances || []).filter(a => a.active);
        const q = (userMsg || '').toLowerCase();

        if (/thursday|day|week|pattern|high/.test(q)) {
            const heavy = active.find(a => a.power > 500);
            const days = Math.floor(bal / (today || 5));
            return `Looking at your usage, you average about ${(today * 1.3).toFixed(1)} kWh on busier days. ` +
                `${heavy ? heavy.name + ' is likely the main driver — it accounts for roughly 40% of your load when running.' : 'Your heavy appliances drive most of the spikes.'}\n\n` +
                `Tip: run heavy appliances after 10pm when grid demand drops — in Dar es Salaam that can save ~12% monthly. ` +
                `You have ${bal.toFixed(1)} kWh left, about ${days} day(s) at today's pace.`;
        }
        if (/save|tip|reduce|bill|cheap|cost/.test(q)) {
            const top = active.length ? active.slice().sort((a, b) => b.power - a.power)[0] : null;
            return `Habari! With ${bal.toFixed(1)} kWh left and ${load.toFixed(2)} kW drawing now:\n\n` +
                `1. Turn off ${top ? top.name : 'unused appliances'} when not needed — saves ~${top ? Math.round(top.power * 0.3) : 200}W.\n` +
                `2. Peak usage is usually 6–9 PM. Shift laundry or the water heater to late night.\n` +
                `3. Top up before you hit 20 kWh to avoid disconnection.\n\nWant me to analyse a specific appliance?`;
        }
        if (/top.?up|recharge|buy|units|when/.test(q)) {
            const days = Math.floor(bal / (today || 5));
            return `You have ${bal.toFixed(1)} kWh — roughly ${days} day(s) at your current rate of ${today.toFixed(1)} kWh/day. ` +
                `I'd recommend topping up once you drop below 20 kWh so you never risk a disconnection. ` +
                `You'll also get an automatic SMS alert at that point.`;
        }
        return `Hello! I'm your SmartLUKU Energy Advisor. You have ${bal.toFixed(1)} kWh remaining and used ` +
            `${today.toFixed(1)} kWh today at ${load.toFixed(2)} kW current load. ` +
            `${active.length ? 'Active now: ' + active.map(a => a.name).join(', ') + '.' : 'No heavy appliances running — good!'}\n\n` +
            `Ask me about saving tips, peak hours, or when to top up. ` +
            `(Offline mode — for full Claude-powered answers, start the API server.)`;
    }

    return { init, updateContext, toggle };
})();
