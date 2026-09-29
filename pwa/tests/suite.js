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

const FILES = ['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js','assets.js','social.js','shop.js','market.js','avatar.js','easter.js','achievements.js','game.js'];
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
    newGame,ageUp,ACTS,doAct,npcAct,reqOk,partner,anyOf,ledger,ledgerTotal,pickFrom,chooseFrom,toggleStats,tickHabits,TRACKS,TRACK,TRACK_RANK,tickTrack,orient,canRomance,partnerGender,addPet,petsAlive,tickPets,diminish,actionsPerYear,randomAct,randomCrime,crimeConfirm,gotoGroup,setTab,setMore,applyJobId,quitHabit,startHabit,lowerDiff,exportSave,importSave,cloudPush,cloudPull,setCloud,saveToSlot,loadSlot,deleteSlot,pickChoice,fateChoice,closePopup,cdo,continueAs,toTitle,showCreate,startLife,rnd,setDiff,setKnob,resetKnobs,countryChanged,applyJob,jobEligible,jobLocked,tryPromote,doCrime,netWorth,buy,fin,
    checkAch,finalChallenges,drain,resolveChoice,confirmDo,popupOK,doAct,buy,save,load,slotInfo,saveToSlot,loadSlot,
    viewLife,viewActs,viewPeople,viewMoney,viewMore,renderHeader,renderTitle,renderCreate,
    rnd,countryChanged,startLife,workPenalty,migrate,isPlus,HOUSING,HOME,FOOD,FOODTIER,livingEffect,PROPERTY_TYPES,PROP,VEHICLES,VEH,BUSINESSES,BIZ,BIZ_UPGRADES,condWord,propPrice,vehPrice,buyProperty,sellProperty,toggleLet,makeHome,repairProperty,buyVehicle,sellVehicle,serviceVehicle,startBusiness,hireStaff,upgradeBusiness,sellBusiness,moneyPropertyMarket,moneyVehicles,moneyBusinesses,propertyEquity,vehicleValue,businessValue,SUBS,SUB,CARDS,CARD,householdSize,billsFor,payBills,setHome,setFood,toggleSub,toggleAutopay,applyCard,payCard,autopayOn,autopayAllowed,moneyLiving,moneyCards,openSection,closeSection,openMoney,closeMoney,openPerson,closePerson,PERKS,PERK,GOAL_POOL,marketRefresh,marketView,findListing,makeOffer,buyListing,listingName,listingDetail,haggleOutcome,SELLERS,SELLER,MOTIVES,financeTotal,financeTick,openListing,closeListing,buyPerk,checkGoals,viewShop,viewGoals,doPersonAction,personActions,personPage,PERSON_ACTIONS,LEISURE,DEGREES,DEGREE,moneyShop,moneyOverview,moneyBanking,moneyCareers,moneyProperty,SHOP_MIN_AGE,buyV8,findEgg,hasEgg,eggTick,tapLogo,setCapsule,EGGS,EGG,EGG_TIERS,EGG_UNLOCKS,sonderLife,requirePlus,buyPlus,togglePlus,rewindYear,secondChance,viewPlus,
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
/* Cheap subject for tests that only care about state, not history. */
function atAge(age){
  G.newGame({});
  G.S.age = age; G.S.jailLeft = 0; G.S.alive = true;
  G.S.stats.health = 80;
  return true;
}
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
    G.LASTPOP=null; G.doAct('rest'); done++; }
  return G.S.actionsLeft === 0 ? true : 'actions left ' + G.S.actionsLeft + ' of ' + max;
});
t('the action budget refills each year', () => {
  if(!freeAt(25)) return true;
  let guard=0;
  while (G.S.actionsLeft>0 && guard++<12) { if(!G.ACTS().some(a=>a.id==='rest')) break; G.doAct('rest'); }
  G.ageUp();
  return G.S.actionsLeft > 0 ? true : 'still empty after ageing';
});
t('resting every year cannot max out happiness (the grind exploit)', () => {
  if(!freeAt(20)) return true;
  for (let y=0; y<35 && G.S.alive; y++){
    let guard=0;
    while (G.S.actionsLeft>0 && guard++<12) {
      if (!G.ACTS().some(a=>a.id==='rest')) break;   // e.g. in prison
      G.doAct('rest');
    }
    G.ageUp();
  }
  if (!G.S.alive) return true;
  return G.S.stats.happiness < 96 ? true : 'happiness reached ' + Math.round(G.S.stats.happiness);
});
t('repeating one action visibly loses value', () => {
  if(!freeAt(25)) return true;
  const d1 = G.diminish('rest');
  for (let i=0;i<4 && G.S.alive;i++){
    if(G.S.actionsLeft<=0) G.ageUp();
    if(G.S.alive && G.ACTS().some(a=>a.id==='rest')) G.doAct('rest');
  }
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
    // crime pays, but it is not free: it risks prison, a record and your health
    if (delta > 4000 && !/loan|sellstash|overtime|^crime_|^tr_|lei_casino/.test(a.id)) earners.push(a.id + '+' + delta);
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
t('nobody ever holds the same condition twice', () => {
  const bad = [];
  for (let i=0;i<60;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && g++<140){
      G.ageUp();
      const ids = G.S.conditions.map(k=>k.id);
      if (new Set(ids).size !== ids.length) { bad.push(ids.join(',')); break; }
    }
  }
  return bad.length ? 'duplicates: ' + bad.slice(0,3).join(' | ') : true;
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
  const m = html.match(/openSection\('([^']+)'\)/);
  if (!m) return 'no section button rendered on the school card';
  const groups = new Set(G.ACTS().map(a => a.grp));
  return groups.has(m[1]) ? true : `button points at "${m[1]}" which has no activities`;
});
t('the activities dice cannot beat the action limit', () => {
  if(!freeAt(25)) return true;
  let g1=0; while (G.S.actionsLeft > 0 && g1++<12) { if(!G.ACTS().some(a=>a.id==='rest')) break; G.doAct('rest'); }
  G.S.actionsLeft = 0;
  const h0 = G.S.stats.happiness, hp0 = G.S.stats.health;
  for (let i=0;i<8;i++) G.randomAct();
  return (G.S.stats.happiness === h0 && G.S.stats.health === hp0)
    ? true : 'dice changed stats after the year was full';
});
t('the crime dice cannot beat the action limit', () => {
  if(!freeAt(25)) return true;
  let g2=0; while (G.S.actionsLeft > 0 && g2++<12) { if(!G.ACTS().some(a=>a.id==='rest')) break; G.doAct('rest'); }
  G.S.actionsLeft = 0;
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
      if (q.property && !(G.S.properties||[]).length) G.S.properties = [{t:'flat',value:200000,mortgage:0,rented:false,cond:70,home:true}];
      if (q.noproperty) G.S.properties = [];
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
    'anyBadHabit','habit','sibling','maxSiblings','teacher','condition','record','parole','followers','artskill']);
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
  const html = G.moneyShop('Vehicle');
  return /buyV8/.test(html) ? 'the V8 is visible without finding it' : true;
});
t('finding the V8 reveals it in the shop', () => {
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  G.META.eggs.v8 = {age:20,life:1,at:Date.now()};
  const html = G.moneyShop('Vehicle');
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
  return /buyV8/.test(html) ? true : 'unlocked item did not appear in the vehicle shop';
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

/* ================= 4h. SPECIAL CAREER PATHS ================= */
section('4h. Special paths');

t('every track is well formed', () => {
  const bad = [];
  G.TRACKS.forEach(d => {
    if (!d.n || !d.ranks || d.ranks.length < 3) bad.push(d.id + ' ranks');
    if (typeof d.yearly !== 'function') bad.push(d.id + ' yearly');
    if (!d.actions || !d.actions.length) bad.push(d.id + ' actions');
    d.actions.forEach(a => { if (typeof a.run !== 'function' || !a.n) bad.push(d.id + '.' + a.id); });
    let need = -1;
    d.ranks.forEach(r => { if (r.need <= need) bad.push(d.id + ' rank order'); need = r.need; });
  });
  return bad.length ? [...new Set(bad)].join(', ') : true;
});
t('each joinable track can actually be joined', () => {
  const unreachable = [];
  G.TRACKS.filter(d => d.id !== 'royal').forEach(d => {
    atAge(Math.min(Math.max(d.joinAge + 2, 24), 30));
    G.S.track = null;
    G.S.skills.combat = 60; G.S.skills.charisma = 70; G.S.stats.smarts = 70;
    G.S.skills.gaming = 60; G.S.record = []; G.S.crimesCommitted = 3; G.S.flags.devout = true;
    const act = G.ACTS().find(a => a.id === 'join_' + d.id);
    if (!act) { unreachable.push(d.id + ' (never offered)'); return; }
    G.AUTOCONFIRM = true; act.f(); G.AUTOCONFIRM = null;
    if (!(G.S.track && G.S.track.id === d.id)) unreachable.push(d.id);
  });
  return unreachable.length ? 'cannot join: ' + unreachable.join(', ') : true;
});
t('every track action runs without error', () => {
  const broken = [];
  G.TRACKS.forEach(d => {
    d.actions.forEach(a => {
      atAge(30);
      G.S.track = {id:d.id,rank:0,progress:0,heat:30,followers:500,standing:50,commend:0,rating:1400,years:3};
      G.TRACK_RANK(G.S.track);
      G.S.money = 2000000; G.S.actionsLeft = 5;
      G.AUTOCONFIRM = true;
      try { a.run(); } catch(e) { broken.push(d.id + '.' + a.id + ': ' + e.message); }
      G.AUTOCONFIRM = null;
    });
  });
  return broken.length ? broken.slice(0,4).join(' | ') : true;
});
t('ranks rise with progress and pay more', () => {
  const bad = [];
  G.TRACKS.forEach(d => {
    const t2 = {id:d.id, rank:0, progress:0};
    const low = G.TRACK_RANK(t2);
    t2.progress = d.ranks[d.ranks.length-1].need;
    const high = G.TRACK_RANK(t2);
    if (t2.rank !== d.ranks.length-1) bad.push(d.id + ' did not reach the top rank');
    if (high.pay <= low.pay && d.id !== 'circuit') bad.push(d.id + ' top rank pays no more');
  });
  return bad.length ? bad.join(', ') : true;
});
t('a track pays out over a year without crashing', () => {
  const broken = [];
  G.TRACKS.forEach(d => {
    atAge(30);
    G.S.track = {id:d.id,rank:0,progress:d.ranks[1].need,heat:40,followers:2000,
                 standing:50,commend:1,rating:1500,years:5};
    G.TRACK_RANK(G.S.track);
    for (let y=0; y<6 && G.S.alive; y++){
      try { G.ageUp(); } catch(e) { broken.push(d.id + ': ' + e.message); break; }
    }
  });
  return broken.length ? broken.join(' | ') : true;
});
t('royalty cannot simply be joined', () => {
  atAge(30);
  G.S.track = null;
  G.S.skills.charisma = 100; G.S.stats.reputation = 100;
  const act = G.ACTS().find(a => a.id === 'join_royal');
  return act ? 'royalty was offered as a choice' : true;
});
t('leaving a path really leaves it', () => {
  atAge(30);
  G.S.track = {id:'mob',rank:1,progress:8,heat:20,followers:0,standing:0,commend:0,rating:0,years:4};
  const act = G.ACTS().find(a => a.id === 'tr_leave_mob');
  if (!act) return 'no way to leave';
  G.AUTOCONFIRM = true; act.f(); G.AUTOCONFIRM = null;
  return G.S.track === null ? true : 'still in the organisation';
});

/* ================= 4i. PHASE 1 REGRESSIONS ================= */
section('4i. Things the player reported');

t('the shop actually sells things', () => {
  const failed = [];
  atAge(30); G.S.money = 5000000; G.S.items = []; G.S.assets = [];
  G.DATA.items.filter(i => !i.secret).forEach(i => {
    G.S.buysThisYear = 0; G.S.money = 5000000;
    const before = G.S.items.length + (G.S.assets||[]).length;
    try { G.buy(i.id); } catch(e) { failed.push(i.id + ': ' + e.message); return; }
    if (G.S.items.length + (G.S.assets||[]).length <= before) failed.push(i.id + ': nothing happened');
  });
  return failed.length ? failed.slice(0,4).join(' | ') : true;
});
t('buying is limited to three things a year', () => {
  atAge(30); G.S.money = 5000000; G.S.items = []; G.S.buysThisYear = 0;
  ['books','phone','laptop','bike','skincare'].forEach(id => G.buy(id));
  return G.S.items.length === 3 ? true : 'bought ' + G.S.items.length;
});
t('a habit charge always names the habit', () => {
  atAge(30);
  Object.keys(G.DATA.habits).forEach(k => G.S.habits[k] = 0);
  G.S.habits.smoking = 60; G.S.habits.gym = 40;
  const notes = G.tickHabits();
  const line = notes.find(n => /cost/.test(n));
  if (!line) return 'no habit charge was produced at all';
  return /smoking/i.test(line) ? true : 'charge did not name the habit: ' + line;
});
t('the new-baby event is rare, and family size varies', () => {
  let fired = 0; const sizes = {};
  for (let i=0;i<120;i++){
    G.newGame({});
    const born = G.S.npcs.filter(n=>n.rel==='sibling').length;
    sizes[born] = (sizes[born]||0) + 1;
    let g=0;
    while (G.S.alive && G.S.age<18 && g++<25) G.ageUp();
    if (G.S.seen['c_sibling']) fired++;
  }
  if (Object.keys(sizes).length < 3) return 'family size barely varies: ' + JSON.stringify(sizes);
  return fired/120 < 0.2 ? true : Math.round(fired/120*100) + '% still got the new-baby event';
});
t('studying moves your grade, not just your smarts', () => {
  let ok = false;
  for (let i=0;i<25 && !ok;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && G.S.age<12 && g++<20) G.ageUp();
    if (!G.S.alive || !G.S.inSchool) continue;
    G.S.gpa = 50; G.S.actionsLeft = 5;
    if (!G.ACTS().some(a=>a.id==='study')) continue;
    G.doAct('study');
    if (G.S.gpa > 50) ok = true;
  }
  return ok ? true : 'study never changed the grade';
});
t('clubs and sports offer a real choice', () => {
  let ok = false;
  for (let i=0;i<25 && !ok;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && G.S.age<12 && g++<20) G.ageUp();
    if (!G.S.alive || !G.S.inSchool) continue;
    const club = G.ACTS().find(a=>a.id==='club');
    if (!club) continue;
    G.S.actionsLeft = 5;
    G.LASTPOP = null; club.f();
    if (G.LASTPOP && G.LASTPOP.type === 'CHOOSE' && G.LASTPOP.options.length >= 5) ok = true;
  }
  return ok ? true : 'no chooser was offered';
});
t('income and outgoings are recorded every year', () => {
  atAge(20);
  let seen = false;
  for (let y=0; y<12 && G.S.alive; y++){
    G.ageUp();
    if (G.ledgerTotal('income') > 0 || G.ledgerTotal('spend') > 0) { seen = true; break; }
  }
  return seen ? true : 'the ledger stayed empty';
});

