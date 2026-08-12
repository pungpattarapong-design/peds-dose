# DESIGN BRIEF — Grovix-style restyle of ER-TSH PED Calc (peds-dose repo root)

## Goal
Restyle `index.html` ONLY. The app is a bedside pediatric dose calculator (Thai-language UI, mobile-first).
Apply the visual language of the "Grovix — Sales management SaaS Website" Dribbble design
(https://dribbble.com/shots/27641705-Grovix-Sales-management-SaaS-Website) while keeping the
application 100% functional. Do NOT touch app.js, dataset.json, sw.js, manifest.webmanifest, or icons/.

## Grovix design language (from the shot)
- Page background: #F8F8FA (very light grey) with subtle radial/linear gradient washes (soft purple glow top-left)
- Primary: #664CF1 (vivid purple) — buttons, active states, focus rings, brand accents
- Accent: #FF8000 (orange) — sparse, for warnings/highlights/badges only
- Secondary text: soft grey (#6B7280-ish); headings: near-black (#111827-ish)
- Cards: pure white, large radius (16–20px), very soft shadow (0 8px 24px rgba(17,24,39,.08)), 1px border rgba(17,24,39,.06)
- Buttons: rounded-rectangle (10–12px radius), primary = purple gradient (#664CF1 → slightly darker), hover lift + shadow
- Inputs: white, 10–12px radius, 1px #E5E7EB border, focus ring 3px rgba(102,76,241,.18)
- Tabs/pills: segmented pill group, active tab = purple gradient white text; inactive = transparent grey text
- Typography: clean geometric sans (keep Sarabun as Thai font — it is REQUIRED for Thai glyphs; pair with Inter for Latin/digits if desired). Bold headings, generous letter-spacing on labels (uppercase small-caps labels like a SaaS product)
- Data/metrics: numbers prominent, tabular feel, small "label above value" metric cards like a sales dashboard
- Micro-interactions: transition 150–200ms ease, hover states on cards/buttons/tabs

## HARD CONTRACT — do not break these (app.js depends on them)
Element IDs that must keep EXACT names (and keep every element that has one of these IDs):
a2hsBtn, age, app, broselow, broselowContent, broselowPanel, broselowPanelTitle, broselowTrigger,
dose, doseConc, doseCountBadge, doseDrug, doseOut, doseSearch, doseW, drawerBackdrop, fAgeDays,
fAuditCopy, fAuditCopyStatus, fAuditOut, fAuditPanel, fAuditStamp, fBolusPerKg, fDegree, fEmesis,
fGroup, fLooseStools, fMeasuredLoss, fOut, fPreW, fW, fluid-D5-1/2NS, fluid-D5-NS, fluid-NS,
fluid-ORS, fluid-RL, fluids, ibwChip, ibwSource, ibwVal, nBG, nGA, nHR, nMinute, nOut, nW, ncpr,
pAge, pOut, pW, pals, tab-dose, tab-fluids, tab-ncpr, tab-pals, useIBW, weight

Classes the JS toggles (keep the same class names available): card, container, col-3, col-6, col-9,
col-12, grid, tab-btn, active, hidden, drawer, drawer-backdrop, fab, broselow, status (or whatever
the status output uses). Keep onclick attributes (e.g. showTab("dose",this)), data-tab attributes,
role="tab" / aria-controls / aria-selected / tabindex structure for the 4 tabs.

Keep the 4 tab structure (dose / fluids / pals / ncpr), the patient-context inputs at the top
(weight, age, IBW toggle, Broselow trigger), the output card, the FAB, the Add-to-Home button,
the Refresh button, the drawer + backdrop.

## Approach
Rewrite the <style> block completely with the Grovix design system (CSS custom properties).
Restructure the visual layout minimally where it improves the SaaS feel (e.g. patient context as a
metric-card row, medication selector as a prominent card, dose output as a hero metric card) —
but keep every ID/class/onclick contract above intact. Verify no JS breaks.

## Verification (run after edit)
1. python3 -m http.server in repo root, load page in browser — all 4 tabs work, no console errors
2. Type weight 20, pick a drug — dose calculation appears in output
3. Toggle Use IBW — IBW chip updates
4. Open Broselow panel — renders
5. Test on narrow (mobile) width — layout holds
