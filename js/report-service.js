// Report Service — CRUD operations and validation for trash reports
import { db } from './firebase-config.js';
import {
    collection, doc, addDoc, getDoc, getDocs,
    updateDoc, query, orderBy, serverTimestamp, runTransaction
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Valid enums
export const TRASH_TYPES = ['beer_cans', 'cooler_box', 'boat_kayak', 'chair', 'plastic_bottles', 'fishing_gear', 'mixed_other'];
export const SEVERITY_LEVELS = ['small', 'medium', 'large'];
export const REPORT_STATUSES = ['open', 'claimed', 'cleaned'];

/**
 * Validate report data before creation.
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateReport(data) {
    const errors = [];

    if (!data.photoUrl) errors.push('Photo is required.');
    if (!data.lat || !data.lng) errors.push('GPS location is required.');
    if (!TRASH_TYPES.includes(data.trashType)) errors.push('Invalid trash type.');
    if (!SEVERITY_LEVELS.includes(data.severity)) errors.push('Invalid severity level.');

    return { valid: errors.length === 0, errors };
}

/**
 * Create a new trash report.
 */
export async function createReport({ photoUrl, lat, lng, trashType, severity, description, reporterId, reporterName }) {
    const validation = validateReport({ photoUrl, lat, lng, trashType, severity });
    if (!validation.valid) {
        throw new Error(validation.errors.join(' '));
    }

    const reportData = {
        reporterId,
        reporterName: reporterName || 'Anonymous',
        lat,
        lng,
        photoUrl,
        trashType,
        severity,
        description: description || '',
        status: 'open',
        claimedBy: null,
        claimerName: null,
        claimedAt: null,
        cleanedAt: null,
        afterPhotoUrl: null,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'reports'), reportData);
    return docRef.id;
}

/**
 * Get all reports, sorted by most recent first.
 */
export async function getAllReports() {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get a single report by ID.
 */
export async function getReportById(id) {
    const docSnap = await getDoc(doc(db, 'reports', id));
    if (!docSnap.exists()) throw new Error('Report not found.');
    return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Claim a report. Uses transaction to prevent race conditions.
 */
export async function claimReport(reportId, userId, userName) {
    const reportRef = doc(db, 'reports', reportId);

    await runTransaction(db, async (transaction) => {
        const reportDoc = await transaction.get(reportRef);
        if (!reportDoc.exists()) throw new Error('Report not found.');

        const data = reportDoc.data();
        if (data.status !== 'open') {
            throw new Error('This report has already been claimed or cleaned.');
        }

        transaction.update(reportRef, {
            status: 'claimed',
            claimedBy: userId,
            claimerName: userName || 'Anonymous',
            claimedAt: serverTimestamp()
        });
    });
}

/**
 * Complete a cleanup by uploading the after-photo.
 */
export async function completeCleanup(reportId, afterPhotoUrl) {
    const reportRef = doc(db, 'reports', reportId);
    const reportDoc = await getDoc(reportRef);

    if (!reportDoc.exists()) throw new Error('Report not found.');
    if (reportDoc.data().status !== 'claimed') {
        throw new Error('Report must be claimed before completing cleanup.');
    }

    await updateDoc(reportRef, {
        status: 'cleaned',
        afterPhotoUrl,
        cleanedAt: serverTimestamp()
    });
}
