// Map Component — Leaflet.js map, pin rendering, popups, manual placement

let map = null;
let markersLayer = null;
let placementMode = false;
let placementCallback = null;

// Bahía de Chiclana center
const DEFAULT_CENTER = [36.4098, -6.1461];
const DEFAULT_ZOOM = 14;

// Pin colors by status
const PIN_COLORS = {
    open: '#e63946',
    claimed: '#f59e0b',
    cleaned: '#22c55e'
};

/**
 * Initialize the Leaflet map.
 */
export function initMap(containerId) {
    if (map) return map;

    map = L.map(containerId, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true
    });

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19
    }).addTo(map);

    // Layer for report markers
    markersLayer = L.layerGroup().addTo(map);

    // Handle map click for manual pin placement
    map.on('click', (e) => {
        if (placementMode && placementCallback) {
            placementCallback({ lat: e.latlng.lat, lng: e.latlng.lng });
            disablePinPlacement();
        }
    });

    return map;
}

/**
 * Render pins for all reports on the map.
 */
export function renderPins(reports) {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    reports.forEach(report => {
        if (!report.lat || !report.lng) return;

        const color = PIN_COLORS[report.status] || PIN_COLORS.open;
        const marker = L.circleMarker([report.lat, report.lng], {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
        });

        marker.bindPopup(createPopupContent(report));
        marker.on('click', () => marker.openPopup());
        marker.reportId = report.id;
        markersLayer.addLayer(marker);
    });
}

/**
 * Create popup HTML content for a report.
 */
function createPopupContent(report) {
    const typeLabel = report.trashType ? report.trashType.replace(/_/g, ' ') : 'unknown';
    const statusClass = `status-${report.status}`;
    return `
        <div style="min-width:200px; text-align:center;">
            <img src="${report.photoUrl}" alt="Trash photo"
                 style="width:100%; max-height:120px; object-fit:cover; border-radius:6px; margin-bottom:8px;"
                 onerror="this.style.display='none'">
            <div style="text-transform:capitalize; font-weight:600;">${typeLabel}</div>
            <div style="font-size:0.8rem; color:#636e72;">Severity: ${report.severity || 'unknown'}</div>
            <span class="status-badge ${statusClass}" style="margin-top:6px; display:inline-block;">${report.status}</span>
            <div style="margin-top:8px;">
                <button onclick="window.showReportDetail('${report.id}')" class="btn btn-primary" style="padding:6px 12px; font-size:0.8rem;">View details</button>
            </div>
        </div>
    `;
}

/**
 * Enable manual pin placement mode.
 */
export function enablePinPlacement(callback) {
    placementMode = true;
    placementCallback = callback;
    if (map) {
        map.getContainer().style.cursor = 'crosshair';
    }
}

/**
 * Disable pin placement mode.
 */
export function disablePinPlacement() {
    placementMode = false;
    placementCallback = null;
    if (map) {
        map.getContainer().style.cursor = '';
    }
}

/**
 * Get the map instance.
 */
export function getMap() {
    return map;
}

/**
 * Invalidate map size (call after view becomes visible).
 */
export function refreshMap() {
    if (map) {
        setTimeout(() => map.invalidateSize(), 100);
    }
}
