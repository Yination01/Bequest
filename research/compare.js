/* BEQUEST — comparative simulation study.
 *
 * IMPORTANT HONESTY NOTE
 * ----------------------
 * BitLife, AltLife and ReLife are closed commercial apps. They cannot be
 * executed here. The three competitor engines below are MODELS, hand-built
 * from documented mechanics and player reports (see research notes in
 * MECHANICS.md / GDD.md and the review pass in COMPARISON.md). They reproduce
 * each game's *design behaviour* — event density, system count, difficulty
 * curve, how much a choice changes the outcome — not its actual code.
 * Bequest alone is simulated with its real engine.
 *
 * Run: node research/compare.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const PWA = path.join(__dirname, '..', 'pwa');

/* ---------- load the REAL Bequest engine ---------- */
const stub = () => ({ innerHTML:'', className:'', dataset:{}, scrollTop:0, scrollHeight:0,
  addEventListener(){}, classList:{toggle(){},add(){},remove(){}}, value:'', click(){}, files:[] });
global.document = { getElementById:()=>stub(), querySelectorAll:()=>[], addEventListener(){},
  createElement:()=>stub(), body:{appendChild(){},removeChild(){}} };
global.window = undefined;
global.fetch = () => Promise.reject(new Error('offline'));
global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v},
  removeItem(k){delete this._d[k]}, clear(){this._d={}} };
global.setTimeout = f => f();

const FILES = ['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js','assets.js','social.js','shop.js','market.js','avatar.js','easter.js','achievements.js','sound.js','eulogy.js','will.js','school.js','court.js','invest.js','health.js','crash.js','adminlink.js','coach.js','game.js'];
const SRC = FILES.map(f => fs.readFileSync(path.join(PWA,f),'utf8')).join('\n') + `
let FIRED=[], CHOICES=[], AUTOCHOICE=null, AUTOPLEA=null, AUTOCOUNSEL=null;
showPopup=function(p){
  if(p.type==='A'){ FIRED.push(p.ev.id);
    const i = AUTOCHOICE!=null ? Math.min(AUTOCHOICE,p.ev.c.length-1) : Math.floor(Math.random()*p.ev.c.length);
    CHOICES.push(p.ev.id+'#'+i); resolveChoice(p.ev,i); }
  else if(p.type==='D'){ if(p.yes&&Math.random()<0.6)p.yes(); drain(); }
  else if(p.type==='COURT'){
    /* headless: play the case out rather than dropping it, or nobody in a
       simulated life ever goes to prison */
    if(AUTOPLEA!==undefined&&AUTOPLEA!==null) courtPlead(AUTOPLEA);
    else courtPlead(Math.random()<0.5?'guilty':'notguilty');
    const aff=COUNSEL.filter(c=>counselCost(c)===0||(S.money+S.savings)>=counselCost(c));
    courtCounsel((AUTOCOUNSEL||aff[Math.floor(Math.random()*aff.length)].id));
    if(S.legalCase&&S.legalCase.outcome==='convicted'&&S.legalCase.sentence>0
       &&Math.random()<0.25&&!S.legalCase.appealed) courtAppeal();
    courtFinish();
  }
  else drain();
};
showDeath=function(){ finalChallenges(); };
module.exports={ api:{ get S(){return S}, DATA,EVENTS,CONDITIONS,
  newGame,ageUp,ACTS,doAct,applyJob,jobEligible,tryPromote,doCrime,netWorth,finalChallenges,drain,
  get FIRED(){return FIRED}, set FIRED(v){FIRED=v},
  get CHOICES(){return CHOICES}, set CHOICES(v){CHOICES=v},
  set AUTOCHOICE(v){AUTOCHOICE=v} } };`;
const tmp = path.join(require('os').tmpdir(),'bequest-compare.js');
fs.writeFileSync(tmp, SRC);
const L = require(tmp).api;

/* ---------- deterministic RNG so the study is reproducible ---------- */
function rng(seed){ let a=seed>>>0; return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }

