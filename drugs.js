// DRUG DATA
// Source: Peds in a Page (reference images provided by Dr. Pung, 2026-06)
// verified: false — review each row against physical copy before clinical use
// concentrations: confirm against your clinic's actual stock

export const drugs = [

  // ── Antipyretics / Analgesics ──────────────────────────────────────────
  {
    generic: "Paracetamol",
    verified: false,
    source: "Peds in a Page · 10-15 mkdose PRN q4-6h",
    ageWarnings: ["<3 months: consult", "Max freq q4h PRN"],
    regimens: [
      {
        indication: "Fever / pain",
        mgPerKgPerDose: 15,
        freqPerDay: 4,
        maxPerDose: 1000,
        maxPerKgPerDay: 75,
        maxPerDay: 4000,
      },
    ],
    concentrations: [
      { label: "120 mg/5 mL", mgPer5ml: 120 },
      { label: "250 mg/5 mL", mgPer5ml: 250 },
    ],
  },

  {
    generic: "Ibuprofen",
    verified: false,
    source: "Peds in a Page · 5-10 mkdose PRN q6-8h",
    ageWarnings: ["Avoid <3 months", "Avoid in asthma / renal disease / dehydration", "Give with food"],
    regimens: [
      {
        indication: "Fever / pain",
        mgPerKgPerDose: 10,
        freqPerDay: 3,        // q6-8h → 3×/day
        maxPerDose: 400,
        maxPerKgPerDay: 40,
        maxPerDay: 1200,
      },
    ],
    concentrations: [
      { label: "100 mg/5 mL", mgPer5ml: 100 },
      { label: "200 mg/5 mL", mgPer5ml: 200 },
    ],
  },

  // ── Antibiotics ────────────────────────────────────────────────────────
  {
    generic: "Amoxicillin",
    verified: false,
    source: "Peds in a Page · std 25-50 mkday TID · high 80-90 mkday BID",
    ageWarnings: ["Check penicillin allergy"],
    regimens: [
      {
        indication: "Standard (mild infection)",
        mgPerKgPerDose: 45 / 3,   // 45 mkday ÷ 3
        freqPerDay: 3,
        maxPerDose: 500,
        maxPerDay: 1500,
      },
      {
        indication: "High dose (AOM / severe)",
        mgPerKgPerDose: 90 / 2,   // 90 mkday ÷ 2
        freqPerDay: 2,
        maxPerDose: 1000,
        maxPerDay: 3000,
      },
    ],
    concentrations: [
      { label: "125 mg/5 mL", mgPer5ml: 125 },
      { label: "250 mg/5 mL", mgPer5ml: 250 },
    ],
  },

  {
    generic: "Azithromycin",
    verified: false,
    source: "Peds in a Page · 10 mkday OD × 5 days",
    ageWarnings: ["5-day course", "Check QT-prolonging drug interactions"],
    regimens: [
      {
        indication: "Standard (5-day course)",
        mgPerKgPerDose: 10,
        freqPerDay: 1,
        maxPerDose: 500,
        maxPerDay: 500,
      },
    ],
    concentrations: [
      { label: "200 mg/5 mL", mgPer5ml: 200 },
    ],
  },

  {
    generic: "Clarithromycin",
    verified: false,
    source: "Peds in a Page · 15 mkday BID",
    ageWarnings: ["Check CYP3A4 drug interactions"],
    regimens: [
      {
        indication: "Standard",
        mgPerKgPerDose: 15 / 2,   // 15 mkday ÷ 2
        freqPerDay: 2,
        maxPerDose: 500,
        maxPerDay: 1000,
      },
    ],
    concentrations: [
      { label: "125 mg/5 mL", mgPer5ml: 125 },
      { label: "250 mg/5 mL", mgPer5ml: 250 },
    ],
  },

  {
    generic: "Erythromycin",
    verified: false,
    source: "Peds in a Page · 20-50 mkday TID",
    ageWarnings: ["GI side effects common", "Check drug interactions"],
    regimens: [
      {
        indication: "Standard",
        mgPerKgPerDose: 40 / 3,   // 40 mkday ÷ 3
        freqPerDay: 3,
        maxPerDose: 500,
        maxPerDay: 2000,
      },
    ],
    concentrations: [
      { label: "125 mg/5 mL", mgPer5ml: 125 },
      { label: "200 mg/5 mL", mgPer5ml: 200 },
    ],
  },

  {
    generic: "Dicloxacillin",
    verified: false,
    source: "Peds in a Page · 25-50 mkday QID",
    ageWarnings: ["Empty stomach (30 min before food)", "Check penicillin allergy"],
    regimens: [
      {
        indication: "Skin / soft tissue (staph)",
        mgPerKgPerDose: 50 / 4,   // 50 mkday ÷ 4
        freqPerDay: 4,
        maxPerDose: 500,
        maxPerDay: 2000,
      },
    ],
    concentrations: [
      { label: "62.5 mg/5 mL", mgPer5ml: 62.5 },
      { label: "125 mg/5 mL", mgPer5ml: 125 },
    ],
  },

  // ── Antihistamines ────────────────────────────────────────────────────
  {
    generic: "Chlorpheniramine (CPM)",
    verified: false,
    source: "Peds in a Page · 0.35 mkday TID-QID",
    ageWarnings: ["Avoid <1 year (sedation / resp risk)", "Drowsiness — warn parents"],
    regimens: [
      {
        indication: "Allergy / rhinitis",
        mgPerKgPerDose: 0.35 / 3,   // 0.35 mkday ÷ 3
        freqPerDay: 3,
        maxPerDose: 4,
        maxPerKgPerDay: 0.35,
        maxPerDay: 12,
      },
    ],
    concentrations: [
      { label: "2 mg/5 mL", mgPer5ml: 2 },
    ],
  },

  {
    generic: "Cetirizine",
    verified: false,
    source: "Peds in a Page · age-based OD dosing",
    calcMode: "ageTable",
    ageWarnings: ["From 6 months · OD dosing"],
    ageDoseTiers: [
      { label: "6 mo – 2 yr", dose_mg: 2.5 },
      { label: "2 – 5 yr",    dose_mg: 5   },
      { label: "> 6 yr",      dose_mg: 10  },
    ],
    regimens: [],
    concentrations: [
      { label: "5 mg/5 mL", mgPer5ml: 5 },
    ],
  },

  // ── GI ───────────────────────────────────────────────────────────────
  {
    generic: "Domperidone",
    verified: false,
    source: "Peds in a Page · 0.1-0.2 mkdose TID",
    ageWarnings: ["Cardiac risk: do not exceed dose or use with QT drugs", "Not for chronic use"],
    regimens: [
      {
        indication: "Nausea / vomiting",
        mgPerKgPerDose: 0.2,
        freqPerDay: 3,
        maxPerDose: 10,
        maxPerDay: 30,
      },
    ],
    concentrations: [
      { label: "5 mg/5 mL", mgPer5ml: 5 },
    ],
  },

  // ── Respiratory ──────────────────────────────────────────────────────
  {
    generic: "Salbutamol (oral)",
    verified: false,
    source: "Peds in a Page · 0.1 mkdose q4-6h",
    ageWarnings: ["Inhaled route preferred for acute wheeze", "Monitor heart rate"],
    regimens: [
      {
        indication: "Wheeze / bronchospasm",
        mgPerKgPerDose: 0.1,
        freqPerDay: 4,     // q6h
        maxPerDose: 4,
        maxPerDay: 16,
      },
    ],
    concentrations: [
      { label: "2 mg/5 mL", mgPer5ml: 2 },
    ],
  },
];