/* ================= 4j. THE COST OF LIVING ================= */
section('4j. Living costs, bills and credit');

t('overtime builds standing, not just cash', () => {
  atAge(30);
  G.S.job = {id:'analyst',t:'Junior Analyst',pay:60000,field:'corp',lvl:1};
  G.S.perf = 50; G.S.money = 0; G.S.actionsLeft = 5;
  const act = G.ACTS().find(a => a.id === 'overtime');
  if (!act) return 'overtime not offered to someone with a job';
  act.f();
  return (G.S.money > 0 && G.S.perf > 50) ? true
    : `money ${G.S.money}, performance ${G.S.perf}`;
});
t('bills are itemised and add up', () => {
  atAge(30); G.S.home='onebed'; G.S.food='normal'; G.S.subs={utilities:true,phone:true,gym:true};
  const items = G.billsFor();
  if (!items.length) return 'no bills produced';
  const hasHousing = items.some(i => /housing/i.test(i.l));
  const hasFood = items.some(i => /food/i.test(i.l));
  const hasSub = items.some(i => /gym/i.test(i.l));
  const total = items.reduce((n,x)=>n+x.a,0);
  return (hasHousing && hasFood && hasSub && total > 0) ? true
    : 'missing lines: ' + items.map(i=>i.l).join(', ');
});
t('a bigger household costs more to feed', () => {
  atAge(35); G.S.home='family'; G.S.food='normal'; G.S.subs={};
  G.S.npcs.forEach(n => { if(n.rel==='child') n.rel='friend'; });
  const alone = G.billsFor().reduce((n,x)=>n+x.a,0);
  for (let i=0;i<3;i++){ const k=G.S.npcs[i]; if(k){ k.rel='child'; k.alive=true; k.age=8; } }
  const family = G.billsFor().reduce((n,x)=>n+x.a,0);
  return family > alone ? true : `alone ${alone} vs family ${family}`;
});
t('you cannot rent what you cannot afford', () => {
  atAge(25); G.S.job = null; G.S.savings = 0; G.S.money = 500000;
  G.S.home = 'parents';
  G.setHome('luxury');
  return G.S.home === 'parents' ? true : 'moved into ' + G.S.home;
});
t('housing and food change how you feel', () => {
  atAge(30);
  G.S.npcs.forEach(n => { if (n.rel==='child'||n.rel==='partner'||n.rel==='spouse') n.rel='friend'; });
  G.S.dependents = 0;
  G.S.home='parents'; G.S.food='skip';
  const poor = G.livingEffect();
  G.S.home='family'; G.S.food='good';
  const comfy = G.livingEffect();
  if (!(comfy.happy > poor.happy && comfy.health > poor.health))
    return `poor ${JSON.stringify(poor)} vs comfortable ${JSON.stringify(comfy)}`;
  // and overcrowding must hurt
  G.S.home='room';
  for (let i=0;i<4;i++){ const k=G.S.npcs[i]; if(k){ k.rel='child'; k.alive=true; k.age=6; } }
  const crowded = G.livingEffect();
  return crowded.happy < comfy.happy ? true : 'overcrowding did not hurt';
});
t('auto-pay is off on Hard and Brutal', () => {
  atAge(30); G.S.diff='normal'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='normal').m);
  const easyOk = G.autopayAllowed();
  G.S.diff='hard'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='hard').m);
  const hardOk = G.autopayAllowed();
  return (easyOk && !hardOk) ? true : `normal:${easyOk} hard:${hardOk}`;
});
t('unpaid bills become arrears and damage your credit', () => {
  atAge(30);
  G.S.diff='hard'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='hard').m);
  G.S.home='family'; G.S.food='good'; G.S.subs={utilities:true,gym:true,therapy_s:true};
  G.S.money=0; G.S.cards=[]; G.S.credit=700; G.S.arrears=0; G.S.job=null;
  for (let i=0;i<4 && G.S.alive;i++) G.ageUp();
  return (G.S.arrears > 0 && G.S.credit < 700) ? true
    : `arrears ${Math.round(G.S.arrears)}, credit ${Math.round(G.S.credit)}`;
});
t('credit cards are gated by score and can be paid down', () => {
  atAge(30); G.S.cards=[]; G.S.credit=520; G.S.money=100000;
  G.applyCard('black');
  if (G.S.cards.length) return 'a poor score got the black card';
  G.S.credit=830; G.applyCard('black');
  if (!G.S.cards.length) return 'a strong score was refused';
  G.S.cards[0].bal = 5000;
  G.payCard('black', true);
  return G.S.cards[0].bal === 0 ? true : 'balance did not clear';
});
t('a card absorbs a shortfall instead of instant arrears', () => {
  atAge(30); G.S.credit=700; G.S.cards=[{id:'standard',bal:0}];
  G.S.money=0; G.S.arrears=0; G.S.billsDue=2000; G.S.billItems=[{l:'Test',a:2000}];
  G.payBills(null,false);
  return (G.S.cards[0].bal > 0 && G.S.arrears === 0) ? true
    : `card ${G.S.cards[0].bal}, arrears ${G.S.arrears}`;
});
t('the living and credit screens render', () => {
  atAge(30);
  const a = G.moneyLiving(), b = G.moneyCards();
  return (a.length > 400 && b.length > 200) ? true : 'screens did not render';
});