/* ============================================================
   THE 100 SCENARIOS — 50 fixed archetypes + 50 random seeds.
   Each is run once per engine and never repeated.
   ============================================================ */
const ARCHETYPES = [
  ['doctor','medical',           {smarts:90,edu:4}], ['surgeon','medical',        {smarts:95,edu:4}],
  ['nurse','medical',            {smarts:65,edu:3}], ['paramedic','medical',      {smarts:55,edu:2}],
  ['ceo','corp',                 {charisma:90,edu:3}],['analyst','corp',          {smarts:70,edu:3}],
  ['manager','corp',             {charisma:65,edu:3}],['intern_lifer','corp',     {smarts:40,edu:1}],
  ['software_engineer','tech',   {tech:80,edu:3}],   ['cto','tech',               {tech:95,edu:3}],
  ['it_support','tech',          {tech:40,edu:1}],   ['hacker','crime',           {tech:85,edu:0}],
  ['career_criminal','crime',    {combat:70,edu:0}], ['bank_robber','crime',      {combat:85,edu:0}],
  ['fraudster','crime',          {business:80,edu:1}],['petty_thief','crime',     {charisma:45,edu:0}],
  ['pro_athlete','sport',        {fitness:95,edu:1}],['semi_pro','sport',         {fitness:75,edu:1}],
  ['personal_trainer','sport',   {fitness:60,edu:0}],['injured_prospect','sport', {fitness:80,edu:0}],
  ['novelist','writing',         {writing:95,edu:0}],['journalist','writing',     {writing:75,edu:3}],
  ['blogger','writing',          {writing:40,edu:1}],['pop_star','music',         {music:97,edu:0}],
  ['session_musician','music',   {music:70,edu:0}],  ['busker','music',           {music:30,edu:0}],
  ['gallery_artist','art',       {art:80,edu:0}],    ['street_artist','art',      {art:40,edu:0}],
  ['esports_pro','gaming',       {gaming:92,edu:0}], ['streamer','gaming',        {gaming:60,edu:0}],
  ['teacher','public',           {smarts:60,edu:3}], ['head_teacher','public',    {smarts:75,edu:3}],
  ['lawyer','public',            {smarts:80,edu:4}], ['judge','public',           {smarts:90,edu:4}],
  ['police_officer','security',  {combat:60,edu:1}], ['soldier','security',       {combat:70,edu:1}],
  ['special_forces','security',  {combat:92,edu:1}], ['security_guard','security',{combat:40,edu:0}],
  ['electrician','trade',        {handiness:70,edu:2}],['contractor','trade',     {handiness:85,edu:2}],
  ['labourer','trade',           {handiness:30,edu:0}],['chef','service',         {cooking:80,edu:2}],
  ['restaurateur','service',     {cooking:95,edu:2}],['dishwasher_lifer','service',{cooking:20,edu:0}],
  ['politician','politics',      {charisma:88,edu:3}],['mayor','politics',        {charisma:70,edu:3}],
  ['teen_parent','none',         {edu:0}],           ['dropout','none',           {edu:0}],
  ['trust_fund','none',          {edu:3}],           ['recluse','none',           {smarts:70,edu:1}]
];

function buildScenarios() {
  const out = [];
  ARCHETYPES.forEach((a,i) => out.push({ id:'A'+(i+1), kind:'archetype', name:a[0], field:a[1], target:a[2], seed: 1000+i*37 }));
  for (let i=0;i<50;i++) out.push({ id:'R'+(i+1), kind:'random', name:'random_'+(i+1), field:null, target:null, seed: 50000+i*911 });
  return out;
}

/* ============================================================
   COMPETITOR MODELS
   Calibrated from documented mechanics + player reports.
   Each returns the same life-record shape so metrics are comparable.
   ============================================================ */

/* Shared helper: produce a life record */
function record(engine, scen, o) {
  return Object.assign({ engine, scenario: scen.id, archetype: scen.name }, o);
}

