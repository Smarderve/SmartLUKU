/**
 * Interactive 2D circuit schematic — synced with 3D simulation
 */
const CircuitSchematic = (function () {
    const NODES = {
        grid:     { x: 40,  y: 50,  label: 'TANESCO Grid',   icon: '⚡', type: 'infra' },
        meter:    { x: 130, y: 50,  label: 'LUKU Meter',     icon: '◉', type: 'infra' },
        distBoard:{ x: 220, y: 50,  label: 'Distribution',   icon: '▦', type: 'infra' },
        junction: { x: 310, y: 50,  label: 'Junction Box',   icon: '⊞', type: 'infra' },
        hub:      { x: 220, y: 130, label: 'IoT Hub',        icon: '📡', type: 'infra' },
        ac:             { x: 55,  y: 200, label: 'AC',       icon: '❄', type: 'appliance' },
        lights:         { x: 140, y: 200, label: 'Lights',   icon: '💡', type: 'appliance' },
        fridge:         { x: 225, y: 200, label: 'Fridge',   icon: '🧊', type: 'appliance' },
        tv:             { x: 310, y: 200, label: 'TV',       icon: '📺', type: 'appliance' },
        water_heater:   { x: 395, y: 200, label: 'Heater',   icon: '🔥', type: 'appliance' }
    };

    const TRUNK = 'M 40 50 L 130 50 L 220 50 L 310 50';
    const HUB_TAP = 'M 130 50 L 130 90 L 220 90 L 220 130';
    const BRANCHES = {
        ac: 'M 310 50 L 310 120 L 55 120 L 55 200',
        lights: 'M 310 50 L 310 120 L 140 120 L 140 200',
        fridge: 'M 310 50 L 310 120 L 225 120 L 225 200',
        tv: 'M 310 50 L 310 120 L 310 120 L 310 200',
        water_heater: 'M 310 50 L 310 120 L 395 120 L 395 200'
    };

    let selectedId = null;
    let onNodeClick = null;

    function init(svgEl, clickCallback) {
        onNodeClick = clickCallback;
        svgEl.setAttribute('viewBox', '0 0 440 240');
        svgEl.innerHTML = buildSvg();
        svgEl.querySelectorAll('.circuit-node').forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = node.dataset.id;
                selectNode(id);
                if (onNodeClick) onNodeClick(id, NODES[id]?.type);
            });
        });
        svgEl.addEventListener('click', () => selectNode(null));
    }

    function buildSvg() {
        let html = `
            <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <path class="flow-path-bg" d="${TRUNK}" />
            <path class="flow-path-live" id="flowTrunk" d="${TRUNK}" />
            <path class="flow-path-bg" d="${HUB_TAP}" stroke-dasharray="5 5" />
            <path class="flow-path-branch" id="flowBranch-hub" d="${HUB_TAP}" />
        `;
        Object.entries(BRANCHES).forEach(([id, d]) => {
            html += `<path class="flow-path-bg" d="${d}" />
                     <path class="flow-path-branch" id="flowBranch-${id}" d="${d}" />
                     <circle class="flow-dot branch-dot" r="3" id="flowDot-${id}" opacity="0">
                         <animateMotion dur="1.5s" repeatCount="indefinite" path="${d}" />
                     </circle>`;
        });
        html += `<circle class="flow-dot" r="5" id="flowDot-trunk" opacity="0">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="${TRUNK}" />
                 </circle>`;
        Object.entries(NODES).forEach(([id, n]) => {
            html += `
            <g class="circuit-node" data-id="${id}" transform="translate(${n.x},${n.y})">
                <rect class="circuit-node-bg" x="-28" y="-22" width="56" height="44" rx="6" />
                <text class="circuit-node-icon" y="-2" text-anchor="middle">${n.icon}</text>
                <text class="circuit-node-label" y="16" text-anchor="middle">${n.label}</text>
                <text class="circuit-node-power" y="30" text-anchor="middle" id="circuitPower-${id}"></text>
            </g>`;
        });
        return html;
    }

    function selectNode(id) {
        selectedId = id;
        document.querySelectorAll('.circuit-node').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === id);
        });
    }

    function getSelectedId() { return selectedId; }

    function update(state) {
        const totalW = state.appliances.reduce((s, a) => s + a.power, 0);
        const gridLive = state.gridConnected && state.balanceKwh > 0;
        const anyLoad = totalW > 0 && gridLive;

        const trunk = document.getElementById('flowTrunk');
        if (trunk) trunk.classList.toggle('on', anyLoad);
        const trunkDot = document.getElementById('flowDot-trunk');
        if (trunkDot) trunkDot.setAttribute('opacity', anyLoad ? '1' : '0');

        const hubBranch = document.getElementById('flowBranch-hub');
        if (hubBranch) hubBranch.classList.toggle('on', gridLive);

        state.appliances.forEach(a => {
            const branch = document.getElementById('flowBranch-' + a.id);
            const dot = document.getElementById('flowDot-' + a.id);
            const live = a.active && gridLive;
            if (branch) branch.classList.toggle('on', live);
            if (dot) dot.setAttribute('opacity', live ? '1' : '0');
            const pwr = document.getElementById('circuitPower-' + a.id);
            if (pwr) pwr.textContent = live ? a.power + 'W' : '';
            const node = document.querySelector(`.circuit-node[data-id="${a.id}"]`);
            if (node) node.classList.toggle('live', live);
        });

        ['grid', 'meter', 'distBoard', 'junction', 'hub'].forEach(id => {
            const node = document.querySelector(`.circuit-node[data-id="${id}"]`);
            if (!node) return;
            const live = id === 'hub' ? gridLive : anyLoad;
            node.classList.toggle('live', live);
            const pwr = document.getElementById('circuitPower-' + id);
            if (!pwr) return;
            if (id === 'meter') pwr.textContent = state.balanceKwh.toFixed(1) + ' kWh';
            else if (id === 'grid') pwr.textContent = gridLive ? '230V' : 'Off';
            else if (id === 'junction' && anyLoad) pwr.textContent = (totalW / 1000).toFixed(2) + ' kW';
            else if (id === 'hub') pwr.textContent = gridLive ? 'Online' : '';
            else pwr.textContent = anyLoad ? 'Live' : '';
        });

        const stats = document.getElementById('circuitStats');
        if (stats) {
            stats.innerHTML = `
                <span><i class="fas fa-bolt"></i> ${anyLoad ? (totalW / 1000).toFixed(2) + ' kW total' : 'No load'}</span>
                <span><i class="fas fa-route"></i> ${state.appliances.filter(a => a.active).length} active circuits</span>
                <span id="circuitSelectedLabel">${selectedId ? 'Selected: ' + (NODES[selectedId]?.label || selectedId) : 'Click a node to link with 3D view'}</span>
            `;
        }
    }

    return { init, update, selectNode, getSelectedId, NODES };
})();
