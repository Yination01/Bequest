/* BEQUEST — difficulty.
   Every knob is a MULTIPLIER applied at one specific point in the engine.
   1.00 = the Normal baseline. Higher is not always harder — see `dir`.        */

const DIFF_KNOBS = [
  { k:'earn',      n:'Earnings',            d:'Salary, business profit and sponsorship income.',      dir:'up_easier', min:0.4, max:2.0 },
  { k:'cost',      n:'Living costs',        d:'Rent, bills, habit upkeep and everyday spending.',     dir:'up_harder', min:0.4, max:2.5 },
  { k:'start',     n:'Starting wealth',     d:'How much money your family has when you are born.',    dir:'up_easier', min:0.0, max:4.0 },
  { k:'decay',     n:'Stat decay',          d:'How fast Health, Happiness and Looks drain each year.',dir:'up_harder', min:0.4, max:2.5 },
  { k:'death',     n:'Death risk',          d:'Your chance of dying in any given year.',              dir:'up_harder', min:0.2, max:3.0 },
  { k:'luck',      n:'Luck',                d:'Bonus added to every risky roll you attempt.',         dir:'up_easier', min:-0.25, max:0.30, add:true },
  { k:'jobOdds',   n:'Hiring odds',         d:'Your chance of getting a job you apply for.',          dir:'up_easier', min:0.3, max:2.0 },
  { k:'promoOdds', n:'Promotion odds',      d:'Your chance of being promoted.',                       dir:'up_easier', min:0.3, max:2.0 },
  { k:'crimeOdds', n:'Crime success',       d:'Your chance of getting away with a crime.',            dir:'up_easier', min:0.3, max:2.0 },
  { k:'prison',    n:'Prison sentences',    d:'How long you serve when you are caught.',              dir:'up_harder', min:0.2, max:2.5 },
  { k:'habitGrip', n:'Habit grip',          d:'How fast addictions take hold and how hard they are to shake.', dir:'up_harder', min:0.3, max:2.5 },
  { k:'relDecay',  n:'Relationship decay',  d:'How quickly people drift away if you neglect them.',   dir:'up_harder', min:0.3, max:2.5 },
  { k:'autopay',   n:'Automatic bill payment',
    d:'On: bills settle themselves. Off: you pay them yourself each year or fall into arrears.',
    dir:'up_easier', min:0, max:1, toggle:true }
];

const DIFFICULTIES = [
  { id:'easy', n:'Easy', rank:0, lp:0.5, colour:'#42c98a',
    blurb:'A forgiving life. Money comes easily, your body holds up, and most gambles go your way. Best for reading the story.',
    m:{ earn:1.30, cost:0.75, start:2.00, decay:0.65, death:0.55, luck:0.12,
        jobOdds:1.30, promoOdds:1.30, crimeOdds:1.25, prison:0.55, habitGrip:0.65, relDecay:0.65, autopay:1 } },

  { id:'normal', n:'Normal', rank:1, lp:1.0, colour:'#f0a63c',
    blurb:'The intended experience. Roughly realistic odds: most people get by, some do very well, some never recover from one bad decade.',
    m:{ earn:1.00, cost:1.00, start:1.00, decay:1.00, death:1.00, luck:0.00,
        jobOdds:1.00, promoOdds:1.00, crimeOdds:1.00, prison:1.00, habitGrip:1.00, relDecay:1.00, autopay:1 } },

  { id:'hard', n:'Hard', rank:2, lp:1.5, colour:'#ef6a4d',
    blurb:'The world pushes back. Wages stretch less, bills bite, addictions take hold faster and people drift away if you neglect them.',
    m:{ earn:0.85, cost:1.25, start:0.50, decay:1.30, death:1.40, luck:-0.07,
        jobOdds:0.80, promoOdds:0.78, crimeOdds:0.85, prison:1.35, habitGrip:1.35, relDecay:1.30, autopay:0 } },

  { id:'brutal', n:'Brutal', rank:3, lp:2.0, colour:'#e0565b',
    blurb:'Most lives here end early, poor and alone. Nothing is given. Reaching old age with anything at all is a genuine achievement.',
    m:{ earn:0.70, cost:1.50, start:0.20, decay:1.65, death:1.95, luck:-0.15,
        jobOdds:0.62, promoOdds:0.60, crimeOdds:0.72, prison:1.70, habitGrip:1.65, relDecay:1.60, autopay:0 } },

  { id:'custom', n:'Custom', rank:-1, lp:1.0, colour:'#8fe3ff', premium:true,
    blurb:'Set all twelve values yourself. Legacy Points are scaled to how hard you actually made it, so easy settings earn less.',
    m:{ earn:1.00, cost:1.00, start:1.00, decay:1.00, death:1.00, luck:0.00,
        jobOdds:1.00, promoOdds:1.00, crimeOdds:1.00, prison:1.00, habitGrip:1.00, relDecay:1.00, autopay:1 } }
];

function diffDef(id){ return DIFFICULTIES.find(d=>d.id===id)||DIFFICULTIES[1]; }

/* Score a custom set against the presets so Custom cannot be used to farm Legacy Points.
   Each knob contributes how much harder than Normal it is; 0 = Normal.          */
function customScore(m){
  let s=0;
  DIFF_KNOBS.forEach(k=>{
    const v=m[k.k], base=k.add?0:1;
    if(k.toggle){ s += (v?0:0.25); return; }   // paying your own bills is harder
    let harder = k.dir==='up_harder' ? (v-base) : (base-v);
    if(k.add) harder = -v*4;
    s += harder;
  });
  return s/DIFF_KNOBS.length;             // ~0 Normal, ~0.3 Hard, ~0.55 Brutal
}
function customLP(m){
  const s=customScore(m);
  return Math.max(0.25, Math.min(2.2, 1 + s*1.8));
}
/* Effective rank of a custom set, for gating Hard-only achievements. */
function customRank(m){
  const s=customScore(m);
  return s>=0.45?3 : s>=0.22?2 : s>=-0.1?1 : 0;
}