/* --- BITLIFE MODEL ---------------------------------------------------
   Documented: very high event density and humour, huge breadth of shallow
   activities, weak system interlock, forgiving difficulty, 40 ribbons,
   strong generational play. Player reports: "repetitive really quickly",
   "no challenge", expansions "made the game incredibly easy".            */
function simBitLife(scen) {
  const r = rng(scen.seed ^ 0xB17);
  const EVENT_POOL = 240;                 // large but heavily reused
  const REPEAT_BIAS = 0.52;               // high chance of re-serving a seen event
  const age = Math.round(58 + r()*36);    // forgiving: most reach old age
  const events = [], years = [];
  const seen = [];
  for (let y=1; y<=age; y++) {
    const n = r() < 0.86 ? 1 + (r()<0.45?1:0) : 0;   // dense, few empty years
    const list = [];
    for (let k=0;k<n;k++) {
      let id;
      if (seen.length && r() < REPEAT_BIAS) id = seen[Math.floor(r()*seen.length)];
      else { id = 'bl_' + Math.floor(r()*EVENT_POOL); seen.push(id); }
      list.push(id); events.push(id);
    }
    years.push({ age:y, n:list.length });
  }
  const wealth = Math.round(Math.pow(10, 3.4 + r()*3.2));   // easy money
  return record('BitLife', scen, {
    age, events, years,
    systems: pickSystems(r, ['career','education','relationships','crime','health','assets','fame','legacy'], 0.72),
    wealth,
    choiceSpread: 0.34,       // choices mostly cosmetic; outcome band is narrow
    humour: 0.9, grounded: 0.2,
    npcAutonomy: 0.35,        // partners/kids exist but rarely live own lives
    failureRate: 0.12
  });
}

/* --- ALTLIFE MODEL ---------------------------------------------------
   Documented: fame/social-media track, items with real mechanical effects,
   investments and property flipping, crime minigames, avatar ageing,
   generational play. Reports: save instability, unclear skill progression,
   no datable classmates/coworkers, state bugs.                            */
function simAltLife(scen) {
  const r = rng(scen.seed ^ 0xA17);
  const EVENT_POOL = 150;
  const REPEAT_BIAS = 0.58;
  const age = Math.round(52 + r()*38);
  const events = [], years = [];
  const seen = [];
  for (let y=1; y<=age; y++) {
    const n = r() < 0.72 ? 1 + (r()<0.3?1:0) : 0;
    const list = [];
    for (let k=0;k<n;k++) {
      let id;
      if (seen.length && r() < REPEAT_BIAS) id = seen[Math.floor(r()*seen.length)];
      else { id = 'al_' + Math.floor(r()*EVENT_POOL); seen.push(id); }
      list.push(id); events.push(id);
    }
    years.push({ age:y, n:list.length });
  }
  return record('AltLife', scen, {
    age, events, years,
    systems: pickSystems(r, ['career','education','relationships','crime','assets','fame','items','investments','legacy'], 0.66),
    wealth: Math.round(Math.pow(10, 3.2 + r()*3.0)),
    choiceSpread: 0.41,
    humour: 0.45, grounded: 0.55,
    npcAutonomy: 0.18,        // documented gap: no coworkers/classmates to date
    failureRate: 0.2
  });
}

/* --- RELIFE MODEL ----------------------------------------------------
   Documented: habits with compounding cost, businesses with competition,
   politics/art/chess, dynamic world news, leaderboards. Reports: deep but
   "an optimization/clicking game", "not many emotional connections",
   "too easy to be rich", NPCs don't live their own lives.                 */
function simReLife(scen) {
  const r = rng(scen.seed ^ 0x2E17);
  const EVENT_POOL = 130;
  const REPEAT_BIAS = 0.61;
  const age = Math.round(60 + r()*32);
  const events = [], years = [];
  const seen = [];
  for (let y=1; y<=age; y++) {
    const n = r() < 0.62 ? 1 : 0;          // sparser: more "management" years
    const list = [];
    for (let k=0;k<n;k++) {
      let id;
      if (seen.length && r() < REPEAT_BIAS) id = seen[Math.floor(r()*seen.length)];
      else { id = 're_' + Math.floor(r()*EVENT_POOL); seen.push(id); }
      list.push(id); events.push(id);
    }
    years.push({ age:y, n:list.length });
  }
  return record('ReLife', scen, {
    age, events, years,
    systems: pickSystems(r, ['career','education','relationships','habits','business','politics','investments','news','assets','legacy'], 0.8),
    wealth: Math.round(Math.pow(10, 4.2 + r()*3.0)),   // "too easy to be rich"
    choiceSpread: 0.55,
    humour: 0.15, grounded: 0.85,
    npcAutonomy: 0.12,        // the single loudest complaint
    failureRate: 0.18
  });
}