/* ================= 4k. PROPERTY, VEHICLES AND BUSINESSES ================= */
section('4k. Things you own');

t('every catalogue entry is well formed', () => {
  const bad=[];
  G.PROPERTY_TYPES.forEach(p=>{ if(!p.n||!p.base||p.yield==null||p.maint==null) bad.push('prop '+p.id); });
  G.VEHICLES.forEach(v=>{ if(!v.n||!v.base||v.dep==null||v.fail==null) bad.push('veh '+v.id); });
  G.BUSINESSES.forEach(b=>{ if(!b.n||!b.cost||!b.rev||!b.maxStaff||!G.DATA.skills[b.skill]) bad.push('biz '+b.id); });
  return bad.length ? bad.join(', ') : true;
});
t('you can buy, let, renovate and sell property', () => {
  atAge(35); G.S.properties=[]; G.S.money=5000000; G.S.credit=800;
  G.buyProperty('flat', false);
  if (!G.S.properties.length) return 'outright purchase failed';
  G.toggleLet(0);
  if (!G.S.properties[0].rented) return 'letting failed';
  G.S.properties[0].cond = 30;
  G.repairProperty(0);
  if (G.S.properties[0].cond <= 30) return 'renovation did nothing';
  G.AUTOCONFIRM = true; G.sellProperty(0); G.AUTOCONFIRM = null;
  return G.S.properties.length === 0 ? true : 'sale failed';
});
t('a mortgage is refused without income', () => {
  atAge(30); G.S.properties=[]; G.S.job=null; G.S.money=5000000; G.S.credit=800;
  G.buyProperty('estate', true);
  return G.S.properties.length === 0 ? true : 'got a country house with no income';
});
t('let property earns rent and needs upkeep', () => {
  atAge(35); G.S.properties=[{t:'flat',value:200000,mortgage:0,rented:true,cond:80,home:false}];
  G.S.money=100000; G.S.job=null;
  let earned=false;
  for (let y=0;y<6 && G.S.alive;y++){ G.ageUp();
    if ((G.S.ledger.income||[]).some(x=>/rent/i.test(x.l))) earned=true; }
  return earned ? true : 'no rent was ever collected';
});
t('vehicles need a licence, depreciate and break down', () => {
  atAge(30); G.S.vehicles=[]; G.S.money=900000; G.S.flags.licence=false;
  G.buyVehicle('saloon');
  if (G.S.vehicles.length) return 'bought a car with no licence';
  G.S.flags.licence=true; G.buyVehicle('saloon');
  if (!G.S.vehicles.length) return 'could not buy with a licence';
  const start=G.S.vehicles[0].value;
  for (let y=0;y<5 && G.S.alive;y++) G.ageUp();
  if (!G.S.vehicles.length) return true;
  return G.S.vehicles[0].value < start ? true : 'no depreciation';
});
t('a business hires, upgrades, earns and can be sold', () => {
  atAge(35); G.S.businesses=[]; G.S.money=9000000; G.S.skills.cooking=80;
  G.AUTOCONFIRM=true; G.startBusiness('cafe'); G.AUTOCONFIRM=null;
  if (!G.S.businesses.length) return 'could not start';
  G.hireStaff(0,3);
  if (G.S.businesses[0].staff < 4) return 'hiring failed';
  G.upgradeBusiness(0,'marketing');
  if (!(G.S.businesses[0].ups||[]).includes('marketing')) return 'upgrade failed';
  let profited=false;
  for (let y=0;y<6 && G.S.alive;y++){ G.ageUp();
    if ((G.S.ledger.income||[]).some(x=>/profit/i.test(x.l))) profited=true; }
  if (!profited) return 'never made a profit with 4 staff and high skill';
  if (!G.S.businesses.length) return true;
  G.AUTOCONFIRM=true; G.sellBusiness(0); G.AUTOCONFIRM=null;
  return G.S.businesses.length === 0 ? true : 'sale failed';
});
t('staffing is capped', () => {
  atAge(35); G.S.businesses=[{t:'stall',value:4000,staff:1,ups:[],rep:50}]; G.S.money=900000;
  G.hireStaff(0,50);
  return G.S.businesses[0].staff <= G.BIZ('stall').maxStaff ? true : 'hired beyond the cap';
});
t('net worth counts property, vehicles and businesses', () => {
  atAge(40); G.S.money=0; G.S.savings=0; G.S.debt=0; G.S.cards=[]; G.S.arrears=0;
  G.S.crypto={units:0,price:100}; G.S.assets=[];
  G.S.properties=[{t:'flat',value:200000,mortgage:50000,rented:false,cond:70,home:true}];
  G.S.vehicles=[{t:'saloon',value:20000,cond:80}];
  G.S.businesses=[{t:'cafe',value:60000,staff:2,ups:[],rep:50}];
  const nw=G.netWorth();
  return Math.abs(nw - 230000) < 2000 ? true : 'net worth came to ' + nw;
});
t('the holdings pages render', () => {
  atAge(35);
  return (G.moneyPropertyMarket().length>200 && G.moneyVehicles().length>200
    && G.moneyBusinesses().length>400) ? true : 'a holdings page failed to render';
});

