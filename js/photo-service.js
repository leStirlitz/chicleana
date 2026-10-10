// Photo Upload Service — uploads images to Firebase Storage
import { storage } from './firebase-config.js';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

/**
 * Upload a photo to Firebase Storage and return the download URL.
 * @param {File} file - Image file to upload
 * @param {string} path - Storage path (e.g., 'reports/before/abc123.jpg')
 * @returns {Promise<string>} - Download URL of the uploaded photo
 * @throws {Error} - If file is invalid or upload fails
 */
export async function uploadPhoto(file, path) {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Please upload a JPEG or PNG image.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Photo must be smaller than 10MB. Please reduce quality or resolution.');
    }

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
}

/**
 * Generate a unique storage path for a report photo.
 * @param {string} type - 'before' or 'after'
 * @param {string} reportId - The report ID
 * @param {string} extension - File extension (jpg, png)
 * @returns {string} - Storage path
 */
export function generatePhotoPath(type, reportId, extension = 'jpg') {
    return `reports/${type}/${reportId}.${extension}`;
}

/**
 * Validate that a file is an acceptable image.
 * @param {File} file - File to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePhoto(file) {
    if (!file) {
        return { valid: false, error: 'No file selected.' };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'Please upload a JPEG or PNG image.' };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'Photo must be smaller than 10MB.' };
    }
    return { valid: true };
}
