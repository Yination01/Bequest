/* BEQUEST — deep systems: health, money, career, relationships, legal, education.
   Pure data + helpers. The engine in game.js calls into these.                    */

/* ============ 1. HEALTH — real conditions with progression ============ */
/* sev 1 minor · 2 serious · 3 critical.  yr = yearly effect while untreated.
   prog = chance per year of worsening.  cure = chance treatment resolves it.      */
const CONDITIONS = [
  { id:'asthma',    n:'Asthma',              sev:1, chronic:true,  cost:900,   yr:{health:-1},            prog:0.03, cure:0.15, work:0, fatal:false },
  { id:'anxiety',   n:'Anxiety disorder',    sev:1, chronic:true,  cost:1600,  yr:{happiness:-4},         prog:0.06, cure:0.35, work:0.05, fatal:false },
  { id:'depression',n:'Depression',          sev:2, chronic:true,  cost:2400,  yr:{happiness:-8,health:-1},prog:0.08, cure:0.30, work:0.15, fatal:false },
  { id:'backinjury',n:'Chronic back injury', sev:1, chronic:true,  cost:2200,  yr:{health:-2,happiness:-2},prog:0.05, cure:0.25, work:0.10, fatal:false },
  { id:'diabetes',  n:'Type 2 diabetes',     sev:2, chronic:true,  cost:3400,  yr:{health:-3},            prog:0.07, cure:0.10, work:0.05, fatal:true },
  { id:'hyperten',  n:'High blood pressure', sev:1, chronic:true,  cost:1400,  yr:{health:-2},            prog:0.09, cure:0.30, work:0, fatal:false },
  { id:'heart',     n:'Heart disease',       sev:3, chronic:true,  cost:9000,  yr:{health:-6},            prog:0.10, cure:0.18, work:0.25, fatal:true },
  { id:'copd',      n:'Lung disease',        sev:3, chronic:true,  cost:7000,  yr:{health:-6,looks:-1},   prog:0.12, cure:0.12, work:0.25, fatal:true },
  { id:'liver',     n:'Liver damage',        sev:3, chronic:true,  cost:8000,  yr:{health:-6},            prog:0.10, cure:0.15, work:0.20, fatal:true },
  { id:'cancer',    n:'Cancer',              sev:3, chronic:false, cost:42000, yr:{health:-12,happiness:-8},prog:0.22,cure:0.45, work:0.45, fatal:true },
  { id:'addiction', n:'Substance addiction', sev:2, chronic:true,  cost:6000,  yr:{health:-4,reputation:-3},prog:0.10,cure:0.30, work:0.30, fatal:false },
  { id:'arthritis', n:'Arthritis',           sev:1, chronic:true,  cost:1800,  yr:{health:-2,happiness:-2},prog:0.06, cure:0.10, work:0.10, fatal:false },
  { id:'dementia',  n:'Dementia',            sev:3, chronic:true,  cost:12000, yr:{health:-5,smarts:-5},  prog:0.18, cure:0.02, work:0.80, fatal:true },
  { id:'stroke',    n:'Stroke aftereffects', sev:3, chronic:true,  cost:15000, yr:{health:-5,smarts:-2},  prog:0.10, cure:0.20, work:0.55, fatal:true },
  { id:'injury',    n:'Serious injury',      sev:2, chronic:false, cost:5500,  yr:{health:-4,happiness:-3},prog:0.05, cure:0.60, work:0.30, fatal:false }
];
const COND = id => CONDITIONS.find(c => c.id === id);

/* Which conditions a life can develop, and what raises the odds. */
function conditionRisk(S, c) {
  const a = S.age, h = S.habits, st = S.stats;
  let p = 0;
  switch (c.id) {
    case 'asthma':     p = a < 16 ? 0.004 : 0.001; break;
    case 'anxiety':    p = 0.004 + (st.happiness < 35 ? 0.012 : 0) + (h.doomscroll > 50 ? 0.008 : 0); break;
    case 'depression': p = 0.003 + (st.happiness < 25 ? 0.020 : 0) + (h.drinking > 55 ? 0.006 : 0); break;
    case 'backinjury': p = a > 30 ? 0.004 + (S.job && ['trade','service'].includes(S.job.field) ? 0.010 : 0) : 0.001; break;
    case 'diabetes':   p = a > 32 ? 0.002 + (h.junkfood > 55 ? 0.014 : 0) : 0; break;
    case 'hyperten':   p = a > 35 ? 0.006 + (h.junkfood > 45 ? 0.006 : 0) + (st.happiness < 35 ? 0.004 : 0) : 0; break;
    case 'heart':      p = a > 45 ? 0.004 + (h.smoking > 40 ? 0.010 : 0) + (h.junkfood > 55 ? 0.006 : 0) : 0; break;
    case 'copd':       p = a > 40 ? (h.smoking > 45 ? 0.014 : 0.0008) : 0; break;
    case 'liver':      p = a > 33 ? (h.drinking > 60 ? 0.014 : 0.0005) : 0; break;
    case 'cancer':     p = a > 40 ? 0.003 + (a - 40) * 0.0004 + (h.smoking > 50 ? 0.008 : 0) : 0.0004; break;
    case 'addiction':  p = (h.drugs > 45 ? 0.030 : 0) + (h.drinking > 70 ? 0.010 : 0); break;
    case 'arthritis':  p = a > 50 ? 0.008 + (a - 50) * 0.0006 : 0; break;
    case 'dementia':   p = a > 68 ? 0.004 + (a - 68) * 0.0022 : 0; break;
    case 'stroke':     p = a > 52 ? 0.002 + (a - 52) * 0.0005 + (h.smoking > 45 ? 0.004 : 0) : 0; break;
    default: p = 0;
  }
  if (S.traits && S.traits.includes('sickly')) p *= 1.8;
  if (S.skills && S.skills.fitness > 65) p *= 0.6;
  if (S.habits && S.habits.gym > 50) p *= 0.75;
  return p * 0.55;   // tuned against the bequest regression test
}

