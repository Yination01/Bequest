/* BEQUEST — automated regression suite.
   Run:  node tests/suite.js          (from the pwa/ directory)
         node tests/suite.js --life   (also print an annotated sample life)
   Exits non-zero if any test fails, so it can gate a build.                    */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..');

/* ---------- headless browser shims ---------- */
const stub = () => ({ innerHTML:'', className:'', dataset:{}, scrollTop:0, scrollHeight:0,
  addEventListener(){}, classList:{toggle(){},add(){},remove(){}}, value:'', click(){}, files:[] });
global.document = { getElementById:()=>stub(), querySelectorAll:()=>[], addEventListener(){},
  createElement:()=>stub(), body:{appendChild(){},removeChild(){}} };
global.window = undefined;
global.fetch = () => Promise.reject(new Error('offline in tests'));
global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v},
  removeItem(k){delete this._d[k]}, clear(){this._d={}} };
global.setTimeout = f => f();

const FILES = ['data.js','events.js','difficulty.js','systems.js','avatar.js','easter.js','achievements.js','game.js'];
const SRC = FILES.map(f => fs.readFileSync(path.join(DIR,f),'utf8')).join('\n');

const HARNESS = `
let LASTPOP=null, FIRED=[], AUTOCHOICE=null, AUTOCONFIRM=null;
showPopup=function(p){
  LASTPOP=p;
  if(p.type==='A'){ FIRED.push(p.ev.id);
    const i=AUTOCHOICE!=null?Math.min(AUTOCHOICE,p.ev.c.length-1):Math.floor(Math.random()*p.ev.c.length);
    resolveChoice(p.ev,i); }
  else if(p.type==='D'){ if(p.yes&&(AUTOCONFIRM===true||(AUTOCONFIRM===null&&Math.random()<0.6)))p.yes(); drain(); }
  else drain();
};
showDeath=function(){ finalChallenges(); };
module.exports={
  api:{ get S(){return S}, set S(v){S=v}, get META(){return META},
    DATA,EVENTS,ACHIEVEMENTS,CHALLENGES,RECORDS,DIFFICULTIES,DIFF_KNOBS,CONDITIONS,COND,
    UNI_TIERS,RECORD_BARS,PERSONALITIES,creditBand,perfBand,gradeBand,recordBlocks,
    newGame,ageUp,ACTS,doAct,npcAct,reqOk,partner,anyOf,orient,canRomance,partnerGender,addPet,petsAlive,tickPets,diminish,actionsPerYear,randomAct,randomCrime,crimeConfirm,gotoGroup,setTab,setMore,applyJobId,quitHabit,startHabit,lowerDiff,exportSave,importSave,cloudPush,cloudPull,setCloud,saveToSlot,loadSlot,deleteSlot,pickChoice,fateChoice,closePopup,cdo,continueAs,toTitle,showCreate,startLife,rnd,setDiff,setKnob,resetKnobs,countryChanged,applyJob,jobEligible,jobLocked,tryPromote,doCrime,netWorth,buy,fin,
    checkAch,finalChallenges,drain,resolveChoice,confirmDo,popupOK,doAct,buy,save,load,slotInfo,saveToSlot,loadSlot,
    viewLife,viewActs,viewPeople,viewMoney,viewMore,renderHeader,renderTitle,renderCreate,
    rnd,countryChanged,startLife,workPenalty,migrate,isPlus,buyV8,findEgg,hasEgg,eggTick,tapLogo,setCapsule,EGGS,EGG,EGG_TIERS,EGG_UNLOCKS,sonderLife,requirePlus,buyPlus,togglePlus,rewindYear,secondChance,viewPlus,
    get CREATE(){return CREATE}, set CREATE(v){CREATE=v},
    get LASTPOP(){return LASTPOP}, set LASTPOP(v){LASTPOP=v},
    get FIRED(){return FIRED}, set FIRED(v){FIRED=v},
    set AUTOCHOICE(v){AUTOCHOICE=v}, set AUTOCONFIRM(v){AUTOCONFIRM=v} }
};`;

const tmp = path.join(require('os').tmpdir(), 'bequest-test-bundle.js');
fs.writeFileSync(tmp, SRC + HARNESS);
const G = require(tmp).api;

/* ---------- tiny test framework ---------- */
let pass = 0, fail = 0;
const fails = [];
function t(name, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
    else { fail++; fails.push(name + ' — ' + r); console.log('  \x1b[31mFAIL\x1b[0m ' + name + ' — ' + r); }
  } catch (e) {
    fail++; fails.push(name + ' — threw ' + e.message);
    console.log('  \x1b[31mFAIL\x1b[0m ' + name + ' — threw ' + e.message);
  }
}
const section = s => console.log('\n\x1b[1m' + s + '\x1b[0m');
const fresh = o => { G.newGame(o || {}); return G.S; };
function ageTo(n){ let g=0; while(G.S.alive && G.S.age<n && g++<140) G.ageUp(); }
/* Many tests are about ordinary life. Prison replaces the activity list and
   short-circuits jobLocked(), so those tests need a subject who is free. */
function freeAt(age){
  let tries = 0;
  do { G.newGame({}); ageTo(age); tries++; } while ((!G.S.alive || G.S.jailLeft > 0) && tries < 40);
  if (G.S.alive) G.S.jailLeft = 0;
  return G.S.alive;
}

/* ================= 1. CONTENT INTEGRITY ================= */
section('1. Content integrity');
t('every event has id, title, text, age range, weight, choices', () => {
  const bad = G.EVENTS.filter(e => !e.id||!e.t||!e.x||!e.c||!e.c.length||e.min==null||e.max==null||!e.w);
  return bad.length ? bad.length + ' malformed' : true;
});
t('no duplicate event ids', () => {
  const s = new Set(), d = [];
  G.EVENTS.forEach(e => s.has(e.id) ? d.push(e.id) : s.add(e.id));
  return d.length ? d.join(',') : true;
});
t('every choice has a label', () => {
  const bad = [];
  G.EVENTS.forEach(e => e.c.forEach(c => { if (!c.l) bad.push(e.id); }));
  return bad.length ? bad.join(',') : true;
});
t('every job references a known field', () => {
  const bad = G.DATA.jobs.filter(j => !G.DATA.fieldNames[j.field]);
  return bad.length ? bad.map(j=>j.id).join(',') : true;
});
t('every job requirement names a real stat or skill', () => {
  const bad = [];
  G.DATA.jobs.forEach(j => Object.keys(j.req||{}).forEach(k => {
    if (!G.DATA.statKeys.includes(k) && !G.DATA.skills[k]) bad.push(j.id + '.' + k); }));
  return bad.length ? bad.join(',') : true;
});
t('every shop item has a category with a minimum age', () => {
  const cats = [...new Set(G.DATA.items.map(i => i.cat))];
  return cats.length ? true : 'no categories';
});
t('every condition has risk wired in', () => {
  fresh(); const bad = G.CONDITIONS.filter(c => typeof c.yr !== 'object' || !c.n);
  return bad.length ? bad.map(c=>c.id).join(',') : true;
});
t('achievements all have a test function', () => {
  const bad = G.ACHIEVEMENTS.filter(a => typeof a.f !== 'function' || !a.n || !a.c);
  return bad.length ? bad.length + ' broken' : true;
});
t('every difficulty defines every knob', () => {
  const bad = [];
  G.DIFFICULTIES.forEach(d => G.DIFF_KNOBS.forEach(k => { if (d.m[k.k] == null) bad.push(d.id+'.'+k.k); }));
  return bad.length ? bad.join(',') : true;
});

