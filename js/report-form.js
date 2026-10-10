// Report Form — UI for submitting new trash reports
import { extractGPS } from './gps-extractor.js';
import { uploadPhoto, generatePhotoPath, validatePhoto } from './photo-service.js';
import { createReport, TRASH_TYPES, SEVERITY_LEVELS } from './report-service.js';
import { getCurrentUser } from './auth.js';
import { enablePinPlacement, disablePinPlacement } from './map-component.js';
import { showToast, showView } from './app.js';

let selectedFile = null;
let gpsCoords = null;

/**
 * Render the report form into the container.
 */
export function initReportForm() {
    const container = document.getElementById('report-form-container');
    container.innerHTML = `
        <div class="card" style="max-width:500px; margin:16px auto; padding:20px;">
            <h2 style="margin-bottom:16px;">📸 Report Trash</h2>
            <form id="report-form">
                <div class="form-group">
                    <label for="photo-input">Photo (required)</label>
                    <input type="file" id="photo-input" accept="image/jpeg,image/png" capture="environment" style="display:none;">
                    <button type="button" id="photo-btn" class="btn btn-primary btn-block">📷 Take or select photo</button>
                    <div id="photo-preview" style="margin-top:8px; display:none;">
                        <img id="preview-img" style="width:100%; max-height:200px; object-fit:cover; border-radius:6px;" alt="Preview">
                    </div>
                </div>

                <div class="form-group">
                    <label>📍 Location</label>
                    <div id="gps-status" style="font-size:0.85rem; color:var(--text-light);">No location yet — upload a photo with GPS or tap the map.</div>
                    <button type="button" id="manual-gps-btn" class="btn" style="background:var(--sand); margin-top:6px; font-size:0.85rem;">📍 Place manually on map</button>
                </div>

                <div class="form-group">
                    <label for="trash-type">Trash Type</label>
                    <select id="trash-type" required>
                        <option value="">Select type...</option>
                        ${TRASH_TYPES.map(t => `<option value="${t}">${formatLabel(t)}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="severity">Severity</label>
                    <select id="severity" required>
                        <option value="">Select severity...</option>
                        ${SEVERITY_LEVELS.map(s => `<option value="${s}">${formatSeverity(s)}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="description">Description (optional)</label>
                    <textarea id="description" placeholder="Any additional details..."></textarea>
                </div>

                <button type="submit" id="submit-report-btn" class="btn btn-success btn-block">✅ Submit Report</button>
            </form>
        </div>
    `;

    // Photo input
    document.getElementById('photo-btn').addEventListener('click', () => {
        document.getElementById('photo-input').click();
    });

    document.getElementById('photo-input').addEventListener('change', handlePhotoSelected);

    // Manual GPS
    document.getElementById('manual-gps-btn').addEventListener('click', () => {
        showView('map');
        showToast('Tap the map to set location', 'info', 3000);
        enablePinPlacement((coords) => {
            gpsCoords = coords;
            updateGPSDisplay();
            showView('report');
            showToast('Location set!', 'success', 2000);
        });
    });

    // Submit
    document.getElementById('report-form').addEventListener('submit', handleSubmit);
}

async function handlePhotoSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validatePhoto(file);
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('preview-img').src = ev.target.result;
        document.getElementById('photo-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Extract GPS
    const coords = await extractGPS(file);
    if (coords) {
        gpsCoords = coords;
        updateGPSDisplay();
    } else {
        document.getElementById('gps-status').textContent = '⚠️ No GPS in photo — use manual placement.';
    }
}

function updateGPSDisplay() {
    if (gpsCoords) {
        document.getElementById('gps-status').innerHTML =
            `✅ Location: <strong>${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}</strong>`;
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
        showToast('Please log in first.', 'error');
        showView('auth');
        return;
    }

    if (!selectedFile) {
        showToast('Please add a photo.', 'error');
        return;
    }

    if (!gpsCoords) {
        showToast('Please set a location (GPS or manual).', 'error');
        return;
    }

    const trashType = document.getElementById('trash-type').value;
    const severity = document.getElementById('severity').value;
    const description = document.getElementById('description').value;

    if (!trashType || !severity) {
        showToast('Please select trash type and severity.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-report-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Uploading...';

    try {
        // Generate unique ID for photo path
        const reportId = Date.now().toString(36) + Math.random().toString(36).slice(2);
        const ext = selectedFile.type === 'image/png' ? 'png' : 'jpg';
        const path = generatePhotoPath('before', reportId, ext);

        // Upload photo
        const photoUrl = await uploadPhoto(selectedFile, path);

        // Create report
        await createReport({
            photoUrl,
            lat: gpsCoords.lat,
            lng: gpsCoords.lng,
            trashType,
            severity,
            description,
            reporterId: user.uid,
            reporterName: user.displayName
        });

        showToast('Report submitted! 🎉', 'success');
        resetForm();
        showView('map');
    } catch (err) {
        showToast(err.message || 'Failed to submit report.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '✅ Submit Report';
    }
}

function resetForm() {
    selectedFile = null;
    gpsCoords = null;
    document.getElementById('report-form').reset();
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('gps-status').textContent = 'No location yet — upload a photo with GPS or tap the map.';
}

function formatLabel(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSeverity(s) {
    const labels = { small: '🟢 Small (fits in bag)', medium: '🟡 Medium (needs boat)', large: '🔴 Large (needs help)' };
    return labels[s] || s;
}
