import { computeDose, roundToHalf } from "./calc.js";
import { drugs } from "./drugs.js";

let pass = 0, fail = 0;
const approx = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
function check(name, cond) {
  if (cond) { pass++; console.log("PASS", name); }
  else       { fail++; console.log("FAIL", name); }
}

const drug = (g) => drugs.find((d) => d.generic === g);

// ─── roundToHalf ──────────────────────────────────────────────────────────
check("round 3.7142 -> 3.5", roundToHalf(3.7142) === 3.5);
check("round 3.8 -> 4.0",    roundToHalf(3.8)    === 4.0);
check("round 6.25 -> 6.5",   roundToHalf(6.25)   === 6.5);

// ─── Paracetamol (15 mk/dose, 120/5mL, 10 kg) ────────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Paracetamol").regimens[0], concentration: drug("Paracetamol").concentrations[0] });
  // 10*15=150mg; 150/(120/5)=150/24=6.25mL->6.5; day=600; cap=min(4000,750)=750 ok
  check("para 10kg perDose 150",           approx(r.perDose_mg, 150));
  check("para 10kg not capped",            !r.perDoseCapped);
  check("para 10kg mL_raw 6.25",           approx(r.mL_raw, 6.25));
  check("para 10kg mL_rounded 6.5",        r.mL_rounded === 6.5);
  check("para 10kg perDay 600",            approx(r.perDay_mg, 600));
  check("para 10kg dayCap 750",            approx(r.dayCap_mg, 750));
  check("para 10kg not over dayCap",       !r.perDayOverCap);
}
{
  // 80kg -> 80*15=1200 > 1000 -> capped; 250/5mL -> 1000/50=20mL
  const r = computeDose({ weightKg: 80, regimen: drug("Paracetamol").regimens[0], concentration: drug("Paracetamol").concentrations[1] });
  check("para 80kg capped 1000",           approx(r.perDose_mg, 1000) && r.perDoseCapped);
  check("para 80kg 250/5 -> 20mL raw",     approx(r.mL_raw, 20));
}

// ─── Ibuprofen (10 mk/dose, 100/5mL, 10 kg) ──────────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Ibuprofen").regimens[0], concentration: drug("Ibuprofen").concentrations[0] });
  // 10*10=100mg; 100/20=5.0mL; day=300; cap=min(1200,400)=400 ok
  check("ibu 10kg perDose 100",            approx(r.perDose_mg, 100));
  check("ibu 10kg mL_raw 5.0",            approx(r.mL_raw, 5.0));
  check("ibu 10kg mL_rounded 5.0",        r.mL_rounded === 5.0);
  check("ibu 10kg dayCap 400",            approx(r.dayCap_mg, 400));
  check("ibu 10kg not over",              !r.perDayOverCap);
}

// ─── Amoxicillin std (45/3=15 mk/dose, 125/5mL, 15 kg) ───────────────────
{
  const r = computeDose({ weightKg: 15, regimen: drug("Amoxicillin").regimens[0], concentration: drug("Amoxicillin").concentrations[0] });
  // 15*15=225mg; 225/25=9.0mL; day=675; cap=1500 ok
  check("amox-std 15kg perDose 225",       approx(r.perDose_mg, 225));
  check("amox-std 15kg mL_raw 9.0",       approx(r.mL_raw, 9.0));
  check("amox-std 15kg mL_rounded 9.0",   r.mL_rounded === 9.0);
  check("amox-std 15kg perDay 675",       approx(r.perDay_mg, 675));
}
{
  // per-dose cap: 40kg*15=600 > 500 -> capped
  const r = computeDose({ weightKg: 40, regimen: drug("Amoxicillin").regimens[0], concentration: drug("Amoxicillin").concentrations[0] });
  check("amox-std 40kg capped 500",        approx(r.perDose_mg, 500) && r.perDoseCapped);
}

// ─── Amoxicillin high (90/2=45 mk/dose, 250/5mL, 15 kg) ──────────────────
{
  const r = computeDose({ weightKg: 15, regimen: drug("Amoxicillin").regimens[1], concentration: drug("Amoxicillin").concentrations[1] });
  // 15*45=675mg; 675/50=13.5mL; day=1350; cap=3000 ok
  check("amox-high 15kg perDose 675",      approx(r.perDose_mg, 675));
  check("amox-high 15kg mL_raw 13.5",     approx(r.mL_raw, 13.5));
  check("amox-high 15kg mL_rounded 13.5", r.mL_rounded === 13.5);
  check("amox-high 15kg perDay 1350",     approx(r.perDay_mg, 1350));
}