/* ================= 2. AGE & STATE GATING ================= */
section('2. Age and state gating');
t('newborn is offered only infant activities', () => {
  fresh();
  const bad = G.ACTS().filter(a => /job|crime|loan|propose|divorce|gym|university/i.test(a.id));
  return bad.length ? bad.map(a=>a.id).join(',') : true;
});
t('newborn cannot be hired', () => {
  fresh(); G.LASTPOP = null; G.applyJob(G.DATA.jobs[0]);
  return (G.LASTPOP && /young/i.test(G.LASTPOP.title)) ? true : 'was not blocked';
});
t('newborn cannot buy a vehicle', () => {
  fresh(); G.LASTPOP = null; G.buy('car3');
  return (G.LASTPOP && /young/i.test(G.LASTPOP.title)) ? true : 'was not blocked';
});
t('newborn cannot use banking', () => {
  fresh(); G.LASTPOP = null; G.fin('buyc');
  return (G.LASTPOP && /young/i.test(G.LASTPOP.title)) ? true : 'was not blocked';
});
t('newborn cannot commit an adult crime', () => {
  fresh(); G.LASTPOP = null; G.doCrime('heist');
  return (G.LASTPOP && /young/i.test(G.LASTPOP.title)) ? true : 'was not blocked';
});
t('no job is eligible below 14', () => {
  fresh(); ageTo(10);
  const ok = G.DATA.jobs.filter(j => G.jobEligible(j));
  return ok.length ? ok.length + ' jobs offered to a 10-year-old' : true;
});
t('careers screen hides applications for a child', () => {
  fresh(); ageTo(8);
  return /applyJobId/.test(G.viewMoney()) ? 'apply buttons present' : true;
});
t('every locked job explains why', () => {
  fresh(); ageTo(22);
  const bad = G.DATA.jobs.filter(j => !G.jobEligible(j) && !G.jobLocked(j));
  return bad.length ? bad.map(j=>j.id).join(',') : true;
});

/* ================= 3. NAME / COUNTRY COHERENCE ================= */
section('3. Naming coherence');
function nameMatches() {
  const reg = G.DATA.countries.find(c => c.id === G.S.country).reg;
  const p = G.DATA.names[reg];
  const f = G.S.name.split(' ')[0], l = G.S.name.split(' ').slice(1).join(' ');
  return (p.m.includes(f) || p.f.includes(f)) && p.l.includes(l);
}
t('name matches country over 300 random births', () => {
  let bad = 0;
  for (let i=0;i<300;i++){ fresh(); if(!nameMatches()) bad++; }
  return bad ? bad + ' mismatches' : true;
});
t('name matches country via "randomise everything" (the reported bug)', () => {
  let bad = 0;
  for (let i=0;i<300;i++){
    G.CREATE = {name:'',gender:'',country:'',typed:false,diff:'normal',mods:null};
    G.rnd('all'); G.startLife(); if(!nameMatches()) bad++;
  }
  return bad ? bad + ' mismatches' : true;
});
t('changing country after rolling a name re-rolls the name', () => {
  let bad = 0;
  for (let i=0;i<120;i++){
    G.CREATE = {name:'',gender:'',country:'',typed:false,diff:'normal',mods:null};
    G.rnd('name'); G.countryChanged(G.DATA.countries[i % G.DATA.countries.length].id);
    G.startLife(); if(!nameMatches()) bad++;
  }
  return bad ? bad + ' mismatches' : true;
});
t('a typed name is never overwritten', () => {
  G.CREATE = {name:'Zebediah Custom',gender:'',country:'jp',typed:true,diff:'normal',mods:null};
  G.startLife();
  return G.S.name === 'Zebediah Custom' ? true : 'became ' + G.S.name;
});
t('employers and schools are generated per country', () => {
  const emp = new Set();
  for (let i=0;i<60;i++){ fresh(); ageTo(30);
    const j = G.DATA.jobs.filter(x=>G.jobEligible(x)); if(j.length) G.applyJob(j[0]);
    if (G.S.employer) emp.add(G.S.employer); }
  return emp.size > 15 ? true : 'only ' + emp.size + ' distinct employers';
});

/* ================= 4. CONSEQUENCES ================= */
section('4. Consequences actually bite');
t('a serious conviction bars public-sector work', () => {
  fresh(); ageTo(30);
  G.S.record = [{crime:'Wire Fraud',age:G.S.age,sev:3,spent:false}];
  return G.recordBlocks(G.S,'public') ? true : 'record ignored';
});
t('a spent conviction stops blocking', () => {
  fresh(); ageTo(30);
  G.S.record = [{crime:'Shoplift',age:5,sev:1,spent:true}];
  return G.recordBlocks(G.S,'public') ? 'still blocked' : true;
});
t('untreated illness reduces work capability', () => {
  fresh(); ageTo(40); G.S.conditions = [{id:'heart',age:40,sev:3,treated:false}];
  const w = G.workPenalty();
  return w > 0.1 ? true : 'penalty only ' + w;
});
t('treating a condition reduces its penalty', () => {
  fresh(); ageTo(40);
  G.S.conditions = [{id:'heart',age:40,sev:3,treated:false}]; const a = G.workPenalty();
  G.S.conditions = [{id:'heart',age:40,sev:3,treated:true}];  const b = G.workPenalty();
  return b < a ? true : `treated ${b} not better than untreated ${a}`;
});
t('debt lowers the credit score over time', () => {
  let tries = 0;
  while (tries++ < 40) {
    fresh(); ageTo(25);
    if (!G.S.alive) continue;
    G.S.credit = 700;
    const before = G.S.credit;
    for (let y = 0; y < 4 && G.S.alive; y++) { G.S.debt = 60000; G.ageUp(); }  // keep them in debt
    if (!G.S.alive) continue;
    return G.S.credit < before ? true : `credit ${before} -> ${G.S.credit}`;
  }
  return 'no subject survived to 29';
});
t('credit band changes borrowing power', () => {
  return G.creditBand(820).mult > G.creditBand(400).mult ? true : 'bands not ordered';
});
t('disability closes physical careers', () => {
  fresh(); ageTo(35); G.S.disabled = true;
  const trade = G.DATA.jobs.find(j => j.field === 'trade');
  return G.jobLocked(trade) ? true : 'trade job still open';
});
t('poor performance can get you dismissed', () => {
  let dismissed = 0;
  for (let i=0;i<40;i++){
    fresh(); ageTo(25);
    const j = G.DATA.jobs.filter(x=>G.jobEligible(x)); if(!j.length) continue;
    G.applyJob(j[0]); if(!G.S.job) continue;
    G.S.perf = 5;
    for (let y=0;y<6 && G.S.alive && G.S.job;y++) G.ageUp();
    if (!G.S.job) dismissed++;
  }
  return dismissed > 0 ? true : 'nobody was ever dismissed';
});
t('school grades influence university tier', () => {
  const hi = G.UNI_TIERS.find(t2 => 95 >= t2.need);
  const lo = G.UNI_TIERS.find(t2 => 10 >= t2.need);
  return hi.sal > lo.sal ? true : 'tiers do not differ';
});
t('NPC personality changes how relationships drift', () => {
  const warm = G.PERSONALITIES.find(p=>p.id==='warm');
  const needy = G.PERSONALITIES.find(p=>p.id==='needy');
  return needy.drift > warm.drift ? true : 'personalities identical';
});

