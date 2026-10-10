// Report Detail — shows full report info with claim/cleanup actions
import { getReportById, claimReport, completeCleanup } from './report-service.js';
import { uploadPhoto, generatePhotoPath, validatePhoto } from './photo-service.js';
import { getCurrentUser } from './auth.js';
import { showToast, showView } from './app.js';

/**
 * Show report detail view for a specific report.
 */
export async function showReportDetail(reportId) {
    const container = document.getElementById('detail-container');
    container.innerHTML = '<p style="text-align:center; padding:20px;">Loading...</p>';
    showView('detail');

    try {
        const report = await getReportById(reportId);
        renderDetail(report, container);
    } catch (err) {
        container.innerHTML = '<p style="color:var(--alert); padding:20px;">Failed to load report.</p>';
        showToast(err.message, 'error');
    }
}

function renderDetail(report, container) {
    const typeLabel = (report.trashType || 'unknown').replace(/_/g, ' ');
    const date = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleString() : 'Unknown';
    const user = getCurrentUser();

    let actionHtml = '';
    if (report.status === 'open' && user) {
        actionHtml = `<button id="claim-btn" class="btn btn-primary btn-block">🧹 I'll clean this!</button>`;
    } else if (report.status === 'claimed' && user && report.claimedBy === user.uid) {
        actionHtml = `
            <div class="form-group">
                <label>Upload cleanup photo to complete:</label>
                <input type="file" id="after-photo-input" accept="image/jpeg,image/png" capture="environment" style="display:none;">
                <button type="button" id="after-photo-btn" class="btn btn-success btn-block">📷 Upload after-photo</button>
            </div>
        `;
    }

    let afterPhotoHtml = '';
    if (report.status === 'cleaned' && report.afterPhotoUrl) {
        afterPhotoHtml = `
            <div style="margin-top:16px;">
                <h4>After cleanup ✅</h4>
                <img src="${report.afterPhotoUrl}" alt="After cleanup"
                     style="width:100%; border-radius:6px; margin-top:8px;"
                     onerror="this.style.display='none'">
            </div>
        `;
    }

    container.innerHTML = `
        <div class="card" style="max-width:500px; margin:16px auto; padding:20px;">
            <button id="back-btn" class="btn" style="background:var(--border); margin-bottom:12px;">← Back</button>
            <img src="${report.photoUrl}" alt="Trash report"
                 style="width:100%; max-height:250px; object-fit:cover; border-radius:6px;"
                 onerror="this.style.display='none'">
            ${afterPhotoHtml}
            <div style="margin-top:16px;">
                <h3 style="text-transform:capitalize;">${typeLabel}</h3>
                <p style="color:var(--text-light); margin:4px 0;">Severity: ${report.severity} · Reported: ${date}</p>
                <p style="color:var(--text-light);">By: ${report.reporterName || 'Anonymous'}</p>
                ${report.description ? `<p style="margin-top:8px;">${report.description}</p>` : ''}
                <div style="margin-top:12px;">
                    <span class="status-badge status-${report.status}">${report.status}</span>
                    ${report.status === 'claimed' ? `<span style="font-size:0.8rem; color:var(--text-light);"> by ${report.claimerName || 'someone'}</span>` : ''}
                </div>
            </div>
            <div style="margin-top:20px;">
                ${actionHtml}
            </div>
        </div>
    `;

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => showView('map'));

    // Claim button
    const claimBtn = document.getElementById('claim-btn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => handleClaim(report.id));
    }

    // After-photo button
    const afterPhotoBtn = document.getElementById('after-photo-btn');
    if (afterPhotoBtn) {
        afterPhotoBtn.addEventListener('click', () => {
            document.getElementById('after-photo-input').click();
        });
        document.getElementById('after-photo-input').addEventListener('change', (e) => {
            handleAfterPhoto(e, report.id);
        });
    }
}

async function handleClaim(reportId) {
    const user = getCurrentUser();
    if (!user) {
        showToast('Please log in first.', 'error');
        return;
    }

    const btn = document.getElementById('claim-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Claiming...';

    try {
        await claimReport(reportId, user.uid, user.displayName);
        showToast('Claimed! Go clean it up! 💪', 'success');
        showReportDetail(reportId); // Refresh view
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = '🧹 I\'ll clean this!';
    }
}

async function handleAfterPhoto(e, reportId) {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validatePhoto(file);
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }

    const btn = document.getElementById('after-photo-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Uploading...';

    try {
        const ext = file.type === 'image/png' ? 'png' : 'jpg';
        const path = generatePhotoPath('after', reportId, ext);
        const afterPhotoUrl = await uploadPhoto(file, path);
        await completeCleanup(reportId, afterPhotoUrl);
        showToast('Cleanup complete! 🎉🌊', 'success');
        showReportDetail(reportId); // Refresh view
    } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = '📷 Upload after-photo';
    }
}

// Expose globally for map popups
window.showReportDetail = showReportDetail;
