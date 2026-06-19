/**
 * SmartLUKU IoT Simulation Engine
 * Simulates prepaid meter, grid connection, appliances, and sensor readings.
 * Syncs live state to localStorage for dashboard integration.
 */
const SimulationEngine = (function () {
    const STORAGE_KEY = 'smartluku_simulation';
    const TICK_MS = 2000;

    // usageHoursPerDay = typical effective hours/day the appliance draws power
    // (duty-cycle adjusted, e.g. a fridge compressor only runs part of the time)
    const APPLIANCE_DEFS = [
        { id: 'ac', name: 'Air Conditioner', icon: 'fa-fan', basePower: 850, usageHoursPerDay: 5, position: { x: -2.5, y: 1.2, z: -1.5 }, color: 0x3b82f6 },
        { id: 'lights', name: 'Smart Lights', icon: 'fa-lightbulb', basePower: 120, usageHoursPerDay: 6, position: { x: 0, y: 3.05, z: 0.5 }, color: 0xfbbf24 },
        { id: 'fridge', name: 'Refrigerator', icon: 'fa-snowflake', basePower: 200, usageHoursPerDay: 9, position: { x: 2.5, y: 0.8, z: -1.5 }, color: 0x10b981 },
        { id: 'tv', name: 'Smart TV', icon: 'fa-tv', basePower: 85, usageHoursPerDay: 5, position: { x: -1.5, y: 1, z: 2 }, color: 0x8b5cf6 },
        { id: 'water_heater', name: 'Water Heater', icon: 'fa-shower', basePower: 1500, usageHoursPerDay: 1.5, position: { x: 2.5, y: 1.5, z: 1.5 }, color: 0xef4444 }
    ];

    const PERIOD_DAYS = { daily: 1, weekly: 7, monthly: 30 };

    const SENSOR_DEFS = [
        { id: 'voltage', name: 'Voltage Sensor', type: 'ZMPT101B', unit: 'V', min: 210, max: 240, nominal: 230 },
        { id: 'current', name: 'Current Sensor', type: 'SCT-013', unit: 'A', min: 0, max: 30 },
        { id: 'power', name: 'Power Monitor', type: 'PZEM-004T', unit: 'W', min: 0, max: 5000 },
        { id: 'frequency', name: 'Frequency Sensor', type: 'ADE7953', unit: 'Hz', min: 49.5, max: 50.5, nominal: 50 },
        { id: 'power_factor', name: 'Power Factor', type: 'ADE7953', unit: '', min: 0.7, max: 1.0 },
        { id: 'temperature', name: 'Temperature', type: 'DHT22', unit: '°C', min: 22, max: 35 },
        { id: 'humidity', name: 'Humidity', type: 'DHT22', unit: '%', min: 40, max: 80 },
        { id: 'motion', name: 'Motion Detector', type: 'PIR HC-SR501', unit: '', binary: true },
        { id: 'smoke', name: 'Smoke Detector', type: 'MQ-2', unit: 'ppm', min: 0, max: 50 },
        { id: 'door', name: 'Door Sensor', type: 'Magnetic Reed', unit: '', binary: true }
    ];

    let state = null;
    let tickInterval = null;
    let listeners = [];

    function getMeterId() {
        const profile = safeParse(localStorage.getItem('smartluku-profile'));
        if (profile?.meter) return profile.meter;
        return localStorage.getItem('smartluku-user') || '1234567890';
    }

    function safeParse(str) {
        try { return str ? JSON.parse(str) : null; } catch { return null; }
    }

    function defaultState() {
        return {
            meterNumber: getMeterId(),
            balanceKwh: 285,
            gridConnected: true,
            meterOnline: true,
            simulationRunning: true,
            lastUpdated: new Date().toISOString(),
            sessionStart: new Date().toISOString(),
            totalEnergyConsumedKwh: 0,
            appliances: APPLIANCE_DEFS.map(a => ({
                id: a.id,
                name: a.name,
                icon: a.icon,
                active: a.id === 'fridge' || a.id === 'lights',
                power: 0,
                basePower: a.basePower,
                position: a.position,
                color: a.color
            })),
            sensors: {},
            alerts: [],
            networkStatus: 'online'
        };
    }

    function loadState() {
        const saved = safeParse(localStorage.getItem(STORAGE_KEY));
        if (saved && saved.appliances) {
            state = saved;
            APPLIANCE_DEFS.forEach(def => {
                if (!state.appliances.find(a => a.id === def.id)) {
                    state.appliances.push({
                        id: def.id, name: def.name, icon: def.icon,
                        active: false, power: 0, basePower: def.basePower,
                        position: def.position, color: def.color
                    });
                }
            });
        } else {
            state = defaultState();
            persist();
        }
        return state;
    }

    function persist() {
        if (!state) return;
        state.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        listeners.forEach(fn => fn(state));
    }

    function calcTotalPower() {
        return state.appliances.reduce((sum, a) => sum + (a.active ? a.basePower : 0), 0);
    }

    function jitter(base, variance, decimals = 1) {
        const v = base + (Math.random() - 0.5) * variance * 2;
        const factor = Math.pow(10, decimals);
        return Math.round(v * factor) / factor;
    }

    function updateSensors() {
        const totalW = calcTotalPower();
        const currentA = totalW / 230;
        const pf = totalW > 0 ? jitter(0.92, 0.05, 2) : 1;

        state.sensors = {
            voltage: { value: jitter(230, 3, 1), unit: 'V', status: 'normal' },
            current: { value: jitter(currentA, currentA * 0.05, 2), unit: 'A', status: currentA > 8 ? 'warning' : 'normal' },
            power: { value: Math.round(totalW + jitter(0, 15, 0)), unit: 'W', status: totalW > 2000 ? 'warning' : 'normal' },
            frequency: { value: jitter(50, 0.15, 2), unit: 'Hz', status: 'normal' },
            power_factor: { value: pf, unit: '', status: pf < 0.85 ? 'warning' : 'normal' },
            temperature: { value: jitter(28, 2, 1), unit: '°C', status: 'normal' },
            humidity: { value: jitter(62, 5, 0), unit: '%', status: 'normal' },
            motion: { value: Math.random() > 0.7 ? 1 : 0, unit: '', status: 'normal', label: Math.random() > 0.7 ? 'Detected' : 'Clear' },
            smoke: { value: jitter(8, 3, 0), unit: 'ppm', status: 'normal' },
            door: { value: Math.random() > 0.95 ? 1 : 0, unit: '', status: 'normal', label: Math.random() > 0.95 ? 'Open' : 'Closed' }
        };

        state.appliances.forEach(a => {
            a.power = a.active ? Math.round(a.basePower + jitter(0, a.basePower * 0.08, 0)) : 0;
        });

        const kwhPerTick = (totalW / 1000) * (TICK_MS / 3600000);
        state.totalEnergyConsumedKwh += kwhPerTick;
        state.balanceKwh = Math.max(0, state.balanceKwh - kwhPerTick);

        state.alerts = [];
        if (state.balanceKwh < 100) {
            state.alerts.push({ type: 'warning', message: `Low balance: ${state.balanceKwh.toFixed(1)} kWh remaining`, icon: 'fa-exclamation-triangle' });
        }
        if (state.balanceKwh < 20) {
            state.alerts.push({ type: 'danger', message: 'Critical balance — disconnection imminent', icon: 'fa-bolt' });
        }
        if (totalW > 2500) {
            state.alerts.push({ type: 'warning', message: `High load: ${(totalW / 1000).toFixed(2)} kW — reduce usage`, icon: 'fa-fire' });
        }
        if (state.sensors.voltage.value < 215 || state.sensors.voltage.value > 245) {
            state.alerts.push({ type: 'danger', message: 'Voltage out of normal range', icon: 'fa-plug' });
        }
    }

    function tick() {
        if (!state?.simulationRunning) return;
        updateSensors();
        persist();
    }

    function start() {
        loadState();
        state.simulationRunning = true;
        if (tickInterval) clearInterval(tickInterval);
        updateSensors();
        persist();
        tickInterval = setInterval(tick, TICK_MS);
    }

    function stop() {
        if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
        if (state) { state.simulationRunning = false; persist(); }
    }

    function toggleAppliance(id) {
        const appliance = state.appliances.find(a => a.id === id);
        if (appliance) {
            appliance.active = !appliance.active;
            updateSensors();
            persist();
        }
        return appliance;
    }

    function setAppliance(id, active) {
        const appliance = state.appliances.find(a => a.id === id);
        if (appliance) {
            appliance.active = active;
            updateSensors();
            persist();
        }
        return appliance;
    }

    function topUpUnits(kwh) {
        state.balanceKwh += kwh;
        updateSensors();
        persist();
    }

    const CUSTOM_COLORS = [0x6b7280, 0xec4899, 0x14b8a6, 0xf97316, 0x6366f1, 0xa855f7];

    function nextCustomPosition() {
        const n = state.appliances.filter(a => a.custom).length;
        return { x: -2 + (n % 3) * 2.5, y: 1 + Math.floor(n / 3) * 0.8, z: (n % 2) ? 1.5 : -1.2 };
    }

    function addAppliance(opts) {
        loadState();
        const id = opts.id || ('custom_' + Date.now().toString(36).slice(-8));
        if (state.appliances.some(a => a.id === id)) return null;
        const appliance = {
            id,
            name: opts.name,
            icon: opts.icon || 'fa-plug',
            active: !!opts.active,
            power: 0,
            basePower: Number(opts.basePower) || 100,
            usageHoursPerDay: Number(opts.usageHoursPerDay) || 4,
            position: opts.position || nextCustomPosition(),
            color: opts.color || CUSTOM_COLORS[state.appliances.length % CUSTOM_COLORS.length],
            room: opts.room || 'Other',
            model: opts.model || 'ESP32 Smart Node',
            serial: opts.serial || ('SLK-' + id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()),
            custom: true,
            deviceType: opts.deviceType || 'smart_plug'
        };
        state.appliances.push(appliance);
        updateSensors();
        persist();
        return appliance;
    }

    function removeAppliance(id) {
        loadState();
        const app = state.appliances.find(a => a.id === id);
        if (!app?.custom) return false;
        state.appliances = state.appliances.filter(a => a.id !== id);
        updateSensors();
        persist();
        return true;
    }

    function getState() {
        if (!state) loadState();
        return state;
    }

    /**
     * Categorised consumption per appliance for a period: 'daily' | 'weekly' | 'monthly'.
     * Estimates use each appliance's typical effective usage hours/day (duty-cycle adjusted).
     */
    function getConsumptionBreakdown(period = 'daily') {
        const s = getState();
        const days = PERIOD_DAYS[period] || 1;
        const tariff = (typeof window !== 'undefined' && window.SmartLUKUConfig && window.SmartLUKUConfig.TARIFF_TZS_PER_KWH) || 292;

        const items = APPLIANCE_DEFS.map(def => {
            const live = s.appliances.find(a => a.id === def.id);
            const dailyKwh = (def.basePower / 1000) * def.usageHoursPerDay;
            const kwh = dailyKwh * days;
            return {
                id: def.id,
                name: def.name,
                icon: def.icon,
                color: def.color,
                colorHex: '#' + def.color.toString(16).padStart(6, '0'),
                basePower: def.basePower,
                hoursPerDay: def.usageHoursPerDay,
                activeNow: live ? live.active : false,
                kwh,
                cost: kwh * tariff
            };
        });

        s.appliances.filter(a => a.custom).forEach(live => {
            const hours = live.usageHoursPerDay || 4;
            const dailyKwh = (live.basePower / 1000) * hours;
            const kwh = dailyKwh * days;
            items.push({
                id: live.id,
                name: live.name,
                icon: live.icon || 'fa-plug',
                color: live.color || 0x6b7280,
                colorHex: '#' + (live.color || 0x6b7280).toString(16).padStart(6, '0'),
                basePower: live.basePower,
                hoursPerDay: hours,
                activeNow: live.active,
                kwh,
                cost: kwh * tariff
            });
        });

        const totalKwh = items.reduce((sum, i) => sum + i.kwh, 0);
        items.forEach(i => { i.share = totalKwh ? (i.kwh / totalKwh) * 100 : 0; });
        items.sort((a, b) => b.kwh - a.kwh);

        return {
            period,
            days,
            tariff,
            items,
            totalKwh,
            totalCost: totalKwh * tariff
        };
    }

    function getDashboardSnapshot() {
        const s = getState();
        const totalW = calcTotalPower();
        const currentPowerKw = totalW / 1000;
        const kwhPerTick = (totalW / 1000) * (TICK_MS / 3600000);
        const drainRateKwhPerHr = currentPowerKw;
        const estHoursLeft = currentPowerKw > 0.01 ? s.balanceKwh / currentPowerKw : null;
        return {
            balanceKwh: s.balanceKwh,
            meterNumber: s.meterNumber,
            connected: s.gridConnected && s.meterOnline,
            simulationRunning: !!s.simulationRunning,
            usageTodayKwh: s.totalEnergyConsumedKwh,
            currentPowerKw,
            drainRateKwhPerHr,
            kwhPerTick,
            estHoursLeft,
            voltage: s.sensors.voltage?.value || 230,
            appliances: s.appliances,
            alerts: s.alerts,
            sensors: s.sensors,
            lastUpdated: s.lastUpdated
        };
    }

    function onUpdate(callback) {
        listeners.push(callback);
        return () => { listeners = listeners.filter(fn => fn !== callback); };
    }

    function getApplianceDefs() { return APPLIANCE_DEFS; }
    function getSensorDefs() { return SENSOR_DEFS; }

    return {
        start, stop, tick, loadState, getState, getDashboardSnapshot,
        getConsumptionBreakdown,
        toggleAppliance, setAppliance, topUpUnits, addAppliance, removeAppliance, onUpdate,
        getApplianceDefs, getSensorDefs, STORAGE_KEY
    };
})();

if (typeof module !== 'undefined') module.exports = SimulationEngine;