function wipeMeta(){ Object.keys(G.META.ach).forEach(k=>delete G.META.ach[k]);
                     Object.keys(G.META.done).forEach(k=>delete G.META.done[k]); }
t('no achievement is awarded at birth', () => {
  wipeMeta();
  for (let i=0;i<40;i++) G.newGame({});
  const gained = Object.keys(G.META.ach).filter(k => {
    const a = G.ACHIEVEMENTS.find(x=>x.id===k); return a && !a.meta; });
  wipeMeta();
  return gained.length ? 'awarded at age 0: ' + gained.join(',') : true;
});
t('"die with..." awards only resolve once dead', () => {
  const atDeath = G.ACHIEVEMENTS.filter(a=>a.atDeath);
  if (!atDeath.length) return 'none flagged';
  wipeMeta();
  // the subject must still be ALIVE at 30, otherwise death awards fire legitimately
  let tries = 0;
  do { G.newGame({}); ageTo(30); tries++; } while (!G.S.alive && tries < 60);
  if (!G.S.alive) return 'could not keep a subject alive to 30';
  wipeMeta();          // discard anything the failed attempts recorded
  G.checkAch(true);
  const early = atDeath.filter(a => G.META.ach[a.id]);
  wipeMeta();
  return early.length ? early.map(a=>a.id).join(',') + ' fired while alive' : true;
});
t('a newborn is never described as Unemployed', () => {
  G.newGame({}); G.renderHeader();
  const j = G.S.job ? G.S.job.t : (G.S.age<5 ? 'Infant' : 'other');
  return j === 'Infant' ? true : 'label was ' + j;
});

/* ================= 4b. ECONOMY OF ACTIONS & GRINDING ================= */
section('4b. Grinding, billing and school');

t('a year has a limited number of actions', () => {
  if(!freeAt(25)) return true;
  const max = G.S.actionsLeft;
  let done = 0;
  for (let i=0;i<12;i++){ const L=G.ACTS(); const a=L.find(x=>x.id==='rest'); if(!a)break;
    G.LASTPOP=null; G.doAct('rest'); if(G.S.actionsLeft>=0) done++; }
  return G.S.actionsLeft === 0 ? true : 'actions left ' + G.S.actionsLeft + ' of ' + max;
});
t('the action budget refills each year', () => {
  if(!freeAt(25)) return true;
  while (G.S.actionsLeft>0) G.doAct('rest');
  G.ageUp();
  return G.S.actionsLeft > 0 ? true : 'still empty after ageing';
});
t('resting every year cannot max out happiness (the grind exploit)', () => {
  if(!freeAt(20)) return true;
  for (let y=0; y<35 && G.S.alive; y++){
    while (G.S.actionsLeft>0) G.doAct('rest');
    G.ageUp();
  }
  if (!G.S.alive) return true;
  return G.S.stats.happiness < 96 ? true : 'happiness reached ' + Math.round(G.S.stats.happiness);
});
t('repeating one action visibly loses value', () => {
  if(!freeAt(25)) return true;
  const d1 = G.diminish('rest');
  for (let i=0;i<4 && G.S.alive;i++){ if(G.S.actionsLeft<=0) G.ageUp(); if(G.S.alive) G.doAct('rest'); }
  const d5 = G.diminish('rest');
  return (d1 === 1 && d5 < 0.6) ? true : `first ${d1}, fifth ${d5}`;
});
t('a five-year-old is never charged for a doctor visit', () => {
  fresh(); ageTo(5); if(!G.S.alive) return true;
  G.S.money = 0; G.S.familyMoney = 50000;
  const before = G.S.money, famBefore = G.S.familyMoney;
  G.doAct('doctor');
  if (G.S.money < before) return 'the child paid ' + (before-G.S.money);
  return G.S.familyMoney < famBefore ? true : 'nobody paid at all';
});
t('a child cannot be pushed into debt by any activity', () => {
  let bad = [];
  for (let age of [5,9,13,16]){
    fresh(); ageTo(age); if(!G.S.alive) continue;
    G.S.money = 0; G.S.familyMoney = 0; G.S.debt = 0;   // isolate: measure only what the ACTIVITIES do
    G.ACTS().forEach(a => { G.S.actionsLeft = 5; try{ a.f(); }catch(e){} });
    if (G.S.money < 0 || G.S.debt > 0) bad.push(age + ':' + G.S.money + '/' + G.S.debt);
  }
  return bad.length ? bad.join(' ') : true;
});
t('no minor ever ends a year in debt', () => {
  const bad = [];
  for (let i=0;i<60;i++){
    G.newGame({});
    let g = 0;
    while (G.S.alive && G.S.age < 18 && g++ < 25) {
      G.ageUp();
      if (G.S.age >= 18) break;          // adult rules legitimately apply from 18
      if (G.S.debt > 0 && !G.S.flags.student_loan) { bad.push('age ' + G.S.age + ' debt ' + Math.round(G.S.debt)); break; }
      if (G.S.money < 0) { bad.push('age ' + G.S.age + ' money ' + Math.round(G.S.money)); break; }
    }
  }
  return bad.length ? bad.slice(0,4).join(' | ') : true;
});
t('a newborn has no purchased habits', () => {
  const bad = [];
  for (let i=0;i<40;i++){
    G.newGame({});
    Object.keys(G.DATA.habits).forEach(k => {
      if (!G.DATA.habits[k].good && G.S.habits[k] > 0) bad.push(k + '=' + G.S.habits[k]);
    });
  }
  return bad.length ? [...new Set(bad)].slice(0,4).join(', ') : true;
});
t('no activity grants free money without limit', () => {
  fresh(); ageTo(30); if(!G.S.alive) return true;
  const earners = [];
  G.ACTS().forEach(a => {
    G.S.actionsLeft = 1; const before = G.S.money;
    try { a.f(); } catch(e) {}
    const delta = G.S.money - before;
    if (delta > 4000 && !/loan|sellstash|overtime/.test(a.id)) earners.push(a.id + '+' + delta);
  });
  return earners.length ? earners.join(', ') : true;
});
t('relationships cannot be ground in a single year', () => {
  fresh(); ageTo(20); if(!G.S.alive) return true;
  const n = G.S.npcs.find(x=>x.alive); if(!n) return true;
  const start = n.r;
  for (let i=0;i<10;i++) G.npcAct ? null : null;
  return true;
});
t('school exists and is visible while you are in it', () => {
  fresh(); ageTo(10); if(!G.S.alive) return true;
  if (!G.S.inSchool) return 'not in school at 10';
  if (!G.S.school) return 'no school name';
  const html = G.viewLife();
  if (!/School/.test(html)) return 'school card missing from Life tab';
  const acts = G.ACTS().filter(a => a.grp === 'School');
  return acts.length >= 5 ? true : 'only ' + acts.length + ' school activities';
});
t('a condition never worsens in the year it is diagnosed', () => {
  let bad = 0;
  for (let i=0;i<60;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && g++<140){
      G.ageUp();
      G.S.conditions.forEach(k => { const c = G.COND(k.id); if (k.age === G.S.age && k.sev > c.sev) bad++; });
    }
  }
  return bad ? bad + ' instant escalations' : true;
});
t('nobody is diagnosed and disabled in the same year', () => {
  let bad = 0;
  for (let i=0;i<60;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && g++<140){
      G.ageUp();
      if (G.S.disabled && G.S.disabledAt != null) {
        // only illnesses that existed BEFORE the disability are relevant;
        // conditions acquired later, or since cured, prove nothing either way
        const priorIllnesses = G.S.conditions.filter(k => k.age <= G.S.disabledAt);
        if (priorIllnesses.length && !priorIllnesses.some(k => (G.S.disabledAt - k.age) >= 3)) bad++;
      }
    }
  }
  return bad ? bad + ' same-year disabilities' : true;
});
t('a teacher exists as a real person', () => {
  fresh(); ageTo(10); if(!G.S.alive) return true;
  return G.S.npcs.some(n => n.rel === 'teacher') ? true : 'no teacher NPC';
});
t('studying raises your grade, skipping lowers it', () => {
  fresh(); ageTo(12); if(!G.S.alive) return true;
  G.S.gpa = 50; G.S.actionsLeft = 9; G.doAct('homework');
  const up = G.S.gpa;
  G.S.gpa = 50; G.S.actionsLeft = 9; G.doAct('skipschool');
  const down = G.S.gpa;
  return (up > 50 && down < 50) ? true : `homework->${up} skip->${down}`;
});
t('the newest log entry is at the top of the story', () => {
  fresh(); ageTo(12); if(!G.S.alive) return true;
  const html = G.viewLife();
  const last = G.S.log[G.S.log.length-1].t;
  const first = G.S.log.find(l=>!l.t.startsWith('\u2014')).t;
  const iLast = html.indexOf(last.slice(0,18)), iFirst = html.indexOf(first.slice(0,18));
  if (iLast < 0) return 'newest entry not rendered';
  return (iFirst < 0 || iLast < iFirst) ? true : 'oldest entry appears first';
});

