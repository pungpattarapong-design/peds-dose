# Pediatric Calculators (TSH) — Firebase PWA

This is a Firebase Hosting–ready Progressive Web App converted from a Google Apps Script + HTML version. 
It loads `dataset.json` locally (no google.script.run) and works offline (service worker).

## Quick Start
```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # choose 'Use an existing project' or create a new one
# Place these files into your hosting directory (this folder).
firebase deploy
```

## Dataset and Peddose import
- `dataset.json` includes the local TSH records plus the public medication data retrieved from [Peddose](https://www.peddose.com/) on 2026-08-11.
- Peddose is authoritative when a matching legacy drug/formulation is found.
- `import-peddose.mjs` extracts the main and Emergency/ICU drug arrays from a downloaded Peddose JavaScript bundle, preserves the raw source fields, normalizes them for this app, and merges them into `dataset.json`.
- All medication and antimicrobial records are unified in `pediatricDose`; duplicate keys, equivalent formulations, and explicitly superseded legacy records are removed during import.
- Import syntax: `node import-peddose.mjs <bundle.js> <raw-output.json> <existing-dataset.json> <merged-output.json>`.
- The imported source URL, retrieval date, record counts, precedence rule, and SHA-256 bundle hash are recorded in `dataset.json` under `meta.peddose`.

## Files
- index.html — responsive bedside UI (Sarabun + blue/teal clinical theme)
- app.js — logic (age-based weight, unified medication calculator, maintenance fluids, Broselow panel, A2HS, refresh)
- manifest.webmanifest — PWA manifest
- sw.js — service worker for offline
- dataset.json — merged TSH + Peddose medication dataset
- import-peddose.mjs — reproducible Peddose extraction and merge tool
- icons/icon-192.png, icons/icon-512.png — placeholders
- firebase.json, .firebaserc — Firebase config

## Differences vs Apps Script
- Replaced `google.script.run.getDataset()` → `fetch('dataset.json')`
- Replaced `estimateWeightFromAge()` and `calcMaintenanceMlPerHr()` with client-side JS
- If more server helpers existed in Code.gs, port them similarly into `app.js`.
