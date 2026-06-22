# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A zero-dependency, single-page pediatric oral dose calculator used as a clinical reference aid in a Thai outpatient setting. No build step, no framework, no package manager. Three files do everything:

- `drugs.js` — drug data (ES module export)
- `calc.js` — pure dose-calculation logic (ES module, no DOM)
- `index.html` — UI that imports both via `<script type="module">`

## Running and testing

Open `index.html` directly in a browser — no server needed.

Run the test suite:
```
node tests.mjs
```

Tests use Node's native ES module support (`.mjs` extension). No test framework. A non-zero exit code means failures.

## Architecture

### Two calculation modes

Drugs use one of two `calcMode` values (implicit default is weight-based):

1. **Weight-based** (`calcMode` absent): `computeDose()` in `calc.js` takes `{ weightKg, regimen, concentration }` and returns per-dose mg, volume in mL (raw + rounded to nearest 0.5 mL), daily totals, and cap-exceeded flags. Supports per-dose cap (`maxPerDose`), per-kg/day cap (`maxPerKgPerDay`), and absolute daily cap (`maxPerDay`) — daily ceiling is the minimum of whichever caps are present.

2. **Age-table** (`calcMode: "ageTable"`): Drug defines `ageDoseTiers` (array of `{ label, dose_mg }`). The UI renders a static table; `computeDose()` is not called. Used for drugs where dose isn't weight-proportional (e.g. Cetirizine).

### Drug data schema (`drugs.js`)

Each drug object:
```js
{
  generic: string,
  verified: boolean,       // false = show UNVERIFIED badge
  source: string,          // citation shown in UI
  ageWarnings: string[],   // shown as warning flags regardless of weight
  regimens: [{             // weight-based only; empty array for ageTable drugs
    indication: string,
    mgPerKgPerDose: number,
    freqPerDay: number,
    maxPerDose?: number,
    maxPerKgPerDay?: number,
    maxPerDay?: number,
  }],
  concentrations: [{ label: string, mgPer5ml: number }],
  calcMode?: "ageTable",
  ageDoseTiers?: [{ label: string, dose_mg: number }],
}
```

When a drug has multiple `regimens`, the UI shows an Indication `<select>`. When it has multiple `concentrations`, it shows a Concentration `<select>`.

### UI state (index.html inline script)

Three mutable variables track UI state: `selectedDrug`, `regimenIdx`, `concIdx`. The `render()` function rebuilds `innerHTML` from scratch on every change — no virtual DOM, no reactive framework. Event listeners for `<select>` elements are re-attached each render cycle (they're created inside the rendered HTML).

## Safety conventions

- All drugs ship with `verified: false`. Only flip to `true` after cross-checking against the physical Thai pediatric reference ("Peds in a Page").
- `mgPer5ml` is the canonical concentration field — the code derives mg/mL as `mgPer5ml / 5` everywhere.
- `roundToHalf` (round to nearest 0.5 mL) is the only rounding used for volumes — never `Math.round`.
- Daily cap logic: when both `maxPerDay` and `maxPerKgPerDay` exist, the UI applies the lower of the two. Exceeding it shows an "OVER daily max" flag (`.flag.over`) rather than silently capping.

## Adding a new drug

1. Add an entry to the `drugs` array in `drugs.js` following the schema above. Set `verified: false`.
2. Add tests to `tests.mjs` covering: correct per-dose mg, mL_raw, mL_rounded, dayCap, and capping behaviour at an adult-sized weight.
3. Run `node tests.mjs` — all previous tests must still pass.