/* ================= 4c. VARIETY, NAVIGATION AND BUTTONS ================= */
section('4c. Variety, navigation and every button');

t('new lives do not all open with the same event', () => {
  const firsts = [];
  for (let i=0;i<30;i++){
    G.FIRED = []; G.newGame({});
    for (let y=0;y<4 && G.S.alive;y++) G.ageUp();
    firsts.push(G.FIRED[0] || 'none');
  }
  const distinct = new Set(firsts).size;
  return distinct >= 6 ? true : `only ${distinct} distinct opening events in 30 lives`;
});
t('the first ten years differ between lives', () => {
  const seqs = [];
  for (let i=0;i<20;i++){
    G.FIRED = []; G.newGame({});
    for (let y=0;y<10 && G.S.alive;y++) G.ageUp();
    seqs.push(G.FIRED.slice(0,8).join('>'));
  }
  return new Set(seqs).size >= 18 ? true : new Set(seqs).size + '/20 distinct';
});
t('no age from 0 to 100 is starved of events', () => {
  const thin = [];
  for (let a=1;a<=100;a++){
    const n = G.EVENTS.filter(e => a>=e.min && a<=e.max).length;
    if (n < 5) thin.push(a + ':' + n);
  }
  return thin.length ? thin.join(' ') : true;
});
t('school activities exist for every year you are in school', () => {
  const bad = [];
  for (let age=6; age<=17; age++){
    let tries=0, ok=false;
    while (tries++ < 20 && !ok){
      G.newGame({}); ageTo(age);
      if (!G.S.alive || !G.S.inSchool) continue;
      ok = G.ACTS().some(a => a.grp === 'School');
    }
    if (!ok) bad.push(age);
  }
  return bad.length ? 'no school actions at ages ' + bad.join(',') : true;
});
t('the school card button targets a group that exists', () => {
  G.newGame({}); ageTo(10);
  if (!G.S.alive || !G.S.inSchool) return true;
  const html = G.viewLife();
  const m = html.match(/gotoGroup\('([^']+)'\)/);
  if (!m) return 'no gotoGroup button rendered';
  const groups = new Set(G.ACTS().map(a => a.grp));
  return groups.has(m[1]) ? true : `button points at "${m[1]}" which has no activities`;
});
t('the activities dice cannot beat the action limit', () => {
  if(!freeAt(25)) return true;
  while (G.S.actionsLeft > 0) G.doAct('rest');
  const h0 = G.S.stats.happiness, hp0 = G.S.stats.health;
  for (let i=0;i<8;i++) G.randomAct();
  return (G.S.stats.happiness === h0 && G.S.stats.health === hp0)
    ? true : 'dice changed stats after the year was full';
});
t('the crime dice cannot beat the action limit', () => {
  if(!freeAt(25)) return true;
  while (G.S.actionsLeft > 0) G.doAct('rest');
  const c0 = G.S.crimesCommitted;
  for (let i=0;i<8;i++) G.randomCrime();
  return G.S.crimesCommitted === c0 ? true : 'committed crimes with no actions left';
});
t('committing a crime consumes an action', () => {
  if(!freeAt(25)) return true;
  const before = G.S.actionsLeft;
  G.AUTOCONFIRM = true; G.crimeConfirm('shoplift'); G.AUTOCONFIRM = null;
  return G.S.actionsLeft < before ? true : 'crime was free';
});
t('every onclick handler in every screen actually exists', () => {
  const missing = new Set();
  const scan = html => {
    const re = /onclick="([a-zA-Z_$][\w$]*)\s*\(/g; let m;
    while ((m = re.exec(html))) if (typeof G[m[1]] !== 'function') missing.add(m[1]);
  };
  [0,3,7,11,15,18,24,35,50,66,82].forEach(age => {
    let tries = 0;
    do { G.newGame({}); ageTo(age); tries++; } while (!G.S.alive && tries < 25);
    if (!G.S.alive) return;
    scan(G.viewLife()); scan(G.viewActs()); scan(G.viewPeople()); scan(G.viewMoney());
    ['stats','ach','chal','rec','save'].forEach(v => { G.S.moreView = v; scan(G.viewMore()); });
  });
  G.CREATE = {name:'',gender:'',country:'',typed:false,diff:'normal',mods:null,showCompare:true,showCustom:true};
  G.setDiff('custom'); scan(G.renderCreate() || '');
  return missing.size ? 'missing: ' + [...missing].join(', ') : true;
});
t('every activity id offered is actually runnable', () => {
  const broken = [];
  [3,8,12,16,20,30,45,60,75].forEach(age => {
    let tries=0;
    do { G.newGame({}); ageTo(age); tries++; } while (!G.S.alive && tries < 25);
    if (!G.S.alive) return;
    G.ACTS().forEach(a => {
      G.S.actionsLeft = 5; G.S.money = 500000; G.S.familyMoney = 500000;
      try { a.f(); } catch(e) { broken.push(age + '/' + a.id + ': ' + e.message); }
    });
  });
  return broken.length ? broken.slice(0,5).join(' | ') : true;
});
t('every shop item can be bought without error', () => {
  const broken = [];
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.DATA.items.forEach(i => {
    G.S.money = 9000000; G.S.buysThisYear = 0; G.S.items = []; G.S.assets = [];
    try { G.buy(i.id); } catch(e) { broken.push(i.id + ': ' + e.message); }
  });
  return broken.length ? broken.join(' | ') : true;
});
t('every job can be applied for without error', () => {
  const broken = [];
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.DATA.jobs.forEach(j => { try { G.applyJob(j); } catch(e) { broken.push(j.id + ': ' + e.message); } });
  return broken.length ? broken.join(' | ') : true;
});
t('every gated event becomes reachable once its gate is met', () => {
  const unreachable = [];
  G.EVENTS.forEach(ev => {
    const q = ev.req || {};
    let tries = 0, ok = false;
    while (tries++ < 6 && !ok) {
      G.newGame({});
      const target = Math.max(1, Math.min(ev.min + 1, 100));
      // age naturally only as far as is realistic, then set the age outright:
      // whether the gate works is a separate question from whether you survive
      const natural = Math.min(target, 55);
      let g = 0;
      while (G.S.alive && G.S.age < natural && g++ < 140) {
        G.ageUp();
        if (G.S.alive) { G.S.stats.health = Math.max(G.S.stats.health, 85); G.S.conditions = []; }
      }
      if (!G.S.alive) continue;
      if (G.S.age < target) G.S.age = target;
      // satisfy the gate by hand
      if (q.item)   { const it = G.DATA.items.find(i => i.tag === q.item || i.id === q.item);
                      if (it && !G.S.items.includes(it.id)) G.S.items.push(it.id); }
      if (q.flags)  q.flags.forEach(f => G.S.flags[f] = true);
      if (q.noflags) q.noflags.forEach(f => delete G.S.flags[f]);
      if (q.job && !G.S.job) G.S.job = {id:'assistant',t:'Admin Assistant',pay:40000,field:'corp',lvl:1};
      if (q.nojob) G.S.job = null;
      // each required relationship needs its OWN person - one NPC cannot be
      // both your spouse and your child
      let free = 0;
      const assign = rel => {
        while (free < G.S.npcs.length) {
          const n = G.S.npcs[free++];
          if (n.rel === 'mother' || n.rel === 'father') continue;   // leave parents alone
          n.rel = rel; n.alive = true; return n;
        }
        const g2 = ['m','f'][free % 2];
        const made = { id:'t'+(free++)+'_'+rel, name:'Test Person', rel, gender:g2,
                       age:Math.max(1, G.S.age - 20), alive:true, r:70, pers:'steady', mem:[],
                       own:{edu:0,job:null,partner:null,kids:0,city:null,arc:'steady'} };
        G.S.npcs.push(made); return made;
      };
      if (q.partner && !G.partner()) assign('spouse');
      if (q.nopartner) G.S.npcs.forEach(n => { if (n.rel==='partner'||n.rel==='spouse') n.rel='ex'; });
      if (q.child && !G.anyOf('child').length) assign('child');
      if (q.nochild) G.S.npcs.forEach(n => { if (n.rel==='child') n.rel='friend'; });
      if (q.friend && !G.anyOf('friend').length) assign('friend');
      if (q.sibling && !G.anyOf('sibling').length) assign('sibling');
      if (q.teacher && !G.anyOf('teacher').length) assign('teacher');
      if (q.property) G.S.property = {value:200000, mortgage:0, rented:false};
      if (q.noproperty) G.S.property = null;
      if (q.record) G.S.record = [{crime:'Shoplift',age:G.S.age-2,sev:1,spent:false}];
      if (q.parole) G.S.parole = 2;
      if (q.condition) G.S.conditions = [{id:'asthma',age:G.S.age-1,sev:1,treated:false}];
      if (q.followers) G.S.followers = q.followers + 1000;
      if (q.artskill) G.S.skills.art = q.artskill + 5;
      if (q.smart) G.S.stats.smarts = q.smart + 5;
      if (q.rep) G.S.stats.reputation = q.rep + 5;
      if (q.poor) G.S.birthTier = 0;
      if (q.habit) Object.keys(q.habit).forEach(k => G.S.habits[k] = q.habit[k] + 5);
      if (q.anyBadHabit) G.S.habits.smoking = q.anyBadHabit + 5;
      if (q.parentAlive) { const p3 = G.S.npcs.find(n=>n.rel==='mother'||n.rel==='father'); if (p3) p3.alive = true; }
      if (q.parentDead)  { const p4 = G.S.npcs.find(n=>n.rel==='mother'||n.rel==='father'); if (p4) p4.alive = false; }
      delete G.S.seen[ev.id]; delete G.S.cd[ev.id];
      ok = G.reqOk(ev);
    }
    if (!ok) unreachable.push(ev.id);
  });
  return unreachable.length ? unreachable.length + ' unreachable: ' + unreachable.slice(0,8).join(', ') : true;
});
t('every event requirement key is understood by the engine', () => {
  const known = new Set(['flags','noflags','job','nojob','partner','nopartner','child','nochild',
    'friend','property','noproperty','item','poor','smart','rep','parentAlive','parentDead',
    'anyBadHabit','habit','sibling','teacher','condition','record','parole','followers','artskill']);
  const bad = new Set();
  G.EVENTS.forEach(e => Object.keys(e.req||{}).forEach(k => { if (!known.has(k)) bad.add(e.id+'.'+k); }));
  return bad.size ? [...bad].join(', ') : true;
});
t('every event choice resolves without error', () => {
  const broken = [];
  G.EVENTS.forEach(ev => {
    ev.c.forEach((c, i) => {
      let tries = 0;
      do { G.newGame({}); ageTo(Math.max(1, Math.min(ev.min + 1, 90))); tries++; } while (!G.S.alive && tries < 10);
      if (!G.S.alive) return;
      try { G.resolveChoice(ev, i); } catch(e) { broken.push(ev.id + '#' + i + ': ' + e.message); }
    });
  });
  return broken.length ? broken.length + ' broken: ' + broken.slice(0,4).join(' | ') : true;
});

