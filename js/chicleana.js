// Chicleana — Single-file app (no ES modules for proxy/CORS compatibility)
(function() {
    'use strict';

    // ============================================================
    // CONFIG
    // ============================================================
    const MAP_CENTER = [36.4098, -6.1461];
    const MAP_ZOOM = 14;
    const PIN_COLORS = { open: '#e63946', claimed: '#f59e0b', cleaned: '#22c55e' };
    const TRASH_TYPES = ['beer_cans', 'cooler_box', 'boat_kayak', 'chair', 'plastic_bottles', 'fishin