// ─── Azithromycin (10 mk/dose, 200/5mL, 10 kg) ───────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Azithromycin").regimens[0], concentration: drug("Azithromycin").concentrations[0] });
  // 10*10=100mg; 100/40=2.5mL; day=100; cap=500 ok
  check("azithro 10kg perDose 100",        approx(r.perDose_mg, 100));
  check("azithro 10kg mL_raw 2.5",        approx(r.mL_raw, 2.5));
  check("azithro 10kg mL_rounded 2.5",    r.mL_rounded === 2.5);
}

// ─── Clarithromycin (15/2=7.5 mk/dose, 125/5mL, 10 kg) ──────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Clarithromycin").regimens[0], concentration: drug("Clarithromycin").concentrations[0] });
  // 10*7.5=75mg; 75/25=3.0mL; day=150; cap=1000 ok
  check("clari 10kg perDose 75",           approx(r.perDose_mg, 75));
  check("clari 10kg mL_raw 3.0",          approx(r.mL_raw, 3.0));
  check("clari 10kg mL_rounded 3.0",      r.mL_rounded === 3.0);
}

// ─── Erythromycin (40/3 mk/dose, 125/5mL, 10 kg) ────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Erythromycin").regimens[0], concentration: drug("Erythromycin").concentrations[0] });
  // 10*(40/3)=133.333mg; 133.333/25=5.333->5.5 rounded
  check("eryth 10kg perDose 133.33",       approx(r.perDose_mg, 400/3));
  check("eryth 10kg mL_raw 5.333",        approx(r.mL_raw, 400/3/25));
  check("eryth 10kg mL_rounded 5.5",      r.mL_rounded === 5.5);
}

// ─── Dicloxacillin (50/4=12.5 mk/dose, 62.5/5mL, 10 kg) ─────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Dicloxacillin").regimens[0], concentration: drug("Dicloxacillin").concentrations[0] });
  // 10*12.5=125mg; 125/12.5=10.0mL; day=500; cap=2000 ok
  check("diclox 10kg perDose 125",         approx(r.perDose_mg, 125));
  check("diclox 10kg mL_raw 10.0",        approx(r.mL_raw, 10.0));
  check("diclox 10kg mL_rounded 10.0",    r.mL_rounded === 10.0);
}

// ─── CPM (0.35/3 mk/dose, 2/5mL, 10 kg) ─────────────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Chlorpheniramine (CPM)").regimens[0], concentration: drug("Chlorpheniramine (CPM)").concentrations[0] });
  // 10*(0.35/3)=1.1666mg; 1.1666/0.4=2.9166->3.0; day=3.5; cap=min(12,3.5)=3.5 ok
  check("cpm 10kg perDose 1.1666",         approx(r.perDose_mg, 0.35/3*10));
  check("cpm 10kg mL_raw 2.916",          approx(r.mL_raw, (0.35/3*10)/0.4));
  check("cpm 10kg mL_rounded 3.0",        r.mL_rounded === 3.0);
  check("cpm 10kg dayCap 3.5",            approx(r.dayCap_mg, 3.5));
  check("cpm 10kg not over",              !r.perDayOverCap);
}

// ─── Domperidone (0.2 mk/dose, 5/5mL, 10 kg) ────────────────────────────
{
  const r = computeDose({ weightKg: 10, regimen: drug("Domperidone").regimens[0], concentration: drug("Domperidone").concentrations[0] });
  // 10*0.2=2.0mg; 2.0/1.0=2.0mL; day=6; cap=30 ok
  check("dompe 10kg perDose 2.0",          approx(r.perDose_mg, 2.0));
  check("dompe 10kg mL_raw 2.0",          approx(r.mL_raw, 2.0));
  check("dompe 10kg mL_rounded 2.0",      r.mL_rounded === 2.0);
}

// ─── Salbutamol (0.1 mk/dose, 2/5mL, 15 kg) ─────────────────────────────
{
  const r = computeDose({ weightKg: 15, regimen: drug("Salbutamol (oral)").regimens[0], concentration: drug("Salbutamol (oral)").concentrations[0] });
  // 15*0.1=1.5mg; 1.5/0.4=3.75->4.0 rounded; day=6; cap=16 ok
  check("salbu 15kg perDose 1.5",          approx(r.perDose_mg, 1.5));
  check("salbu 15kg mL_raw 3.75",         approx(r.mL_raw, 3.75));
  check("salbu 15kg mL_rounded 4.0",      r.mL_rounded === 4.0);
}

console.log(`\n${pass} pass, ${fail} fail`);
if (fail > 0) process.exit(1);