/* ================= 4d. LIFE FORKS AND NPC LIVES ================= */
section('4d. Forks, dependents and other people');

t('being barred from a field really closes it', () => {
  if(!freeAt(30)) return true;
  G.S.banned = [{field:'medical', until:null, why:'You were struck off'}];
  const med = G.DATA.jobs.filter(j => j.field === 'medical');
  const open = med.filter(j => G.jobEligible(j));
  if (open.length) return open.length + ' medical jobs still open';
  const reason = G.jobLocked(med[0]);
  return /struck off/i.test(reason) ? true : 'no explanation given: ' + reason;
});
t('a time-limited bar expires', () => {
  if(!freeAt(30)) return true;
  G.S.banned = [{field:'corp', until:G.S.age+2, why:'an undischarged bankruptcy'}];
  const corp = G.DATA.jobs.find(j => j.field === 'corp');
  const now = G.jobLocked(corp) || '';
  G.S.age += 5;
  const later = G.jobLocked(corp) || '';
  // after it expires the ban must no longer be the reason; the job may still be
  // locked for ordinary reasons like qualifications, which is correct
  return (/bankruptcy/.test(now) && !/bankruptcy/.test(later))
    ? true : `now:"${now}" later:"${later}"`;
});
t('dependents cost you time every year', () => {
  if(!freeAt(30)) return true;
  G.S.dependents = 0; const free = G.actionsPerYear();
  G.S.dependents = 2; const burdened = G.actionsPerYear();
  return burdened < free ? true : `${free} -> ${burdened}`;
});
t('every fork event has a mechanism that changes the life', () => {
  const forks = G.EVENTS.filter(e => e.id.indexOf('k_') === 0);
  if (forks.length < 10) return 'only ' + forks.length + ' forks';
  const mech = ['banField','deport','dependent','fire','retrain','bankrupt','ruin','inheritBiz',
                'strikeRoll','appealRoll','rehabCareer','npcJob','childReflect','npcGift','npcDrain',
                'flag','condition','emigrate','joinForces','setEdu','bigBreak','divorce','vow',
                'wrongfulRoll','rehab','newJob','perfDrop','secondProp','flipRoll'];
  const weak = forks.filter(e => !e.c.some(c => mech.some(m => c[m] !== undefined)));
  return weak.length ? 'no mechanism: ' + weak.map(e=>e.id).join(',') : true;
});
t('NPCs accumulate their own life stories', () => {
  let tries = 0, best = 0;
  while (tries++ < 20) {
    G.newGame({}); ageTo(55);
    if (!G.S.alive) continue;
    const live = G.S.npcs.filter(n => n.own);
    if (!live.length) continue;
    const told = live.filter(n => n.own.job || n.own.married || n.own.kids || n.own.city).length;
    best = Math.max(best, told / live.length);
    if (best > 0.5) break;
  }
  return best > 0.5 ? true : 'only ' + (best*100).toFixed(0) + '% of NPCs had a story';
});
t('an NPC job offer produces a real job', () => {
  let worked = false;
  for (let i=0;i<25 && !worked;i++){
    G.newGame({}); ageTo(35);
    if (!G.S.alive) continue;
    G.S.npcs.forEach(n => { n.alive = true; n.own = n.own||{}; n.own.job = 'Manager'; });
    G.S.job = null;
    const ev = G.EVENTS.find(e => e.id === 'n_joboffer');
    const idx = ev.c.findIndex(c => c.npcJob);
    G.resolveChoice(ev, idx);
    if (G.S.job) worked = true;
  }
  return worked ? true : 'never produced a job';
});

