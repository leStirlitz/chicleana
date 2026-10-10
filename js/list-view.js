// List View — displays all trash reports in a scrollable list
import { getAllReports } from './report-service.js';
import { showToast } from './app.js';

/**
 * Render the list view with all reports.
 */
export async function renderListView() {
    const container = document.getElementById('report-list');
    container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-light);">Loading reports...</p>';

    try {
        const reports = await getAllReports();

        if (reports.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--text-light);">
                    <p style="font-size:1.5rem;">🌊</p>
                    <p>No reports yet. Be the first to report trash!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="padding:12px;">
                <h3 style="margin-bottom:12px;">All Reports (${reports.length})</h3>
                ${reports.map(r => renderListItem(r)).join('')}
            </div>
        `;

        // Attach click handlers
        container.querySelectorAll('[data-report-id]').forEach(el => {
            el.addEventListener('click', () => {
                window.showReportDetail(el.dataset.reportId);
            });
        });
    } catch (err) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:var(--alert);">Failed to load reports.</p>';
        showToast('Failed to load reports', 'error');
    }
}

function renderListItem(report) {
    const typeLabel = (report.trashType || 'unknown').replace(/_/g, ' ');
    const date = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Unknown date';
    const statusClass = `status-${report.status}`;

    return `
        <div class="card" data-report-id="${report.id}" style="cursor:pointer; display:flex; gap:12px; align-items:center;">
            <img src="${report.photoUrl}" alt="Trash"
                 style="width:60px; height:60px; object-fit:cover; border-radius:6px; flex-shrink:0;"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%23dfe6e9%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 font-size=%2220%22>📷</text></svg>'">
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600; text-transform:capitalize;">${typeLabel}</div>
                <div style="font-size:0.8rem; color:var(--text-light);">Severity: ${report.severity || '?'} · ${date}</div>
            </div>
            <span class="status-badge ${statusClass}">${report.status}</span>
        </div>
    `;
}
