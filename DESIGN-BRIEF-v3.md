# DESIGN BRIEF v3 — Warm Human / Family-Friendly aesthetic restyle of er-ped-calc

## Goal
Restyle index.html from the current Grovix purple-saas look into a WARM, HUMAN,
FAMILY-FRIENDLY aesthetic — soft cream background, coral + teal accents, rounded
friendly shapes. KEEP the exact landing structure (sticky header, hero, trusted-by
strip, 4 feature cards, product/calculator section, footer) and KEEP the app 100%
functional. Do NOT touch app.js, dataset.json, sw.js, manifest.webmanifest, icons/.

## New design tokens (replace the Grovix purple palette)
- Page background: soft cream #FAF5EC (with very subtle warm peach/cream gradient washes)
- Cards: #FFFFFF with a faint warm tint (#FFFDF9), radius 20-24px, soft warm shadow
  (0 10px 28px rgba(120,90,60,.10)), 1px border rgba(120,90,60,.08)
- Primary: warm coral #F07167 (buttons, active tab, primary accents, focus rings)
- Primary-dark: #E05A50; primary-soft: #FDEBE8
- Accent: soft teal #2AA79B (secondary accents, success states, some icons/badges)
- Accent-soft: #E3F5F2
- Text: warm dark brown #3F3A35 (headings), muted #8A8177 (labels), never pure black
- Danger/warning: keep a warm red #D1495B for dose warnings (medical safety MUST stay clear)
- Buttons: pill-shaped (radius 999px) or very rounded (14-16px), coral primary with
  gentle hover lift; teal outline for secondary
- Fonts: keep Sarabun for Thai (REQUIRED); switch Latin/digits to a rounded friendly
  geometric font — Nunito (Google Fonts, weights 400-800) instead of Inter
- Icons/emoji stay; give icon containers rounded-square shape with coral-soft or
  teal-soft backgrounds
- Gradients: hero uses a soft cream → peach gradient (NOT the purple one) with
  floating white stat cards whose numbers are coral
- Rounded, friendly, approachable everywhere; generous spacing; soft shadows;
  150-200ms transitions. This should feel like a children's clinic app — warm,
  calm, trustworthy — while staying high-contrast and readable for bedside use.

## Keep the landing structure EXACTLY as it is now (from DESIGN-BRIEF-v2.md)
1. Sticky header: brand + nav links + CTA button
2. Hero: big Thai headline, subheadline, two CTA buttons, floating stat cards
3. Trusted-by strip (clinical references)
4. Features grid: 4 cards (Pediatric Dose / IV Fluids / PALS / NCPR) that switch tabs
5. Product/calculator section: patient-context row, 4 pill tabs, tabpanels
6. Footer

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
active, hidden, drawer, drawer-backdrop, fab, broselow, summary, note, muted, pill.
Keep onclick attributes (showTab("dose",this) etc. with SINGLE quotes), data-tab attributes,
role="tab"/aria-controls/aria-selected/tabindex on the 4 tab buttons, and the drawer + backdrop.
Feature cards must call the existing global showTab with a real tab button element
(e.g. document.getElementById('tab-pals')).

## Approach
Edit index.html ONLY (CSS variables + colors + fonts + shapes + any inline styles).
Replace the Grovix purple tokens with the warm tokens above. No structural changes —
same sections, same IDs, same handlers. No changes to app.js/dataset.json/sw.js/manifest/icons.

## Verification (run after edit)
1. python3 -m http.server; page renders with cream/coral/teal palette
2. Feature card click switches tab; hero CTA scrolls
3. Weight 20 + drug → dose computes; IBW toggle; Broselow drawer opens
4. Mobile 390px: layout holds
5. Contrast check: dose warnings (red) and headings remain clearly readable