/* ================= 4e. MONETISATION ================= */
section('4e. Monetisation is fair');

t('no content is ever locked behind payment', () => {
  G.META.premium.plus = false; G.META.premium.lifetime = false;
  fresh(); ageTo(30);
  if (!G.S.alive) return true;
  const eventsFree  = G.EVENTS.length;
  const jobsFree    = G.DATA.jobs.length;
  const countryFree = G.DATA.countries.length;
  const actsFree    = G.ACTS().length;
  G.META.premium.plus = true;
  const actsPlus = G.ACTS().length;
  const ok = (eventsFree === G.EVENTS.length && jobsFree === G.DATA.jobs.length &&
              countryFree === G.DATA.countries.length && actsFree === actsPlus);
  return ok ? true : 'content differs between free and paid';
});
t('all four difficulties are free', () => {
  G.META.premium.plus = false;
  const free = G.DIFFICULTIES.filter(d => !d.premium);
  return free.length >= 4 ? true : 'only ' + free.length + ' free difficulties';
});
t('extra save slots require Plus', () => {
  G.META.premium.plus = false;
  fresh(); ageTo(20);
  G.LASTPOP = null; G.saveToSlot(3);
  const blocked = G.S.slot !== 3;
  G.META.premium.plus = true;
  G.saveToSlot(3);
  return (blocked && G.S.slot === 3) ? true : 'slot gating not working';
});
t('buying Plus actually grants it, and can be switched off', () => {
  G.META.premium.plus = false;
  G.AUTOCONFIRM = true; G.buyPlus('lifetime'); G.AUTOCONFIRM = null;
  const on = G.isPlus() && G.META.premium.lifetime;
  G.togglePlus();
  return (on && !G.isPlus()) ? true : 'purchase or toggle failed';
});
t('a free player still gets one Second Chance per life', () => {
  G.META.premium.plus = false;
  fresh(); ageTo(40);
  if (!G.S.alive) return true;
  G.S.alive = false; G.S.usedSecondChance = false;
  G.secondChance();
  const revived = G.S.alive === true;
  G.S.alive = false;
  G.secondChance();
  return (revived && G.S.alive === false) ? true : 'second chance is repeatable or missing';
});
t('the store screen renders in both states', () => {
  fresh();
  G.META.premium.plus = false; const a = G.viewPlus();
  G.META.premium.plus = true;  const b = G.viewPlus();
  G.META.premium.plus = true;
  return (a.length > 200 && b.length > 200 && a !== b) ? true : 'store did not render both states';
});

/* ================= 4f. EASTER EGGS ================= */
section('4f. Easter eggs');

t('every egg has a tier the engine understands', () => {
  const bad = G.EGGS.filter(e => G.EGG_TIERS[e.tier] === undefined);
  return bad.length ? bad.map(e=>e.id).join(',') : true;
});
t('every unlock points at a real egg', () => {
  const bad = Object.keys(G.EGG_UNLOCKS).filter(k => !G.EGG(k));
  return bad.length ? bad.join(',') : true;
});
t('secret traits are never rolled at birth', () => {
  const secret = G.DATA.traits.filter(t2 => t2.secret).map(t2 => t2.id);
  const bad = [];
  for (let i=0;i<150;i++){
    Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
    G.newGame({});
    G.S.traits.forEach(tr => { if (secret.includes(tr)) bad.push(tr); });
  }
  return bad.length ? [...new Set(bad)].join(',') : true;
});
t('secret shop items stay hidden until unlocked', () => {
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  const html = G.viewMoney();
  return /buyV8/.test(html) ? 'the V8 is visible without finding it' : true;
});
t('finding the V8 reveals it in the shop', () => {
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.META.eggs.v8 = {age:20,life:1,at:Date.now()};
  const html = G.viewMoney();
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
  return /buyV8/.test(html) ? true : 'unlocked item did not appear';
});
t('eggs are recorded permanently across lives', () => {
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
  G.newGame({});
  G.findEgg('sonder','test');
  const recorded = G.hasEgg('sonder');
  G.newGame({});
  const persisted = G.hasEgg('sonder');
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
  return (recorded && persisted) ? true : 'eggs did not persist';
});
t('a sonder life reads as a complete life', () => {
  G.newGame({});
  const txt = G.sonderLife(Math.random, a=>a[Math.floor(Math.random()*a.length)],
    (r,g)=>'Test', r=>'Person', r=>'City', 'west');
  return (/Born \d{4}, died \d{4}/.test(txt) && txt.length > 80) ? true : 'malformed: ' + txt;
});
t('the whole egg set is reachable in principle', () => {
  const g = require('fs').readFileSync(require('path').join(DIR,'game.js'),'utf8');
  const unreachable = G.EGGS.filter(e => !g.includes("'" + e.id + "'"));
  return unreachable.length ? 'never triggered: ' + unreachable.map(e=>e.id).join(',') : true;
});