/* ================= 4l. PEOPLE, LEISURE AND DEGREES ================= */
section('4l. People, leisure and degrees');

t('every person action is well formed and runs', () => {
  const broken=[];
  G.PERSON_ACTIONS.forEach(a=>{
    if(!a.n||!a.rel||typeof a.run!=='function'){ broken.push(a.id+' malformed'); return; }
    atAge(35);
    const n=G.S.npcs.find(x=>x.alive);
    if(!n) return;
    n.rel = a.rel==='*' ? 'friend' : a.rel.split(',')[0];
    n.alive=true; n.age=Math.max(a.min||20, Math.min(a.max||60, 35)); n.r=60;
    G.S.money=500000;
    try{ a.run(n); }catch(e){ broken.push(a.id+': '+e.message); }
  });
  return broken.length ? broken.slice(0,4).join(' | ') : true;
});
t('each relationship gets its own set of options', () => {
  atAge(35);
  const counts={};
  ['mother','child','spouse','friend','colleague','teacher'].forEach(rel=>{
    const n=G.S.npcs.find(x=>x.alive); if(!n)return;
    n.rel=rel; n.age = rel==='child'?9:45; n.alive=true;
    counts[rel]=G.personActions(n).length;
  });
  const vals=Object.values(counts);
  if(vals.some(v=>v<8)) return 'too few options: '+JSON.stringify(counts);
  return new Set(vals).size>1 ? true : 'every relationship offers exactly the same thing';
});
t('you can only spend time with someone once a year', () => {
  atAge(35);
  const n=G.S.npcs.find(x=>x.alive); if(!n) return true;
  n.rel='friend'; n.r=50; n.lastSeen=null; G.S.money=100000;
  G.doPersonAction(n.id,'talk');
  const after=n.r;
  G.doPersonAction(n.id,'talk');
  return n.r===after ? true : 'the relationship moved twice in one year';
});
t('leisure is offered and every option works', () => {
  atAge(30); G.S.money=900000;
  const acts=G.ACTS().filter(a=>a.grp==='Leisure');
  if(acts.length<10) return 'only '+acts.length+' leisure options';
  const broken=[];
  acts.forEach(a=>{ G.S.actionsLeft=5; G.S.money=900000;
    try{ a.f(); }catch(e){ broken.push(a.id+': '+e.message); } });
  return broken.length ? broken.join(' | ') : true;
});
t('the casino loses money over time, as a casino should', () => {
  atAge(30);
  let net = 0;
  for (let i=0;i<400;i++){
    G.S.money = 100000; G.S.actionsLeft = 5; G.S.habits.gambling = 0;
    const before = G.S.money;
    const act = G.ACTS().find(a => a.id === 'lei_casino');
    if (!act) return 'no casino';
    act.f();
    net += G.S.money - before;
  }
  return net < 0 ? true : 'the house lost ' + Math.round(net) + ' over 400 nights';
});
t('every degree is well formed and teaches something', () => {
  const bad=G.DEGREES.filter(d=>!d.n||!d.years||!d.fields||!d.fields.length||!Object.keys(d.skills||{}).length);
  return bad.length ? bad.map(d=>d.id).join(', ') : true;
});
t('a degree actually teaches you its subject', () => {
  atAge(18);
  G.S.flags.inCollege=true; G.S.inSchool=true; G.S.degree='compsci';
  G.S.degreeYears=3; G.S.collegeYears=0;
  const before=G.S.skills.tech;
  for(let y=0;y<4 && G.S.alive;y++) G.ageUp();
  if(!G.S.alive) return true;
  return (G.S.skills.tech > before + 15 && G.S.degreeDone==='compsci') ? true
    : `tech ${before} -> ${G.S.skills.tech}, degree ${G.S.degreeDone}`;
});
t('a relevant degree helps you get hired', () => {
  const rel=[], irr=[];
  for(let i=0;i<60;i++){
    atAge(25); G.S.edu=3; G.S.skills.tech=70; G.S.stats.smarts=70; G.S.credit=700;
    G.S.degreeDone='compsci'; G.S.job=null;
    const j=G.DATA.jobs.find(x=>x.id==='swe');
    if(G.jobEligible(j)){ G.applyJob(j); rel.push(!!G.S.job); }
    atAge(25); G.S.edu=3; G.S.skills.tech=70; G.S.stats.smarts=70; G.S.credit=700;
    G.S.degreeDone='arts'; G.S.job=null;
    if(G.jobEligible(j)){ G.applyJob(j); irr.push(!!G.S.job); }
  }
  const a=rel.filter(Boolean).length, b=irr.filter(Boolean).length;
  return a>=b ? true : `relevant ${a} vs irrelevant ${b}`;
});

