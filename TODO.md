# Chicleana — Next Steps

## Current State
- ✅ Working demo: map with real GPS-pinned photos from Bahía de Chiclana
- ✅ Hover popups with photo preview, type, severity, description
- ✅ Navigation (map, list, report, profile views)
- ✅ Spec complete: requirements, design, data model, anti-spam, reporting tool
- ✅ Python test framework (pytest + hypothesis) working
- ✅ JS service modules written (auth, GPS extractor, photo service, report service)

## Next Session — Priority Order

### 1. Firebase Setup (required for everything else)
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable: Authentication (email/password), Firestore, Storage
- [ ] Copy project config into `js/firebase-config.js`
- [ ] Set Firestore security rules (authenticated read/write)
- [ ] Set Storage rules (authenticated upload, public read)
- [ ] Test: register a user, write a document, upload a photo

### 2. Wire Report Form (with new material categories)
- [ ] Update report form UI: multi-select material tags (plastic, metal, glass, styrofoam, organic, hazardous, fabric, mixed)
- [ ] Add photo compression pipeline (Canvas resize to 1200px, JPEG 0.75)
- [ ] Add EXIF date extraction (DateTimeOriginal → photoTakenAt)
- [ ] Add original filename preservation (photoOriginalName field)
- [ ] Implement file naming convention: `{user}_{location}_{timestamp}.jpg`
- [ ] Add optional user crop tool before upload
- [ ] Wire form submission to Firebase (upload photo → create report → refresh map)

### 3. Anti-Spam Rules
- [ ] GPS bounds check (reject if >50km from Bahía center)
- [ ] Rate limit (max 5 reports/user/hour)
- [ ] Photo minimum size check (>10KB, >200×200px)
- [ ] Duplicate detection (same originalFilename + photoTakenAt = warning)

### 4. Claim & Collect Flow
- [ ] Claim button on report detail → status change to "claimed"
- [ ] Collection form: after-photo + weight + item count + bags + material breakdown
- [ ] Processing form: disposal method, disposal location
- [ ] Status transitions: spotted → claimed → collected → processed

### 5. List View Enhancements
- [ ] Filter by status (show only open, or only claimed, etc.)
- [ ] Filter by material type
- [ ] Sort options (date, distance from me, severity)

### 6. Archive & Reporting (Phase 2)
- [ ] Auto-archive processed reports after 30 days
- [ ] Summary dashboard: total weight, items, volunteers, response time
- [ ] Material breakdown report with charts
- [ ] Volunteer leaderboard
- [ ] Mission (group event) creation and tracking
- [ ] Export: PDF, CSV, JSON

### 7. Polish
- [ ] PWA manifest + service worker (offline photo capture)
- [ ] Push notifications (your claimed report was cleaned!)
- [ ] Multi-language (ES/EN toggle)
- [ ] Social sharing (share cleanup before/after)

## Dev Server
```powershell
# Start local server (from workspace root):
python -m http.server 8080 --directory chicleana
# Then open http://localhost:8080
```

## Test
```powershell
# Run property tests:
cd chicleana
python -m pytest tests/ -v
```