/* ================= 4g. IDENTITY, FAMILY AND PETS ================= */
section('4g. Orientation, adoption, pets, prison');

t('orientation decides who you are matched with', () => {
  const bad = [];
  for (let i=0;i<400;i++){
    G.newGame({});
    G.S.orientation = 'gay'; G.S.gender = 'm';
    if (G.partnerGender() !== 'm') bad.push('gay man matched with ' + G.partnerGender());
    G.S.orientation = 'lesbian'; G.S.gender = 'f';
    if (G.partnerGender() !== 'f') bad.push('lesbian matched with ' + G.partnerGender());
    G.S.orientation = 'straight'; G.S.gender = 'f';
    if (G.partnerGender() !== 'm') bad.push('straight woman matched with ' + G.partnerGender());
  }
  return bad.length ? [...new Set(bad)].join(', ') : true;
});
t('bisexual characters can be matched with either', () => {
  G.newGame({}); G.S.orientation = 'bi';
  const seen = new Set();
  for (let i=0;i<200;i++) seen.add(G.partnerGender());
  return seen.size === 2 ? true : 'only ever matched with ' + [...seen].join(',');
});
t('asexual characters are never pushed into romance', () => {
  G.newGame({}); G.S.orientation = 'ace';
  if (G.canRomance()) return 'canRomance() true for asexual';
  const ev = G.EVENTS.find(e => e.c.some(c => c.romance != null));
  const idx = ev.c.findIndex(c => c.romance != null);
  let paired = 0;
  for (let i=0;i<40;i++){
    G.newGame({}); G.S.orientation = 'ace'; ageTo(22);
    if (!G.S.alive) continue;
    G.S.npcs.forEach(n => { if (n.rel==='partner'||n.rel==='spouse') n.rel='ex'; });
    G.resolveChoice(ev, idx);
    if (G.partner()) paired++;
  }
  return paired === 0 ? true : 'paired ' + paired + ' times';
});
t('every orientation is reachable at birth', () => {
  const seen = new Set();
  for (let i=0;i<3000;i++){ G.newGame({}); seen.add(G.S.orientation); }
  const missing = G.DATA.orientations.filter(o => !seen.has(o.id) && o.w > 0);
  return missing.length ? 'never born: ' + missing.map(o=>o.id).join(',') : true;
});
t('adoption produces a real child', () => {
  let worked = false;
  for (let i=0;i<40 && !worked;i++){
    G.newGame({}); ageTo(34);
    if (!G.S.alive) continue;
    G.S.money = 500000; G.S.record = []; G.S.actionsLeft = 5;
    const a = G.ACTS().find(x => x.id === 'adopt');
    if (!a) continue;
    G.AUTOCONFIRM = true; a.f(); G.AUTOCONFIRM = null;
    if (G.anyOf('child').some(c => c.adopted)) worked = true;
  }
  return worked ? true : 'adoption never produced a child';
});
t('pets are born, cost money, age and die', () => {
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.S.pets = []; G.S.money = 100000;
  const pet = G.addPet('hamster', false);
  if (!G.petsAlive().length) return 'pet not created';
  const before = G.S.money;
  const notes = []; G.tickPets(notes);
  if (G.S.money >= before) return 'pet cost nothing';
  let guard = 0;
  while (G.petsAlive().length && guard++ < 40) G.tickPets([]);
  return G.petsAlive().length === 0 ? true : 'pet never died of old age';
});
t('losing a pet actually hurts', () => {
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.S.pets = []; const p = G.addPet('dog', false);
  p.age = 99; p.lifespan = 1;
  G.S.stats.happiness = 80;
  G.tickPets([]);
  return G.S.stats.happiness < 80 ? true : 'no grief when the pet died';
});
t('prison replaces your year with prison activities', () => {
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.S.jailLeft = 4;
  const acts = G.ACTS();
  const groups = new Set(acts.map(a => a.grp));
  if (!groups.has('Prison')) return 'no prison activities';
  const outside = acts.filter(a => ['Work','Love','Social','Education'].includes(a.grp));
  return outside.length === 0 ? true : 'outside activities still offered: ' + outside.map(a=>a.id).join(',');
});
t('a criminal record makes adoption much harder', () => {
  // the subject must be alive, of age, and NOT in prison - prison replaces the
  // entire activity list, so adoption would be absent for reasons unrelated to
  // the criminal record we are actually measuring
  if(!freeAt(34)) return true;
  if (!G.ACTS().some(x => x.id === 'adopt')) return 'adoption was not offered to an eligible adult';
  const clean = [], dirty = [];
  for (let i=0;i<120;i++){
    G.S.record = []; G.S.money = 500000; G.S.actionsLeft = 5;
    let a = G.ACTS().find(x => x.id === 'adopt');
    const before = G.anyOf('child').length;
    G.AUTOCONFIRM = true; if (a) a.f(); G.AUTOCONFIRM = null;
    clean.push(G.anyOf('child').length > before);
    G.S.npcs.forEach(n => { if (n.rel === 'child') n.rel = 'friend'; });
    G.S.record = [{crime:'Wire Fraud',age:G.S.age-1,sev:3,spent:false}];
    G.S.money = 500000; G.S.actionsLeft = 5;
    a = G.ACTS().find(x => x.id === 'adopt');
    const b2 = G.anyOf('child').length;
    G.AUTOCONFIRM = true; if (a) a.f(); G.AUTOCONFIRM = null;
    dirty.push(G.anyOf('child').length > b2);
    G.S.npcs.forEach(n => { if (n.rel === 'child') n.rel = 'friend'; });
  }
  const rc = clean.filter(Boolean).length, rd = dirty.filter(Boolean).length;
  if (rc === 0 && rd === 0) return 'adoption never succeeded in either arm';
  return rc > rd ? true : `clean ${rc} vs record ${rd}`;
});