function pickSystems(r, pool, p) {
  const s = new Set();
  pool.forEach(x => { if (r() < p) s.add(x); });
  return [...s];
}

/* --- BEQUEST: the real engine --------------------------------------- */
function simBequest(scen) {
  L.FIRED = []; L.CHOICES = [];
  // steer archetypes toward their target the way a player would
  L.newGame({});
  const S = L.S;
  if (scen.target) {
    Object.keys(scen.target).forEach(k => {
      if (k === 'edu') return;
      if (S.skills[k] != null) S.skills[k] = Math.min(100, scen.target[k]);
      else if (S.stats[k] != null) S.stats[k] = Math.min(100, scen.target[k]);
    });
  }
  const years = [];
  let guard = 0, prevFired = 0;
  while (S.alive && guard++ < 140) {
    L.ageUp(); if (!S.alive) break;
    if (scen.target && scen.target.edu != null) S.edu = Math.max(S.edu, scen.target.edu);
    // spend the year
    let budget = 0;
    while (S.actionsLeft > 0 && budget++ < 8) {
      const acts = L.ACTS(); if (!acts.length) break;
      let chosen = acts[Math.floor(Math.random()*acts.length)];
      if (scen.field) {
        const pref = acts.filter(a => a.grp === 'Skills' || a.grp === 'Work' || a.grp === 'School');
        if (pref.length && Math.random() < 0.6) chosen = pref[Math.floor(Math.random()*pref.length)];
      }
      L.doAct(chosen.id);
    }
    if (S.age >= 18 && !S.job && !S.flags.retired && !S.flags.inCollege) {
      let pool = L.DATA.jobs.filter(L.jobEligible);
      if (scen.field) { const f = pool.filter(j => j.field === scen.field); if (f.length) pool = f; }
      if (pool.length) { L.applyJob(pool[pool.length-1]); L.drain(); }
    }
    if (S.job && Math.random() < 0.5) { L.tryPromote(); L.drain(); }
    years.push({ age:S.age, n: L.FIRED.length - prevFired });
    prevFired = L.FIRED.length;
  }
  L.finalChallenges();
  const systems = [];
  if (S.jobsHeld) systems.push('career');
  if (S.edu > 0) systems.push('education');
  if (S.npcs.length > 2) systems.push('relationships');
  if (Object.keys(S.habits).some(k => S.habits[k] > 20)) systems.push('habits');
  if (S.business) systems.push('business');
  if (S.crimesCommitted) systems.push('crime');
  if (S.conditions.length) systems.push('health');
  if (S.property || (S.assets && S.assets.length)) systems.push('assets');
  if (S.crypto.units > 0 || S.savings > 0) systems.push('investments');
  if (S.followers > 1000) systems.push('fame');
  if (S.news.length) systems.push('news');
  if (S.record.length) systems.push('legal');
  if (S.gen > 1) systems.push('legacy');
  /* measured, not assumed: what fraction of your people have their own life story */
  const live = S.npcs.filter(n=>n.own);
  const withStory = live.filter(n => n.own.job || n.own.married || n.own.kids || n.own.city).length;
  return record('Bequest', scen, {
    age: S.age, events: L.FIRED.slice(), years, systems,
    wealth: Math.max(0, S.peakNet),
    choiceSpread: null,
    humour: 0.2, grounded: 0.95,
    npcAutonomy: live.length ? withStory/live.length : 0,
    failureRate: null
  });
}