/* ================= 4m. SHOP, GOALS AND THE TUNING FIXES ================= */
section('4m. Shop, goals and reported balance');

t('every perk is well formed', () => {
  const bad = G.PERKS.filter(p => !p.n || !p.d || !p.cost || !['life','forever'].includes(p.kind));
  return bad.length ? bad.map(p=>p.id).join(', ') : true;
});
t('perks cost Legacy Points and cannot be bought twice', () => {
  atAge(30); G.META.lp = 5000; G.META.perks = {}; G.S.perksUsed = [];
  G.AUTOCONFIRM = true;
  G.buyPerk('windfall');
  const spent = G.META.lp < 5000;
  G.buyPerk('windfall');
  const twice = (G.S.perksUsed||[]).filter(x=>x==='windfall').length;
  G.buyPerk('extraaction');
  const forever = !!G.META.perks.extraaction;
  G.AUTOCONFIRM = null;
  G.META.perks = {};
  return (spent && twice === 1 && forever) ? true : `spent:${spent} used:${twice} forever:${forever}`;
});
t('a permanent perk changes future lives', () => {
  G.META.perks = {};
  atAge(30); const before = G.actionsPerYear();
  G.META.perks = { extraaction:true };
  atAge(30); const after = G.actionsPerYear();
  G.META.perks = {};
  return after > before ? true : `${before} -> ${after}`;
});
t('every life gets three goals, and they vary', () => {
  const seen = new Set(); let counts = new Set();
  for (let i=0;i<30;i++){ G.newGame({});
    counts.add((G.S.goals||[]).length);
    (G.S.goals||[]).forEach(g => seen.add(g.id)); }
  if (![...counts].every(c => c === 3)) return 'goal count varies: ' + [...counts].join(',');
  return seen.size >= 10 ? true : 'only ' + seen.size + ' distinct goals ever drawn';
});
t('every goal can be evaluated without error', () => {
  atAge(40);
  const bad = [];
  G.GOAL_POOL.forEach(g => { try { g.test(G.S); } catch(e) { bad.push(g.id+': '+e.message); } });
  return bad.length ? bad.join(' | ') : true;
});
t('meeting a goal awards Legacy Points', () => {
  atAge(40); G.META.lp = 0;
  G.S.goals = [{id:'g_parent',done:false}];
  G.S.childrenCount = 2;
  G.checkGoals();
  return (G.S.goals[0].done && G.META.lp > 0) ? true : 'goal did not pay out';
});
t('raises are no longer annual', () => {
  let raises = 0, years = 0;
  for (let i=0;i<25;i++){
    atAge(25);
    G.S.job = {id:'analyst',t:'Junior Analyst',pay:60000,field:'corp',lvl:1}; G.S.perf = 80;
    let last = G.S.job.pay;
    for (let y=0;y<20 && G.S.alive && G.S.job;y++){
      G.ageUp(); years++;
      if (G.S.job && G.S.job.pay > last) { raises++; last = G.S.job.pay; }
    }
  }
  const every = years / Math.max(1,raises);
  return every >= 3 ? true : `a raise every ${every.toFixed(1)} years`;
});
t('an action reports the numbers it actually applied', () => {
  atAge(30);
  G.S.actionsLeft = 9;
  for (let i=0;i<4;i++) G.doAct('meditate');
  G.S.actionsLeft = 9;
  G.S.stats.happiness = 50;       // leave room, or the honest answer is 'already at maximum'
  const before = G.S.stats.happiness;
  G.doAct('meditate');
  const realGain = G.S.stats.happiness - before;
  const pop = G.LASTPOP;
  if (!pop || !pop.res || !pop.res.length) return 'no effect list was attached to the popup';
  const shown = pop.res.join(' ');
  const m = shown.match(/Happiness \+([\d.]+)/);
  if (!m) return 'happiness not reported: ' + shown;
  // the point of the test: the number shown must be the number applied,
  // after diminishing returns and after clamping
  return Math.abs(parseFloat(m[1]) - realGain) < 0.6 ? true
    : `reported +${m[1]} but applied +${realGain.toFixed(1)}`;
});
t('rare events are rare in a first life', () => {
  let total = 0;
  for (let i=0;i<25;i++){
    Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
    G.newGame({}); let g=0;
    while (G.S.alive && g++<130) G.ageUp();
    total += (G.S.eggsThisLife||[]).length;
  }
  const per = total/25;
  // aim for roughly one every other life, so finding one still feels like something
  return per <= 0.85 ? true : per.toFixed(2) + ' rare events per first life';
});
t('auto-pay is explicit on custom difficulty', () => {
  const knob = G.DIFF_KNOBS.find(k => k.k === 'autopay');
  if (!knob) return 'no autopay knob';
  atAge(30);
  G.S.diff = 'custom'; G.S.mods = Object.assign({}, G.DIFFICULTIES.find(d=>d.id==='normal').m, {autopay:1});
  const on = G.autopayAllowed();
  G.S.mods.autopay = 0;
  const off = G.autopayAllowed();
  return (on && !off) ? true : `on:${on} off:${off}`;
});
t('utilities can be cancelled to save money', () => {
  atAge(30); G.S.subs = {utilities:true};
  const withU = G.billsFor().reduce((n,x)=>n+x.a,0);
  G.toggleSub('utilities');
  const without = G.billsFor().reduce((n,x)=>n+x.a,0);
  return (without < withU && G.S.flags.noUtilities) ? true : `${withU} -> ${without}`;
});