/* ============ 2. MONEY — credit score & lending ============ */
const CREDIT_BANDS = [
  { min:800, n:'Excellent', rate:0.04, mult:5.0 },
  { min:740, n:'Very good', rate:0.06, mult:4.0 },
  { min:670, n:'Good',      rate:0.09, mult:3.0 },
  { min:580, n:'Fair',      rate:0.15, mult:1.5 },
  { min:0,   n:'Poor',      rate:0.26, mult:0.5 }
];
const creditBand = sc => CREDIT_BANDS.find(b => sc >= b.min);

/* ============ 3. CAREER — performance ============ */
const PERF_BANDS = [
  { min:80, n:'Outstanding', promo:0.25,  raise:0.08, fire:0.00 },
  { min:60, n:'Strong',      promo:0.10,  raise:0.05, fire:0.00 },
  { min:40, n:'Meets expectations', promo:0.00, raise:0.02, fire:0.02 },
  { min:20, n:'Below expectations', promo:-0.20, raise:0.00, fire:0.12 },
  { min:0,  n:'Unacceptable', promo:-0.50, raise:0.00, fire:0.35 }
];
const perfBand = v => PERF_BANDS.find(b => v >= b.min);

/* ============ 4. RELATIONSHIPS — personalities ============ */
const PERSONALITIES = [
  { id:'warm',     n:'Warm',        talk:1.4, forgive:1.5, drift:0.6, fatal:false },
  { id:'distant',  n:'Distant',     talk:0.6, forgive:0.7, drift:1.5, fatal:false },
  { id:'loyal',    n:'Loyal',       talk:1.1, forgive:1.8, drift:0.4, fatal:false },
  { id:'volatile', n:'Volatile',    talk:1.2, forgive:0.5, drift:1.6, fatal:false },
  { id:'ambitious',n:'Ambitious',   talk:0.9, forgive:0.9, drift:1.2, fatal:false },
  { id:'steady',   n:'Steady',      talk:1.0, forgive:1.2, drift:0.7, fatal:false },
  { id:'needy',    n:'Needy',       talk:1.3, forgive:0.8, drift:1.8, fatal:false },
  { id:'private',  n:'Private',     talk:0.7, forgive:1.0, drift:0.9, fatal:false }
];
const personality = id => PERSONALITIES.find(p => p.id === id) || PERSONALITIES[5];

/* ============ 5. LEGAL — records, employment bars, parole ============ */
/* Fields that run criminal-record checks, and how far back they care. */
const RECORD_BARS = {
  public:   { years:99, label:'Public sector posts run full record checks' },
  medical:  { years:99, label:'Medical roles require a clean record' },
  security: { years:99, label:'Security and forces bar anyone with convictions' },
  politics: { years:99, label:'You would never pass selection with a conviction' },
  corp:     { years:10, label:'Corporate employers check the last 10 years' },
  tech:     { years:7,  label:'Screening covers the last 7 years' }
};
/* Severity of the worst conviction determines how long it haunts you. */
function recordAge(S) {
  if (!S.record || !S.record.length) return null;
  const worst = S.record.reduce((a, b) => (b.sev > a.sev ? b : a));
  return { worst, since: S.age - worst.age };
}
function recordBlocks(S, field) {
  const bar = RECORD_BARS[field];
  if (!bar) return null;
  const r = recordAge(S);
  if (!r) return null;
  if (r.worst.spent) return null;                   // conviction is spent
  if (r.since >= bar.years) return null;
  return bar.label;
}

/* ============ 6. EDUCATION — grades ============ */
const GRADE_BANDS = [
  { min:85, n:'A', uni:0.95, label:'Top of the year' },
  { min:70, n:'B', uni:0.75, label:'Doing well' },
  { min:55, n:'C', uni:0.45, label:'Getting by' },
  { min:40, n:'D', uni:0.15, label:'Struggling' },
  { min:0,  n:'E', uni:0.03, label:'Failing' }
];
const gradeBand = v => GRADE_BANDS.find(b => v >= b.min);

const UNI_TIERS = [
  { id:'elite',    n:'an elite university',     need:88, cost:2.2, sal:1.35, rep:14, fatal:false },
  { id:'good',     n:'a well-regarded university', need:70, cost:1.4, sal:1.15, rep:7, fatal:false },
  { id:'standard', n:'a standard university',   need:52, cost:1.0, sal:1.00, rep:2, fatal:false },
  { id:'local',    n:'the local college',       need:0,  cost:0.6, sal:0.92, rep:0, fatal:false }
];
