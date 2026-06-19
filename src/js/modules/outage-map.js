/**
 * Neighbourhood outage crowdsourcing — Leaflet + OpenStreetMap
 * Centers on the logged-in user's account location (from smartluku-profile).
 */
const OutageMap = (function () {
    let map = null;
    let clusterGroup = null;
    let userMarker = null;
    let userCenter = null;
    let reportMode = false;
    let apiAvailable = null;

    const REGION_COORDS = {
        dar: [-6.8000, 39.2833],
        arusha: [-3.3869, 36.6830],
        dodoma: [-6.1667, 35.7333],
        mbeya: [-8.7500, 33.4667],
        morogoro: [-6.8167, 37.6667],
        iringa: [-7.7667, 35.6833],
        songea: [-10.6667, 35.6333],
        mwanza: [-2.5167, 32.8833],
        tabora: [-5.0333, 32.7833],
        bukoba: [-1.3333, 31.8333]
    };

    const NEARBY_KM = 15;
    const OSM_CACHE_KEY = 'smartluku-osm-location';

    function getProfile() {
        try {
            return JSON.parse(localStorage.getItem('smartluku-profile') || 'null');
        } catch { return null; }
    }

    function cacheKey(profile) {
        if (!profile) return 'default';
        return [profile.region, profile.district, profile.street].join('|');
    }

    function readCachedLocation(profile) {
        try {
            const cached = JSON.parse(localStorage.getItem(OSM_CACHE_KEY) || 'null');
            if (cached && cached.key === cacheKey(profile)) return cached.location;
        } catch { /* ignore */ }
        return null;
    }

    function writeCachedLocation(profile, location) {
        localStorage.setItem(OSM_CACHE_KEY, JSON.stringify({
            key: cacheKey(profile),
            location,
            cachedAt: new Date().toISOString()
        }));
    }

    function defaultLocation() {
        return { lat: -6.7924, lng: 39.2083, label: 'Dar es Salaam', source: 'default', zoom: 11 };
    }

    function regionFallback(profile) {
        if (profile?.region && REGION_COORDS[profile.region]) {
            const [lat, lng] = REGION_COORDS[profile.region];
            const label = [profile.street, profile.districtName, profile.regionName].filter(Boolean).join(', ')
                || profile.regionName || profile.region;
            return { lat, lng, label, source: 'region', zoom: 12 };
        }
        return defaultLocation();
    }

    function buildGeocodeQueries(profile) {
        if (!profile) return [];
        const queries = [];
        if (profile.street && profile.districtName && profile.regionName) {
            queries.push(`${profile.street}, ${profile.districtName}, ${profile.regionName}, Tanzania`);
        }
        if (profile.districtName && profile.regionName) {
            queries.push(`${profile.districtName}, ${profile.regionName}, Tanzania`);
        }
        if (profile.regionName) {
            queries.push(`${profile.regionName}, Tanzania`);
        }
        return [...new Set(queries)];
    }

    async function nominatimSearch(query) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tz&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(SmartLUKUConfig.API_TIMEOUT_MS || 8000)
        });
        if (!res.ok) throw new Error('Nominatim unavailable');
        const data = await res.json();
        if (!data || !data.length) return null;
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            label: data[0].display_name || query,
            source: 'osm',
            zoom: 15
        };
    }

    async function resolveUserLocation() {
        const profile = getProfile();
        const cached = readCachedLocation(profile);
        if (cached) return cached;

        if (!profile) return defaultLocation();

        for (const query of buildGeocodeQueries(profile)) {
            try {
                const loc = await nominatimSearch(query);
                if (loc) {
                    loc.label = [profile.street, profile.districtName, profile.regionName]
                        .filter(Boolean).join(', ') || loc.label;
                    writeCachedLocation(profile, loc);
                    return loc;
                }
            } catch (err) {
                console.warn('[OutageMap] OSM geocode failed for', query, err.message);
            }
        }

        const fallback = regionFallback(profile);
        writeCachedLocation(profile, fallback);
        return fallback;
    }

    function haversineKm(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function isNearby(report) {
        if (!userCenter) return true;
        return haversineKm(userCenter.lat, userCenter.lng, report.lat, report.lng) <= NEARBY_KM;
    }

    function updateLocationLabel(loc) {
        const el = document.getElementById('outageUserLocation');
        if (!el || !loc) return;
        const sourceNote = loc.source === 'osm'
            ? 'matched via OpenStreetMap'
            : loc.source === 'region'
                ? 'centered on your region'
                : 'default area';
        el.className = 'outage-location-hint matched';
        el.innerHTML = `<i class="fas fa-home"></i> Your account: <strong>${loc.label}</strong> <span style="opacity:0.75">(${sourceNote})</span>`;
    }

    function placeUserMarker(loc) {
        if (!map || !loc) return;
        if (userMarker) map.removeLayer(userMarker);
        const icon = L.divIcon({
            html: '<div style="background:#1f5a3d;color:#fbbf24;width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px;"><i class="fas fa-home"></i></div>',
            className: 'user-home-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        userMarker = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 1000 }).addTo(map);
        const profile = getProfile();
        const name = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Your account';
        userMarker.bindPopup(`
            <div style="min-width:180px">
                <strong style="color:#1f5a3d"><i class="fas fa-home"></i> ${name || 'Your home'}</strong><br>
                <span style="font-size:0.85rem">${loc.label}</span><br>
                <small>${profile?.meter ? 'Meter: ' + profile.meter : ''}</small>
            </div>
        `);
    }

    async function applyUserLocation() {
        const profile = getProfile();
        userCenter = await resolveUserLocation();
        if (!map || !userCenter) return;
        map.setView([userCenter.lat, userCenter.lng], userCenter.zoom || 14);
        if (profile) {
            placeUserMarker(userCenter);
            updateLocationLabel(userCenter);
        } else {
            const el = document.getElementById('outageUserLocation');
            if (el) {
                el.className = 'outage-location-hint';
                el.innerHTML = '<i class="fas fa-info-circle"></i> Default map view — account address from registration is used to match your location on OpenStreetMap.';
            }
        }
    }

    function init(leafletMap) {
        map = leafletMap;
        if (typeof L.markerClusterGroup === 'undefined') {
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

        map.on('click', onMapClick);
        applyUserLocation().then(() => {
            seedDemoReports().then(() => loadReports());
        });
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
                if (res.ok) return await res.json();
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
            const nearby = isNearby(r);
            marker.bindPopup(`
                <div style="min-width:180px">
                    <strong style="color:#ef4444">⚡ Outage Report</strong><br>
                    <span style="font-size:0.85rem">${r.description || 'Power outage reported'}</span><br>
                    <small>${ago} · ${r.region || 'Unknown area'}${nearby ? ' · <strong>near you</strong>' : ''}</small>
                    ${r.reporterPhone ? `<br><small>Reporter: ${r.reporterPhone}</small>` : ''}
                </div>
            `);
            clusterGroup.addLayer(marker);
        });

        const nearbyCount = reports.filter(isNearby).length;
        updateReportCount(nearbyCount, reports.length);
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

    function updateReportCount(nearby, total) {
        const el = document.getElementById('outageReportCount');
        const totalEl = document.getElementById('outageTotalCount');
        if (el) el.textContent = nearby;
        if (totalEl) totalEl.textContent = total != null ? total : nearby;
    }

    function enableReportMode() {
        reportMode = true;
        if (map) {
            map.getContainer().style.cursor = 'crosshair';
            if (userCenter) map.setView([userCenter.lat, userCenter.lng], Math.max(map.getZoom(), 14));
        }
        showToast('Click on the map near your home to report an outage');
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
        disableReportMode();
        showReportModal(e.latlng);
    }

    async function showReportModal(latlng) {
        const profile = getProfile();
        const region = profile?.regionName || 'Tanzania';

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
            map.setView([latlng.lat, latlng.lng], Math.max(map.getZoom(), 14));
        }
        const mode = apiAvailable ? 'saved to server' : 'saved locally';
        showToast(`Outage reported (${mode})! Your neighbours can now see it on the map.`);
    }

    function demoReportsNearCenter() {
        const c = userCenter || defaultLocation();
        const profile = getProfile();
        const region = profile?.regionName || 'Dar es Salaam';
        const area = profile?.districtName || region;
        return [
            { lat: c.lat + 0.008, lng: c.lng + 0.006, description: `Power out since 2pm — ${area}`, region },
            { lat: c.lat - 0.006, lng: c.lng + 0.012, description: 'Intermittent outages reported nearby', region },
            { lat: c.lat + 0.004, lng: c.lng - 0.009, description: 'Full blackout in neighbourhood', region },
            { lat: c.lat - 0.011, lng: c.lng - 0.005, description: 'Transformer issue reported', region }
        ];
    }

    async function seedDemoReports() {
        const existing = await getReports();
        if (existing.length > 0) return;

        const demos = demoReportsNearCenter();
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
            if (apiAvailable) return;
        }

        const reports = demos.map((d, i) => ({
            id: 'demo_' + i,
            ...d,
            timestamp: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
            reporterPhone: '+2557********'
        }));
        saveReportsLocal(reports);
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
        getReports,
        applyUserLocation
    };
})();