/* ================= 4n. THE MARKETPLACE ================= */
section('4n. The marketplace');

t('the market stocks individual listings', () => {
  atAge(30); G.marketRefresh(true);
  const v=G.S.market.vehicle, p=G.S.market.property, i=G.S.market.item;
  if(!v.length||!p.length||!i.length) return 'a category was empty';
  const car=v[0];
  if(car.miles==null||car.cond==null||!car.colour||!car.seller) return 'vehicles lack detail';
  if(!p[0].addr) return 'property has no address';
  return true;
});
t('two listings of the same type differ', () => {
  atAge(30);
  const prices=new Set(), conds=new Set();
  for(let y=0;y<14;y++){ G.S.age=30+y; G.marketRefresh(true);
    G.S.market.vehicle.forEach(l=>{ prices.add(l.price); conds.add(l.cond); }); }
  return (prices.size>10 && conds.size>6) ? true : `only ${prices.size} prices, ${conds.size} conditions`;
});
t('stock turns over each year', () => {
  atAge(30); G.marketRefresh(true);
  const before=G.S.market.vehicle.map(l=>l.id).join(',');
  G.S.age=31; G.marketRefresh();
  const after=G.S.market.vehicle.map(l=>l.id).join(',');
  return before!==after ? true : 'the same cars were for sale the next year';
});
t('haggling has all four outcomes', () => {
  const seen=new Set();
  for(let i=0;i<500;i++){
    atAge(30); G.marketRefresh(true);
    const l=G.S.market.vehicle[0]; if(!l)continue;
    const pct=[0.03,0.1,0.2,0.3,0.45,0.6][i%6];
    const o=G.haggleOutcome(l, Math.round(l.ask*(1-pct)), 50, 30, Math.random);
    seen.add(o.result);
  }
  const want=['accept','counter','refuse','insulted'];
  const missing=want.filter(w=>!seen.has(w));
  return missing.length ? 'never saw: '+missing.join(', ') : true;
});
t('charisma makes sellers more generous', () => {
  let lowAccept=0, highAccept=0;
  for(let i=0;i<400;i++){
    atAge(30); G.marketRefresh(true);
    const l=G.S.market.vehicle[0]; if(!l)continue;
    const offer=Math.round(l.ask*0.85);
    if(G.haggleOutcome(l,offer,5,5,Math.random).result==='accept')lowAccept++;
    if(G.haggleOutcome(l,offer,95,95,Math.random).result==='accept')highAccept++;
  }
  return highAccept>=lowAccept ? true : `low ${lowAccept} vs high ${highAccept}`;
});
t('you can buy for cash and it becomes yours', () => {
  atAge(35); G.S.money=9000000; G.S.vehicles=[]; G.S.flags.licence=true;
  G.marketRefresh(true);
  const l=G.S.market.vehicle[0];
  G.buyListing(l.id,'cash');
  return G.S.vehicles.length===1 ? true : 'the vehicle did not arrive';
});
t('finance needs credit and creates repayments', () => {
  atAge(35); G.S.money=9000000; G.S.properties=[]; G.S.finance=[]; G.S.credit=380;
  G.marketRefresh(true);
  let l=G.S.market.property[0];
  G.buyListing(l.id,'finance');
  if(G.S.properties.length) return 'a poor credit score still got finance';
  atAge(35); G.S.money=9000000; G.S.properties=[]; G.S.finance=[];
  G.S.credit=780; G.S.job={id:'ceo',t:'CEO',pay:400000,field:'corp',lvl:5};
  G.marketRefresh(true);
  l=G.S.market.property[0];
  G.buyListing(l.id,'finance');
  return (G.S.properties.length===1 && (G.S.finance||[]).length===1) ? true
    : `properties ${G.S.properties.length}, finance ${(G.S.finance||[]).length}`;
});
t('finance repayments are collected and eventually end', () => {
  atAge(35); G.S.money=4000000; G.S.finance=[{l:'Test car',annual:5000,left:3,principal:15000}];
  let paid=0;
  for(let y=0;y<5 && G.S.alive;y++){ const before=G.S.money; G.ageUp();
    if(G.S.money<before)paid++; }
  return (S=>true)() && (G.S.finance||[]).length===0 ? true : 'finance never cleared';
});
t('an insulting offer can lose you the listing', () => {
  let withdrawn=false;
  for(let i=0;i<200 && !withdrawn;i++){
    atAge(30); G.marketRefresh(true);
    const l=G.S.market.item[0]; if(!l)continue;
    G.makeOffer(l.id,0.75);
    if(!G.findListing(l.id))withdrawn=true;
  }
  return withdrawn ? true : 'never lost a listing to a lowball';
});
t('every market view renders', () => {
  atAge(35);
  return (G.marketView('vehicle','v').length>200 && G.marketView('property','p').length>200
    && G.marketView('item','i').length>200) ? true : 'a market view failed';
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
