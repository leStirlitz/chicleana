// GPS Extractor — reads EXIF GPS data from uploaded images
// Uses exif-js loaded via CDN (global EXIF object)

/**
 * Extract GPS coordinates from an image file's EXIF data.
 * @param {File} imageFile - The image file to extract GPS from
 * @returns {Promise<{lat: number, lng: number} | null>} - Coordinates or null if not found
 */
export function extractGPS(imageFile) {
    return new Promise((resolve) => {
        if (!imageFile || !imageFile.type.startsWith('image/')) {
            resolve(null);
            return;
        }

        EXIF.getData(imageFile, function () {
            const lat = EXIF.getTag(this, 'GPSLatitude');
            const lng = EXIF.getTag(this, 'GPSLongitude');
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
            const lngRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'W';

            if (!lat || !lng) {
                resolve(null);
                return;
            }

            const latitude = convertDMSToDecimal(lat, latRef);
            const longitude = convertDMSToDecimal(lng, lngRef);

            if (isNaN(latitude) || isNaN(longitude)) {
                resolve(null);
                return;
            }

            resolve({ lat: latitude, lng: longitude });
        });
    });
}

/**
 * Convert DMS (degrees, minutes, seconds) to decimal degrees.
 * @param {number[]} dms - Array of [degrees, minutes, seconds]
 * @param {string} ref - Reference direction (N/S/E/W)
 * @returns {number} - Decimal degrees
 */
export function convertDMSToDecimal(dms, ref) {
    if (!dms || dms.length < 3) return NaN;

    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];

    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    if (ref === 'S' || ref === 'W') {
        decimal = -decimal;
    }

    return decimal;
}
