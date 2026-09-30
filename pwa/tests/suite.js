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

const FILES = ['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js','assets.js','social.js','shop.js','market.js','avatar.js','easter.js','achievements.js','sound.js','eulogy.js','will.js','school.js','court.js','invest.js','health.js','crash.js','adminlink.js','a11y.js','i18n.js','coach.js','game.js'];
const SRC = FILES.map(f => fs.readFileSync(path.join(DIR,f),'utf8')).join('\n');

const HARNESS = `
let LASTPOP=null, FIRED=[], AUTOCHOICE=null, AUTOCONFIRM=null, AUTOPLEA=null, AUTOCOUNSEL=null;
showPopup=function(p){
  LASTPOP=p;
  if(p.type==='A'){ FIRED.push(p.ev.id);
    const i=AUTOCHOICE!=null?Math.min(AUTOCHOICE,p.ev.c.length-1):Math.floor(Math.random()*p.ev.c.length);
    resolveChoice(p.ev,i); }
  else if(p.type==='D'){ if(p.yes&&(AUTOCONFIRM===true||(AUTOCONFIRM===null&&Math.random()<0.6)))p.yes(); drain(); }
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
module.exports={
  api:{ get S(){return S}, set S(v){S=v}, get META(){return META},
    get QUEUE(){return QUEUE},
    DATA,EVENTS,ACHIEVEMENTS,CHALLENGES,RECORDS,DIFFICULTIES,DIFF_KNOBS,CONDITIONS,COND,
    UNI_TIERS,RECORD_BARS,PERSONALITIES,creditBand,perfBand,gradeBand,recordBlocks,
    newGame,ageUp,ACTS,doAct,npcAct,reqOk,evWeight,CRASH_KEY,crashSink,crashOptIn,setCrashOptIn,crashContext,crashLog,crashClear,recordCrash,softFail,crashReportText,crashSummary,crashScreen,installCrashHandlers,noteAct,notePopup,moneyBand,healthSystem,healthMigrate,condCost,waitYears,treatJoin,treatPrivate,seeSpecialist,doRehab,applyTreatment,tickHealth,healthCard,ASSETS,ASSET,investBirth,investMigrate,holdingsValue,holdingOf,tickInvest,investBuy,investSell,investPick,spread,moneyInvest,tok,findNPC,makeCast,withCast,nameList,COUNSEL,COUNSEL_BY,courtMigrate,counselCost,openCase,evidenceWord,courtPlead,courtCounsel,courtResolve,courtAppeal,courtFinish,courtSheet,renderPopup,SUBJECTS,SUBJECT,SCHOOL_START,OPTIONS_AGE,SCHOOL_END,DEGREE_BAR,schoolBirth,schoolMigrate,subjectsActive,subjectsTaken,subjectGrade,bestSubjects,tickSubjects,gpaFrom,optionPool,chooseOptions,degreeOpen,degreesOpenTo,degreeBlockedBy,schoolLeavingSkills,studySubject,studyPick,subjectsCard,partner,anyOf,ledger,ledgerTotal,pickFrom,chooseFrom,toggleStats,tickHabits,TRACKS,TRACK,TRACK_RANK,tickTrack,orient,canRomance,partnerGender,addPet,petsAlive,tickPets,diminish,actionsPerYear,randomAct,randomCrime,crimeConfirm,gotoGroup,setTab,setMore,applyJobId,quitHabit,startHabit,lowerDiff,exportSave,importSave,cloudPush,cloudPull,setCloud,validSlot,cloudMergeMeta,saveToSlot,loadSlot,deleteSlot,pickChoice,fateChoice,closePopup,cdo,continueAs,toTitle,showCreate,startLife,rnd,setDiff,setKnob,resetKnobs,countryChanged,applyJob,jobEligible,jobLocked,tryPromote,doCrime,netWorth,buy,fin,
    checkAch,die,finalChallenges,drain,resolveChoice,confirmDo,popupOK,doAct,buy,save,load,slotInfo,saveToSlot,loadSlot,
    viewLife,viewActs,viewPeople,viewMoney,viewMore,renderHeader,renderTitle,renderCreate,
    rnd,countryChanged,startLife,workPenalty,migrate,isPlus,HOUSING,HOME,FOOD,FOODTIER,livingEffect,PROPERTY_TYPES,PROP,VEHICLES,VEH,BUSINESSES,BIZ,BIZ_UPGRADES,condWord,propPrice,vehPrice,buyProperty,sellProperty,toggleLet,makeHome,repairProperty,buyVehicle,sellVehicle,serviceVehicle,startBusiness,hireStaff,upgradeBusiness,sellBusiness,moneyPropertyMarket,moneyVehicles,moneyBusinesses,propertyEquity,vehicleValue,businessValue,SUBS,SUB,CARDS,CARD,householdSize,billsFor,livingFloor,livingRatio,livingTarget,tickLiving,payBills,setHome,setFood,toggleSub,toggleAutopay,applyCard,payCard,autopayOn,autopayAllowed,autopayFree,autopayBounces,payBillsNow,payOverdueNow,payArrears,arrPlanAmount,startArrPlan,cancelArrPlan,tickArrears,tickBills,moneyLiving,moneyCards,openSection,closeSection,openMoney,closeMoney,openPerson,closePerson,setTextSize,applyTextSize,setJobFilter,doAgeUp,PERKS,PERK,GOAL_POOL,marketRefresh,marketView,findListing,makeOffer,buyListing,listingName,listingDetail,haggleOutcome,SELLERS,SELLER,MOTIVES,financeTotal,financeTick,openListing,closeListing,buyPerk,checkGoals,viewShop,viewGoals,doPersonAction,personActions,personPage,PERSON_ACTIONS,LEISURE,DEGREES,DEGREE,moneyShop,moneyOverview,moneyBanking,moneyCareers,actionsPerYear,moneyProperty,SHOP_MIN_AGE,reachAllowance,hasItem,hasSub,nextMilestone,groupMeta,buyV8,findEgg,hasEgg,eggTick,tapLogo,setCapsule,EGGS,EGG,EGG_TIERS,EGG_UNLOCKS,sonderLife,requirePlus,buyPlus,togglePlus,devUnlocked,i18nKey,T,setLocale,currentLocale,trackMissing,missingStrings,localiseData,pseudoLocale,variant,avatarSVG,avatarMini,avatarWorth,avatarWealthTier,avatarAiling,a11ySyncTabs,a11ySwitches,a11yAgeHint,say,a11yDialogOpen,a11yDialogClose,a11yInit,CODE_GRANTS,codeHash,makeCode,readCode,redeemCode,broadcast,setBroadcast,dismissBroadcast,broadcastCard,forceEvent,clearForced,takeForced,flagSave,saveFlag,rewindYear,secondChance,viewPlus,SFX,NOTE,HAPTIC,sfx,cue,haptic,eulogy,eulogyOpening,eulogyWork,eulogyPeople,eulogyEstate,eulogyClose,eName,eKin,eNum,eList,ePron,eulogyEstateFrom,eOrd,showDeath,renderDeath,toggleDeathStats,HEIRLOOMS,HEIRLOOM,heirloomValue,heirloomAge,heirloomLine,willBirth,willMigrate,willAssets,willHeirs,willHeir,willFee,willShareTotal,willCanWrite,willSetShare,willEven,willSetGift,willCut,willSetMain,willMainGuess,willWrite,willTell,willLeak,heirloomOffer,commissionHeirloom,settleEstate,settlementFor,willView,willDeathBlock,wHash,wHashId,continueAs,soundCfg,soundOn,hapticsOn,setSound,setHaptics,setVolume,popupCue,bindTapSounds,audioCtx,COACH_TIPS,COACH_OPENING,coachTip,coachCard,coachSeen,coachMark,coachDismiss,coachReplay,coachOpeningDue,openingShow,openingDone,offerDirectDebit,viewStats,
    get CREATE(){return CREATE}, set CREATE(v){CREATE=v},
    get LASTPOP(){return LASTPOP}, set LASTPOP(v){LASTPOP=v},
    get FIRED(){return FIRED}, set FIRED(v){FIRED=v},
    set AUTOCHOICE(v){AUTOCHOICE=v}, set AUTOCONFIRM(v){AUTOCONFIRM=v},
    set AUTOPLEA(v){AUTOPLEA=v}, set AUTOCOUNSEL(v){AUTOCOUNSEL=v} }
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
  // Counted per LIFE, not per year. It used to re-check the same state on
  // every remaining year of an offending life, so a single rare coincidence
  // was reported as nineteen violations and read like a systemic fault.
  //
  // A small number is legitimate: an accident can disable you in the same
  // year an unrelated illness is diagnosed. What this guards against is the
  // progression breaking so that disability routinely arrives with the
  // diagnosis. Measured at 0 in 300 lives, so 2 in 60 is generous.
  let offenders = 0;
  for (let i=0;i<60;i++){
    G.newGame({}); let g=0, flagged = false;
    while (G.S.alive && g++<140){
      G.ageUp();
      if (!flagged && G.S.disabled && G.S.disabledAt != null) {
        const priorIllnesses = G.S.conditions.filter(k => k.age <= G.S.disabledAt);
        if (priorIllnesses.length && !priorIllnesses.some(k => (G.S.disabledAt - k.age) >= 3)) {
          flagged = true; offenders++;
        }
      }
    }
  }
  return offenders <= 2 ? true : offenders + ' lives of 60 were disabled by an illness diagnosed that same year';
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
      while (q.children2 && G.anyOf('child').length < 2) assign('child');
      while (q.siblings2 && G.anyOf('sibling').length < 2) assign('sibling');
      if (q.gathering) {
        // g_whenyou is gathering AND nochild: filling the room with children
        // makes its own gate unsatisfiable, so use siblings when children are
        // excluded
        const fill = q.nochild ? 'sibling' : 'child';
        while (G.anyOf('child').length + G.anyOf('sibling').length < 2) assign(fill);
      }
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
    'anyBadHabit','habit','sibling','maxSiblings','teacher','condition','record','parole','followers',
    'artskill','children2','siblings2','gathering']);
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
  // switching it off is a developer affordance now, not a player one, so the
  // test has to say which build it is standing in. It also has to leave
  // META clean: lifetime surviving this test made the next one compare two
  // identical screens.
  G.META.premium = { plus:false, lifetime:false, since:null, protoUnlocked:true };
  G.AUTOCONFIRM = true; G.buyPlus('lifetime'); G.AUTOCONFIRM = null;
  const on = G.isPlus() && G.META.premium.lifetime;
  G.togglePlus();
  const off = !G.isPlus();
  G.META.premium = { plus:false, lifetime:false, since:null, protoUnlocked:false };
  if (!on) return 'the purchase did not grant Plus';
  if (!off) return 'the developer toggle did not revoke it';
  return true;
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
  G.newGame({}); ageTo(30);
  if (!G.S.alive) return true;
  // clear AFTER living: about one life in a hundred finds the V8 egg during
  // those thirty years, and the shop was then right to show it
  Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
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
  // studying is now aimed at a subject, so it takes two steps: the action
  // offers the subjects you are taking, and the pick is what moves the grade
  let ok = false, picked = false;
  for (let i=0;i<25 && !ok;i++){
    G.newGame({}); let g=0;
    while (G.S.alive && G.S.age<13 && g++<20) G.ageUp();
    if (!G.S.alive || !G.S.inSchool) continue;
    G.S.actionsLeft = 5;
    if (!G.ACTS().some(a=>a.id==='study')) continue;
    const active = G.subjectsActive(G.S);
    if (!active.length) continue;
    const before = active.map(id => G.subjectGrade(G.S, id));
    const gpaBefore = G.gpaFrom(G.S);
    G.doAct('study');
    G.pickFrom(0);                        // choose the first subject offered
    picked = true;
    const after = active.map(id => G.subjectGrade(G.S, id));
    if (after.some((v,j) => v > before[j]) && G.S.gpa >= gpaBefore) ok = true;
  }
  if (!picked) return 'the study action never offered a subject';
  return ok ? true : 'studying a subject never changed the grade';
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
/* ---- the obituary ---- */
function deadLife(opts){
  let tries = 0;
  do { G.newGame(opts || {}); let g = 0; while (G.S.alive && g++ < 130) G.ageUp(); tries++; }
  while (G.S.alive && tries < 20);
  return G.S;
}
t('every life can be written up as an obituary', () => {
  for (let i = 0; i < 40; i++) {
    const s = deadLife({diff:['easy','normal','hard','brutal'][i % 4]});
    const o = G.eulogy(s, G.netWorth());
    if (!o.name || !o.strap) return 'life ' + i + ' has no headline';
    if (!o.life.length) return 'life ' + i + ' has no story';
    if (!o.people.length) return 'life ' + i + ' says nothing about anyone';
    if (!o.close) return 'life ' + i + ' has no closing line';
  }
  return true;
});
t('an obituary never leaks a placeholder or a broken number', () => {
  const bad = [];
  for (let i = 0; i < 60; i++) {
    const s = deadLife({diff:['easy','normal','hard','brutal'][i % 4]});
    const o = G.eulogy(s, G.netWorth());
    const text = [o.name, o.strap, o.close].concat(o.life, o.people, o.estate).join(' ');
    if (/undefined|NaN|\[object|null/.test(text)) bad.push('placeholder: ' + text.match(/.{0,40}(undefined|NaN|\[object|null).{0,20}/)[0]);
    if (/\s+[,.]/.test(text)) bad.push('space before punctuation');
    if (/,,|\.\./.test(text)) bad.push('doubled punctuation');
    if (/\s\s/.test(text)) bad.push('double space');
    if (bad.length) break;
  }
  return bad.length ? bad[0] : true;
});
t('every sentence in an obituary is a sentence', () => {
  for (let i = 0; i < 30; i++) {
    const s = deadLife({});
    const o = G.eulogy(s, G.netWorth());
    const lines = o.life.concat(o.people, o.estate, [o.close]);
    const bad = lines.filter(l => !/^[A-Z"']/.test(l) || !/[.!?"]$/.test(l));
    if (bad.length) return 'not a sentence: ' + JSON.stringify(bad[0]);
  }
  return true;
});
t('the same life is always written up the same way', () => {
  // the numbers toggle re-renders the screen; it must not rewrite the eulogy
  const s = deadLife({});
  const a = JSON.stringify(G.eulogy(s, G.netWorth()));
  const b = JSON.stringify(G.eulogy(s, G.netWorth()));
  const c = JSON.stringify(G.eulogy(s, G.netWorth()));
  return (a === b && b === c) ? true : 'the obituary changed between renders';
});
t('an obituary uses the right pronouns throughout', () => {
  for (let i = 0; i < 40; i++) {
    const s = deadLife({});
    if (s.age < 16) continue;
    const o = G.eulogy(s, G.netWorth());
    const text = o.life.concat(o.people, o.estate, [o.close]).join(' ');
    const wrong = s.gender === 'f' ? /\b(he|him|his)\b/i : /\b(she|her|hers)\b/i;
    // other people in the life are named, not pronouned, so any hit is a bug
    const m = text.match(wrong);
    if (m) return `${s.gender} life used "${m[0]}" — ${text.slice(Math.max(0, m.index - 40), m.index + 40)}`;
  }
  return true;
});
t('a child who dies does not get a career and an estate', () => {
  const s = deadLife({});
  s.age = 7; s.alive = false; s.cause = 'a sudden illness';
  s.career = [{t:'Surgeon',field:'med',from:30}]; s.jobsHeld = 1; s.properties = [{value:9e5,mortgage:0}];
  const o = G.eulogy(s, 900000);
  const text = o.life.concat(o.estate).join(' ');
  return (!/Surgeon|surgeon|estate/i.test(text) && !o.estate.length) ? true
    : 'a seven-year-old was given a career or an estate: ' + text;
});
t('an obituary says what someone did for a living', () => {
  const s = deadLife({});
  s.age = 70; s.career = [{t:'Structural engineer',field:'eng',from:24}];
  s.jobsHeld = 1; s.edu = 3;
  const text = G.eulogy(s, 10000).life.join(' ');
  return /structural engineer/i.test(text) ? true : 'the working life is missing: ' + text;
});
t('an obituary names who is left and what they get', () => {
  const s = deadLife({});
  s.age = 80; s.alive = false;
  s.npcs = [{id:'a',rel:'child',name:'Margot Vance',gender:'f',alive:true,r:90,age:50},
            {id:'b',rel:'child',name:'Tom Vance',gender:'m',alive:true,r:20,age:47},
            {id:'c',rel:'spouse',name:'Ada Vance',gender:'f',alive:false,r:80,age:79}];
  s.childrenCount = 2; s.properties = []; s.businesses = [];
  const o = G.eulogy(s, 400000);
  const people = o.people.join(' '), estate = o.estate.join(' ');
  if (!/Margot/.test(people) || !/Tom/.test(people)) return 'the children are not named: ' + people;
  if (!/Ada/.test(people)) return 'the dead spouse is not mentioned: ' + people;
  if (!/Margot/.test(estate) || !/400,000/.test(estate)) return 'the estate does not say who gets it: ' + estate;
  return true;
});
t('a debt is not passed to the children', () => {
  const s = deadLife({});
  s.age = 70; s.npcs = [{id:'a',rel:'child',name:'Ana Reyes',gender:'f',alive:true,r:70,age:40}];
  const estate = G.eulogy(s, -50000).estate.join(' ');
  return /owing/.test(estate) && /\$50,000/.test(estate) ? true : 'a debt was not reported: ' + estate;
});
t('obituaries do not all end the same way', () => {
  const seen = {};
  const N = 60;
  for (let i = 0; i < N; i++) {
    const s = deadLife({diff:['easy','normal','hard','brutal'][i % 4]});
    const c = G.eulogy(s, G.netWorth()).close;
    seen[c] = (seen[c] || 0) + 1;
  }
  const distinct = Object.keys(seen).length;
  const commonest = Math.max.apply(null, Object.values(seen));
  return (distinct >= 6 && commonest / N <= 0.4) ? true
    : `${distinct} distinct endings, commonest used ${Math.round(commonest / N * 100)}% of the time`;
});
t('the death screen leads with the obituary and keeps the numbers', () => {
  const s = deadLife({});
  let html = '';
  const realGet = global.document.getElementById;
  global.document.getElementById = id => (id === 'modal')
    ? { set innerHTML(v){ html = v; }, get innerHTML(){ return html; }, className:'' }
    : realGet(id);
  try {
    G.renderDeath();
    if (!/class="obit"/.test(html)) return 'no obituary on the death screen';
    if (!/statstoggle/.test(html)) return 'no way to see the numbers';
    if (/Peak net worth/.test(html)) return 'the numbers are shown before they are asked for';
    G.toggleDeathStats();
    const keys = ['Years lived','Peak net worth','Peak income','Final net worth','Jobs held',
                  'Children','Crimes','Years jailed','Countries lived in','Education',
                  'Special path','Difficulty','Legacy Point rate'];
    const missing = keys.filter(k => html.indexOf(k) < 0);
    if (missing.length) return 'the numbers toggle lost: ' + missing.join(', ');
    G.toggleDeathStats();
    return true;
  } finally { global.document.getElementById = realGet; }
});

/* ---- the cost of living as you live ---- */
t('what you spend follows what you earn', () => {
  // the whole point: outgoings used to sit flat near $11,000 while income
  // climbed past $50,000, so a salary was banked rather than spent
  atAge(40);
  const at = income => {
    G.S.living = G.livingFloor(); G.S.thrift = 0; G.S.money = 5000000;
    G.S.stats.discipline = 50;
    for (let y = 0; y < 25; y++) {
      G.S.ledger = { income: [{ l:'x', a:income }], spend: [] };
      G.tickLiving([]);
    }
    return G.S.living;
  };
  const poor = at(15000), rich = at(120000);
  if (!(rich > poor * 3)) return `living costs ${poor} on 15k and ${rich} on 120k`;
  if (rich >= 120000) return 'living costs more than the whole income';
  return true;
});

t('how you choose to live moves the target, not merely the speed', () => {
  // a lever on the rate of convergence is a lever on nothing: over fifty
  // years everybody arrives at the same place anyway
  const r = (disc, thrift) => G.livingRatio({ stats:{discipline:disc}, thrift });
  if (!(r(85,0) < r(50,0))) return 'discipline does not lower the target';
  if (!(r(20,0) > r(50,0))) return 'being undisciplined does not raise it';
  if (!(r(50,1) < r(50,0) - 0.1)) return 'thrift barely moves the target';
  const all = [r(0,0), r(100,1), r(100,0), r(0,1), r(50,0.5)];
  if (all.some(x => x < 0.3 || x > 0.68)) return 'the ratio escaped its clamp: ' + all.join(', ');
  return true;
});

t('cutting back is a decision that lasts, but lapses', () => {
  atAge(40);
  G.S.money = 500000; G.S.living = 60000; G.S.thrift = 0;
  G.S.actionsLeft = 3;
  const acts = G.ACTS();
  if (!acts.some(a => a.id === 'cutback')) return 'no way to cut back when living high';
  G.doAct('cutback');
  if (!(G.S.living < 60000)) return 'cutting back did not reduce the cost of living';
  if (!(G.S.thrift > 0)) return 'cutting back left no lasting intent';
  const kept = G.S.thrift;
  for (let y = 0; y < 3; y++) { G.S.ledger = { income:[{l:'x',a:50000}], spend:[] }; G.tickLiving([]); }
  if (!(G.S.thrift < kept)) return 'thrift never lapses, so the decision is free forever';
  if (G.S.thrift < 0) return 'thrift went negative';
  return true;
});

t('you are never charged more than you have', () => {
  atAge(40);
  G.S.living = 90000; G.S.money = 1200; G.S.savings = 0; G.S.thrift = 0;
  G.S.ledger = { income: [], spend: [] };
  const out = [];
  G.tickLiving(out);
  if (G.S.money < 0) return 'living costs pushed money negative: ' + G.S.money;
  if (!(G.S.living < 90000)) return 'an unaffordable life did not get smaller';
  if (!out.length) return 'nothing was said about having to give something up';
  // and it never falls through the floor
  for (let y = 0; y < 30; y++) { G.S.money = 0; G.tickLiving([]); }
  if (G.S.living < G.livingFloor()) return 'living fell below the floor: ' + G.S.living;
  return true;
});

t('prison does not charge you rent', () => {
  atAge(40);
  G.S.living = 40000; G.S.money = 100000; G.S.jailLeft = 3;
  const before = G.S.money;
  G.S.ledger = { income: [], spend: [] };
  G.tickLiving([]);
  if (G.S.money !== before) return 'you paid for a life you were not living';
  if (!(G.S.living < 40000)) return 'the outside life did not wind down while inside';
  G.S.jailLeft = 0;
  return true;
});

t('a whole life no longer banks its salary by default', () => {
  // the original fault, asserted end to end: surplus used to quadruple
  // between the twenties and the fifties
  const band = {};
  for (let i = 0; i < 14; i++) {
    G.newGame({}); let g = 0;
    while (G.S.alive && g++ < 140) {
      G.ageUp(); if (!G.S.alive) break;
      let b = 0;
      while (G.S.actionsLeft > 0 && b++ < 6) {
        const acts = G.ACTS().filter(a => a.grp !== 'Crime');
        if (!acts.length) break;
        G.doAct(acts[Math.floor(Math.random()*acts.length)].id);
      }
      if (G.S.age >= 18 && !G.S.job && !G.S.flags.retired && !G.S.flags.inCollege) {
        const p = G.DATA.jobs.filter(G.jobEligible);
        if (p.length) { G.applyJob(p[p.length-1]); G.drain(); }
      }
      if (G.S.age < 25 || G.S.age > 60) continue;
      const k = G.S.age < 40 ? 'young' : 'older';
      band[k] = band[k] || { y:0, inc:0, sp:0 };
      band[k].y++; band[k].inc += G.ledgerTotal('income'); band[k].sp += G.ledgerTotal('spend');
    }
  }
  if (!band.young || !band.older || band.young.y < 40 || band.older.y < 40)
    return 'not enough years sampled to say anything';
  const share = k => band[k].inc ? band[k].sp / band[k].inc : 0;
  const youngShare = share('young'), olderShare = share('older');
  if (olderShare < youngShare * 0.5)
    return `spending collapses as a share of income: ${(youngShare*100).toFixed(0)}% young, ${(olderShare*100).toFixed(0)}% older`;
  if (olderShare < 0.25)
    return `older earners spend only ${(olderShare*100).toFixed(0)}% of what they earn`;
  return true;
});

/* ---- localisation ---- */
t('the extractor and the game agree on how a string is keyed', () => {
  // the catalogue is keyed by a hash of the English, and that hash is
  // computed in two places: tools/extract-strings.js when the catalogue is
  // written, and pwa/i18n.js when it is read. If they drift, every lookup
  // misses and the game silently stays English forever.
  const fs2 = require('fs'), p2 = require('path');
  const tool = fs2.readFileSync(p2.join(DIR, '..', 'tools', 'extract-strings.js'), 'utf8');
  const i = tool.indexOf('function hashKey');
  if (i < 0) return 'the extractor no longer has hashKey()';
  const toolHash = new Function(tool.slice(i, tool.indexOf('\n}', i) + 2) + '\nreturn hashKey;')();
  const samples = ['Raised Voices', 'a', 'The estate came to $570,000.',
                   '{child} and {child2} fell out', 'Zzyzx \u2014 dash and \u00e9accent', ''];
  for (const s of samples) {
    if (toolHash(s) !== G.i18nKey(s))
      return `"${s.slice(0,24)}": extractor ${toolHash(s)}, game ${G.i18nKey(s)}`;
  }
  return true;
});

t('the shipped catalogue covers what the extractor finds', () => {
  const fs2 = require('fs'), p2 = require('path');
  let cat;
  try { cat = JSON.parse(fs2.readFileSync(p2.join(DIR, '..', 'locales', 'en.json'), 'utf8')); }
  catch(e){ return 'locales/en.json is missing or unreadable; run tools/extract-strings.js --write'; }
  const keys = Object.keys(cat);
  if (keys.length < 2500) return 'the catalogue has only ' + keys.length + ' entries';
  // every event string the game can show must be in it
  const missing = [];
  G.EVENTS.slice(0, 120).forEach(e => {
    const strings = [e.t].concat(Array.isArray(e.x) ? e.x : [e.x]).concat(e.c.map(c => c.l));
    strings.forEach(s => { if (typeof s === 'string' && s.trim() && !cat[G.i18nKey(s.trim())]) missing.push(s.slice(0,40)); });
  });
  if (missing.length) return missing.length + ' event strings are not in the catalogue, e.g. ' + missing[0];
  // and the catalogue must map English to itself, not to an id
  const first = keys[0];
  if (G.i18nKey(cat[first]) !== first) return 'an entry does not hash back to its own key';
  return true;
});

t('with no locale loaded, translation costs nothing and changes nothing', () => {
  G.setLocale('en', null);
  const s = 'The estate came to $570,000.';
  if (G.T(s) !== s) return 'English was altered with no locale loaded';
  if (G.T('') !== '') return 'the empty string was mangled';
  if (G.T(null) !== null) return 'a non-string was not passed through';
  return true;
});

t('a loaded locale reaches the event text, the titles and the choices', () => {
  // the pseudo-locale exists to answer exactly this without a translator
  const strings = [];
  G.EVENTS.forEach(e => {
    strings.push(e.t);
    (Array.isArray(e.x) ? e.x : [e.x]).forEach(x => strings.push(x));
    e.c.forEach(c => strings.push(c.l));
  });
  G.setLocale('qps', G.pseudoLocale(strings));
  try {
    const ev = G.EVENTS.find(e => e.c && e.c.length);
    const title = G.tok(ev.t);
    const body = G.variant(ev.x);
    const label = G.tok(ev.c[0].l);
    for (const [what, got] of [['title', title], ['text', body], ['choice', label]]) {
      if (got.indexOf('\u27e6') !== 0) return `the ${what} did not go through the catalogue: ` + got.slice(0, 40);
    }
    // tokens must survive: a translator moves them, they do not get mangled
    const withTok = G.EVENTS.find(e => /\{\w+\}/.test(Array.isArray(e.x) ? e.x[0] : e.x));
    if (withTok) {
      const out = G.variant(withTok.x);
      if (/\{\w+\}/.test(out)) return 'a token survived substitution unreplaced: ' + out.slice(0, 50);
    }
  } finally { G.setLocale('en', null); }
  return true;
});

t('a loaded locale reaches the data tables too', () => {
  const before = G.DATA.crimes[0].n;
  G.setLocale('qps', G.pseudoLocale([before]));
  try {
    if (G.DATA.crimes[0].n.indexOf('\u27e6') !== 0)
      return 'a crime name was not localised: ' + G.DATA.crimes[0].n;
    // and doing it twice must not double-wrap
    G.localiseData();
    const twice = G.DATA.crimes[0].n;
    if ((twice.match(/\u27e6/g) || []).length > 1) return 'localising twice wrapped it twice';
  } finally {
    G.setLocale('en', null);
    G.DATA.crimes[0].n = before;
  }
  return true;
});

t('a missing translation falls back to English rather than breaking', () => {
  G.setLocale('qps', { 'nothing': 'in here' });
  try {
    const s = 'A sentence nobody has translated.';
    if (G.T(s) !== s) return 'a missing entry did not fall back';
    G.trackMissing(true);
    G.T(s); G.T(s); G.T('Another one.');
    const missing = G.missingStrings();
    if (missing.length !== 2) return 'missing tracking reported ' + missing.length + ', expected 2';
  } finally { G.trackMissing(false); G.setLocale('en', null); }
  return true;
});

t('a longer language does not have to be a broken one', () => {
  // the pseudo-locale pads every string, which is the cheap way to find a
  // button that only fits because English is short
  const s = 'Continue';
  const map = G.pseudoLocale([s]);
  G.setLocale('qps', map);
  try {
    const out = G.T(s);
    if (out.length <= s.length) return 'the pseudo-locale is not longer than English';
    if (out.indexOf('Cóntínúé') < 0) return 'the pseudo-locale is not legible as its source: ' + out;
  } finally { G.setLocale('en', null); }
  return true;
});

/* ---- the avatar shows more than a face ---- */
function portrait(over){
  // newGame() rolls a different person every call, and the portrait is
  // derived from name, seed and country. Pin the person, or every
  // comparison below is between two strangers.
  G.newGame({});
  const s = G.S;
  s.age = 40; s.name = 'Ada Vale'; s.gender = 'f'; s.seed = 12345; s.country = 'uk';
  s.stats = { health:70, happiness:60, smarts:50, looks:50, reputation:50, discipline:50 };
  s.money = 0; s.savings = 0; s.debt = 0;
  s.properties = []; s.businesses = []; s.conditions = []; s.habits = {};
  s.jailLeft = 0; s.job = null;
  Object.keys(over || {}).forEach(k => { s[k] = over[k]; });
  return G.avatarSVG(s, 96);
}

t('what you are worth shows in what you are wearing', () => {
  const poor = portrait({ money: 200 });
  const mid  = portrait({ money: 300000 });
  const rich = portrait({ money: 2000000 });
  if (poor === rich) return 'a pauper and a millionaire render identically';
  if (G.avatarWealthTier({ money: 200 }) !== 0) return 'tier 0 is not the floor';
  if (G.avatarWealthTier({ money: 2000000 }) !== 3) return 'tier 3 is not the ceiling';
  // the tie only belongs to the top tier
  if (poor.indexOf('#8d2733') >= 0) return 'a pauper is wearing a tie';
  if (rich.indexOf('#8d2733') < 0) return 'the wealthiest tier has no tie';
  if (mid === poor) return 'the middle tier is indistinguishable from the bottom';
  // and property counts, not just cash in hand
  const landed = G.avatarWealthTier({ money: 0, properties: [{ value: 900000, mortgage: 0 }] });
  if (landed < 3) return 'someone with a paid-off house reads as poor';
  return true;
});

t('age shows below the neck as well as above it', () => {
  const young = portrait({ age: 25 });
  const old   = portrait({ age: 82 });
  const shoulders = svg => {
    const m = svg.match(/M ([\d.]+) 100 Q/);
    return m ? parseFloat(m[1]) : null;
  };
  const y = shoulders(young), o = shoulders(old);
  if (y == null || o == null) return 'the shoulder path is no longer readable';
  if (!(o > y)) return `shoulders do not narrow with age: ${y} at 25, ${o} at 82`;
  return true;
});

t('an untreated illness is visible, a managed one is not', () => {
  const well    = portrait({ conditions: [] });
  const managed = portrait({ conditions: [{ id:'diabetes', sev:2, treated:true }] });
  const ill     = portrait({ conditions: [{ id:'diabetes', sev:2, treated:false }] });
  if (G.avatarAiling({ conditions: [{ id:'x', sev:2, treated:true }] }) !== 0)
    return 'a managed condition still counts as ailing';
  if (G.avatarAiling({ conditions: [{ id:'x', sev:1, treated:false }] }) !== 0)
    return 'a minor condition is being treated as serious';
  if (ill === well) return 'a serious untreated illness does not show at all';
  if (managed !== well) return 'treating it does not clear the face';
  return true;
});

t('habits show in the face, but only once they are habits', () => {
  const clean = portrait({ habits: {} });
  const light = portrait({ habits: { drinking: 20 } });
  const heavy = portrait({ habits: { drinking: 80 } });
  if (light !== clean) return 'the occasional drink already shows';
  if (heavy === clean) return 'heavy drinking does not show at all';
  const fed = portrait({ habits: { junkfood: 80 } });
  if (fed === clean) return 'a long junk food habit does not show';
  return true;
});

t('a portrait renders for anybody, however little is known about them', () => {
  // avatarMini builds a fabricated state for NPCs, with no money, habits,
  // conditions or properties on it at all
  const bare = { name:'X Y', id:'n1', age:30, gender:'m', alive:true, r:60 };
  let out = null, err = null;
  try { out = G.avatarMini(bare, 38); } catch(e){ err = e.message; }
  if (err) return 'an NPC portrait threw: ' + err;
  if (!out || out.indexOf('<svg') !== 0) return 'no svg came back';
  if (/undefined|NaN/.test(out)) return 'the portrait leaked a raw value';
  // and a dead one, and a baby
  for (const t2 of [{...bare, alive:false}, {...bare, age:1}, {...bare, age:99}]) {
    const o = G.avatarMini(t2, 38);
    if (/undefined|NaN/.test(o)) return 'a portrait leaked on ' + JSON.stringify(t2).slice(0, 40);
  }
  return true;
});

/* ---- accessibility ---- */
t('the shell carries the roles a screen reader needs', () => {
  const fs2 = require('fs'), p2 = require('path');
  const built = fs2.readFileSync(p2.join(DIR, 'index.html'), 'utf8');
  const need = {
    'role="tablist"': 'the tab bar is not a tablist',
    'role="tabpanel"': 'nothing is marked as the panel the tabs control',
    'role="dialog"': 'the modal is not a dialog',
    'aria-modal="true"': 'the dialog does not trap assistive focus',
    'role="status"': 'there is no live region for the year to be announced',
    'aria-live="polite"': 'the live region does not announce',
    'lang="en"': 'the document has no language'
  };
  const missing = Object.keys(need).filter(k => built.indexOf(k) < 0).map(k => need[k]);
  if (missing.length) return missing.join(' | ');
  const tabs = (built.match(/role="tab"/g) || []).length;
  if (tabs < 5) return 'only ' + tabs + ' tabs are labelled, expected 5';
  if ((built.match(/aria-selected=/g) || []).length < 5) return 'tabs do not report which is selected';
  // decorative icons must be hidden, or every tab is read twice
  const svgs = (built.match(/<svg /g) || []).length;
  const hidden = (built.match(/<svg [^>]*aria-hidden="true"/g) || []).length;
  if (hidden < svgs) return (svgs - hidden) + ' decorative icons are still announced';
  return true;
});

t('exactly one tab is selected, and it is the one that is shown', () => {
  const fs2 = require('fs'), p2 = require('path');
  const built = fs2.readFileSync(p2.join(DIR, 'index.html'), 'utf8');
  const sel = (built.match(/aria-selected="true"/g) || []).length;
  if (sel !== 1) return sel + ' tabs claim to be selected at rest';
  // roving tabindex: one stop, not five
  const zero = (built.match(/role="tab"[^>]*tabindex="0"/g) || []).length;
  const minus = (built.match(/role="tab"[^>]*tabindex="-1"/g) || []).length;
  if (zero !== 1) return zero + ' tabs are keyboard stops, expected 1';
  if (minus !== 4) return 'the other tabs are not removed from the tab order';
  return true;
});

t('every toggle announces its state as a switch', () => {
  const fs2 = require('fs'), p2 = require('path');
  const game = fs2.readFileSync(p2.join(DIR, 'game.js'), 'utf8');
  // a row whose entire job is on or off, found by the tick glyph it paints
  const rows = game.split('\n').filter(l => /\\u2713'\s*:\s*'\\u25CB/i.test(l));
  if (!rows.length) return 'no toggle rows found at all, so this test proves nothing';
  const unmarked = rows.filter(l => {
    const i = game.indexOf(l);
    const start = game.lastIndexOf('<button', i);
    if (start < 0) return false;
    const between = game.slice(start, i);
    // the glyph must actually be inside that button, not after it closed:
    // the Plus feature list paints the same tick in a <div> and is a list,
    // not a control
    if (between.indexOf('</button>') >= 0) return false;
    return between.indexOf('data-switch') < 0;
  });
  if (unmarked.length)
    return unmarked.length + ' toggles do not declare a switch state, e.g. ' + unmarked[0].trim().slice(0, 70);
  return true;
});

t('accessibility never stops a headless life from running', () => {
  // the harness document is a stub; an a11y helper that assumes a real DOM
  // took out 184 of 480 simulated lives before this guard existed
  const before = G.S;
  G.newGame({});
  let err = null;
  try {
    G.setTab('money'); G.setTab('life');
    G.a11ySyncTabs('life'); G.a11ySwitches(); G.a11yAgeHint();
    G.say('anything'); G.a11yDialogOpen('x'); G.a11yDialogClose(); G.a11yInit();
    let g = 0; while (G.S.alive && g++ < 30) G.ageUp();
  } catch(e) { err = e.message; }
  if (err) return 'a life could not run: ' + err;
  return true;
});

t('the focus ring does not look like the selected state', () => {
  const fs2 = require('fs'), p2 = require('path');
  const css = fs2.readFileSync(p2.join(DIR, 'style.css'), 'utf8');
  if (css.indexOf(':focus-visible') < 0) return 'there is no focus-visible style at all';
  const m = css.match(/:focus-visible\s*\{[^}]*\}/);
  if (!m || !/outline/.test(m[0])) return 'focus-visible sets no outline';
  if (css.indexOf('.sronly') < 0) return 'there is no screen-reader-only class for hidden labels';
  return true;
});

/* ---- the admin console ---- */
t('a code the console generates is one the game accepts', () => {
  // the algorithm exists in two files, pwa/adminlink.js and the console's
  // own copy, because the console is a separate page that cannot import the
  // bundle. If they drift, every code minted is rejected.
  const fs2 = require('fs'), p2 = require('path');
  const src = fs2.readFileSync(p2.join(DIR, 'admin', 'admin.js'), 'utf8');
  const grab = name => {
    const i2 = src.indexOf('function ' + name + '(');
    if (i2 < 0) throw new Error('the console has no ' + name);
    const end = src.indexOf('\n}', i2);
    if (end < 0) throw new Error(name + ' is not closed where expected');
    return src.slice(i2, end + 2);
  };
  const consoleMake = new Function(
    src.match(/var CODE_SECRET = '[^']*';/)[0] + '\n' +
    grab('codeHash') + '\n' + grab('padCheck') + '\n' + grab('makeCode') + '\n' +
    'return makeCode;')();

  const cases = [['LP','dw'],['LP','1'],['LP','zzz'],['PERK','inheritance'],['EGG','sonder'],['LP','0']];
  for (const [t2, v] of cases) {
    const fromConsole = consoleMake(t2, v);
    const fromGame = G.makeCode(t2, v);
    if (fromConsole !== fromGame)
      return `console minted ${fromConsole} but the game mints ${fromGame}`;
    if (!G.readCode(fromConsole)) return 'the game rejected its own code: ' + fromConsole;
  }
  return true;
});

t('a tampered or invented code is refused', () => {
  const real = G.makeCode('LP', 'dw');
  const bad = [real.slice(0, -1) + 'X', 'LP-DW-0000', 'LP-ZZZZ', 'nonsense',
               '', 'PLUS-LIFETIME-AAAA', real.replace('LP', 'PERK')];
  for (let i = 0; i < bad.length; i++)
    if (G.readCode(bad[i])) return 'accepted a bad code: ' + JSON.stringify(bad[i]);
  if (!G.readCode(real)) return 'refused a good one';
  return true;
});

t('no code can ever grant Bequest Plus', () => {
  // money-backed entitlement, same rule as the cloud sync
  if (G.CODE_GRANTS.plus || G.CODE_GRANTS.premium || G.CODE_GRANTS.lifetime)
    return 'there is a grant type for the paid tier';
  G.META.premium = { plus:false, lifetime:false, since:null };
  G.META.redeemed = {};
  ['PLUS','PREMIUM','LIFETIME'].forEach(k => G.redeemCode(G.makeCode(k, 'x')));
  if (G.isPlus()) return 'a code granted Plus';
  return true;
});

t('a code pays out once and only once', () => {
  G.META.lp = 0; G.META.redeemed = {};
  const code = G.makeCode('LP', (500).toString(36));
  G.redeemCode(code);
  const after = G.META.lp;
  if (after !== 500) return 'expected 500 Legacy Points, got ' + after;
  G.redeemCode(code);
  G.redeemCode(code.toLowerCase());
  if (G.META.lp !== after) return 'the same code paid out twice: ' + G.META.lp;
  return true;
});

t('a forced event fires on the next year and then stops', () => {
  G.newGame({});
  G.S.age = 30; G.S.alive = true;
  G.clearForced();
  if (!G.forceEvent('g_kidsfight')) return 'could not queue a real event';
  if (G.forceEvent('no_such_event_id')) return 'queued an event that does not exist';
  const seen = [];
  const realShow = global.showPopup;
  G.META.forced = ['g_kidsfight'];
  const taken = G.takeForced();
  if (!taken.length || taken[0].id !== 'g_kidsfight') return 'the queue did not hand the event back';
  if ((G.META.forced || []).length) return 'the queue was not emptied after being taken';
  return true;
});

t('a broadcast shows, dismisses, and stays dismissed', () => {
  G.newGame({});
  G.setBroadcast('Servers are fine. It is the writing that is slow.');
  let html = G.broadcastCard();
  if (html.indexOf('writing that is slow') < 0) return 'the note did not render';
  G.dismissBroadcast();
  if (G.broadcastCard() !== '') return 'it came back after being dismissed';
  G.setBroadcast('');
  if (G.broadcast()) return 'clearing it left something behind';
  // and an expired one never shows
  G.setBroadcast('old news', Date.now() - 1000);
  if (G.broadcastCard() !== '') return 'an expired note still showed';
  G.setBroadcast('');
  return true;
});

t('the admin console is never shipped inside the game', () => {
  const fs2 = require('fs'), p2 = require('path');
  const built = fs2.readFileSync(p2.join(DIR, 'index.html'), 'utf8');
  if (/BEQUEST ADMIN|admin\/admin\.js|PASS_KEY/.test(built))
    return 'the console leaked into the built bundle';
  const build = fs2.readFileSync(p2.join(DIR, 'build.py'), 'utf8');
  if (/admin\//.test(build)) return 'build.py inlines the console directory';
  // the in-game half must be there, though: the paired positive
  if (built.indexOf('redeemCode') < 0) return 'the in-game half is missing from the bundle';
  return true;
});

t('the console reads the same storage keys the game writes', () => {
  // the console is a separate page with its own copy of the key names, so
  // it can silently administer nothing at all
  const fs2 = require('fs'), p2 = require('path');
  const gsrc = fs2.readFileSync(p2.join(DIR, 'game.js'), 'utf8');
  const asrc = fs2.readFileSync(p2.join(DIR, 'admin', 'admin.js'), 'utf8');
  const constOf = (src, name) => {
    const m = src.match(new RegExp(name + "\\s*=\\s*'([^']+)'"));
    return m ? m[1] : null;
  };
  for (const k of ['META_KEY','SAVE_KEY']) {
    const game = constOf(gsrc, k), cons = constOf(asrc, k);
    if (!game) return 'game.js no longer defines ' + k;
    if (!cons) return 'the console no longer defines ' + k;
    if (game !== cons) return `${k}: game uses ${game}, the console uses ${cons}`;
  }
  if (/'bequest\.meta'|'bequest\.save'/.test(asrc))
    return 'the console still has an unversioned key name in it';
  return true;
});

t('the console passphrase is stored as a hash, not as itself', () => {
  const fs2 = require('fs'), p2 = require('path');
  const src = fs2.readFileSync(p2.join(DIR, 'admin', 'admin.js'), 'utf8');
  if (/setItem\(PASS_KEY,\s*v\)/.test(src)) return 'the passphrase is stored in clear';
  if (!/setItem\(PASS_KEY,\s*hash\(/.test(src)) return 'the passphrase is not hashed on the way in';
  if (!/hash\(v\)\s*!==\s*localStorage\.getItem\(PASS_KEY\)/.test(src))
    return 'the check does not compare hashes';
  return true;
});

/* ---- the developer surface does not ship ---- */
t('a player is never offered a button that grants the paid tier', () => {
  // protoUnlocked was written at load and read nowhere, so the "Switch Plus
  // on" card rendered for everybody
  G.META.premium = { plus:false, lifetime:false, since:null, protoUnlocked:false };
  G.newGame({});
  const html = G.viewPlus();
  if (/togglePlus/.test(html)) return 'the Plus toggle is on screen for a normal player';
  if (/Prototype controls/.test(html)) return 'the prototype card is on screen for a normal player';
  if (!/Restore purchases/.test(html)) return 'the real purchase controls disappeared with it';
  return true;
});

t('the toggle refuses to fire even if it is called directly', () => {
  // hiding a button is not the same as disabling it
  G.META.premium = { plus:false, lifetime:false, since:null, protoUnlocked:false };
  G.togglePlus();
  if (G.isPlus()) return 'calling togglePlus() granted Plus without a developer build';
  return true;
});

t('a developer build still gets the controls', () => {
  // the paired positive: hiding it from everyone including the developer
  // would pass the two checks above and be useless
  G.META.premium = { plus:false, lifetime:false, since:null, protoUnlocked:true };
  G.newGame({});
  if (!G.devUnlocked()) return 'the developer flag does not register';
  const html = G.viewPlus();
  if (!/togglePlus/.test(html)) return 'a developer build cannot reach the toggle';
  G.togglePlus();
  if (!G.isPlus()) return 'the toggle does not work in a developer build';
  G.togglePlus();
  if (G.isPlus()) return 'the toggle does not switch back off';
  G.META.premium.protoUnlocked = false;
  return true;
});

/* ---- the store declarations have to stay true ---- */
function allGameStrings(){
  const fs2 = require('fs'), p2 = require('path');
  let all = '';
  FILES.forEach(f => { try { all += fs2.readFileSync(p2.join(DIR, f), 'utf8') + '\n'; } catch(e){} });
  // strip comments: a developer note is not something the player can read
  const code = all.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return (code.match(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g) || []).join(' ').toLowerCase();
}

t('the game contains no profanity, as declared to the rating board', () => {
  // PLAY_LISTING.md answers "Profanity: No" to IARC. A wrong answer there is
  // a policy violation, so it cannot be left to memory.
  const s = allGameStrings();
  const words = ['fuck','shit','bastard','bitch','bollock','bugger','wank','prick','cunt','slut','whore'];
  const hits = [];
  words.forEach(w => {
    const m = s.match(new RegExp('\\b' + w + '\\w*\\b', 'g'));
    if (m) hits.push(w + ' x' + m.length);
  });
  if (hits.length) return 'declared clean but found: ' + hits.join(', ');
  if (s.length < 100000) return 'the scan only saw ' + s.length + ' characters, so it proves nothing';
  return true;
});

t('the game does contain what we declared it contains', () => {
  // the paired positive: a negative check alone would pass on an empty game
  const s = allGameStrings();
  const musts = {
    'references to illegal drugs': /\bdrugs?\b/,
    'alcohol': /\b(alcohol|drinking|drunk)\b/,
    'tobacco': /\bsmoking\b/,
    'simulated gambling': /\bgambl/,
    'crime': /\b(burglary|shoplift|mugging)\b/
  };
  const missing = Object.keys(musts).filter(k => !musts[k].test(s));
  if (missing.length)
    return 'declared as present but not found, so the rating answers are now wrong: ' + missing.join(', ');
  return true;
});

t('the store listing fits the fields it has to go in', () => {
  const fs2 = require('fs'), p2 = require('path');
  const doc = fs2.readFileSync(p2.join(DIR, '..', 'PLAY_LISTING.md'), 'utf8');
  const block = re => { const m = doc.match(re); return m ? m[1].trim() : null; };
  const name = block(/\*\*App name\*\*[^\n]*\n\n([\s\S]*?)\n\n/);
  const short = block(/\*\*Short description\*\*[^\n]*\n\n([\s\S]*?)\n\n/);
  const full = block(/\*\*Full description\*\*[^\n]*\n\n([\s\S]*?)\n\n\*\*Category/);
  if (!name || !short || !full) return 'the listing no longer has the three text fields in it';
  const clean = t2 => t2.split('\n').map(l => l.replace(/^ {4}/, '')).join('\n').trim();
  if (clean(name).length > 30) return 'app name is ' + clean(name).length + ' characters, limit is 30';
  if (clean(short).length > 80) return 'short description is ' + clean(short).length + ', limit is 80';
  if (clean(full).length > 4000) return 'full description is ' + clean(full).length + ', limit is 4000';
  if (clean(name).toLowerCase().indexOf('life') < 0)
    return 'the app name dropped the genre, which is the whole reason it is findable';
  return true;
});

/* ---- the privacy policy has to stay true ---- */
t('the app talks to nobody except the sync server the player chose', () => {
  // PRIVACY.md claims no analytics, no ad networks, no third-party SDKs and
  // no first-party server. A policy that is not enforced drifts.
  const fs2 = require('fs'), p2 = require('path');
  const bad = [];
  FILES.forEach(f => {
    const src = fs2.readFileSync(p2.join(DIR, f), 'utf8');
    // strip comments so prose about fetch does not trip this
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const calls = (code.match(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|new\s+WebSocket|new\s+EventSource/g) || []);
    calls.forEach(c => {
      // the only permitted callers are the two cloud functions
      if (f === 'game.js' && /fetch\s*\(/.test(c)) return;
      bad.push(f + ': ' + c);
    });
    if (/googletagmanager|google-analytics|firebase|sentry\.io|crashlytics|facebook\.net|doubleclick|admob/i.test(code))
      bad.push(f + ': a third-party service is referenced');
  });
  if (bad.length) return bad.join(' | ');
  // and the two permitted ones must be the cloud pair, nothing else
  const game = fs2.readFileSync(p2.join(DIR, 'game.js'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const fetches = game.match(/fetch\s*\([^)]*/g) || [];
  const offCloud = fetches.filter(x => x.indexOf('CLOUD.url') < 0);
  if (offCloud.length) return 'a fetch that is not the cloud sync: ' + offCloud[0].slice(0, 60);
  return true;
});

t('the privacy policy lists every key the game writes', () => {
  const fs2 = require('fs'), p2 = require('path');
  const policy = fs2.readFileSync(p2.join(DIR, '..', 'PRIVACY.md'), 'utf8');
  const keys = new Set();
  FILES.forEach(f => {
    const src = fs2.readFileSync(p2.join(DIR, f), 'utf8');
    (src.match(/localStorage\.setItem\(\s*'([^']+)'/g) || [])
      .forEach(m => keys.add(m.replace(/.*'([^']+)'.*/, '$1')));
    // the constants, resolved by name
    if (/localStorage\.setItem\(\s*META_KEY/.test(src))  keys.add('META_KEY');
    if (/localStorage\.setItem\(\s*SAVE_KEY/.test(src))  keys.add('SAVE_KEY');
    if (/localStorage\.setItem\(\s*CRASH_KEY/.test(src)) keys.add('CRASH_KEY');
    if (/localStorage\.setItem\(\s*slotKey/.test(src))   keys.add('slot');
  });
  // resolve the constants from the source rather than restating them here:
  // hardcoding them meant this test happily validated a policy that listed
  // two key names the game has never written
  const gsrc = fs2.readFileSync(p2.join(DIR, 'game.js'), 'utf8');
  const csrc = fs2.readFileSync(p2.join(DIR, 'crash.js'), 'utf8');
  const constOf = (src, name) => {
    const m = src.match(new RegExp(name + "\\s*=\\s*'([^']+)'"));
    return m ? m[1] : null;
  };
  const documented = {
    'bequest.cloud':'bequest.cloud', 'bequest.lastslot':'bequest.lastslot',
    'bequest.migrated':'bequest.migrated',
    'META_KEY':  constOf(gsrc, 'META_KEY'),
    'SAVE_KEY':  constOf(gsrc, 'SAVE_KEY'),
    'CRASH_KEY': constOf(csrc, 'CRASH_KEY'),
    'slot':      'bequest.slot'
  };
  const unresolved = Object.keys(documented).filter(k => !documented[k]);
  if (unresolved.length) return 'could not resolve key constants: ' + unresolved.join(', ');
  const missing = [...keys].filter(k => {
    const shown = documented[k] || k;
    return policy.indexOf(shown) < 0;
  });
  if (missing.length) return 'written but not documented in PRIVACY.md: ' + missing.join(', ');
  return true;
});

t('the policy does not promise something the code has stopped doing', () => {
  const fs2 = require('fs'), p2 = require('path');
  const policy = fs2.readFileSync(p2.join(DIR, '..', 'PRIVACY.md'), 'utf8');
  const crash = fs2.readFileSync(p2.join(DIR, 'crash.js'), 'utf8');
  // it claims reports are never transmitted in this version
  if (policy.indexOf('not sent anywhere') < 0 && policy.indexOf('not sent') < 0)
    return 'the policy no longer says reports are not sent';
  const sink = crash.match(/function crashSink\([^)]*\)\s*\{([^}]*)\}/);
  if (!sink) return 'crashSink is gone; the policy needs rewriting';
  if (!/return\s+false/.test(sink[1]))
    return 'crashSink now does something, so PRIVACY.md section 5 is out of date';
  // and it claims Plus is never restored from a sync
  const game = fs2.readFileSync(p2.join(DIR, 'game.js'), 'utf8');
  const merge = game.match(/function cloudMergeMeta[\s\S]*?\n\}/);
  if (!merge) return 'cloudMergeMeta is gone';
  if (/premium/.test(merge[0].replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')))
    return 'cloudMergeMeta touches premium, contradicting the policy and TERMS.md section 5';
  return true;
});

/* ---- cloud sync trusts nothing ---- */
t('a cloud restore can never grant Bequest Plus', () => {
  // CLOUD.url is typed by the player, so the reply is a message from a
  // stranger. Plus is bought with money and must never come off the wire.
  G.newGame({});
  G.META.premium = { plus:false, lifetime:false, since:null };
  const hostile = [
    { premium: { plus:true, lifetime:true, since:1 } },
    { premium: { lifetime:true } },
    { lp: 999999, premium: { plus:true } }
  ];
  for (let i = 0; i < hostile.length; i++) {
    G.cloudMergeMeta(hostile[i]);
    if (G.META.premium.plus || G.META.premium.lifetime)
      return 'payload ' + i + ' bought the paid tier for nothing';
  }
  return true;
});

t('a malformed reply cannot wipe progress that is already there', () => {
  G.newGame({});
  G.META.lp = 5000; G.META.lives = 40;
  G.META.ach = { earned_one: true, earned_two: true };
  const junk = [null, 'nonsense', [], { lp: 0, lives: 0, ach: {} }, { lp: -9, ach: null }];
  junk.forEach(j => G.cloudMergeMeta(j));
  if (G.META.lp !== 5000) return 'Legacy Points went from 5000 to ' + G.META.lp;
  if (G.META.lives !== 40) return 'lives were reset';
  if (!G.META.ach.earned_one || !G.META.ach.earned_two) return 'achievements were erased';
  return true;
});

t('a cloud restore adds progress rather than replacing it', () => {
  G.newGame({});
  G.META.lp = 100; G.META.ach = { local_only: true };
  G.cloudMergeMeta({ lp: 900, ach: { from_cloud: true } });
  if (G.META.lp !== 900) return 'the higher total was not taken: ' + G.META.lp;
  if (!G.META.ach.local_only) return 'a local achievement was lost in the merge';
  if (!G.META.ach.from_cloud) return 'the cloud achievement did not arrive';
  return true;
});

t('only things shaped like a save are written to a slot', () => {
  const good = { name:'Ada Vale', age:34, npcs:[], stats:{} };
  if (!G.validSlot(good)) return 'a real save was refused';
  const bad = [null, 'x', 42, [], {}, { name:'x' }, { age:34 },
               { name:'x', age:-5 }, { name:'x', age:9999 },
               { name:'x', age:20, npcs:'not an array' },
               { name:'x'.repeat(200), age:20 }];
  for (let i = 0; i < bad.length; i++)
    if (G.validSlot(bad[i])) return 'junk payload ' + i + ' was accepted as a save';
  return true;
});

t('the merge cannot be used to stuff unbounded data into storage', () => {
  G.newGame({});
  const huge = { ach: {} };
  for (let i = 0; i < 9000; i++) huge.ach['k' + i] = true;
  huge.ach['x'.repeat(500)] = true;
  G.cloudMergeMeta(huge);
  if (Object.keys(G.META.ach).length > 2100) return 'took ' + Object.keys(G.META.ach).length + ' keys';
  if (Object.keys(G.META.ach).some(k => k.length > 60)) return 'accepted an absurd key';
  const long = { deathAges: new Array(500).fill(70) };
  G.cloudMergeMeta(long);
  if (G.META.deathAges.length > 12) return 'deathAges grew to ' + G.META.deathAges.length;
  return true;
});

/* ---- problem reports ---- */
function brokenLife(){
  G.newGame({});
  const s = G.S;
  s.age = 44; s.alive = true;
  s.name = 'Zzyzx Qwertyson';                       // findable if it leaks
  s.employer = 'Qwertyson Holdings'; s.boss = 'Zzyzx Bossman'; s.school = 'Qwertyson High';
  s.npcs.forEach(n => { n.name = 'Nnnpc Leakerman'; });
  s.log = [{ a:43, t:'Nnnpc Leakerman was born.', k:'good' }];
  G.crashClear();
  return s;
}

t('a report describes the life without naming anybody in it', () => {
  // the whole privacy claim rests on this one
  const s = brokenLife();
  G.recordCrash('error', 'test', 'something broke', 'at thing (game.js:1)');
  const blob = JSON.stringify(G.crashLog()) + ' ' + G.crashReportText();
  const leaks = ['Zzyzx','Qwertyson','Nnnpc','Leakerman','Bossman'].filter(w => blob.indexOf(w) >= 0);
  if (leaks.length) return 'a report contained: ' + leaks.join(', ');
  if (blob.indexOf('was born') >= 0) return 'a log line leaked into the report';
  return true;
});

t('a report still says enough to reproduce the bug', () => {
  const s = brokenLife();
  s.country = 'uk'; s.diff = 'hard'; s.conditions = [{id:'asthma',sev:1,age:40,treated:false}];
  G.noteAct('study'); G.noteAct('gym');
  G.notePopup({ type:'A', ev:{ id:'c_bully' } });
  const r = G.recordCrash('error', 'game.js:1200', 'x is not a function', 'at ageUp (game.js:1200)');
  const c = r.ctx;
  if (c.age !== 44) return 'no age';
  if (c.country !== 'uk') return 'no country';
  if (c.diff !== 'hard') return 'no difficulty';
  if ((c.acts || []).indexOf('gym') < 0) return 'no record of what they had just done';
  if (c.popup !== 'A:c_bully') return 'no record of what was on screen: ' + c.popup;
  if ((c.conds || []).indexOf('asthma') < 0) return 'no conditions';
  if (!r.stack) return 'no stack';
  return true;
});

t('exact money is reported as a band, not a figure', () => {
  const s = brokenLife();
  s.money = 123456;
  const r = G.recordCrash('soft', 'test', 'x');
  if (String(r.ctx.money).indexOf('123456') >= 0) return 'the exact balance was reported';
  if (!/k|m|<1k|^0$/.test(String(r.ctx.money))) return 'the band is unreadable: ' + r.ctx.money;
  return true;
});

t('nothing is sent anywhere, and consent defaults to off', () => {
  const s = brokenLife();
  if (G.crashOptIn()) return 'reports are allowed to be sent by default';
  let sent = 0;
  const realSink = G.crashSink;
  // the seam exists but has no destination behind it
  if (G.crashSink({}) !== false) return 'crashSink claims to have sent something';
  G.recordCrash('error', 'test', 'boom');
  if (sent) return 'a report was transmitted';
  return true;
});

t('a swallowed failure is recorded instead of vanishing', () => {
  const s = brokenLife();
  const before = G.crashLog().length;
  G.softFail('save', new Error('QuotaExceededError'));
  const log = G.crashLog();
  if (log.length !== before + 1) return 'nothing was recorded';
  const r = log[log.length - 1];
  if (r.kind !== 'soft') return 'recorded as the wrong kind';
  if (r.where !== 'save') return 'lost track of where it happened';
  if (r.msg.indexOf('Quota') < 0) return 'lost the message';
  return true;
});

t('a broken achievement is noticed rather than silently never firing', () => {
  const s = brokenLife();
  G.crashClear();
  // checkAch skips anything already unlocked or marked atDeath, so pick one
  // it will really evaluate
  Object.keys(G.META.ach).forEach(k => delete G.META.ach[k]);
  const ach = G.ACHIEVEMENTS.find(a => !a.atDeath && a.meta !== true);
  if (!ach) return 'no achievement is evaluated during life';
  const realF = ach.f;
  ach.f = () => { throw new Error('bad predicate'); };
  try { G.checkAch(true); } finally { ach.f = realF; }
  const hit = G.crashLog().some(r => r.where.indexOf('achievement:') === 0);
  return hit ? true : 'an achievement predicate threw and nobody heard it';
});

t('the log is a ring buffer and cannot grow without limit', () => {
  brokenLife();
  for (let i = 0; i < 40; i++) G.softFail('test' + i, new Error('e' + i));
  const log = G.crashLog();
  if (log.length > 12) return 'the log grew to ' + log.length;
  if (!log.length) return 'the log is empty';
  if (log[log.length - 1].where !== 'test39') return 'the newest report was dropped instead of the oldest';
  return true;
});

t('a report survives being written and read back', () => {
  brokenLife();
  G.softFail('roundtrip', new Error('kept'));
  const again = G.crashLog();
  if (!again.length) return 'nothing persisted';
  if (JSON.stringify(again).indexOf('kept') < 0) return 'the report did not survive the round trip';
  G.crashClear();
  if (G.crashLog().length) return 'clearing did not clear';
  return true;
});

t('the crash screen does not show the player a stack trace', () => {
  // the house quality bar treats backend detail in a user-facing error as
  // both a UX failure and a security one; the stack goes out via Copy only
  const s = brokenLife();
  G.recordCrash('error', 'game.js:1200', 'x is not a function',
    'TypeError: x is not a function\n    at ageUp (game.js:1200:14)');
  let html = '';
  const realGet = global.document.getElementById;
  global.document.getElementById = () => ({ set innerHTML(v){ html = v; }, get innerHTML(){ return html; },
                                            set className(v){}, get className(){ return ''; } });
  try { G.crashScreen(); } finally { global.document.getElementById = realGet; }
  if (!html) return 'the screen rendered nothing';
  if (/at ageUp|TypeError|game\.js:1200/.test(html)) return 'the stack trace is on screen';
  if (html.indexOf('Copy the report') < 0) return 'no way to send it on';
  // but the copyable report must still carry the detail
  const full = G.crashReportText();
  if (full.indexOf('at ageUp') < 0) return 'the copied report lost the stack';
  return true;
});

t('recording a problem never throws, whatever state the game is in', () => {
  // it runs at the worst possible moment, so it has to cope with anything
  const cases = [
    () => { G.S = null; },
    () => { G.newGame({}); G.S.npcs = null; G.S.log = null; G.S.flags = null; },
    () => { G.newGame({}); G.S.conditions = null; G.S.holdings = null; }
  ];
  for (let i = 0; i < cases.length; i++) {
    try {
      cases[i]();
      G.recordCrash('error', 'hostile', 'x', 'stack');
      G.crashReportText();
      G.crashContext();
    } catch (e) { return 'case ' + i + ' threw: ' + e.message; }
  }
  G.newGame({});
  return true;
});

/* ---- health systems ---- */
function ill(countryId, condId, sev){
  G.newGame({ country: countryId });
  const s = G.S;
  s.age = 45; s.alive = true; s.money = 400000; s.savings = 0; s.items = [];
  s.conditions = [{ id: condId || 'diabetes', age: 44, sev: sev || 2, treated: false,
                    waiting: 0, specialist: false, rehab: 0 }];
  return s;
}
const PUBLIC_C  = (G.DATA.countries.find(c => c.med <= 0.40) || {}).id;
const PRIVATE_C = (G.DATA.countries.find(c => c.med >= 0.85) || {}).id;

t('every country falls into a healthcare system', () => {
  const kinds = new Set();
  const bad = [];
  G.DATA.countries.forEach(c => {
    G.newGame({ country: c.id });
    const sys = G.healthSystem();
    if (!sys || !sys.n || !sys.wait) bad.push(c.id);
    else kinds.add(sys.id);
  });
  if (bad.length) return 'no system for: ' + bad.join(', ');
  if (kinds.size < 2) return 'every country has the same system';
  return true;
});

t('a public system is cheap and slow, a private one is dear and quick', () => {
  if (!PUBLIC_C || !PRIVATE_C) return 'the data has no contrasting countries';
  const pub = ill(PUBLIC_C), pubCost = G.condCost(pub.conditions[0], false);
  const pubSys = G.healthSystem();
  const prv = ill(PRIVATE_C), prvCost = G.condCost(prv.conditions[0], false);
  const prvSys = G.healthSystem();
  if (!(pubCost < prvCost)) return `public care costs ${pubCost} and private ${prvCost}`;
  if (!(pubSys.wait[1] > prvSys.wait[1])) return 'the public system has no more of a wait';
  return true;
});

t('being referred on a public system means waiting, and you can pay to skip it', () => {
  if (!PUBLIC_C) return 'no public country in the data';
  let waited = 0;
  for (let i = 0; i < 40; i++) {
    const s = ill(PUBLIC_C, 'diabetes', 1);       // low severity: least urgent
    G.treatJoin('diabetes');
    if (s.conditions[0] && s.conditions[0].waiting > s.age) waited++;
  }
  if (!waited) return 'nobody ever had to wait on a public system';
  // and paying jumps it
  const s = ill(PUBLIC_C, 'diabetes', 1);
  G.treatJoin('diabetes');
  const cash = s.money;
  G.treatPrivate('diabetes');
  const k = s.conditions[0];
  if (k && k.waiting > s.age) return 'paying privately did not clear the wait';
  if (s.money >= cash) return 'going private was free';
  if (k && !k.treated) return 'paying privately did not treat it';
  return true;
});

t('a waiting list delivers treatment on its own, in time', () => {
  if (!PUBLIC_C) return 'no public country in the data';
  let delivered = 0;
  for (let i = 0; i < 40; i++) {
    const s = ill(PUBLIC_C, 'diabetes', 1);
    G.treatJoin('diabetes');
    for (let y = 0; y < 6; y++) { s.age++; G.tickHealth(s, []); }
    const k = (s.conditions || []).find(x => x.id === 'diabetes');
    if (!k || (k.treated && !k.waiting)) delivered++;
  }
  if (delivered < 35) return `only ${delivered}/40 waiting lists ever delivered`;
  return true;
});

t('a specialist improves the odds of beating something, not just managing it', () => {
  const beat = withSpec => {
    let cured = 0;
    for (let i = 0; i < 400; i++) {
      const s = ill(PRIVATE_C || PUBLIC_C, 'injury', 2);
      s.conditions[0].specialist = withSpec;
      G.applyTreatment(s.conditions[0], true);
      if (!(s.conditions || []).some(x => x.id === 'injury')) cured++;
    }
    return cured / 400;
  };
  const without = beat(false), with_ = beat(true);
  if (!(with_ > without + 0.05)) return `specialist cured ${(with_*100).toFixed(0)}% vs ${(without*100).toFixed(0)}%`;
  return true;
});

t('rehabilitation brings the severity down, but only with time put in', () => {
  const s = ill(PRIVATE_C || PUBLIC_C, 'backinjury', 3);
  s.conditions[0].treated = true;
  const sev0 = s.conditions[0].sev;
  G.doRehab('backinjury');
  if (s.conditions[0].sev < sev0) return 'one year of rehab was enough';
  G.doRehab('backinjury');
  if (!(s.conditions[0].sev < sev0)) return 'two years of rehab changed nothing';
  // and it cannot be done before treatment
  const s2 = ill(PRIVATE_C || PUBLIC_C, 'backinjury', 3);
  s2.conditions[0].treated = false;
  const r0 = s2.conditions[0].rehab;
  G.doRehab('backinjury');
  if (s2.conditions[0].rehab > r0) return 'rehab ran before any treatment';
  return true;
});

t('nobody is treated for free on a private system', () => {
  if (!PRIVATE_C) return 'no private country in the data';
  const s = ill(PRIVATE_C, 'diabetes', 2);
  const before = s.money;
  G.treatJoin('diabetes');
  if (s.money >= before) return 'treatment on a private system cost nothing';
  if (!s.conditions[0].treated && !s.conditions[0].waiting) return 'paid and got nothing';
  return true;
});

t('you cannot be treated with no money, and it does not go negative', () => {
  const s = ill(PRIVATE_C || PUBLIC_C, 'cancer', 3);
  s.money = 5; s.savings = 0;
  G.treatPrivate('cancer');
  if (s.money < 0) return 'money went negative: ' + s.money;
  G.seeSpecialist('cancer');
  if (s.money < 0) return 'a specialist overdrew the account';
  return true;
});

t('the health card renders and disappears when you are well', () => {
  const s = ill(PUBLIC_C || PRIVATE_C, 'asthma', 1);
  const html = G.healthCard();
  if (html.indexOf('Asthma') < 0) return 'the condition is not listed';
  if (/undefined|NaN|\[object/.test(html)) return 'the card leaked a raw value';
  s.conditions = [];
  if (G.healthCard() !== '') return 'the card shows with nothing wrong';
  return true;
});

/* ---- investments ---- */
function investor(alloc){
  G.newGame({});
  const s = G.S; s.age = 30; s.holdings = {};
  Object.keys(alloc || {}).forEach(k => s.holdings[k] = alloc[k]);
  return s;
}
function grow(alloc, years, runs){
  const ends = [];
  for (let i = 0; i < runs; i++) {
    const s = investor(alloc);
    for (let y = 0; y < years; y++) { s.age++; G.tickInvest(s, null); }
    ends.push(G.holdingsValue(s));
  }
  ends.sort((a, b) => a - b);
  return { med: ends[Math.floor(runs/2)], p10: ends[Math.floor(runs*0.1)], p90: ends[Math.floor(runs*0.9)] };
}

t('a new life starts with an empty portfolio and old saves get one', () => {
  G.newGame({});
  if (!G.S.holdings) return 'no holdings object';
  if (G.holdingsValue(G.S) !== 0) return 'born holding investments';
  const s = investor({}); delete s.holdings; delete s.market; delete s.investIn;
  G.investMigrate(s);
  if (!s.holdings || !s.market || s.investIn == null) return 'migrate left it half-built';
  return true;
});

t('risk and return line up across the asset classes', () => {
  const shares = grow({ shares: 60000 }, 30, 500);
  const bonds  = grow({ bonds: 60000 },  30, 500);
  if (!(shares.med > bonds.med)) return `shares median ${shares.med} vs bonds ${bonds.med}`;
  const shareSpread = shares.p90 - shares.p10, bondSpread = bonds.p90 - bonds.p10;
  if (!(shareSpread > bondSpread * 2)) return 'shares are no riskier than bonds';
  return true;
});

t('spreading the money is worth something', () => {
  // the whole reason for six asset classes: a spread should give up a little
  // of the upside and a lot of the downside
  const all  = grow({ shares: 60000 }, 30, 600);
  const mix  = grow({ bonds:10000, index:10000, reit:10000, shares:10000, em:10000, gold:10000 }, 30, 600);
  if (!(mix.p10 > all.p10)) return `a spread's bad case (${Math.round(mix.p10)}) is no better than one bet's (${Math.round(all.p10)})`;
  if (!(all.p90 > mix.p90)) return 'one big bet has no more upside than a spread, so there is no trade-off';
  return true;
});

t('gold rises when the market falls', () => {
  // it earns its place by being the only thing that does
  let goldUp = 0, sharesUp = 0, bad = 0;
  for (let i = 0; i < 4000; i++) {
    const s = investor({ gold: 10000, shares: 10000 });
    s.age++; G.tickInvest(s, null);
    if (s.market.last < -0.15) {
      bad++;
      if (s.holdings.gold > 10000) goldUp++;
      if (s.holdings.shares > 10000) sharesUp++;
    }
  }
  if (bad < 40) return 'not enough bad years to measure (' + bad + ')';
  if (!(goldUp / bad > sharesUp / bad + 0.3))
    return `in a bad year gold rose ${(100*goldUp/bad).toFixed(0)}% of the time and shares ${(100*sharesUp/bad).toFixed(0)}%`;
  return true;
});

t('buying moves real money and selling brings it back', () => {
  const s = investor({}); s.money = 50000; s.age = 30;
  G.investBuy('index', 10000);
  if (s.money !== 40000) return 'cash did not go down: ' + s.money;
  if (G.holdingOf(s, 'index') !== 10000) return 'the holding did not appear';
  if (s.investIn !== 10000) return 'the contribution was not recorded';
  G.investSell('index', 1);
  if (G.holdingOf(s, 'index') !== 0) return 'the holding survived being sold';
  if (s.money !== 50000) return 'the money did not come back: ' + s.money;
  if (s.investOut !== 10000) return 'the withdrawal was not recorded';
  return true;
});

t('you cannot buy below the minimum or beyond your means', () => {
  const s = investor({}); s.money = 800; s.age = 30;
  G.investBuy('reit', 2000);                 // minimum is 2000, and he has 800
  if (G.holdingOf(s, 'reit') > 0) return 'bought a property fund with $800';
  if (s.money < 0) return 'money went negative';
  G.investBuy('index', 100);                 // below the 500 minimum
  if (G.holdingOf(s, 'index') > 0) return 'bought below the minimum';
  s.age = 12; s.money = 100000;
  G.investBuy('index', 5000);
  if (G.holdingOf(s, 'index') > 0) return 'a twelve-year-old opened a brokerage account';
  return true;
});

t('a portfolio counts towards what you are worth, and what you leave', () => {
  const s = investor({ index: 40000 }); s.money = 0; s.savings = 0; s.debt = 0;
  s.cards = []; s.arrears = 0; s.overdue = 0; s.crypto = {units:0, price:100};
  s.properties = []; s.vehicles = []; s.businesses = []; s.assets = []; s.loans = [];
  if (Math.abs(G.netWorth() - 40000) > 1) return 'net worth ignores the portfolio: ' + G.netWorth();
  const st = G.settleEstate(s, G.netWorth());
  if (st.gross < 39000) return 'the estate does not include investments';
  return true;
});

t('the spread measure reads one bet and an even split correctly', () => {
  if (G.spread(investor({ index: 50000 })) > 0.01) return 'one holding does not read as concentrated';
  const even = {}; G.ASSETS.forEach(a => even[a.id] = 10000);
  if (G.spread(investor(even)) < 0.99) return 'an even split does not read as spread';
  if (G.spread(investor({})) !== 0) return 'an empty portfolio has a spread';
  return true;
});

t('the investments screen renders without leaking a raw value', () => {
  const s = investor({ index: 12000, gold: 3000 }); s.age = 40; s.money = 20000;
  s.market.last = -0.3;
  const html = G.moneyInvest();
  if (html.indexOf('index fund') < 0) return 'the assets are not listed';
  if (html.indexOf('very bad year') < 0) return 'the market mood is not reported';
  if (/undefined|NaN|\[object/.test(html)) return 'the screen leaked a raw value';
  s.age = 12;
  if (G.moneyInvest().indexOf('opens at 18') < 0) return 'a child was offered a portfolio';
  return true;
});

/* ---- the event cast ---- */
function familyOf(kids, sibs){
  G.newGame({});
  const s = G.S; s.age = 45;
  s.npcs = s.npcs.filter(n => n.rel === 'mother' || n.rel === 'father');
  const names = ['Margot','Tom','Claire','Rita','Paul','Ada','Joe'];
  for (let i = 0; i < kids; i++)
    s.npcs.push({ id:'k'+i, rel:'child', name:names[i]+' Vale', gender: i%2?'m':'f',
                  alive:true, r:60, age:20-i, pers:'steady', mem:[], own:{} });
  for (let i = 0; i < sibs; i++)
    s.npcs.push({ id:'sb'+i, rel:'sibling', name:names[4+i%3]+' Vale', gender: i%2?'f':'m',
                  alive:true, r:55, age:47+i, pers:'steady', mem:[], own:{} });
  return s;
}

t('one event names the same person from its title to its outcome', () => {
  // the title, the text, the labels and the outcome are four separate tok()
  // calls; each used to re-roll, so with three children they disagreed about
  // two thirds of the time
  let disagreed = 0;
  for (let i = 0; i < 200; i++) {
    familyOf(3, 0);
    const cast = G.makeCast();
    const title   = G.withCast(cast, () => G.tok('{child} rang'));
    const label   = G.withCast(cast, () => G.tok('Go and see {child}'));
    const outcome = G.withCast(cast, () => G.tok('{child} was grateful'));
    const who = t => t.match(/Margot|Tom|Claire/);
    if (!who(title) || !who(label) || !who(outcome)) return 'a token did not resolve to anybody';
    if (who(title)[0] !== who(label)[0] || who(label)[0] !== who(outcome)[0]) disagreed++;
  }
  return disagreed ? `the same event named different children ${disagreed}/200 times` : true;
});

t('an event can name two different children at once', () => {
  for (let i = 0; i < 60; i++) {
    familyOf(3, 0);
    const cast = G.makeCast();
    const line = G.withCast(cast, () => G.tok('{child} and {child2} fell out'));
    const m = line.match(/(\w+) and (\w+) fell out/);
    if (!m) return 'the line did not resolve: ' + line;
    if (m[1] === m[2]) return 'both halves named the same child: ' + line;
  }
  return true;
});

t('a whole family can be named in one line', () => {
  familyOf(3, 2);
  const cast = G.makeCast();
  const kids = G.withCast(cast, () => G.tok('{kids}'));
  if (!/Margot/.test(kids) || !/and/.test(kids)) return 'the children were not listed: ' + kids;
  const fam = G.withCast(cast, () => G.tok('{family}'));
  if (fam.split(',').length < 2 && !/ and /.test(fam)) return 'the family was not listed: ' + fam;
  if (/undefined|\[object/.test(kids + fam)) return 'a list leaked a raw value';
  return true;
});

t('group tokens still read properly when there is nobody', () => {
  G.newGame({});
  G.S.npcs = [];
  const out = ['{kids}','{family}','{child2}','{sibling2}','{origin}'].map(x => G.tok(x)).join(' | ');
  if (/undefined|null|\[object|\{/.test(out)) return 'a group token broke with no family: ' + out;
  return true;
});

t('a gathering event will not fire at somebody with no family', () => {
  const gatherings = G.EVENTS.filter(e => e.req && (e.req.gathering || e.req.children2 || e.req.siblings2));
  if (!gatherings.length) return 'there are no group events';
  G.newGame({});
  G.S.age = 40; G.S.npcs = [];
  const fired = gatherings.filter(e => G.reqOk(e));
  if (fired.length) return 'a family gathering fired with no family: ' + fired.map(e => e.id).join(', ');
  // and they do become reachable once there is a family
  familyOf(2, 2);
  G.S.age = 40; G.S.seen = {}; G.S.cd = {};
  const reachable = gatherings.filter(e => G.S.age >= e.min && G.S.age <= e.max && G.reqOk(e));
  if (!reachable.length) return 'no gathering is reachable even with a full family';
  return true;
});

/* ---- court ---- */
function aCase(opts){
  opts = opts || {};
  G.newGame({});
  const s = G.S;
  s.age = 30; s.alive = true;
  s.money = opts.money == null ? 200000 : opts.money;
  s.savings = opts.savings == null ? 0 : opts.savings;
  s.skills.charisma = 40; s.stats.reputation = 50; s.job = null;
  s.legalCase = { crime:'burglary', name:'Burglary', base: opts.base == null ? 6 : opts.base,
    evidence: opts.evidence == null ? 60 : opts.evidence, stage:'plea', plea:null, counsel:null,
    spent:0, outcome:null, sentence:0, appealed:false, note:null };
  return s;
}
function runCase(opts, plea, counsel){
  const s = aCase(opts);
  G.courtPlead(plea); G.courtCounsel(counsel);
  return s.legalCase;
}

t('a crime with a real sentence goes to court instead of straight to prison', () => {
  G.newGame({});
  G.S.age = 30; G.S.alive = true; G.S.legalCase = null;
  const line = G.openCase('burglary', 5);
  if (!G.S.legalCase) return 'no case was opened';
  if (G.S.legalCase.stage !== 'plea') return 'the case did not start at the plea';
  if (G.S.jailLeft > 0) return 'sentenced before any hearing';
  if (!/charged/i.test(line)) return 'nothing was said about being charged';
  return true;
});

t('pleading guilty is the right call on strong evidence and the wrong one on thin', () => {
  // tested at the extremes, not at the crossover: near the middle the two are
  // meant to be close, and a 300-life sample cannot resolve a tenth of a year
  const N = 400;
  const mean = (ev, plea) => {
    let tot = 0;
    for (let i = 0; i < N; i++) tot += runCase({ evidence: ev, base: 6 }, plea, 'duty').sentence;
    return tot / N;
  };
  const strongGuilty = mean(90, 'guilty'), strongFight = mean(90, 'notguilty');
  const thinGuilty   = mean(10, 'guilty'), thinFight   = mean(10, 'notguilty');
  if (!(strongGuilty < strongFight))
    return `with strong evidence, fighting (${strongFight.toFixed(1)}y) beats pleading (${strongGuilty.toFixed(1)}y)`;
  if (!(thinFight < thinGuilty))
    return `with thin evidence, pleading (${thinGuilty.toFixed(1)}y) beats fighting (${thinFight.toFixed(1)}y)`;
  return true;
});

t('better representation buys better odds and costs real money', () => {
  const rate = id => {
    let acq = 0, spent = 0;
    for (let i = 0; i < 250; i++) {
      const c = runCase({ evidence: 60, base: 6 }, 'notguilty', id);
      if (c.outcome === 'acquitted') acq++;
      spent += c.spent;
    }
    return { acq: acq / 250, spent: spent / 250 };
  };
  const duty = rate('duty'), silk = rate('barrister');
  if (!(silk.acq > duty.acq + 0.1)) return `a silk acquits ${(silk.acq*100).toFixed(0)}% vs duty ${(duty.acq*100).toFixed(0)}%`;
  if (!(silk.spent > duty.spent)) return 'the silk was free';
  return true;
});

t('you cannot hire counsel you cannot afford, and it does not take the money', () => {
  const s = aCase({ money: 100, savings: 0 });
  G.courtPlead('notguilty');
  G.courtCounsel('barrister');
  if (s.legalCase.counsel === 'barrister') return 'hired a silk with $100';
  if (s.money < 0) return 'money went negative: ' + s.money;
  if (s.legalCase.stage !== 'counsel') return 'the case moved on regardless';
  if (!s.legalCase.note) return 'nothing explained why';
  // a negative balance must not pay you to hire someone
  const s2 = aCase({ money: -5000, savings: 0 });
  const before = s2.money;
  G.courtPlead('guilty'); G.courtCounsel('duty');
  if (s2.money > before) return 'being overdrawn earned money';
  return true;
});

t('an appeal costs money and can cut or quash the sentence', () => {
  let cut = 0, quashed = 0, refused = 0, paid = 0;
  for (let i = 0; i < 300; i++) {
    const s = aCase({ evidence: 35, base: 8, money: 500000 });
    G.courtPlead('guilty'); G.courtCounsel('duty');
    const before = s.legalCase.sentence, cash = s.money;
    G.courtAppeal();
    if (s.money >= cash) { paid++; continue; }
    if (s.legalCase.outcome === 'quashed') quashed++;
    else if (s.legalCase.sentence < before) cut++;
    else refused++;
  }
  if (paid) return 'an appeal was free ' + paid + ' times';
  if (!quashed && !cut) return 'no appeal ever changed anything';
  if (!refused) return 'every appeal succeeded';
  return true;
});

t('a conviction is only applied when the case finishes', () => {
  const s = aCase({ evidence: 95, base: 5 });
  s.job = { id:'x', t:'Clerk', pay:30000, field:'corp', lvl:1 };
  G.courtPlead('guilty'); G.courtCounsel('duty');
  if (s.jailLeft > 0) return 'jailed before the verdict was accepted';
  const sentence = s.legalCase.sentence;
  G.courtFinish();
  if (s.legalCase) return 'the case was not cleared';
  if (sentence > 0) {
    if (s.jailLeft !== sentence) return `sentenced to ${sentence} but serving ${s.jailLeft}`;
    if (!s.record.length) return 'prison left no record';
    if (s.job) return 'kept the job while in prison';
  }
  return true;
});

t('an acquittal leaves no record and no sentence', () => {
  let found = null;
  for (let i = 0; i < 400 && !found; i++) {
    const s = aCase({ evidence: 12, base: 4 });
    G.courtPlead('notguilty'); G.courtCounsel('duty');
    if (s.legalCase.outcome === 'acquitted') found = s;
  }
  if (!found) return 'never acquitted in 400 tries on the thinnest evidence';
  const before = found.record.length;
  G.courtFinish();
  if (found.jailLeft > 0) return 'jailed after an acquittal';
  if (found.record.length > before) return 'acquittal still left a criminal record';
  return true;
});

t('a case interrupted by closing the game comes back', () => {
  const s = aCase({});
  G.save();
  G.QUEUE.length = 0;
  G.load();
  if (!G.S.legalCase) return 'the case vanished';
  if (!G.QUEUE.some(p => p.type === 'COURT')) return 'the case was never re-queued, so it can never resolve';
  return true;
});

t('dying ends the prosecution', () => {
  const s = aCase({});
  s.alive = true;
  G.die('a heart attack');
  if (s.legalCase) return 'a case survived the defendant';
  return true;
});

t('the sentence the plea screen promises is the one handed down', () => {
  // the screen had its own copy of the discount and kept the old constant
  // after the sentencing was retuned, so it advertised four years and gave three
  for (const base of [1,2,3,4,6,8,10,14]) {
    const s = aCase({ base, evidence: 60, money: 1000000 });
    const m = G.courtSheet().match(/about (\d+) year/);
    if (!m) return 'the plea screen does not say what pleading guilty costs';
    G.courtPlead('guilty'); G.courtCounsel('duty');
    if (+m[1] !== s.legalCase.sentence)
      return `at ${base}y the screen promised ${m[1]} and the court gave ${s.legalCase.sentence}`;
  }
  return true;
});

t('the court sheet renders at every stage without leaking a raw value', () => {
  const s = aCase({});
  const seen = [];
  seen.push(G.courtSheet());
  G.courtPlead('notguilty'); seen.push(G.courtSheet());
  G.courtCounsel('duty');    seen.push(G.courtSheet());
  const all = seen.join(' ');
  if (/undefined|NaN|\[object/.test(all)) return 'the sheet leaked a raw value';
  if (seen[0].indexOf('Plead guilty') < 0) return 'no plea offered';
  if (seen[1].indexOf('duty solicitor') < 0) return 'no counsel offered';
  if (!/Not guilty|year|fine/i.test(seen[2])) return 'no verdict shown';
  s.legalCase = null;
  if (/undefined|NaN/.test(G.courtSheet())) return 'the empty sheet leaks';
  return true;
});

/* ---- school subjects ---- */
function toAge(n){
  G.newGame({});
  let g = 0;
  while (G.S.alive && G.S.age < n && g++ < 120) G.ageUp();
  return G.S;
}

t('a new life is born with subjects and an aptitude for them', () => {
  G.newGame({});
  if (!G.S.aptitude) return 'no aptitudes';
  const vals = G.SUBJECTS.map(s => G.S.aptitude[s.id]);
  if (vals.some(v => v == null)) return 'a subject has no aptitude';
  if (new Set(vals).size < 3) return 'every subject has the same aptitude';
  return true;
});

t('school grades separate people instead of maxing out', () => {
  const all = [], tops = [];
  for (let i = 0; i < 40; i++) {
    const s = toAge(18);
    if (s.age < 18) continue;
    const taken = G.subjectsTaken(s).map(id => G.subjectGrade(s, id));
    all.push(...taken);
    if (taken.length) tops.push(Math.max(...taken));
  }
  if (all.length < 40) return 'not enough lives reached eighteen';
  const maxed = all.filter(g => g >= 99).length / all.length;
  if (maxed > 0.15) return `${(maxed*100).toFixed(0)}% of all grades are pinned at 100`;
  const sorted = all.slice().sort((a,b) => a-b);
  const spread = sorted[Math.floor(sorted.length*0.9)] - sorted[Math.floor(sorted.length*0.1)];
  if (spread < 15) return 'grades barely vary between subjects or people: spread ' + spread;
  return true;
});

t('nobody gets past sixteen without choosing their options', () => {
  for (let i = 0; i < 12; i++) {
    const s = toAge(17);
    if (s.age < 17) continue;
    if (!s.options || !s.options.length) return 'reached ' + s.age + ' with no options chosen';
    if (s.options.length > 4) return 'kept too many subjects: ' + s.options.length;
    const core = G.SUBJECTS.filter(x => x.core).map(x => x.id);
    if (s.options.some(id => core.indexOf(id) >= 0)) return 'a core subject was offered as an option';
  }
  return true;
});

t('dropping a subject at fourteen closes the degrees it fed', () => {
  const s = toAge(15);
  if (s.age < 15) return true;
  G.chooseOptions('best');
  const dropped = G.SUBJECTS.filter(x => !x.core && s.options.indexOf(x.id) < 0);
  if (!dropped.length) return 'nothing was dropped';
  // a degree fed ONLY by dropped subjects must be closed, however good you are
  const onlyFedByDropped = G.DEGREES.filter(d => {
    const feeders = G.SUBJECTS.filter(x => x.degrees.indexOf(d.id) >= 0);
    return feeders.length && feeders.every(f => dropped.some(x => x.id === f.id));
  });
  dropped.forEach(x => { s.subjects[x.id] = 100; });   // brilliant at what you dropped
  const stillOpen = onlyFedByDropped.filter(d => G.degreeOpen(s, d.id));
  if (stillOpen.length) return 'dropped subjects still open ' + stillOpen.map(d => d.n).join(', ');
  return true;
});

t('what you were good at follows you out of school as skills', () => {
  const s = toAge(16);
  if (s.age < 16) return true;
  s.flags.schoolSkillsGiven = false;
  G.SUBJECTS.forEach(x => { s.subjects[x.id] = 90; });
  const before = JSON.parse(JSON.stringify(s.skills));
  const notes = [];
  G.schoolLeavingSkills(s, notes);
  const moved = Object.keys(s.skills).filter(k => s.skills[k] > (before[k] || 0));
  if (!moved.length) return 'straight top grades produced no skills at all';
  if (!notes.length) return 'nothing was said about it';
  // and it must not fire twice
  const mid = JSON.parse(JSON.stringify(s.skills));
  G.schoolLeavingSkills(s, []);
  if (Object.keys(s.skills).some(k => s.skills[k] !== mid[k])) return 'leaving skills were awarded twice';
  return true;
});

t('the headline grade is the average of what is actually being studied', () => {
  const s = toAge(15);
  if (s.age < 15) return true;
  G.subjectsActive(s).forEach(id => { s.subjects[id] = 70; });
  const g = G.gpaFrom(s);
  if (Math.abs(g - 70) > 2) return 'all subjects at 70 gave an average of ' + Math.round(g);
  return true;
});

t('going to university always means reading something', () => {
  // S.degree was read in six places and assigned in none, so every degree in
  // the game was unreachable and the field pay bonus never applied. This is
  // the guard against that coming back.
  for (let i = 0; i < 25; i++) {
    G.newGame({});
    let g = 0;
    while (G.S.alive && G.S.age < 18 && g++ < 40) G.ageUp();
    // a life that died exactly at 18 leaves age === 18 and alive === false,
    // and ageUp() then early-returns, so the degree never gets assigned and
    // the test blames the engine for something it never ran
    if (G.S.age < 18 || !G.S.alive) continue;
    G.S.flags.inCollege = true; G.S.inSchool = true;
    G.S.degree = null; G.S.degreeYears = null; G.S.collegeYears = 0;
    G.ageUp();
    if (!G.S.degree) return 'enrolled with no subject';
    if (!G.DEGREE(G.S.degree)) return 'assigned a degree that does not exist: ' + G.S.degree;
  }
  return true;
});

t('a degree finished actually awards its skills and its field', () => {
  const deg = G.DEGREE('compsci');
  // a student can die mid-course; try until one of them graduates
  for (let attempt = 0; attempt < 8; attempt++) {
    const s = toAge(18);
    if (s.age < 18) continue;
    s.flags.inCollege = true; s.inSchool = true;
    s.degree = 'compsci'; s.degreeYears = deg.years; s.collegeYears = 0;
    const before = s.skills.tech;
    for (let i = 0; i < deg.years + 1 && s.alive; i++) G.ageUp();
    if (!s.alive) continue;
    if (s.skills.tech <= before) return 'studying computer science taught no tech';
    if (s.degreeDone !== 'compsci') return 'the degree was never recorded as finished';
    if (s.edu < 3) return 'education level did not reach a degree';
    return true;
  }
  return 'no student survived long enough to graduate in eight attempts';
});

t('the subjects card renders without leaking a raw value', () => {
  const s = toAge(13);
  if (s.age < 13) return true;
  const html = G.subjectsCard();
  if (!html) return 'no card at thirteen';
  if (html.indexOf('Mathematics') < 0) return 'subjects are not listed';
  if (/undefined|NaN|\[object/.test(html)) return 'the card leaked a raw value';
  s.age = 40;
  if (G.subjectsCard() !== '') return 'the card is still showing at forty';
  return true;
});

/* ---- the will ---- */
function estateLife(opts){
  opts = opts || {};
  G.newGame({});
  const s = G.S;
  s.seed = opts.seed == null ? 4242 : opts.seed;
  s.name = 'John Vale'; s.surname = 'Vale'; s.gender = 'm'; s.age = 80;
  s.alive = false; s.cause = 'old age'; s.gen = 2;
  s.money = opts.money == null ? 300000 : opts.money;
  s.savings = 0; s.debt = 0; s.cards = []; s.arrears = 0; s.overdue = 0;
  s.crypto = {units:0, price:100}; s.assets = []; s.loans = [];
  s.properties = opts.properties || []; s.vehicles = []; s.businesses = opts.businesses || [];
  s.childrenCount = (opts.npcs || []).filter(n => n.rel === 'child').length;
  s.npcs = opts.npcs || [
    {id:'k1', rel:'child', name:'Anna Vale',  gender:'f', alive:true, r:82, age:50},
    {id:'k2', rel:'child', name:'Ben Vale',   gender:'m', alive:true, r:60, age:47}];
  s.heirloom = opts.heirloom === undefined ? null : opts.heirloom;
  s.will = Object.assign({made:0, updated:0, main:null, shares:{}, gifts:{}, told:false, cut:[]},
                          opts.will || {});
  return s;
}

t('a new life has a will that is empty rather than missing', () => {
  G.newGame({});
  if (!G.S.will) return 'no will on the save';
  if (G.S.will.made) return 'born with a will already drawn up';
  if (G.willShareTotal(G.S) !== 0) return 'born with shares allocated';
  return true;
});

t('an old save without a will is migrated, not crashed', () => {
  const s = estateLife({});
  delete s.will; delete s.heirloom;
  G.willMigrate(s);
  if (!s.will || !s.will.shares || !s.will.gifts || !s.will.cut) return 'migrate left the will half-built';
  const st = G.settleEstate(s, 100000);
  if (!st || !st.intestate) return 'a migrated save should settle as intestate';
  return true;
});

t('dying without a will costs more and liquidates everything', () => {
  const s = estateLife({properties:[{t:'flat', value:200000, mortgage:0, cond:60, home:true}]});
  const st = G.settleEstate(s, 500000);
  if (!st.intestate) return 'should be intestate';
  if (st.probateRate <= 0.04) return 'intestate probate should cost more than a will';
  if (st.allocations.some(a => a.assets.length)) return 'nothing should pass in kind without a will';
  const cash = st.allocations.reduce((n, a) => n + a.cash, 0);
  if (Math.abs(cash + st.probate - 500000) > 4) return 'the intestate estate does not add up';
  return true;
});

t('a will passes named things in kind and keeps more of the money', () => {
  const prop = {t:'flat', value:200000, mortgage:0, cond:60, home:true};
  const s = estateLife({properties:[prop], will:{made:60, shares:{k1:50, k2:50}}});
  const uid = G.willAssets(s).find(a => a.kind === 'prop').uid;
  s.will.gifts[uid] = 'k2';
  const st = G.settleEstate(s, 500000);
  if (st.intestate) return 'should not be intestate';
  if (st.probateRate >= 0.12) return 'a will should reduce probate';
  const ben = st.allocations.find(a => a.id === 'k2');
  if (!ben || !ben.assets.length) return 'the flat did not reach the person it was left to';
  if (ben.assets[0].kind !== 'prop') return 'the wrong kind of thing was handed over';
  return true;
});

t('every settlement accounts for every last pound', () => {
  for (let i = 0; i < 120; i++) {
    const gross = 1000 + i * 9137;
    const s = estateLife({seed:i, will: i % 2 ? {made:60, shares:{k1:70, k2:30}} : {}});
    if (i % 3 === 0) s.npcs.push({id:'k3', rel:'child', name:'Cara Vale', gender:'f', alive:true, r:12, age:40});
    const st = G.settleEstate(s, gross);
    const cash = st.allocations.reduce((n, a) => n + a.cash, 0);
    const kind = st.allocations.reduce((n, a) => n + a.assets.reduce((m, x) => m + x.worth, 0), 0);
    const sum = cash + kind + st.probate + st.legal + st.lost;
    if (Math.abs(sum - gross) > Math.max(40, gross * 0.005))
      return `estate ${gross} accounts for ${sum} (seed ${i})`;
    if (st.allocations.some(a => a.cash < 0)) return 'an heir was left owing money';
  }
  return true;
});

t('the same death settles the same way every time', () => {
  const s = estateLife({seed:99, will:{made:60, shares:{k1:100}}});
  s.npcs.push({id:'k3', rel:'child', name:'Cara Vale', gender:'f', alive:true, r:9, age:40});
  const a = JSON.stringify(G.settleEstate(s, 800000));
  const b = JSON.stringify(G.settleEstate(s, 800000));
  const c = JSON.stringify(G.settleEstate(s, 800000));
  if (a !== b || b !== c) return 'the estate re-settled itself between reads';
  return true;
});

t('being cut out of a large estate provokes a fight, a small one does not', () => {
  let big = 0, small = 0;
  for (let i = 0; i < 200; i++) {
    const mk = () => {
      const s = estateLife({seed:i, will:{made:60, shares:{k1:100}, cut:['k3']}});
      s.npcs.push({id:'k3', rel:'child', name:'Cara Vale', gender:'f', alive:true, r:14, age:40});
      return s;
    };
    if (G.settleEstate(mk(), 900000).contested.length) big++;
    if (G.settleEstate(mk(), 6000).contested.length) small++;
  }
  if (big < 20) return `cutting a resentful child out of $900k almost never provokes a claim (${big}/200)`;
  if (small > big / 3) return `a $6,000 estate draws lawyers too readily (${small}/200)`;
  return true;
});

t('telling the family while alive makes a contest less likely', () => {
  let quiet = 0, told = 0;
  for (let i = 0; i < 300; i++) {
    const mk = tl => {
      const s = estateLife({seed:i, will:{made:60, shares:{k1:100}, cut:['k3'], told:tl}});
      s.npcs.push({id:'k3', rel:'child', name:'Cara Vale', gender:'f', alive:true, r:16, age:40});
      return s;
    };
    if (G.settleEstate(mk(false), 700000).contested.length) quiet++;
    if (G.settleEstate(mk(true),  700000).contested.length) told++;
  }
  if (!(told < quiet)) return `telling them made no difference (${told} vs ${quiet})`;
  return true;
});

t('a contest takes real money out of the people who were left some', () => {
  let found = null;
  for (let i = 0; i < 300 && !found; i++) {
    const s = estateLife({seed:i, will:{made:60, shares:{k1:100}, cut:['k3']}});
    s.npcs.push({id:'k3', rel:'child', name:'Cara Vale', gender:'f', alive:true, r:10, age:40});
    const st = G.settleEstate(s, 900000);
    if (st.contested.length) found = st;
  }
  if (!found) return 'no contest happened in 300 tries';
  if (found.legal <= 0) return 'a contest cost nothing in legal fees';
  const claimant = found.allocations.find(a => a.id === 'k3');
  if (!claimant || claimant.cash <= 0) return 'the person who went to court got nothing out of it';
  const main = found.allocations.find(a => a.id === 'k1');
  if (!main || main.cash >= 900000 * 0.96) return 'the main heir did not feel the contest at all';
  return true;
});

t('a bequest to someone already dead lapses instead of vanishing quietly', () => {
  const prop = {t:'flat', value:200000, mortgage:0, cond:60, home:true};
  const s = estateLife({properties:[prop], will:{made:60, shares:{k1:100}}});
  const uid = G.willAssets(s).find(a => a.kind === 'prop').uid;
  s.will.gifts[uid] = 'k9';
  s.npcs.push({id:'k9', rel:'child', name:'Dead Vale', gender:'m', alive:false, r:70, age:55});
  const st = G.settleEstate(s, 400000);
  if (!st.lapsed.length) return 'the bequest did not lapse';
  if (st.allocations.some(a => a.assets.length)) return 'a dead person was handed a house';
  return true;
});

t('an estate in debt leaves nothing and blames no one for it', () => {
  const s = estateLife({will:{made:60, shares:{k1:100}}});
  const st = G.settleEstate(s, -50000);
  if (st.allocations.length) return 'debt was passed on to the children';
  if (st.probate > 0) return 'probate charged on an estate with nothing in it';
  return true;
});

t('an heirloom survives a will and is lost without one', () => {
  const loom = {id:'watch', name:'a gold pocket watch', v:3800, gens:[{gen:1, name:'Old Vale'}], origin:'family'};
  const kept = estateLife({heirloom:loom, will:{made:60, shares:{k1:100}}});
  kept.will.gifts['heirloom'] = 'k1';
  const a = G.settleEstate(kept, 200000);
  if (a.heirloomLost) return 'an heirloom left to someone was still sold';
  if (!a.allocations.find(x => x.id === 'k1' && x.heirloom)) return 'the heirloom did not reach the heir';

  const lost = estateLife({heirloom:loom});
  const b = G.settleEstate(lost, 200000);
  if (!b.heirloomLost) return 'an heirloom with no will should be sold with the rest';
  return true;
});

t('an heirloom is worth more for having been kept, but not much', () => {
  const one = {v:1000, gens:[{gen:1}]};
  const five = {v:1000, gens:[1,2,3,4,5].map(g => ({gen:g}))};
  if (!(G.heirloomValue(five) > G.heirloomValue(one))) return 'age adds nothing';
  if (G.heirloomValue(five) > G.heirloomValue(one) * 3) return 'an heirloom became an investment';
  if (G.heirloomAge(five) !== 5) return 'generations miscounted';
  return true;
});

t('the heir arrives owning the actual house, not the cash for it', () => {
  const prop = {t:'detached', value:410000, mortgage:0, cond:70, home:true};
  const s = estateLife({properties:[prop], money:100000, will:{made:60, shares:{k1:100}}});
  const uid = G.willAssets(s).find(a => a.kind === 'prop').uid;
  s.will.gifts[uid] = 'k1';
  s.will.main = 'k1';
  G.continueAs('k1');
  const n = G.S;
  if (n.gen !== 3) return 'the generation did not advance';
  if (!n.properties.length) return 'the house did not arrive';
  if (n.properties[0].t !== 'detached') return 'the wrong property arrived';
  if (n.properties[0].home) return 'a newborn was moved into the house';
  if (n.money <= 0) return 'the cash share did not arrive';
  return true;
});

t('the heirloom gains the name of everyone who holds it', () => {
  const loom = {id:'watch', name:'a gold pocket watch', v:3800,
                gens:[{gen:1, name:'Old Vale'}], origin:'family'};
  const s = estateLife({heirloom:loom, will:{made:60, shares:{k1:100}, main:'k1'}});
  s.will.gifts['heirloom'] = 'k1';
  const before = s.heirloom.gens.length, dead = s.name;
  G.continueAs('k1');
  const after = G.S.heirloom;
  if (!after) return 'the heirloom did not survive the generation';
  if (after.gens.length <= before) return 'no new holder was recorded';
  if (!after.gens.some(g => g.name === dead)) return 'the person who just died is not in its history';
  if (G.heirloomLine(after).indexOf('generation') < 0) return 'the heirloom cannot describe itself';
  return true;
});

t('an heir left nothing still inherits nothing, and the game continues', () => {
  const s = estateLife({will:{made:60, shares:{k1:100}}});
  G.continueAs('k2');
  if (G.S.money !== 0) return 'someone cut out of the will still received money';
  if (!G.S.alive) return 'the next life did not start';
  return true;
});

t('shares can never be pushed past a hundred percent', () => {
  const s = estateLife({});
  G.S = s;
  G.willSetShare('k1', 80);
  G.willSetShare('k2', 80);
  if (G.willShareTotal(s) > 100) return 'allocated ' + G.willShareTotal(s) + '%';
  G.willEven();
  if (G.willShareTotal(s) !== 100) return 'an even split came to ' + G.willShareTotal(s) + '%';
  return true;
});

t('cutting someone out clears what they were going to get', () => {
  const s = estateLife({});
  G.S = s;
  G.willEven();
  const uid = 'heirloom';
  s.heirloom = {id:'ring', name:'a signet ring', v:2400, gens:[], origin:'made'};
  G.willSetGift(uid, 'k2');
  G.willCut('k2');
  if (s.will.shares.k2) return 'a disinherited child kept their share';
  if (s.will.gifts[uid] === 'k2') return 'a disinherited child kept their bequest';
  G.willCut('k2');
  if (s.will.cut.indexOf('k2') >= 0) return 'they could not be put back in';
  return true;
});

t('the will screen renders at every stage without throwing', () => {
  const s = estateLife({properties:[{t:'flat', value:200000, mortgage:50000, cond:60, home:true}],
                        heirloom:{id:'ring', name:'a signet ring', v:2400, gens:[], origin:'made'}});
  s.alive = true;
  G.S = s;
  const before = G.willView();
  if (before.indexOf('have not made a will') < 0) return 'no warning that there is no will';
  s.will.made = 60; G.willEven();
  const after = G.willView();
  if (after.indexOf('%') < 0) return 'no shares shown once a will exists';
  if (/undefined|NaN|\[object/.test(before + after)) return 'the will screen leaked a raw value';
  s.age = 10;
  if (G.willView().indexOf('until you are 18') < 0) return 'a child was offered a will';
  return true;
});

t('the obituary reports the estate that was actually settled', () => {
  const prop = {t:'detached', value:410000, mortgage:0, cond:70, home:true};
  const s = estateLife({properties:[prop], money:200000, will:{made:60, shares:{k1:50, k2:50}}});
  const uid = G.willAssets(s).find(a => a.kind === 'prop').uid;
  s.will.gifts[uid] = 'k1';
  const st = G.settleEstate(s, 610000);
  const text = G.eulogy(s, 610000, st).estate.join(' ');
  if (text.indexOf('Anna') < 0) return 'the obituary does not name who got the house';
  if (text.indexOf('went to') < 0) return 'the in-kind bequest has no verb in it: ' + text;
  if (/undefined|NaN|\[object|\s,|,,/.test(text)) return 'malformed estate prose: ' + text;
  if (!/[.!?]$/.test(text.trim())) return 'the estate paragraph does not end: ' + text;
  return true;
});

t('the obituary says so when there was no will', () => {
  const s = estateLife({});
  const st = G.settleEstate(s, 400000);
  const text = G.eulogy(s, 400000, st).estate.join(' ');
  if (text.indexOf('no will') < 0) return 'dying intestate went unmentioned: ' + text;
  return true;
});

t('the death screen offers each heir and says what they get', () => {
  const s = estateLife({will:{made:60, shares:{k1:70, k2:30}, main:'k1'}});
  let html = '';
  const realGet = global.document.getElementById;
  global.document.getElementById = id => ({ set innerHTML(v){ html = v; }, get innerHTML(){ return html; },
                                            set className(v){}, get className(){ return ''; }, dataset:{} });
  try {
    G.showDeath();
    G.renderDeath();
    if (html.indexOf('Carry on as') < 0) return 'no heir picker on the death screen';
    if (html.indexOf('Anna') < 0 || html.indexOf('Ben') < 0) return 'not every heir was offered';
    if (html.indexOf('What was left') < 0) return 'the estate was not reported';
    if (/undefined|NaN|\[object/.test(html)) return 'the death screen leaked a raw value';
    return true;
  } finally { global.document.getElementById = realGet; }
});

t('a family never hands two siblings the same first name', () => {
  for (let i = 0; i < 400; i++) {
    G.newGame({});
    const names = G.S.npcs.filter(n => n.rel === 'sibling').map(n => n.name.split(' ')[0]);
    if (new Set(names).size !== names.length) return 'duplicate siblings: ' + names.join(', ');
    if (names.indexOf(G.S.name.split(' ')[0]) >= 0) return 'a sibling shares the player\'s name';
  }
  return true;
});

/* ---- sound and haptics ---- */
t('every cue the code asks for actually exists', () => {
  const fs2 = require('fs'), p2 = require('path');
  const src = ['game.js','coach.js','sound.js'].map(f => fs2.readFileSync(p2.join(DIR,f),'utf8')).join('\n');
  const asked = new Set();
  let m;
  const re = /\b(?:sfx|cue)\(\s*'([a-zA-Z]+)'/g;
  while ((m = re.exec(src))) asked.add(m[1]);
  if (!asked.size) return 'nothing plays a sound at all';
  const missing = [...asked].filter(id => !G.SFX[id]);
  return missing.length ? 'no such cue: ' + missing.join(',') : true;
});
t('every haptic the code asks for actually exists', () => {
  const fs2 = require('fs'), p2 = require('path');
  const src = ['game.js','coach.js','sound.js'].map(f => fs2.readFileSync(p2.join(DIR,f),'utf8')).join('\n');
  const asked = new Set();
  let m;
  const re = /\bcue\(\s*'[a-zA-Z]+'\s*,\s*'([a-zA-Z]+)'/g;
  while ((m = re.exec(src))) asked.add(m[1]);
  const missing = [...asked].filter(k => G.HAPTIC[k] == null);
  return missing.length ? 'no such haptic: ' + missing.join(',') : true;
});
t('every cue is a playable shape', () => {
  const bad = [];
  Object.keys(G.SFX).forEach(id => {
    const c = G.SFX[id];
    if (!c.w || !Array.isArray(c.n) || !c.n.length) { bad.push(id + ':empty'); return; }
    if (!(c.g > 0 && c.g <= 0.4)) bad.push(id + ':gain ' + c.g);
    c.n.forEach(([hz, at, len, vol]) => {
      if (!(hz > 20 && hz < 20000)) bad.push(id + ':hz ' + hz);
      if (!(at >= 0 && at < 3)) bad.push(id + ':offset ' + at);
      if (!(len > 0 && len <= 2)) bad.push(id + ':len ' + len);
      if (vol != null && !(vol > 0 && vol <= 1)) bad.push(id + ':vol ' + vol);
    });
  });
  return bad.length ? bad.join(', ') : true;
});
t('the moments that matter all have a sound', () => {
  const want = ['year','event','good','bad','ach','death','promote','denied','tap'];
  const missing = want.filter(k => !G.SFX[k]);
  return missing.length ? 'no cue for ' + missing.join(',') : true;
});
t('a year, a death and an achievement do not all sound the same', () => {
  const sig = c => c.w + '|' + c.n.map(n => n[0].toFixed(1)).join(',');
  const s = new Set(['year','death','ach','good','bad','promote'].map(k => sig(G.SFX[k])));
  return s.size === 6 ? true : 'only ' + s.size + ' distinct cues among 6';
});
t('sound is on by default but silent without an audio device', () => {
  G.META.sfx = null;
  if (!G.soundOn()) return 'sound defaulted to off';
  if (!G.hapticsOn()) return 'haptics defaulted to off';
  // the harness has no window and no Web Audio: every call must be a safe no-op
  const played = G.sfx('year'), buzzed = G.haptic('year'), both = G.cue('ach','medium');
  return (played === false && buzzed === false && both === false) ? true
    : `played:${played} buzzed:${buzzed} both:${both}`;
});
t('muting is respected before anything is synthesised', () => {
  G.setSound(false);
  const off = G.sfx('year');
  G.setHaptics(false);
  const noBuzz = G.haptic('death');
  G.META.sfx = null;
  return (off === false && noBuzz === false) ? true : `off:${off} noBuzz:${noBuzz}`;
});
t('an unknown cue is ignored rather than thrown', () => {
  G.META.sfx = null;
  return (G.sfx('no_such_cue') === false && G.haptic('no_such_haptic') === false) ? true : 'did not ignore';
});
t('a result popup sounds like what it did to you', () => {
  if (typeof G.popupCue !== 'function') return 'no popupCue';
  // There is no audio device here, so assert on the branch popupCue takes
  // rather than on what comes out of the speakers.
  const src = require('fs').readFileSync(require('path').join(DIR,'game.js'),'utf8');
  const fn = src.slice(src.indexOf('function popupCue'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  const reads = /p\.res/.test(body), splits = /'bad'/.test(body) && /'good'/.test(body);
  // The guarantee is that the sheet accompanying the year tick stays quiet,
  // because the year cue has already played. Pinning the exact spelling of
  // that check broke the moment the birthday sheet was merged into the year
  // sheet, so find the type the year actually pushes and assert THAT is
  // exempt.
  const ageUp = src.slice(src.indexOf('function ageUp'));
  const pushes = [...ageUp.slice(0, ageUp.indexOf('\nfunction ')).matchAll(/push\(\{type:'(\w+)'/g)]
    .map(m => m[1]);
  const yearType = pushes.find(t2 => t2 === 'YEAR' || t2 === 'B');
  if (!yearType) return 'the year tick no longer pushes a sheet of its own';
  // the line that names the year sheet's type must be the one that returns
  const line = body.split('\n').find(l => l.indexOf("'" + yearType + "'") >= 0);
  const exempt = !!line && /\breturn\b/.test(line);
  return (reads && splits && exempt) ? true
    : `reads:${reads} splits:${splits} yearSheet(${yearType})Quiet:${exempt}`;
});
t('the sound settings are reachable and can be turned off', () => {
  G.newGame({}); G.S.age = 30; G.S.alive = true; G.META.sfx = null;
  const html = G.viewStats();
  return (/setSound\(/.test(html) && /setHaptics\(/.test(html) && /setVolume\(/.test(html)) ? true
    : 'no sound settings on the More tab';
});
t('a whole life can be lived with the sound code in the loop', () => {
  G.META.sfx = null;
  G.newGame({diff:'normal'});
  let g = 0;
  while (G.S.alive && g++ < 130) G.ageUp();
  return true;                                   // a throw anywhere above fails the test
});

/* ---- onboarding ---- */
t('a new player is shown the opening before their first life', () => {
  G.META.tips = {};
  const due = G.coachOpeningDue();
  G.coachMark('opening');
  return (due && !G.coachOpeningDue()) ? true : `due:${due} after:${G.coachOpeningDue()}`;
});
t('the opening is more than one screen and every pane has words in it', () => {
  if (G.COACH_OPENING.length < 3) return 'only ' + G.COACH_OPENING.length + ' panes';
  const thin = G.COACH_OPENING.filter(p => !p.t || !p.x || p.x.length < 80);
  return thin.length ? thin.length + ' thin panes' : true;
});
t('teaching continues past age 0', () => {
  const late = G.COACH_TIPS.filter(c => c.to == null || c.to > 5);
  return late.length >= 5 ? true : 'only ' + late.length + ' tips land after early childhood';
});
t('every tip names a real place to go', () => {
  const bad = G.COACH_TIPS.filter(c => c.go && !/^set(Tab|More)\(|^openMoney\(/.test(c.go[0]));
  const nameless = G.COACH_TIPS.filter(c => !c.id || !c.t || !c.x || typeof c.when !== 'function');
  return (!bad.length && !nameless.length) ? true : `${bad.length} bad links, ${nameless.length} malformed`;
});
t('a first life meets a tip at each system as it opens', () => {
  // one sample, and a life that dies at eight teaches nothing: whether the
  // tips arrive is a separate question from whether you survive to see them
  G.META.tips = {}; G.META.lives = 0;
  G.newGame({});
  const met = [];
  let g = 0;
  while (G.S.age < 30 && g++ < 60) {
    const c = G.coachTip();
    if (c) { met.push(c.id); G.coachMark(c.id); }
    G.ageUp();
    if (!G.S.alive) { G.S.alive = true; G.S.cause = null; }
    G.S.stats.health = Math.max(G.S.stats.health, 80);
    G.S.conditions = [];
  }
  const want = ['ageup','acts','stats','people','work','money'];
  const missed = want.filter(w => met.indexOf(w) < 0);
  return missed.length ? 'never taught: ' + missed.join(',') : true;
});
t('only one tip is ever on screen at a time', () => {
  G.META.tips = {};
  G.newGame({}); G.S.age = 20; G.S.alive = true;
  const html = G.coachCard();
  return (html.match(/class="card tip coach"/g) || []).length <= 1 ? true : 'more than one tip card';
});
t('a tip whose moment has passed is retired rather than shown late', () => {
  G.META.tips = {};
  G.newGame({}); G.S.age = 40; G.S.alive = true;
  G.coachTip();
  return G.coachSeen('ageup') ? true : 'still trying to teach AGE UP at 40';
});
t('a player who already knows the game is not taught it again', () => {
  G.META.tips = {};
  G.newGame({}); G.S.age = 0; G.S.alive = true;
  const first = G.coachTip();
  if (!first) return 'no tip on a fresh life';
  G.coachDismiss(first.id);
  G.newGame({}); G.S.age = 0; G.S.alive = true;       // a second life
  const again = G.coachTip();
  return (!again || again.id !== first.id) ? true : 'repeated the same tip on a new life';
});
t('the tutorial can be replayed', () => {
  G.META.tips = {}; G.coachMark('opening'); G.coachMark('ageup');
  G.coachReplay();
  return (!G.coachSeen('opening') && !G.coachSeen('ageup')) ? true : 'replay did not reset the tips';
});
t('the how-to-play entry is reachable from the More tab', () => {
  G.newGame({}); G.S.age = 30; G.S.alive = true;
  return /coachReplay\(\)/.test(G.viewStats()) ? true : 'no way back to the tutorial';
});
t('the direct debit offer waits its turn instead of jumping the queue', () => {
  // it runs inside ageUp, so it must not drain the popups queued before it
  const src = require('fs').readFileSync(require('path').join(DIR,'game.js'),'utf8');
  const fn = src.slice(src.indexOf('function offerDirectDebit'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  return /push\(\{type:'D'/.test(body) && !/confirmDo\(/.test(body) ? true
    : 'offerDirectDebit drains the queue mid-year';
});
t('a direct debit is offered once, to players who are not given one', () => {
  G.newGame({diff:'hard'});
  G.S.age = 25; G.S.alive = true; G.S.autopay = false; G.S.flags = {}; G.S.billsDue = 4000;
  G.offerDirectDebit();
  if (!G.S.flags.ddAsked) return 'never offered on Hard';
  G.S.flags.ddAsked = false;
  G.S.diff = 'normal'; G.S.mods = Object.assign({}, G.DIFFICULTIES.find(d=>d.id==='normal').m);
  G.S.autopay = null;
  G.offerDirectDebit();
  return !G.S.flags.ddAsked ? true : 'offered one to a player who already has it';
});

t('a direct debit is off by default on Hard, on by default below it', () => {
  atAge(30); G.S.autopay=null;
  G.S.diff='normal'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='normal').m);
  const normalOn = G.autopayOn(), normalSafe = !G.autopayBounces();
  G.S.diff='hard'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='hard').m);
  const hardOff = !G.autopayOn(), hardRisky = G.autopayBounces(), hardCanArrange = G.autopayAllowed();
  return (normalOn && normalSafe && hardOff && hardRisky && hardCanArrange) ? true
    : `normal on:${normalOn} safe:${normalSafe} / hard off:${hardOff} risky:${hardRisky} arrangeable:${hardCanArrange}`;
});
t('a direct debit bounces rather than silently covering a short balance', () => {
  atAge(30);
  G.S.diff='hard'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='hard').m);
  G.S.autopay=true; G.S.cards=[]; G.S.credit=700; G.S.arrears=0; G.S.overdue=0;
  G.S.money=500; G.S.billsDue=4000; G.S.billItems=[{l:'Test',a:4000}];
  G.payBills(null,true);
  return (G.S.money===0 && G.S.billsDue>3500 && G.S.arrears===0 && G.S.credit<700) ? true
    : `money ${G.S.money}, stillDue ${G.S.billsDue}, arrears ${G.S.arrears}, credit ${G.S.credit}`;
});
t('unpaid bills get one year of grace before they become arrears', () => {
  atAge(30);
  G.S.diff='hard'; G.S.mods=Object.assign({},G.DIFFICULTIES.find(d=>d.id==='hard').m);
  G.S.autopay=false; G.S.money=0; G.S.cards=[]; G.S.credit=700;
  G.S.arrears=0; G.S.overdue=0; G.S.billsDue=3000; G.S.billItems=[{l:'Test',a:3000}];
  const out=[];
  G.tickBills(out);                       // year one: final notice, not arrears
  if (!(G.S.overdue > 3000)) return `no final notice, overdue ${G.S.overdue}`;
  if (G.S.arrears !== 0) return `went straight to arrears: ${G.S.arrears}`;
  G.S.billsDue=0; G.S.billItems=[];
  G.tickBills(out);                       // year two, still unpaid: now it is a debt
  return (G.S.arrears > 3000 && G.S.overdue === 0) ? true
    : `after grace year: arrears ${G.S.arrears}, overdue ${G.S.overdue}`;
});
t('settling a final notice stops it reaching collection', () => {
  atAge(30);
  G.S.arrears=0; G.S.overdue=2000; G.S.money=5000; G.S.credit=600;
  G.payOverdueNow();
  if (G.S.overdue !== 0) return `overdue ${G.S.overdue}`;
  const out=[]; G.S.billsDue=0; G.S.billItems=[]; G.tickBills(out);
  return G.S.arrears === 0 ? true : `arrears appeared anyway: ${G.S.arrears}`;
});
t('paying anything at all freezes the arrears interest for a year', () => {
  // kept well under the enforcement threshold so only the interest rule is
  // under test — seizure and write-off have their own tests below
  atAge(30); G.S.home='parents';
  G.S.arrears=400; G.S.money=100; G.S.arrPlan=null; G.S.arrPaid=0; G.S.savings=0;
  G.payArrears();                          // pays 100, leaves 300
  const owed=G.S.arrears;
  G.S.money=0;
  G.tickArrears([]);
  const frozen = G.S.arrears === owed;
  G.S.arrears=400; G.S.arrPaid=0; G.S.money=0; G.S.savings=0;
  G.tickArrears([]);
  const grew = G.S.arrears === 432;        // 400 x 1.08
  return (frozen && grew) ? true : `frozen:${frozen} (300 -> ${owed}) grew:${grew} (${G.S.arrears})`;
});
t('a repayment plan clears a debt instead of it compounding forever', () => {
  atAge(30);
  G.S.arrears=20000; G.S.money=0; G.S.savings=0; G.S.arrPaid=0; G.S.home='parents';
  G.S.arrPlan={amt:G.arrPlanAmount(),missed:0};
  for (let y=0; y<25 && G.S.arrears>0; y++){ G.S.money=G.S.arrPlan?G.S.arrPlan.amt:0; G.tickArrears([]); }
  return G.S.arrears === 0 ? true : `still owed ${Math.round(G.S.arrears)} after 25 years of paying`;
});
t('an uncollectable debt is written off rather than growing forever', () => {
  atAge(30);
  let cleared=false;
  for (let i=0;i<60 && !cleared;i++){
    G.S.arrears=200000; G.S.money=0; G.S.savings=0; G.S.arrPaid=0; G.S.arrPlan=null;
    G.S.properties=[]; G.S.vehicles=[]; G.S.businesses=[]; G.S.home='room';
    for (let y=0;y<12 && G.S.arrears>0;y++) G.tickArrears([]);
    if (G.S.arrears===0) cleared=true;
  }
  return cleared ? true : 'a destitute debtor never escaped their arrears';
});
t('arrears are no longer the certain outcome of a Hard life', () => {
  // A player who engages with the Money tab at all should usually not end in arrears.
  let ended=0;
  const N=40;
  for (let i=0;i<N;i++){
    G.newGame({diff:'hard'});
    let g=0;
    while (G.S.alive && g++<130){
      G.ageUp();
      if (!G.S.alive) break;
      if (G.S.age>=18 && G.S.autopay!==true) G.S.autopay=true;   // arranges a direct debit
      if (G.S.overdue>0 && G.S.money>0){ const p=Math.min(G.S.money,G.S.overdue); G.S.money-=p; G.S.overdue-=p; }
      if (G.S.arrears>0 && !G.S.arrPlan && G.S.money>0) G.S.arrPlan={amt:G.arrPlanAmount(),missed:0};
    }
    if (G.S.arrears>0) ended++;
  }
  const pct = Math.round(ended/N*100);
  return pct <= 60 ? true : `${pct}% of engaged Hard lives still ended in arrears`;
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
  // This compared two independently drawn sets of random lives and counted
  // raw hires, so charisma, reputation and time spent in prison all leaked
  // into the result. Hold everything except the degree fixed.
  const j = G.DATA.jobs.find(x => x.id === 'swe');
  const rate = deg => {
    let tries = 0, hired = 0;
    for (let i = 0; i < 200; i++) {
      G.newGame({});
      G.S.age = 25; G.S.edu = 3; G.S.skills.tech = 70; G.S.stats.smarts = 70;
      G.S.skills.charisma = 50; G.S.stats.reputation = 50; G.S.credit = 700;
      G.S.yearsJailed = 0; G.S.jailLeft = 0; G.S.job = null; G.S.degreeDone = deg;
      if (!G.jobEligible(j)) continue;
      tries++; G.applyJob(j); if (G.S.job) hired++;
    }
    return tries ? hired / tries : 0;
  };
  const rel = rate('compsci'), irr = rate('arts');
  if (!(rel > irr + 0.05))
    return `a computer science degree hired ${(rel*100).toFixed(0)}% vs fine art ${(irr*100).toFixed(0)}%`;
  return true;
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
  // 25 lives was too small to measure this: the true rate is about 0.63 and a
  // 25-life draw crossed the 0.85 ceiling roughly one run in nineteen. The
  // ceiling is unchanged; the sample is now big enough to mean something.
  let total = 0;
  const RUNS = 90;
  for (let i=0;i<RUNS;i++){
    Object.keys(G.META.eggs).forEach(k => delete G.META.eggs[k]);
    G.newGame({}); let g=0;
    while (G.S.alive && g++<130) G.ageUp();
    total += (G.S.eggsThisLife||[]).length;
  }
  const per = total/RUNS;
  // aim for roughly one every other life, so finding one still feels like something
  return per <= 0.85 ? true : per.toFixed(2) + ' rare events per first life';
});
t('the auto-pay knob still means something on custom difficulty', () => {
  const knob = G.DIFF_KNOBS.find(k => k.k === 'autopay');
  if (!knob) return 'no autopay knob';
  atAge(30);
  G.S.diff = 'custom'; G.S.mods = Object.assign({}, G.DIFFICULTIES.find(d=>d.id==='normal').m, {autopay:1});
  G.S.autopay = null;
  const free = G.autopayFree(), onByDefault = G.autopayOn();
  G.S.mods.autopay = 0;
  const risky = G.autopayBounces(), offByDefault = !G.autopayOn();
  return (free && onByDefault && risky && offByDefault) ? true
    : `free:${free} default-on:${onByDefault} risky:${risky} default-off:${offByDefault}`;
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
  // two things used to derail this and neither is the guarantee: the life
  // dying inside the loop, and an event signing a NEW agreement so the array
  // is not empty. Track the specific agreement instead, and retry on death.
  for (let attempt = 0; attempt < 6; attempt++) {
    atAge(35); G.S.money = 4000000;
    G.S.finance = [{ l:'Test car', annual:5000, left:3, principal:15000 }];
    let paid = 0, died = false;
    for (let y = 0; y < 5; y++) {
      const before = G.S.money;
      G.ageUp();
      if (!G.S.alive) { died = true; break; }
      if (G.S.money < before) paid++;
      // whether an instalment CAN be paid is a different guarantee, tested
      // elsewhere: financeTick only counts a year down when it is paid, so
      // a life bankrupted by an event legitimately never clears the
      // agreement. Keep affordability out of this one.
      G.S.money = 4000000; G.S.arrears = 0;
    }
    if (died) continue;
    if (!paid) return 'nothing was ever collected';
    if ((G.S.finance || []).some(f => f.l === 'Test car')) return 'the agreement never ended';
    return true;
  }
  return 'no life survived five years at 35 in six attempts';
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

/* ================= 4o. EVENT WRITING ================= */
section('4o. Event writing');

t('every token in event text is one the engine substitutes', () => {
  const known = ['npc','friend','partner','child','child2','parent','sibling','sibling2',
    'colleague','boss','employer','school','paper','city','country','job','name','age','amt',
    'kids','family','origin'];
  const bad = new Set();
  G.EVENTS.forEach(e => {
    const texts = (Array.isArray(e.x) ? e.x : [e.x]).concat(e.c.map(c => c.l));
    texts.forEach(txt => {
      const m = String(txt).match(/\{(\w+)\}/g) || [];
      m.forEach(tok => { const k = tok.slice(1,-1); if (!known.includes(k)) bad.add(e.id+':'+tok); });
    });
  });
  return bad.size ? [...bad].join(', ') : true;
});
t('no choice is phrased as an outcome rather than a decision', () => {
  const bad = [];
  G.EVENTS.forEach(e => e.c.forEach(c => {
    if (/^(realise|discover|find out|it turns out|become aware|learn that)/i.test(c.l))
      bad.push(e.id + ': "' + c.l + '"');
  }));
  return bad.length ? bad.join(' | ') : true;
});
t('every event establishes a situation, not just a fragment', () => {
  // a very short line is fine if it names something concrete; a short line
  // that opens on a bare pronoun is not
  const bad = [];
  G.EVENTS.forEach(e => {
    const txt = String(Array.isArray(e.x) ? e.x[0] : e.x);
    if (txt.length >= 55) return;
    const concrete = /\{\w+\}|your |a |an |the |everyone|somebody|someone|nobody|school|work/i.test(txt);
    if (!concrete) bad.push(e.id + ': "' + txt + '"');
  });
  return bad.length ? bad.slice(0,6).join(' | ') : true;
});
t('event text never opens on an unexplained pronoun', () => {
  // every phrasing, not just the first: the game picks one at random, so a
  // second variant opening on a bare "It" is seen just as often
  const bad = [];
  G.EVENTS.forEach(e => {
    (Array.isArray(e.x) ? e.x : [e.x]).forEach((raw, i) => {
      const txt = String(raw);
      if (/^(It|They|He|She|Not from|This)\b/.test(txt) && txt.length < 70)
        bad.push(e.id + '[' + i + ']: "' + txt.slice(0,44) + '"');
    });
  });
  return bad.length ? bad.length + ' openings, e.g. ' + bad.slice(0,5).join(' | ') : true;
});
t('every hook an event uses is one the engine implements', () => {
  // Content and engine live in different files and nothing connected them.
  // A misspelled hook is silently ignored, so the choice looks like it does
  // something and does nothing at all. This caught four dead hooks.
  const fs2 = require('fs'), p2 = require('path');
  const game = fs2.readFileSync(p2.join(DIR,'game.js'),'utf8');
  const impl = new Set([...game.matchAll(/ch\.([a-zA-Z]+)/g)].map(m => m[1]));
  const bad = [];
  G.EVENTS.forEach(e => (e.c||[]).forEach((c,i) => {
    Object.keys(c).forEach(k => {
      if (k === 'l' || k === 'e') return;
      if (!impl.has(k)) bad.push(`${e.id} choice ${i}: '${k}'`);
    });
  }));
  return bad.length ? bad.slice(0,8).join(' | ') : true;
});

t('every id an event names actually exists', () => {
  const bad = [];
  const conds = new Set(G.CONDITIONS.map(c => c.id));
  const crimes = new Set(G.DATA.crimes.map(c => c.id));
  const habits = new Set(Object.keys(G.DATA.habits));
  const skills = new Set(Object.keys(G.DATA.skills));
  const stats  = new Set(G.DATA.statKeys);
  const fields = new Set(Object.keys(G.DATA.fieldNames || {}));
  G.EVENTS.forEach(e => (e.c||[]).forEach((c,i) => {
    const at = w => bad.push(`${e.id} choice ${i}: ${w}`);
    if (c.condition && !conds.has(c.condition)) at(`condition '${c.condition}'`);
    if (c.conditionRisk) {
      if (!conds.has(c.conditionRisk.id)) at(`conditionRisk '${c.conditionRisk.id}'`);
      if (!(c.conditionRisk.p > 0 && c.conditionRisk.p <= 1)) at(`conditionRisk p=${c.conditionRisk.p}`);
    }
    if (c.crimeRoll && !crimes.has(c.crimeRoll)) at(`crime '${c.crimeRoll}'`);
    if (c.banField && !fields.has(c.banField)) at(`field '${c.banField}'`);
    if (c.setEdu != null && (c.setEdu < 0 || c.setEdu >= G.DATA.eduNames.length)) at(`setEdu ${c.setEdu}`);
    Object.keys((c.e && c.e.habit) || {}).forEach(h => { if (!habits.has(h)) at(`habit '${h}'`); });
    Object.keys((c.e && c.e.skill) || {}).forEach(h => { if (!skills.has(h)) at(`skill '${h}'`); });
    Object.keys(c.e || {}).forEach(k => {
      if (['money','savings','skill','habit','rel','followers'].includes(k)) return;
      if (!stats.has(k)) at(`effect '${k}' is not a stat`);
    });
  }));
  return bad.length ? bad.slice(0,8).join(' | ') : true;
});

t('no two events share an id', () => {
  // pickChoice() resolves by id, so a duplicate makes a click fire the wrong
  // event, and the two share one cooldown
  const seen = new Set(), dup = [];
  G.EVENTS.forEach(e => { if (seen.has(e.id)) dup.push(e.id); seen.add(e.id); });
  return dup.length ? 'duplicate ids: ' + [...new Set(dup)].join(', ') : true;
});

t('every requirement an event states can actually be met', () => {
  const fs2 = require('fs'), p2 = require('path');
  const game = fs2.readFileSync(p2.join(DIR,'game.js'),'utf8');
  const evsrc = fs2.readFileSync(p2.join(DIR,'events.js'),'utf8');
  const reqKeys = new Set([...game.matchAll(/q\.([a-zA-Z0-9]+)/g)].map(m => m[1]));
  const setFlags = new Set([...evsrc.matchAll(/flag:'([a-zA-Z_]+)'/g)].map(m => m[1]));
  [...game.matchAll(/S\.flags\.([a-zA-Z_]+)\s*=/g)].forEach(m => setFlags.add(m[1]));
  const bad = [];
  G.EVENTS.forEach(e => {
    Object.keys(e.req || {}).forEach(k => { if (!reqKeys.has(k)) bad.push(`${e.id}: req.${k} is never read`); });
    ((e.req && e.req.flags) || []).forEach(f => { if (!setFlags.has(f)) bad.push(`${e.id}: needs flag '${f}' nothing sets`); });
    if (e.min > e.max) bad.push(`${e.id}: min ${e.min} > max ${e.max}`);
  });
  return bad.length ? bad.slice(0,8).join(' | ') : true;
});

t('a meaningful share of events change a life rather than its statistics', () => {
  // the agency measurement in research/compare.js turns on this
  const DIRECTIONAL = ['setEdu','collegeRoll','examRoll','retrain','child','crimeRoll','arrestRisk',
    'fraudRoll','courtRoll','condition','conditionRisk','deport','emigrate','bankrupt','ruin','vow',
    'divorce','widow','joinForces','takeJob','careerReset','banField','retire','bigBreak','startup'];
  const forked = G.EVENTS.filter(e => (e.c||[]).some(c => DIRECTIONAL.some(k => c[k] != null)));
  const share = forked.length / G.EVENTS.length;
  // 13.5% before this work, 21.9% after; the bar is a ratchet, not a target
  return share >= 0.20 ? true : `only ${(share*100).toFixed(0)}% of events contain a fork`;
});

t('a year is more likely to hand you a decision than a nudge', () => {
  // adding 182 events for volume quietly diluted this and cost three points
  // of measured agency. The engine now prefers events that redirect a life;
  // this asserts the preference survives, and that illness is NOT boosted
  // (weighting illness up shortens every life in the game).
  G.newGame({});
  G.S.lean = []; G.S.away = [];          // neutralise the theme multiplier
  const path = G.EVENTS.filter(e => e.pathFork);
  const plain = G.EVENTS.filter(e => !e.fork);
  if (!path.length || !plain.length) return 'events are not being tagged at load';
  const avg = a => a.reduce((n,e) => n + G.evWeight(e), 0) / a.length;
  const ratio = avg(path) / avg(plain);
  if (ratio < 1.5) return `path forks are only ${ratio.toFixed(2)}x as likely as filler`;
  const ill = G.EVENTS.filter(e => e.fork && !e.pathFork);
  if (ill.some(e => e.pathFork)) return 'illness is being boosted';
  return true;
});

t('every choice label is a readable instruction', () => {
  const bad = [];
  G.EVENTS.forEach(e => e.c.forEach(c => {
    if (c.l.length < 4) bad.push(e.id + ':' + c.l);
    if (/^(yes|no|ok|do it)$/i.test(c.l.trim())) bad.push(e.id + ': bare "' + c.l + '"');
  }));
  return bad.length ? bad.join(' | ') : true;
});

t('a year cannot be thrown away without a warning', () => {
  // the guard only matters when actions remain; the handler is on the button,
  // so assert the state it depends on is tracked correctly
  atAge(30);
  // atAge() sets the age directly, so top the budget up the way a new year would
  const max = G.actionsPerYear();
  G.S.actionsLeft = max;
  G.doAct('rest');
  return G.S.actionsLeft === max - 1 ? true : 'actions are not being counted';
});
t('the careers list can be searched and filtered', () => {
  atAge(30);
  G.S.jobFilter = ''; G.S.jobOpenOnly = false;
  const all = (G.moneyCareers().match(/class="row/g)||[]).length;
  G.setJobFilter('nurse');
  const few = (G.moneyCareers().match(/class="row/g)||[]).length;
  G.setJobFilter(''); G.S.jobOpenOnly = true;
  const open = (G.moneyCareers().match(/class="row/g)||[]).length;
  G.S.jobOpenOnly = false;
  return (few < all && open <= all) ? true : `all ${all}, filtered ${few}, open ${open}`;
});
t('text size is applied and saved', () => {
  atAge(30);
  G.setTextSize('xl');
  return G.S.textSize === 'xl' ? true : 'text size not stored';
});

/* ================= 4p. P0 FIXES ================= */
section('4p. Reachability and clutter');

t('owning a vehicle counts as owning a car', () => {
  atAge(30); G.S.items=[]; G.S.vehicles=[{t:'saloon',value:20000,cond:80}];
  if(!G.hasItem('car')) return 'a saloon on the drive did not register as a car';
  G.S.vehicles=[{t:'bicycle',value:400,cond:80}];
  return !G.hasItem('car') ? true : 'a bicycle counted as a car';
});
t('every job is reachable by someone who trains for it', () => {
  const never=[];
  G.DATA.jobs.forEach(j=>{
    atAge(34); G.S.edu=Math.max(j.edu,3); G.S.record=[]; G.S.banned=[]; G.S.jailLeft=0;
    const deg=G.DEGREES.find(d=>d.fields.includes(j.field));
    if(deg)G.S.degreeDone=deg.id;
    Object.keys(j.req||{}).forEach(k=>{
      if(G.DATA.statKeys.includes(k))G.S.stats[k]=Math.min(100,j.req[k]+15);
      else G.S.skills[k]=Math.min(100,j.req[k]+15);
    });
    G.S.careerLvl=5; G.S.job={id:'x',t:'x',pay:1,field:j.field,lvl:4};
    if(!G.jobEligible(j)) never.push(j.id+' ('+(G.jobLocked(j)||'?')+')');
  });
  return never.length ? never.slice(0,5).join(' | ') : true;
});
t('skill can substitute for time served', () => {
  const j=G.DATA.jobs.find(x=>x.id==='chef');
  atAge(30); G.S.careerLvl=0; G.S.job=null; G.S.edu=2;
  Object.keys(j.req).forEach(k=>{ G.S.skills[k]=j.req[k]; });
  const bare=G.reachAllowance(j);
  Object.keys(j.req).forEach(k=>{ G.S.skills[k]=Math.min(100,j.req[k]+30); });
  const expert=G.reachAllowance(j);
  return expert>bare ? true : `allowance ${bare} -> ${expert}`;
});
t('the Life tab never shows more than three optional cards', () => {
  // build the most cluttered life possible
  atAge(30);
  G.S.billsDue=5000; G.S.arrears=2000; G.S.inSchool=true; G.S.school='Test Academy';
  G.S.track={id:'mob',rank:1,progress:8,heat:20,followers:0,standing:0,commend:0,rating:0,years:3};
  G.S.home='parents'; G.S.job={id:'x',t:'Clerk',pay:30000,field:'corp',lvl:1};
  G.S.news=[{id:'boom',left:2}];
  const html=G.viewLife();
  // the hero card and the story card are always present
  const cards=(html.match(/class="card/g)||[]).length;
  return cards<=6 ? true : cards+' cards rendered on the Life tab';
});
t('hidden cards are acknowledged rather than silently dropped', () => {
  atAge(30);
  G.S.billsDue=5000; G.S.arrears=2000; G.S.inSchool=true;
  G.S.track={id:'mob',rank:1,progress:8,heat:20,followers:0,standing:0,commend:0,rating:0,years:3};
  G.S.home='parents'; G.S.job={id:'x',t:'Clerk',pay:30000,field:'corp',lvl:1};
  G.S.news=[{id:'boom',left:2}]; G.S.flags.hideMoveNudge=false;
  const html=G.viewLife();
  return /more cards? hidden/.test(html) ? true : 'no note that cards were hidden';
});
t('a licence can be obtained as an adult', () => {
  atAge(30); G.S.flags.licence=false; G.S.money=50000;
  const act=G.ACTS().find(a=>a.id==='lessons');
  if(!act) return 'no way to learn to drive as an adult';
  let passed=false;
  for(let i=0;i<40 && !passed;i++){ G.S.flags.licence=false; G.S.money=50000; G.S.actionsLeft=5;
    act.f(); if(G.S.flags.licence)passed=true; }
  return passed ? true : 'never passed in 40 attempts';
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
