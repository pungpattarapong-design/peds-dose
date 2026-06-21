// Pure dose-calc functions. No DOM. Importable by browser (ES module) + node tests.

export function roundToHalf(x) {
  return Math.round(x * 2) / 2;
}

// regimen: { indication, mgPerKgPerDose, freqPerDay, maxPerDose?, maxPerKgPerDay?, maxPerDay? }
// concentration: { label, mgPer5ml }
export function computeDose({ weightKg, regimen, concentration }) {
  const { mgPerKgPerDose, freqPerDay, maxPerDose, maxPerKgPerDay, maxPerDay } = regimen;

  let perDose = weightKg * mgPerKgPerDose;
  let perDoseCapped = false;
  if (maxPerDose != null && perDose > maxPerDose) {
    perDose = maxPerDose;
    perDoseCapped = true;
  }

  const perDay = perDose * freqPerDay;

  // daily ceiling = min of whichever caps are provided
  const caps = [];
  if (maxPerDay != null) caps.push(maxPerDay);
  if (maxPerKgPerDay != null) caps.push(maxPerKgPerDay * weightKg);
  const dayCap = caps.length ? Math.min(...caps) : null;
  const perDayOverCap = dayCap != null && perDay > dayCap + 1e-9;

  let mgPerMl = null, mlRaw = null, mlRounded = null;
  if (concentration && concentration.mgPer5ml) {
    mgPerMl = concentration.mgPer5ml / 5;
    mlRaw = perDose / mgPerMl;
    mlRounded = roundToHalf(mlRaw);
  }

  return {
    perDose_mg: perDose,
    perDoseCapped,
    perDay_mg: perDay,
    dayCap_mg: dayCap,
    perDayOverCap,
    freqPerDay,
    mgPerMl,
    mL_raw: mlRaw,
    mL_rounded: mlRounded,
  };
}