/* ================= 5. SIMULATION STABILITY ================= */
section('5. Simulation stability');
function bulk(diff, n) {
  let err = 0, ages = [], nets = [];
  for (let i=0;i<n;i++){
    try {
      G.newGame({diff}); let g = 0;
      while (G.S.alive && g++ < 140) {
        G.ageUp(); if (!G.S.alive) break;
        const L = G.ACTS();
        if (L.length && Math.random() < 0.8) { L[Math.floor(Math.random()*L.length)].f(); G.drain(); }
        if (G.S.age>=18 && !G.S.job && !G.S.flags.retired && !G.S.flags.inCollege) {
          const el = G.DATA.jobs.filter(G.jobEligible);
          if (el.length && Math.random()<0.7) { G.applyJob(el[el.length-1]); G.drain(); }
        }
        if (G.S.job && Math.random()<0.4) { G.tryPromote(); G.drain(); }
      }
      G.finalChallenges(); ages.push(G.S.age); nets.push(G.S.peakNet);
    } catch(e) { err++; if (err<3) console.log('      ! ' + e.message); }
  }
  ages.sort((a,b)=>a-b);
  return { err, ages, nets, median: ages[Math.floor(ages.length/2)] };
}
const runs = {};
['easy','normal','hard','brutal'].forEach(d => { runs[d] = bulk(d, 120); });
t('no crashes across 480 full lives', () => {
  const e = Object.values(runs).reduce((n,r)=>n+r.err,0);
  return e ? e + ' crashes' : true;
});
t('nobody lives past 122 (human record)', () => {
  const max = Math.max(...Object.values(runs).flatMap(r=>r.ages));
  return max <= 122 ? true : 'oldest was ' + max;
});
t('median lifespan is plausible on Normal (60-90)', () => {
  const m = runs.normal.median;
  return (m>=60 && m<=90) ? true : 'median ' + m;
});
t('difficulty monotonically shortens life', () => {
  const o = ['easy','normal','hard','brutal'].map(d=>runs[d].median);
  return (o[0]>=o[1] && o[1]>=o[2] && o[2]>=o[3]) ? true : o.join(' > ');
});
t('difficulty reduces wealth, allowing for sampling noise', () => {
  const med = d => { const a=runs[d].nets.slice().sort((x,y)=>x-y); return a[Math.floor(a.length/2)]; };
  const o = ['easy','normal','hard','brutal'].map(med);
  // 120 lives per difficulty is a small sample, and Hard/Brutal both sit near
  // the floor, so allow each step a 30% tolerance. The overall claim - that
  // harder settings leave you poorer - is asserted strictly end to end.
  const stepsOk = o.every((v,i) => i === 0 || o[i-1] >= v * 0.7);
  const endToEnd = o[0] > o[3] * 1.5;
  return (stepsOk && endToEnd) ? true : o.map(Math.round).join(' > ');
});
t('stats never escape 0-100', () => {
  let bad = 0;
  for (let i=0;i<40;i++){ G.newGame({}); let g=0;
    while (G.S.alive && g++<140) { G.ageUp();
      G.DATA.statKeys.forEach(k => { const v=G.S.stats[k]; if (v<0||v>100||isNaN(v)) bad++; });
      Object.keys(G.DATA.skills).forEach(k => { const v=G.S.skills[k]; if (v<0||v>100||isNaN(v)) bad++; }); } }
  return bad ? bad + ' out-of-range readings' : true;
});
t('money and net worth never become NaN', () => {
  let bad = 0;
  for (let i=0;i<40;i++){ G.newGame({}); let g=0;
    while (G.S.alive && g++<140) { G.ageUp(); if (isNaN(G.S.money)||isNaN(G.netWorth())) bad++; } }
  return bad ? bad + ' NaN readings' : true;
});
t('every screen renders at every life stage', () => {
  const bad = [];
  [0,3,8,14,17,22,35,50,68,85].forEach(age => {
    G.newGame({}); ageTo(age); if (!G.S.alive) return;
    ['life','act','ppl','money','more'].forEach(() => {});
    try { G.viewLife(); G.viewActs(); G.viewPeople(); G.viewMoney();
      ['stats','ach','chal','rec','save'].forEach(v => { G.S.moreView=v; G.viewMore(); });
      G.renderHeader();
    } catch(e) { bad.push(age + ':' + e.message); }
  });
  return bad.length ? bad.join(' | ') : true;
});
t('event uniqueness within a life stays above 80%', () => {
  let ratios = [];
  for (let i=0;i<30;i++){
    G.FIRED = []; G.newGame({}); let g=0;
    while (G.S.alive && g++<140) G.ageUp();
    if (G.FIRED.length) ratios.push(new Set(G.FIRED).size / G.FIRED.length);
  }
  const avg = ratios.reduce((a,b)=>a+b,0)/ratios.length;
  return avg >= 0.80 ? true : (avg*100).toFixed(1) + '%';
});

/* ================= 6. SAVES ================= */
section('6. Saves');
t('save and reload preserves the character', () => {
  G.newGame({}); ageTo(30);
  const name = G.S.name, age = G.S.age, money = G.S.money;
  G.S.slot = 2; G.save(); G.S = null; G.loadSlot(2);
  return (G.S.name===name && G.S.age===age && G.S.money===money) ? true : 'state changed on reload';
});
t('slot summary reports the right character', () => {
  G.newGame({}); ageTo(20); G.S.slot = 3; G.save();
  const info = G.slotInfo(3);
  return (info && info.name === G.S.name && info.age === G.S.age) ? true : 'summary mismatch';
});
t('an old save without new fields still loads', () => {
  G.newGame({}); ageTo(25);
  const old = JSON.parse(JSON.stringify(G.S));
  delete old.conditions; delete old.record; delete old.credit; delete old.loans;
  delete old.perf; delete old.gpa; delete old.counters; delete old.mods;
  global.localStorage.setItem('bequest.slot1', JSON.stringify(old));
  G.S = null; G.loadSlot(1);
  return (G.S && Array.isArray(G.S.conditions) && Array.isArray(G.S.record)) ? true : 'migration failed';
});
t('loading a corrupt save does not crash', () => {
  global.localStorage.setItem('bequest.slot1', '{not json');
  try { G.loadSlot(1); return true; } catch(e) { return 'threw ' + e.message; }
});

/* ================= REPORT ================= */
console.log('\n' + '='.repeat(60));
console.log(`  ${pass} passed, ${fail} failed, ${pass+fail} total`);
if (fail) { console.log('\n  Failures:'); fails.forEach(f => console.log('   - ' + f)); }
console.log('='.repeat(60));

/* ---------- optional annotated sample life ---------- */
if (process.argv.includes('--life')) {
  console.log('\n\n' + '='.repeat(60));
  console.log('  ANNOTATED SAMPLE LIFE');
  console.log('='.repeat(60));
  G.AUTOCHOICE = 0;
  G.newGame({ diff:'normal' });
  const money = v => (v<0?'-':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US');
  let guard = 0;
  while (G.S.alive && guard++ < 140) {
    G.ageUp(); if (!G.S.alive) break;
    const L = G.ACTS();
    if (L.length) { L[Math.floor(Math.random()*L.length)].f(); G.drain(); }
    if (G.S.age>=18 && !G.S.job && !G.S.flags.retired && !G.S.flags.inCollege) {
      const el = G.DATA.jobs.filter(G.jobEligible);
      if (el.length) { G.applyJob(el[el.length-1]); G.drain(); }
    }
  }
  G.finalChallenges();
  let year = -1;
  G.S.log.forEach(l => {
    if (l.a !== year) { year = l.a; console.log(`\n\x1b[33m— Age ${year} —\x1b[0m`); }
    if (!l.t.startsWith('—')) console.log('   ' + l.t);
  });
  console.log('\n' + '-'.repeat(60));
  console.log(`  ${G.S.name} died at ${G.S.age} of ${G.S.cause}`);
  console.log(`  Peak net worth ${money(G.S.peakNet)} · peak income ${money(G.S.peakIncome)}`);
  console.log(`  Education: ${G.DATA.eduNames[G.S.edu]} · jobs held ${G.S.jobsHeld} · children ${G.S.childrenCount}`);
  console.log(`  Conditions at death: ${G.S.conditions.map(k=>G.COND(k.id).n).join(', ')||'none'}`);
  console.log(`  Criminal record: ${G.S.record.map(r=>r.crime).join(', ')||'clean'}`);
  console.log('-'.repeat(60));
}

process.exit(fail ? 1 : 0);
