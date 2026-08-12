import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

function findArrayLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Cannot find Peddose dataset marker: ${marker}`);

  const start = source.lastIndexOf('[', markerIndex);
  if (start < 0) throw new Error('Cannot find the start of the Peddose dataset array');

  let depth = 0;
  let quote = '';
  let escaped = false;

  for (let i = start; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  throw new Error('Cannot find the end of the Peddose dataset array');
}

function extractPeddoseDrugs(bundlePath) {
  const source = fs.readFileSync(bundlePath, 'utf8');
  const mainLiteral = findArrayLiteral(source, '{value:"abd200",label:');
  const emergencyLiteral = findArrayLiteral(source, '{drugName:"Adrenaline",type:"range"');
  const main = vm.runInNewContext(`(${mainLiteral})`, Object.create(null), {
    timeout: 1_000,
    filename: 'peddose-main.literal.js'
  });
  const emergency = vm.runInNewContext(`(${emergencyLiteral})`, Object.create(null), {
    timeout: 1_000,
    filename: 'peddose-emergency.literal.js'
  });

  if (!Array.isArray(main) || main.length === 0 || !Array.isArray(emergency) || emergency.length === 0) {
    throw new Error('One or more extracted Peddose datasets are empty');
  }

  for (const [index, drug] of main.entries()) {
    if (!drug || typeof drug !== 'object' || !drug.value || !drug.label || !drug.type) {
      throw new Error(`Invalid Peddose main record at index ${index}`);
    }
  }

  for (const [index, drug] of emergency.entries()) {
    if (!drug || typeof drug !== 'object' || !drug.drugName || !drug.type) {
      throw new Error(`Invalid Peddose emergency record at index ${index}`);
    }
  }

  return { main, emergency };
}

function cleanLabel(value) {
  return String(value || '')
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return cleanLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'drug';
}

function canonicalDrugName(value) {
  const normalized = cleanLabel(value)
    .toLowerCase()
    .replace(/\bsyrup\b|\bsyr\b/g, 'syr')
    .replace(/\btablets?\b|\btab\b/g, 'tab')
    .replace(/\bcapsules?\b|\bcap\b/g, 'cap')
    .replace(/\binjection\b|\binj\b/g, 'inj')
    .replace(/millilit(?:er|re)s?/g, 'ml')
    .replace(/\s*\/\s*/g, '/')
    .replace(/(\d)\s+(mg|mcg|g|ml)\b/g, '$1$2')
    .replace(/[^a-z0-9./]+/g, ' ')
    .trim();

  return normalized.split(/\s+/).filter(Boolean).sort().join(' ');
}

function peddosePreparation(raw) {
  const strength = Number(raw.volume);
  if (!(strength > 0)) return '';
  if (raw.type === 'syr' || raw.type === 'syrrange') return `${strength} mg/mL`;
  if (raw.type === 'tab' || raw.type === 'tabrange') return `${strength} mg / tab`;
  if (raw.type === 'sac') return `${strength} mg / sachet`;
  return '';
}

function normalizeMainDrug(raw) {
  const isDomperidone = raw.value === 'dom1' || raw.value === 'dom10';
  const clinicalOverride = isDomperidone
    ? {
        mindose: 0.25,
        maxdose: 0.25,
        mkdose: 0.25,
        interval: 'up to TID',
        warning: 'Use only for nausea/vomiting where locally authorized; lowest effective dose for the shortest duration (generally ≤1 week). Avoid in QT prolongation, significant cardiac disease, electrolyte disturbance, or with QT-prolonging/potent CYP3A4-inhibiting medicines.'
      }
    : null;
  const calculation = clinicalOverride ? { ...raw, ...clinicalOverride } : raw;
  const minDose = calculation.mindose ?? calculation.mkdose ?? null;
  const maxDose = calculation.maxdose ?? calculation.mkdose ?? null;
  const sourceNote = String(raw.note || '').trim();
  const isAlbendazole = raw.value === 'abd200';
  const note = isAlbendazole
    ? 'Age ≥2 yr: Enterobiasis 400 mg PO once, repeat in 2 weeks; soil-transmitted helminths 400 mg PO once; Strongyloidiasis alternative 400 mg PO BID ×7 days (ivermectin preferred). For 200 mg/5 mL: 400 mg = 10 mL.'
    : sourceNote;

  return {
    key: `peddose-main-${raw.value}`,
    drug: cleanLabel(raw.label).split(/\s+(?=\d)/)[0],
    name: raw.value === 'lvd' ? 'Levodropropizine 30mg/5ml syrup' : cleanLabel(raw.label),
    preparation: peddosePreparation(raw),
    note: note === '-' ? '' : note,
    unit: 'mg/kg',
    unitType: 'perDose',
    doseMinMgPerKg: minDose,
    doseMaxMgPerKg: maxDose,
    dose: calculation.mkdose ?? null,
    freq: String(calculation.interval || '').trim(),
    route: raw.type.startsWith('inj') ? 'IV' : 'PO',
    minAgeYr: isAlbendazole ? 2 : null,
    maxAgeYr: null,
    minWeightKg: null,
    maxWeightKg: null,
    aliases: [raw.value],
    source: 'Peddose',
    calculationModel: 'peddose-main',
    clinicalOverride,
    peddose: { ...raw }
  };
}

function normalizeEmergencyDrug(raw, index) {
  const cleanName = cleanLabel(raw.drugName);
  let displayName = cleanName;
  if (cleanName === 'Fentanyl') displayName += raw.unit?.includes('/hr') ? ' infusion' : ' bolus';
  if (cleanName === 'Prostaglandin I2') displayName += raw.unit?.includes('nebulizer') ? ' nebulized' : ' infusion';
  return {
    key: `peddose-emergency-${slugify(cleanName)}-${index + 1}`,
    drug: cleanName,
    name: `🚑 ${displayName}`,
    preparation: '',
    note: String(raw.note || '').trim(),
    unit: String(raw.unit || '').trim(),
    unitType: 'perDose',
    doseMinMgPerKg: raw.dosemin ?? raw.dose ?? null,
    doseMaxMgPerKg: raw.dosemax ?? raw.dose ?? null,
    freq: '',
    route: '',
    minAgeYr: null,
    maxAgeYr: null,
    minWeightKg: null,
    maxWeightKg: null,
    aliases: ['Emergency', 'ICU'],
    source: 'Peddose Emergency & ICU',
    calculationModel: 'peddose-emergency',
    peddose: { ...raw }
  };
}

const PEDDOSE_ATB_IDS = new Set([
  'amkiv', 'amx125', 'amx250', 'amx250bid', 'amx250c', 'amx500c', 'amx500cbid',
  'amx250h', 'amx500h', 'amxc228', 'amxc457', 'amxc600', 'amxc625', 'amxciv',
  'apciv', 'azt200', 'cdmiv', 'cdn125', 'cfpiv', 'cftiv', 'cftivhigh', 'cfx100',
  'cfzivq6', 'cfzivq8', 'cpl125', 'cpl250', 'ctaiv', 'ctaivhigh', 'ctziv',
  'cxc125', 'dcx625', 'gtmiv', 'impiv', 'mrpiv', 'mtn400', 'mtniv', 'pptziv',
  'tms40', 'tmsfiv'
]);

function peddoseATBGeneric(id) {
  if (id === 'amkiv') return 'amikacin';
  if (id.startsWith('amxc')) return 'amox-clav';
  if (id.startsWith('amx')) return 'amoxicillin';
  if (id === 'apciv') return 'ampicillin';
  if (id === 'azt200') return 'azithromycin';
  if (id === 'cdmiv') return 'clindamycin';
  if (id === 'cdn125') return 'cefdinir';
  if (id === 'cfpiv') return 'cefepime';
  if (id.startsWith('cftiv')) return 'cefotaxime';
  if (id === 'cfx100') return 'cefixime';
  if (id.startsWith('cfziv')) return 'cefazolin';
  if (id.startsWith('cpl')) return 'cephalexin';
  if (id.startsWith('ctaiv')) return 'ceftriaxone';
  if (id === 'ctziv') return 'ceftazidime';
  if (id === 'cxc125') return 'cloxacillin';
  if (id === 'dcx625') return 'dicloxacillin';
  if (id === 'gtmiv') return 'gentamicin';
  if (id === 'impiv') return 'imipenem';
  if (id === 'mrpiv') return 'meropenem';
  if (id.startsWith('mtn')) return 'metronidazole';
  if (id === 'pptziv') return 'pip-tazo';
  if (id.startsWith('tms')) return 'co-trimoxazole';
  return null;
}

function legacyMatchesATBGeneric(drug, generic) {
  const name = cleanLabel(`${drug.name || ''} ${drug.drug || ''}`).toLowerCase();
  if (generic === 'amox-clav') return /amox\s*[/+-]?\s*clav/.test(name);
  if (generic === 'pip-tazo') return /pip(?:eracillin)?\s*[/+-]?\s*tazo/.test(name);
  if (generic === 'co-trimoxazole') return /co[- ]?trimoxazole|trimethoprim|tmp\s*[/+-]?\s*smx/.test(name);
  return name.includes(generic);
}

function mergePreferredATB(primary, secondary) {
  const primaryGenerics = new Set(primary.map(drug => drug.atbGeneric).filter(Boolean));
  const keptSecondary = secondary.filter(drug => (
    ![...primaryGenerics].some(generic => legacyMatchesATBGeneric(drug, generic))
  ));
  return {
    records: [...primary, ...keptSecondary],
    removedDuplicates: secondary.length - keptSecondary.length
  };
}

function mergePreferred(primary, secondary) {
  const primaryNames = new Set(primary.map(drug => canonicalDrugName(drug.name || drug.drug)));
  const keptSecondary = secondary.filter(drug => !primaryNames.has(canonicalDrugName(drug.name || drug.drug)));
  return {
    records: [...primary, ...keptSecondary],
    removedDuplicates: secondary.length - keptSecondary.length
  };
}

function unifiedMedicationFingerprint(drug) {
  return [
    canonicalDrugName(drug.name || drug.drug),
    String(drug.route || '').toLowerCase().trim(),
    canonicalDrugName(drug.preparation || ''),
    String(drug.freq || drug.split || '').toLowerCase().replace(/\s+/g, ' ').trim(),
    String(drug.unit || '').toLowerCase().trim(),
    String(drug.calculationModel || ''),
    String(drug.peddose?.type || '')
  ].join('|');
}

function mergeUnifiedMedicationCollections(...collections) {
  const records = [];
  const keys = new Set();
  const fingerprints = new Set();
  let removedDuplicates = 0;

  for (const drug of collections.flat()) {
    const fingerprint = unifiedMedicationFingerprint(drug);
    const generic = cleanLabel(drug.drug || drug.name).toLowerCase();
    const isLegacyAlbendazole = generic === 'albendazole' && !String(drug.source || '').startsWith('Peddose');
    const hasCurrentAlbendazole = records.some(record => record.key === 'peddose-main-abd200');

    if (keys.has(drug.key) || fingerprints.has(fingerprint) || (isLegacyAlbendazole && hasCurrentAlbendazole)) {
      removedDuplicates += 1;
      continue;
    }

    records.push(drug);
    keys.add(drug.key);
    fingerprints.add(fingerprint);
  }

  return { records, removedDuplicates };
}

function mergeDataset(existing, extracted, bundlePath) {
  const peddoseMain = extracted.main.map(normalizeMainDrug);
  const peddoseEmergency = extracted.emergency
    .filter(raw => cleanLabel(raw.drugName) && !/^⸻+$/.test(cleanLabel(raw.drugName)))
    .map(normalizeEmergencyDrug);
  const peddoseATB = peddoseMain
    .filter(drug => PEDDOSE_ATB_IDS.has(drug.peddose.value))
    .map(drug => ({ ...drug, atbGeneric: peddoseATBGeneric(drug.peddose.value) }));

  const supersededLegacyKeys = new Set([
    'domperidone-syrup-5-mg-5-ml',
    'hydroxyzine-syrup-10-mg-5-ml',
    'levodropropizine-syrup-30-mg-5-ml',
    'racecadotril-hidrasec-sachet-30g',
    'fentanyl-iv',
    'hydrocortisone-iv-100mg-vial'
  ]);
  const legacyDose = (existing.pediatricDose || [])
    .filter(drug => !String(drug.source || '').startsWith('Peddose'))
    .filter(drug => !supersededLegacyKeys.has(drug.key))
    .map(drug => drug.key === 'midazolam-iv-in'
      ? {
          ...drug,
          key: 'midazolam-in',
          drug: 'Midazolam',
          name: 'Midazolam intranasal',
          preparation: 'varies',
          note: '0.2–0.3 mg/kg/dose IN PRN; monitor airway, breathing, circulation, and paradoxical agitation.',
          unit: 'mg/kg',
          doseMinMgPerKg: 0.2,
          doseMaxMgPerKg: 0.3,
          dose: null,
          freq: 'PRN',
          route: 'IN'
        }
      : drug);
  const legacyATB = (existing.pediatricATB || []).filter(drug => !String(drug.source || '').startsWith('Peddose'));
  const doseMerge = mergePreferred([...peddoseMain, ...peddoseEmergency], legacyDose);
  const atbMerge = mergePreferredATB(peddoseATB, legacyATB);
  const unifiedMerge = mergeUnifiedMedicationCollections(doseMerge.records, atbMerge.records);
  const bundleHash = crypto.createHash('sha256').update(fs.readFileSync(bundlePath)).digest('hex');
  const { pediatricATB: _removedPediatricATB, ...existingWithoutATB } = existing;

  return {
    dataset: {
      ...existingWithoutATB,
      meta: {
        ...(existing.meta || {}),
        version: 'TSH PED Unified Medications 2026-08-11',
        peddose: {
          page: 'https://www.peddose.com/',
          bundle: 'https://www.peddose.com/assets/index-4c93780c.js',
          retrievedAt: '2026-08-11',
          bundleSha256: bundleHash,
          precedence: 'Peddose records replace matching legacy records',
          mainRecords: peddoseMain.length,
          emergencyRecords: peddoseEmergency.length,
          antibioticRecords: peddoseATB.length
        },
        guidelineReview: {
          reviewedAt: '2026-08-11',
          albendazole: {
            sources: [
              'https://www.cdc.gov/pinworm/hcp/clinical-overview/index.html',
              'https://www.cdc.gov/immigrant-refugee-health/hcp/overseas-guidance/intestinal-parasite-guidelines.html'
            ],
            note: 'Indication-specific regimens retained in one unified record; legacy duplicate removed.'
          },
          domperidone: {
            sources: [
              'https://www.ema.europa.eu/en/news/cmdh-confirms-recommendations-restricting-use-domperidone-containing-medicines',
              'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852497/Dec-2019-PDF.pdf.pdf'
            ],
            note: 'Unified duplicate oral-suspension record uses 0.25 mg/kg/dose up to TID with current cardiac-risk and duration warnings; verify local authorization.'
          }
        }
      },
      pediatricDose: unifiedMerge.records
    },
    report: {
      peddoseMain: peddoseMain.length,
      peddoseEmergency: peddoseEmergency.length,
      peddoseATB: peddoseATB.length,
      legacyDose: legacyDose.length,
      legacyATB: legacyATB.length,
      removedDoseDuplicates: doseMerge.removedDuplicates,
      removedATBDuplicates: atbMerge.removedDuplicates,
      mergedDoseBeforeUnification: doseMerge.records.length,
      mergedATBBeforeUnification: atbMerge.records.length,
      removedUnifiedDuplicates: unifiedMerge.removedDuplicates,
      unifiedMedications: unifiedMerge.records.length,
      bundleSha256: bundleHash
    }
  };
}

const bundlePath = process.argv[2];
const outputPath = process.argv[3];
const datasetPath = process.argv[4];
const mergedOutputPath = process.argv[5];

if (!bundlePath) {
  console.error('Usage: node import-peddose.mjs <downloaded-bundle.js> [raw-output.json]');
  process.exitCode = 1;
} else {
  const data = extractPeddoseDrugs(bundlePath);
  const typeCounts = Object.fromEntries(
    [...new Set(data.main.map(drug => drug.type))]
      .sort()
      .map(type => [type, data.main.filter(drug => drug.type === type).length])
  );
  const emergencyTypeCounts = Object.fromEntries(
    [...new Set(data.emergency.map(drug => drug.type))]
      .sort()
      .map(type => [type, data.emergency.filter(drug => drug.type === type).length])
  );

  if (outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  let mergeReport = null;
  if (datasetPath && mergedOutputPath) {
    const existing = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    const merged = mergeDataset(existing, data, bundlePath);
    fs.writeFileSync(mergedOutputPath, `${JSON.stringify(merged.dataset, null, 2)}\n`, 'utf8');
    mergeReport = merged.report;
  }

  console.log(JSON.stringify({
    mainCount: data.main.length,
    mainTypeCounts: typeCounts,
    emergencyCount: data.emergency.length,
    emergencyTypeCounts,
    outputPath: outputPath || null,
    mergedOutputPath: mergedOutputPath || null,
    mergeReport
  }, null, 2));
}
