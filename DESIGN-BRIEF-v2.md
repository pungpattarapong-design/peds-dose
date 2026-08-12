# DESIGN BRIEF v2 — Grovix LANDING-page restyle of er-ped-calc (peds-dose repo root)

## Goal
Restructure index.html into a full SaaS LANDING PAGE in the Grovix design language
(https://dribbble.com/shots/27641705-Grovix-Sales-management-SaaS-Website),
with the working calculator as the product section. Keep the app 100% functional.
Do NOT touch app.js, dataset.json, sw.js, manifest.webmanifest, or icons/.

## The Grovix landing structure (from the reference shot) — build ALL of these
1. TOP HEADER (sticky): brand logo left (👶🏻 + "er-ped-calc"), nav links center/right
   (Calculator, Features, PALS, NCPR), and a purple "Get Started"-style CTA button right
   that scrolls to the calculator section (#app).
2. HERO section: big bold headline (e.g. "คำนวณยาเด็กฉุกเฉิน ในไม่กี่วินาที"), one-line
   subheadline, two CTA buttons (primary purple "เปิดเครื่องคำนวณ" → scroll #app,
   secondary "ดูฟีเจอร์" → scroll #features). Background: soft purple/indigo gradient
   with floating abstract stat cards (like Grovix's hero) — floating rounded cards
   showing e.g. "197 ยา", "PALS 2025", "NCPR", "Offline-ready", slightly rotated,
   with soft shadows.
3. "TRUSTED BY" style strip: small row of pills/badges (e.g. AHA/AAP 2025 · Holliday–Segar ·
   Broselow · Thai bedside) to echo the logo-row feel.
4. FEATURES grid (#features): 4 feature cards — Pediatric Dose, IV Fluids, PALS, NCPR —
   each: emoji icon in a purple-soft rounded square, title, 1-2 line description, and
   clicking the card switches to that tab (showTab) and scrolls to the calculator.
5. CALCULATOR section: the existing app below the landing content — KEEP the patient-context
   row (ABW/AGE/Use IBW/IBW/BROSELOW), the 4 pill tabs, and all tabpanels. Present it as a
   big white rounded "product" card on the gradient page, like a dashboard preview.
6. FOOTER: simple centered footer (brand + one-line disclaimer + copyright).

## Design tokens (Grovix)
- bg: #F8F8FA with purple gradient washes; hero: radial/linear gradient #664CF1 → #5139D9
  with white text
- primary #664CF1, primary-dark #5139D9, accent orange #FF8000 (sparse, badges/numbers)
- cards: #FFFFFF, radius 16-20px, shadow 0 8px 24px rgba(17,24,39,.08)
- buttons: radius 10-12px; primary = purple gradient, hover lift
- fonts: Inter (Latin/digits) + Sarabun (Thai, REQUIRED), weights 400-800

## HARD CONTRACT — do not break (app.js depends on these)
Element IDs that must keep EXACT names and remain present:
a2hsBtn, age, app, broselow, broselowContent, broselowPanel, broselowPanelTitle,
broselowTrigger, dose, doseConc, doseCountBadge, doseDrug, doseOut, doseSearch, doseW,
drawerBackdrop, fAgeDays, fAuditCopy, fAuditCopyStatus, fAuditOut, fAuditPanel, fAuditStamp,
fBolusPerKg, fDegree, fEmesis, fGroup, fLooseStools, fMeasuredLoss, fOut, fPreW, fW,
fluid-D5-1/2NS, fluid-D5-NS, fluid-NS, fluid-ORS, fluid-RL, fluids, ibwChip, ibwSource,
ibwVal, nBG, nGA, nHR, nMinute, nOut, nW, ncpr, pAge, pOut, pW, pals, tab-dose, tab-fluids,
tab-ncpr, tab-pals, useIBW, weight

Classes the JS toggles/uses: card, container, col-3, col-6, col-9, col-12, grid, tab-btn,
active, hidden, drawer, drawer-backdrop, fab, broselow, summary, note, muted, pills.
Keep onclick attributes (showTab("dose",this) etc. with SINGLE quotes), data-tab attributes,
role="tab"/aria-controls/aria-selected/tabindex on the 4 tab buttons, and the drawer + backdrop.

The feature cards' click handlers must call the existing global showTab("dose"|"fluids"|"pals"|"ncpr", <button>) — pass a real tab button element (e.g. document.getElementById('tab-pals')).

## Approach
Rewrite index.html completely: new landing sections + calculator section, all contract IDs
intact. Keep the entire patient-context row and tab structure from the current version —
move them into the calculator section as-is. Style everything per the tokens above.
No changes to app.js/dataset.json/sw.js.

## Verification (run after edit)
1. python3 -m http.server in repo root; load page — landing renders: header, hero, features, calculator, footer
2. Click feature card "PALS" → PALS tab activates
3. Hero CTA scrolls to calculator
4. Type weight 20, pick drug → dose computes
5. Toggle Use IBW → IBW chip updates; Broselow drawer opens
6. Mobile 390px: layout holds, no overflow
