/**
 * TANESCO grid lines on OpenStreetMap — trunk + branch channels with live status
 */
const GridMap = (function () {
    let map = null;
    let gridLayer = null;
    let nodeLayer = null;
    let onSelect = null;
    let selectedId = null;
    let userNetId = null;
    let lineRegistry = {};

    const STATUS_COLOR = { operational: '#10b981', maintenance: '#f59e0b', down: '#ef4444' };
    const STATUS_LABEL = { operational: 'Operational', maintenance: 'Maintenance', down: 'Outage' };

    function lineStyle(status, emphasis) {
        return {
            color: STATUS_COLOR[status] || '#10b981',
            weight: emphasis ? 5 : status === 'down' ? 4 : 3,
            opacity: status === 'down' ? 0.95 : 0.8,
            dashArray: status === 'down' ? '12 8' : status === 'maintenance' ? '8 6' : null
        };
    }

    function buildPopup(net) {
        const color = STATUS_COLOR[net.status];
        return `<div style="min-width:200px">
            <strong style="color:${color}"><i class="fas fa-bolt"></i> ${net.name}</strong><br>
            <span style="font-size:0.85rem">Status: <strong>${STATUS_LABEL[net.status]}</strong></span><br>
            <small>Uptime ${net.uptime}% · ${net.customers.toLocaleString()} customers · ${net.voltage}V</small><br>
            <small style="color:var(--text-light,#666)">Click for full downtime report</small>
        </div>`;
    }

    function getScope() {
        const el = document.getElementById('mapScopeSelect');
        return el ? el.value : 'region';
    }

    function getProfile() {
        try { return JSON.parse(localStorage.getItem('smartluku-profile') || 'null'); }
        catch { return null; }
    }

    function clearLayers() {
        if (gridLayer) gridLayer.clearLayers();
        if (nodeLayer) nodeLayer.clearLayers();
        lineRegistry = {};
    }

    function render(scope) {
        if (!map || typeof tanzaniaData === 'undefined') return;
        clearLayers();
        const profile = getProfile();
        const userNet = tanzaniaData.getUserNetwork(profile);
        userNetId = userNet.id;
        const networks = tanzaniaData.getNetworksForScope(scope || getScope(), profile);
        const bounds = [];

        networks.forEach(net => {
            const geo = tanzaniaData.getNetworkGeometry(net);
            const emphasis = net.id === selectedId || net.id === userNetId;
            const style = lineStyle(net.status, emphasis);

            const trunk = L.polyline(geo.trunk, style);
            trunk.on('click', () => { if (onSelect) onSelect(net.id); });
            trunk.bindPopup(buildPopup(net));
            gridLayer.addLayer(trunk);
            lineRegistry[net.id + ':trunk'] = trunk;
            geo.trunk.forEach(p => bounds.push(p));

            geo.branchLines.forEach((coords, i) => {
                const branch = L.polyline(coords, { ...style, weight: emphasis ? 4 : 2, opacity: 0.75 });
                branch.on('click', () => { if (onSelect) onSelect(net.id); });
                gridLayer.addLayer(branch);
                coords.forEach(p => bounds.push(p));
            });

            const isUser = net.id === userNetId;
            const node = L.circleMarker([geo.substation.lat, geo.substation.lng], {
                radius: isUser ? 11 : 8,
                fillColor: STATUS_COLOR[net.status],
                color: isUser ? '#fbbf24' : '#ffffff',
                weight: isUser ? 3 : 2,
                fillOpacity: 0.9
            });
            node.on('click', () => { if (onSelect) onSelect(net.id); });
            node.bindPopup(buildPopup(net));
            nodeLayer.addLayer(node);

            if (net.status === 'down') {
                const outageGlow = L.polyline(geo.trunk, {
                    color: '#ef4444', weight: 8, opacity: 0.25, dashArray: '4 6'
                });
                gridLayer.addLayer(outageGlow);
            }
        });

        if (bounds.length && scope !== 'all') {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: scope === 'mine' ? 15 : 13 });
        } else if (scope === 'all') {
            map.setView([-6.3690, 34.8888], 6);
        }
    }

    function highlight(id) {
        selectedId = id;
        render(getScope());
        const net = tanzaniaData.getNetworkReport(id);
        if (!net || !map) return;
        const geo = tanzaniaData.getNetworkGeometry(net);
        map.setView([geo.substation.lat, geo.substation.lng], Math.max(map.getZoom(), 13));
    }

    function init(leafletMap, selectCallback) {
        map = leafletMap;
        onSelect = selectCallback;
        gridLayer = L.featureGroup().addTo(map);
        nodeLayer = L.featureGroup().addTo(map);
    }

    function countByStatus(scope) {
        const profile = getProfile();
        const nets = tanzaniaData.getNetworksForScope(scope || getScope(), profile);
        return {
            total: nets.length,
            operational: nets.filter(n => n.status === 'operational').length,
            maintenance: nets.filter(n => n.status === 'maintenance').length,
            down: nets.filter(n => n.status === 'down').length
        };
    }

    return { init, render, highlight, countByStatus, getScope };
})();