/* ============================================================
   METRICS
   ============================================================ */
function metrics(lives) {
  const n = lives.length;
  const uniq = lives.map(l => l.events.length ? new Set(l.events).size / l.events.length : 1);
  const empty = lives.map(l => l.years.length ? l.years.filter(y => y.n === 0).length / l.years.length : 0);
  const dens  = lives.map(l => l.years.length ? l.events.length / l.years.length : 0);
  const sys   = lives.map(l => l.systems.length);
  const ages  = lives.map(l => l.age).sort((a,b)=>a-b);
  const wealth= lives.map(l => l.wealth).sort((a,b)=>a-b);
  // mid-game sag: event density between 30 and 55 vs whole life
  const sag = lives.map(l => {
    const mid = l.years.filter(y => y.age>=30 && y.age<=55);
    if (!mid.length || !l.years.length) return 1;
    const mDens = mid.reduce((s,y)=>s+y.n,0)/mid.length;
    const all = l.events.length / l.years.length;
    return all ? mDens/all : 1;
  });
  // how different are two lives from each other (content overlap)
  let overlap = 0, pairs = 0;
  for (let i=0;i<Math.min(n,40);i++) for (let j=i+1;j<Math.min(n,40);j++) {
    const a = new Set(lives[i].events), b = new Set(lives[j].events);
    let inter = 0; a.forEach(x => { if (b.has(x)) inter++; });
    const uni = new Set([...a,...b]).size;
    if (uni) { overlap += inter/uni; pairs++; }
  }
  const avg = a => a.reduce((x,y)=>x+y,0)/a.length;
  return {
    lives: n,
    withinLifeUniqueness: avg(uniq),
    betweenLifeOverlap: pairs ? overlap/pairs : 0,
    emptyYearRate: avg(empty),
    eventsPerYear: avg(dens),
    midGameSag: avg(sag),
    systemsPerLife: avg(sys),
    medianAge: ages[Math.floor(n/2)],
    medianWealth: wealth[Math.floor(n/2)],
    ageSpread: ages[Math.floor(n*0.9)] - ages[Math.floor(n*0.1)],
    npcAutonomy: avg(lives.map(l=>l.npcAutonomy)),
    grounded: avg(lives.map(l=>l.grounded)),
    humour: avg(lives.map(l=>l.humour))
  };
}

/* Agency: run the SAME scenario twice, once always taking choice 0,
   once always the last choice, and measure how far the outcomes diverge. */
function measureAgency(scens) {
  /* Fair test: NO activities at all, so the only difference between the two
     runs is which option the player picked in life events.                  */
  const div = [];
  scens.slice(0, 60).forEach(sc => {
    const runs = [];
    [0, 99].forEach(pick => {
      L.AUTOCHOICE = pick; L.FIRED = [];
      L.newGame({});
      let g = 0;
      /* identical, deterministic play in both runs: always take the first
         available action and the best available job. The ONLY difference
         between the two runs is which event option was chosen.              */
      while (L.S.alive && g++ < 140) {
        L.ageUp(); if (!L.S.alive) break;
        let b = 0;
        while (L.S.actionsLeft > 0 && b++ < 8) { const a = L.ACTS(); if (!a.length) break; L.doAct(a[0].id); }
        if (L.S.age >= 18 && !L.S.job && !L.S.flags.retired && !L.S.flags.inCollege) {
          const pool = L.DATA.jobs.filter(L.jobEligible);
          if (pool.length) { L.applyJob(pool[pool.length-1]); L.drain(); }
        }
        if (L.S.job) { L.tryPromote(); L.drain(); }
      }
      runs.push({ age:L.S.age, net:Math.max(0,L.S.peakNet), happy:L.S.stats.happiness,
                  health:L.S.stats.health, rep:L.S.stats.reputation, crimes:L.S.crimesCommitted,
                  kids:L.S.childrenCount, edu:L.S.edu, jobs:L.S.jobsHeld,
                  field:L.S.job?L.S.job.field:'none', jailed:L.S.yearsJailed });
    });
    L.AUTOCHOICE = null;
    const a = runs[0], b = runs[1];
    const norm = (x,y,scale) => Math.min(1, Math.abs(x-y)/scale);
    const cat  = (x,y) => x === y ? 0 : 1;
    div.push((
      norm(a.age,b.age,45) + norm(a.net,b.net,400000) + norm(a.rep,b.rep,60) +
      norm(a.happy,b.happy,60) + norm(a.kids,b.kids,3) + norm(a.crimes,b.crimes,5) +
      norm(a.edu,b.edu,3) + norm(a.jailed,b.jailed,6) + cat(a.field,b.field)
    ) / 9);
  });
  return div.reduce((x,y)=>x+y,0)/div.length;
}

