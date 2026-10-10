// Chicleana — Main app controller
// Handles navigation between views and initializes components

import { initAuthUI } from './auth-ui.js';
import { initMap, renderPins, refreshMap } from './map-component.js';
import { initReportForm } from './report-form.js';
import { renderListView } from './list-view.js';
import { showReportDetail } from './report-detail.js';
import { getAllReports } from './report-service.js';
import { onAuthStateChanged } from './auth.js';

const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

// Navigation
function showView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));

    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    const btn = document.querySelector(`[data-view="${viewId}"]`);
    if (btn) btn.classList.add('active');

    // Refresh map when switching to map view
    if (viewId === 'map') {
        refreshMap();
        loadAndRenderPins();
    }

    // Refresh list when switching to list view
    if (viewId === 'list') {
        renderListView();
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const user = window._chicleanaUser;
        const restricted = ['report'];
        if (restricted.includes(btn.dataset.view) && !user) {
            showView('auth');
            showToast('Please log in to report trash.', 'info');
            return;
        }
        showView(btn.dataset.view);
    });
});

// Toast notifications
export function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// Load reports and render on map
async function loadAndRenderPins() {
    try {
        const reports = await getAllReports();
        renderPins(reports);
    } catch (err) {
        console.error('Failed to load reports for map:', err);
    }
}

// Export navigation for other modules
export { showView };

// Initialize
window._chicleanaUser = null;
onAuthStateChanged((user) => { window._chicleanaUser = user; });
initAuthUI();
initMap('map-container');
initReportForm();
showView('map');
loadAndRenderPins();
