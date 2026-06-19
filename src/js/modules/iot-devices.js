/**
 * IoT device registry — register, list, and manage smart home devices in Settings.
 */
const IoTDevices = (function () {
    const TYPE_LABELS = {
        meter: 'LUKU Meter',
        smart_plug: 'Smart Plug',
        switch: 'Smart Switch',
        sensor: 'Sensor'
    };

    const ICON_OPTIONS = [
        { value: 'fa-plug', label: 'Smart Plug' },
        { value: 'fa-fan', label: 'Fan / AC' },
        { value: 'fa-lightbulb', label: 'Lights' },
        { value: 'fa-tv', label: 'TV' },
        { value: 'fa-snowflake', label: 'Fridge' },
        { value: 'fa-shower', label: 'Heater' },
        { value: 'fa-blender', label: 'Kitchen' },
        { value: 'fa-wifi', label: 'Gateway' },
        { value: 'fa-microchip', label: 'Sensor Node' }
    ];

    function storageKey() {
        return SmartLUKUConfig?.IOT_REGISTRY_KEY || 'smartluku_iot_registry';
    }

    function loadRegistry() {
        try {
            const raw = localStorage.getItem(storageKey());
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveRegistry(entries) {
        localStorage.setItem(storageKey(), JSON.stringify(entries.slice(0, 100)));
    }

    function slugify(text) {
        return String(text || 'device').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24);
    }

    function makeSerial(prefix) {
        return prefix + '-' + Date.now().toString(36).toUpperCase().slice(-6);
    }

    function getMeterDevice() {
        const state = typeof SimulationEngine !== 'undefined' ? SimulationEngine.getState() : null;
        return {
            id: 'luku_meter',
            name: 'LUKU Prepaid Meter',
            type: 'meter',
            model: 'Conlog STS',
            serial: state?.meterNumber || '—',
            room: 'Main Panel',
            basePower: null,
            icon: 'fa-bolt',
            active: !!(state?.gridConnected && state?.meterOnline),
            online: !!state?.meterOnline,
            builtin: true,
            custom: false
        };
    }

    function getBuiltinAppliances() {
        if (typeof SimulationEngine === 'undefined') return [];
        const state = SimulationEngine.getState();
        return (state?.appliances || []).filter(a => !a.custom).map(a => ({
            id: a.id,
            name: a.name,
            type: 'smart_plug',
            model: a.model || 'SmartLUKU Smart Plug',
            serial: a.serial || ('SLK-' + a.id.toUpperCase().replace(/_/g, '-')),
            room: a.room || 'Living Room',
            basePower: a.basePower,
            icon: a.icon,
            active: a.active,
            online: true,
            builtin: true,
            custom: false
        }));
    }

    function getCustomAppliances() {
        if (typeof SimulationEngine === 'undefined') return [];
        const state = SimulationEngine.getState();
        return (state?.appliances || []).filter(a => a.custom).map(a => ({
            id: a.id,
            name: a.name,
            type: a.deviceType || 'smart_plug',
            model: a.model,
            serial: a.serial,
            room: a.room,
            basePower: a.basePower,
            icon: a.icon,
            active: a.active,
            online: true,
            builtin: false,
            custom: true
        }));
    }

    function getBuiltinSensors() {
        if (typeof SimulationEngine === 'undefined') return [];
        return SimulationEngine.getSensorDefs().map(s => ({
            id: 'sensor_' + s.id,
            name: s.name,
            type: 'sensor',
            model: s.type,
            serial: 'SLK-SNS-' + s.id.toUpperCase().replace(/_/g, '-'),
            room: 'Meter Unit',
            basePower: null,
            icon: 'fa-microchip',
            active: true,
            online: true,
            builtin: true,
            custom: false
        }));
    }

    function getCustomSensors() {
        return loadRegistry().map(entry => ({
            ...entry,
            builtin: false,
            custom: true,
            online: entry.online !== false
        }));
    }

    function getAllDevices() {
        return [
            getMeterDevice(),
            ...getBuiltinAppliances(),
            ...getCustomAppliances(),
            ...getBuiltinSensors(),
            ...getCustomSensors()
        ];
    }

    function registerDevice(form) {
        const name = form.name?.trim();
        const type = form.type || 'smart_plug';
        const model = form.model?.trim() || 'ESP32 Smart Node';
        const room = form.room?.trim() || 'Other';
        const basePower = Number(form.basePower) || 100;
        const icon = form.icon || 'fa-plug';

        if (!name) return { ok: false, error: 'Device name is required.' };

        if (type === 'smart_plug' || type === 'switch') {
            if (typeof SimulationEngine === 'undefined') {
                return { ok: false, error: 'Simulation engine not loaded.' };
            }
            const id = 'custom_' + slugify(name) + '_' + Date.now().toString(36).slice(-4);
            const appliance = SimulationEngine.addAppliance({
                id,
                name,
                icon,
                basePower: type === 'switch' ? Math.min(basePower, 500) : basePower,
                room,
                model,
                serial: makeSerial('SLK'),
                deviceType: type,
                active: false
            });
            if (!appliance) return { ok: false, error: 'Could not register device.' };
            return { ok: true, device: appliance };
        }

        const registry = loadRegistry();
        const entry = {
            id: 'sensor_' + slugify(name) + '_' + Date.now().toString(36).slice(-4),
            name,
            type: 'sensor',
            model,
            serial: makeSerial('SNS'),
            room,
            basePower: null,
            icon: icon === 'fa-plug' ? 'fa-microchip' : icon,
            active: true,
            online: true,
            registeredAt: new Date().toISOString()
        };
        registry.unshift(entry);
        saveRegistry(registry);
        return { ok: true, device: entry };
    }

    function removeDevice(id) {
        if (id === 'luku_meter' || getBuiltinSensors().some(s => s.id === id)) {
            return { ok: false, error: 'Built-in devices cannot be removed.' };
        }

        const builtinApp = getBuiltinAppliances().find(d => d.id === id);
        if (builtinApp) {
            if (typeof SimulationEngine !== 'undefined') {
                SimulationEngine.setAppliance(id, false);
            }
            return { ok: true, message: 'Device turned off (built-in devices stay registered).' };
        }

        if (typeof SimulationEngine !== 'undefined' && SimulationEngine.removeAppliance(id)) {
            return { ok: true };
        }

        const registry = loadRegistry();
        const next = registry.filter(e => e.id !== id);
        if (next.length !== registry.length) {
            saveRegistry(next);
            return { ok: true };
        }

        return { ok: false, error: 'Device not found.' };
    }

    function toggleDevice(id, active) {
        if (id === 'luku_meter') return { ok: false, error: 'Meter status is managed by the grid.' };

        const sensor = getCustomSensors().find(d => d.id === id);
        if (sensor) {
            const registry = loadRegistry().map(e => e.id === id ? { ...e, active } : e);
            saveRegistry(registry);
            return { ok: true };
        }

        const builtinSensor = getBuiltinSensors().find(d => d.id === id);
        if (builtinSensor) {
            return { ok: false, error: 'Built-in sensors are always active.' };
        }

        if (typeof SimulationEngine !== 'undefined') {
            SimulationEngine.setAppliance(id, active);
            return { ok: true };
        }
        return { ok: false, error: 'Simulation engine not available.' };
    }

    function statusBadge(device) {
        if (!device.online) return '<span class="iot-badge offline">Offline</span>';
        if (device.type === 'meter') {
            return device.active
                ? '<span class="iot-badge online">Grid Connected</span>'
                : '<span class="iot-badge offline">Disconnected</span>';
        }
        if (device.type === 'sensor') {
            return '<span class="iot-badge sensor">Monitoring</span>';
        }
        return device.active
            ? '<span class="iot-badge online">On</span>'
            : '<span class="iot-badge idle">Off</span>';
    }

    function renderList() {
        const container = document.getElementById('iotDeviceList');
        const countEl = document.getElementById('iotDeviceCount');
        if (!container) return;

        const devices = getAllDevices();
        if (countEl) {
            const custom = devices.filter(d => d.custom).length;
            countEl.textContent = `${devices.length} registered · ${custom} custom`;
        }

        if (!devices.length) {
            container.innerHTML = '<div class="iot-empty">No IoT devices registered yet.</div>';
            return;
        }

        container.innerHTML = devices.map(d => {
            const canRemove = d.custom;
            const canToggle = d.type !== 'meter' && !(d.builtin && d.type === 'sensor');
            const power = d.basePower != null ? `${d.basePower} W` : '—';
            const typeLabel = TYPE_LABELS[d.type] || d.type;
            const tag = d.builtin
                ? '<span class="iot-tag builtin">Built-in</span>'
                : '<span class="iot-tag custom">Custom</span>';

            return `<div class="iot-device-row" data-id="${d.id}">
                <div class="iot-device-icon"><i class="fas ${d.icon}"></i></div>
                <div class="iot-device-info">
                    <div class="iot-device-name">${d.name} ${tag}</div>
                    <div class="iot-device-meta">${typeLabel} · ${d.model} · ${d.room} · ${power}</div>
                    <div class="iot-device-serial">Serial: ${d.serial}</div>
                </div>
                <div class="iot-device-status">${statusBadge(d)}</div>
                <div class="iot-device-actions">
                    ${canToggle ? `<label class="iot-toggle" title="Power ${d.active ? 'off' : 'on'}">
                        <input type="checkbox" ${d.active ? 'checked' : ''} onchange="IoTDevices.handleToggle('${d.id}', this.checked)">
                        <span class="iot-toggle-slider"></span>
                    </label>` : ''}
                    ${canRemove ? `<button type="button" class="iot-remove-btn" onclick="IoTDevices.handleRemove('${d.id}')" title="Remove device"><i class="fas fa-trash-alt"></i></button>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    function toggleRegisterForm(forceOpen) {
        const form = document.getElementById('iotRegisterPanel');
        const btn = document.getElementById('iotRegisterToggleBtn');
        if (!form) return;
        let visible;
        if (forceOpen === true) visible = true;
        else if (forceOpen === false) visible = false;
        else visible = form.hidden;
        form.hidden = !visible;
        if (btn) btn.innerHTML = visible
            ? '<i class="fas fa-times"></i> Cancel'
            : '<i class="fas fa-plus"></i> Register Device';
    }

    function handleRegister(event) {
        if (event) event.preventDefault();
        const msg = document.getElementById('iotRegisterMsg');
        const typeEl = document.getElementById('iotDeviceType');
        const type = typeEl?.value || 'smart_plug';
        const powerGroup = document.getElementById('iotPowerGroup');

        const result = registerDevice({
            name: document.getElementById('iotDeviceName')?.value,
            type,
            model: document.getElementById('iotDeviceModel')?.value,
            room: document.getElementById('iotDeviceRoom')?.value,
            basePower: document.getElementById('iotDevicePower')?.value,
            icon: document.getElementById('iotDeviceIcon')?.value
        });

        if (msg) {
            msg.className = 'iot-register-msg ' + (result.ok ? 'success' : 'error');
            msg.textContent = result.ok
                ? `✓ "${document.getElementById('iotDeviceName')?.value}" registered successfully.`
                : result.error;
        }

        if (result.ok) {
            document.getElementById('iotRegisterForm')?.reset();
            if (powerGroup) powerGroup.style.display = '';
            toggleRegisterForm(false);
            renderList();
            if (typeof syncFromSimulation === 'function') syncFromSimulation();
            if (typeof renderConsumptionBreakdown === 'function') renderConsumptionBreakdown();
        }
    }

    function handleToggle(id, active) {
        toggleDevice(id, active);
        renderList();
        if (typeof syncFromSimulation === 'function') syncFromSimulation();
    }

    function handleRemove(id) {
        const device = getAllDevices().find(d => d.id === id);
        if (!device) return;
        if (!confirm(`Remove "${device.name}" from your IoT registry?`)) return;
        const result = removeDevice(id);
        if (!result.ok && result.error) alert(result.error);
        renderList();
        if (typeof syncFromSimulation === 'function') syncFromSimulation();
        if (typeof renderConsumptionBreakdown === 'function') renderConsumptionBreakdown();
    }

    function onTypeChange() {
        const type = document.getElementById('iotDeviceType')?.value;
        const powerGroup = document.getElementById('iotPowerGroup');
        if (powerGroup) {
            powerGroup.style.display = type === 'sensor' ? 'none' : '';
        }
    }

    function init() {
        renderList();
        onTypeChange();
    }

    return {
        init,
        renderList,
        registerDevice,
        removeDevice,
        toggleDevice,
        getAllDevices,
        handleRegister,
        handleToggle,
        handleRemove,
        toggleRegisterForm,
        onTypeChange
    };
})();