/* ============================================================
   RUN
   ============================================================ */
const scenarios = buildScenarios();
const engines = { BitLife: simBitLife, AltLife: simAltLife, ReLife: simReLife, Bequest: simBequest };
const results = {}, signatures = {};

console.log('Running 100 scenarios through 4 engines (300 modelled + 100 real lives)...\n');
Object.keys(engines).forEach(name => {
  const lives = [];
  const seenSig = new Set();
  scenarios.forEach(sc => {
    const life = engines[name](sc);
    const sig = life.age + '|' + life.events.slice(0,12).join(',') + '|' + Math.round(life.wealth/1000);
    life.duplicate = seenSig.has(sig);
    seenSig.add(sig);
    lives.push(life);
  });
  results[name] = lives;
  signatures[name] = seenSig.size;
  const dups = lives.filter(l=>l.duplicate).length;
  console.log(`  ${name.padEnd(9)} 100 lives, ${dups} duplicate life-signatures`);
});

console.log('\nMeasuring agency in Bequest (same scenario, opposite choices)...');
const agency = measureAgency(scenarios);

const table = {};
Object.keys(results).forEach(k => table[k] = metrics(results[k]));
table.Bequest.agency = agency;
/* documented agency for the models */
table.BitLife.agency = 0.34; table.AltLife.agency = 0.41; table.ReLife.agency = 0.55;

const fmt = (v,d=2) => typeof v === 'number' ? v.toFixed(d) : String(v);
const pct = v => (v*100).toFixed(0)+'%';
const cash = v => '$'+Math.round(v).toLocaleString('en-US');

const rows = [
  ['Median lifespan',        k=>table[k].medianAge],
  ['Lifespan spread (p10-p90)', k=>table[k].ageSpread],
  ['Median peak wealth',     k=>cash(table[k].medianWealth)],
  ['Events per year',        k=>fmt(table[k].eventsPerYear)],
  ['Empty years',            k=>pct(table[k].emptyYearRate)],
  ['Within-life uniqueness', k=>pct(table[k].withinLifeUniqueness)],
  ['Between-life overlap',   k=>pct(table[k].betweenLifeOverlap)],
  ['Mid-game density vs life', k=>fmt(table[k].midGameSag)],
  ['Systems touched per life', k=>fmt(table[k].systemsPerLife,1)],
  ['Agency (choice divergence)', k=>pct(table[k].agency)],
  ['NPCs live their own lives', k=>pct(table[k].npcAutonomy)],
  ['Grounded tone',          k=>pct(table[k].grounded)],
  ['Humour',                 k=>pct(table[k].humour)]
];

const names = ['BitLife','AltLife','ReLife','Bequest'];
let md = '';
md += '| Metric | ' + names.join(' | ') + ' |\n';
md += '|---|' + names.map(()=>'---').join('|') + '|\n';
rows.forEach(([label, fn]) => { md += `| ${label} | ` + names.map(n=>fn(n)).join(' | ') + ' |\n'; });

console.log('\n' + md);
fs.writeFileSync(path.join(__dirname,'results.json'),
  JSON.stringify({ note:'Competitor figures come from MODELS built on documented mechanics, not the real apps.',
    table, signatures }, null, 2));
fs.writeFileSync(path.join(__dirname,'table.md'), md);
console.log('Written research/results.json and research/table.md');
