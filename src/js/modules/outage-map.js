/**
 * Neighbourhood outage crowdsourcing — extends Leaflet network map
 * Uses PostgreSQL API when available; falls back to localStorage in demo mode.
 */
const OutageMap = (function () {
    let map = null;
    let clusterGroup = null;
    let reportMode = false;
    let pendingPin = null;
    let apiAvailable = null;

    function init(leafletMap) {
        map = leafletMap;
        if (typeof L.markerClusterGroup === 'undefined') {
            console.warn('Leaflet.markercluster not loaded — using plain layer');
            clusterGroup = L.layerGroup().addTo(map);
        } else {
            clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                iconCreateFunction: function (cluster) {
                    const count = cluster.getChildCount();
                    return L.divIcon({
                        html: `<div style="background:#ef4444;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${count}</div>`,
                        className: 'outage-cluster',
                        iconSize: [36, 36]
                    });
                }
            });
            map.addLayer(clusterGroup);
        }

        loadReports();
        map.on('click', onMapClick);
    }

    function getReportsLocal() {
        try {
            return JSON.parse(localStorage.getItem(SmartLUKUConfig.OUTAGE_STORAGE_KEY) || '[]');
        } catch { return []; }
    }

    function saveReportsLocal(reports) {
        localStorage.setItem(SmartLUKUConfig.OUTAGE_STORAGE_KEY, JSON.stringify(reports));
        window.dispatchEvent(new Event('storage'));
    }

    async function checkApi() {
        if (apiAvailable !== null) return apiAvailable;
        try {
            const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/health`, {
                signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS)
            });
            const data = await res.json();
            apiAvailable = !!(data.ok && data.db);
            return apiAvailable;
        } catch {
            apiAvailable = false;
            return false;
        }
    }

    async function fetchReportsFromApi() {
        const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/outages`, {
            signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS)
        });
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        return data.reports || [];
    }

    async function getReports() {
        const useApi = await checkApi();
        if (useApi) {
            try {
                return await fetchReportsFromApi();
            } catch (err) {
                console.warn('[OutageMap] API fetch failed, using localStorage:', err.message);
                apiAvailable = false;
            }
        }
        return getReportsLocal();
    }

    async function saveReport(report) {
        const useApi = await checkApi();
        if (useApi) {
            try {
                const res = await fetch(`${SmartLUKUConfig.API_BASE}/api/outages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report),
                    signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS)
                });
                if (res.ok) {
                    const saved = await res.json();
                    return saved;
                }
                throw new Error('POST failed');
            } catch (err) {
                console.warn('[OutageMap] API save failed, using localStorage:', err.message);
                apiAvailable = false;
            }
        }

        const reports = getReportsLocal();
        reports.unshift(report);
        saveReportsLocal(reports.slice(0, 200));
        return report;
    }

    function renderReports(reports) {
        if (!clusterGroup) return;
        clusterGroup.clearLayers();

        reports.forEach(r => {
            const marker = L.circleMarker([r.lat, r.lng], {
                radius: 10,
                fillColor: '#ef4444',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85
            });
            const ago = timeAgo(r.timestamp);
            marker.bindPopup(`
                <div style="min-width:180px">
                    <strong style="color:#ef4444">⚡ Outage Report</strong><br>
                    <span style="font-size:0.85rem">${r.description || 'Power outage reported'}</span><br>
                    <small>${ago} · ${r.region || 'Unknown area'}</small>
                    ${r.reporterPhone ? `<br><small>Reporter: ${r.reporterPhone}</small>` : ''}
                </div>
            `);
            clusterGroup.addLayer(marker);
        });

        updateReportCount(reports.length);
    }

    async function loadReports() {
        const reports = await getReports();
        renderReports(reports);
    }

    function timeAgo(iso) {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    function updateReportCount(n) {
        const el = document.getElementById('outageReportCount');
        if (el) el.textContent = n;
    }

    function enableReportMode() {
        reportMode = true;
        if (map) map.getContainer().style.cursor = 'crosshair';
        showToast('Click on the map to report an outage in your area');
        const btn = document.getElementById('reportOutageBtn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-crosshairs"></i> Click map to place pin';
            btn.classList.add('active-report');
        }
    }

    function disableReportMode() {
        reportMode = false;
        if (map) map.getContainer().style.cursor = '';
        const btn = document.getElementById('reportOutageBtn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Report Outage';
            btn.classList.remove('active-report');
        }
    }

    function onMapClick(e) {
        if (!reportMode) return;
        pendingPin = e.latlng;
        disableReportMode();
        showReportModal(e.latlng);
    }

    async function showReportModal(latlng) {
        const profile = JSON.parse(localStorage.getItem('smartluku-profile') || 'null');
        const region = profile?.regionName || 'Dar es Salaam';

        const desc = prompt(
            `Report power outage at ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}\n\nDescribe the outage (optional):`,
            'No power in my area'
        );
        if (desc === null) return;

        const report = {
            id: 'outage_' + Date.now(),
            lat: latlng.lat,
            lng: latlng.lng,
            description: desc,
            region,
            meterNumber: profile?.meter || localStorage.getItem('smartluku-user'),
            reporterPhone: profile?.phone,
            timestamp: new Date().toISOString()
        };

        await saveReport(report);
        await loadReports();

        if (map) {
            map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 12));
        }
        const mode = apiAvailable ? 'saved to server' : 'saved locally';
        showToast(`Outage reported (${mode})! Your neighbours can now see it on the map.`);
    }

    async function seedDemoReports() {
        const existing = await getReports();
        if (existing.length > 0) return;

        const demos = [
            { lat: -6.7924, lng: 39.2083, description: 'Power out since 2pm — Kinondoni', region: 'Dar es Salaam' },
            { lat: -6.8160, lng: 39.2803, description: 'Intermittent outages — Ilala', region: 'Dar es Salaam' },
            { lat: -6.7730, lng: 39.2695, description: 'Full blackout — Temeke ward', region: 'Dar es Salaam' },
            { lat: -6.8500, lng: 39.2500, description: 'Transformer issue reported', region: 'Dar es Salaam' }
        ];

        const useApi = await checkApi();
        if (useApi) {
            for (let i = 0; i < demos.length; i++) {
                const d = demos[i];
                try {
                    await fetch(`${SmartLUKUConfig.API_BASE}/api/outages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: 'demo_' + i,
                            ...d,
                            timestamp: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
                            reporterPhone: '+2557********'
                        }),
                        signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS)
                    });
                } catch {
                    apiAvailable = false;
                    break;
                }
            }
            if (apiAvailable) {
                await loadReports();
                return;
            }
        }

        const reports = demos.map((d, i) => ({
            id: 'demo_' + i,
            ...d,
            timestamp: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
            reporterPhone: '+2557********'
        }));
        saveReportsLocal(reports);
        renderReports(reports);
    }

    function showToast(msg) {
        let toast = document.getElementById('outageToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'outageToast';
            toast.style.cssText = 'position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:var(--primary);color:white;padding:0.6rem 1.2rem;border-radius:0.5rem;z-index:3000;font-size:0.85rem;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    return {
        init,
        loadReports,
        enableReportMode,
        seedDemoReports,
        getReports
    };
})();
