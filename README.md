# 🛶 Chicleana — Limpia tu Bahía

Community waterway cleanup platform for kayakers, canoers, and fishermen in the **Bahía de Chiclana** marshlands (Cádiz, Spain).

**Live:** https://lestirlitz.github.io/chicleana/

## What it does

- 📸 **Spot trash** — Photograph and report abandoned waste from the water
- 🗺️ **Map it** — GPS-tagged pins show exact locations on an interactive map
- 🧹 **Clean it** — Claim a report, go clean it, upload proof
- 📊 **Track it** — Community statistics on materials collected and impact

## How it works

1. Register an account
2. Upload a photo of trash you find while kayaking
3. GPS is extracted automatically from the photo
4. Tag the materials (plastic, metal, glass, etc.)
5. Pin appears on the map for the community to see
6. Someone claims it and goes to clean it up

## Tech Stack

- **Frontend:** Single-page HTML + vanilla JavaScript
- **Map:** Leaflet.js with OpenStreetMap
- **Backend:** Firebase (Auth + Firestore + Storage)
- **Hosting:** GitHub Pages

## Screenshots

The map shows trash reports as colored pins:
- 🔴 Red = spotted (needs cleanup)
- 🟡 Yellow = claimed (someone's on it)
- 🟢 Green = cleaned

## Area

Bahía de Chiclana / Salinas marshlands — saltwater channels, seagrass, and small islands between Chiclana de la Frontera and San Fernando.

## Contributing

This project is in early development. If you're a kayaker in the Bahía de Chiclana area and want to test, register an account and start reporting!

## Contact

Built by Karoly Feher — kayaker, developer, and marshland cleanup enthusiast.
