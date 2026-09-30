/* BEQUEST — engine + UI. */
'use strict';

/* ---------------- utilities ---------------- */
let RNG = mulberry32(Date.now() >>> 0);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const R  = ()=>RNG();
const ri = (a,b)=>Math.floor(R()*(b-a+1))+a;
const pick = arr=>arr[Math.floor(R()*arr.length)];
const clamp=(v,a=0,b=100)=>Math.round(Math.max(a,Math.min(b,v))*10)/10;
const money = v => (v<0?'-':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DICE = '<span class="die">⚄</span>';
const IC={
 life:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-4.7-9.2-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.2 12C19 16.3 12 21 12 21z"/></svg>',
 act:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
 ppl:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0z"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M14.6 20a5.5 5.5 0 0 1 7.9-4.6"/></svg>',
 money:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><circle cx="12" cy="12" r="3"/></svg>',
 more:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
 health:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-6.5-4.3-8.5-8.2A4.9 4.9 0 0 1 12 7a4.9 4.9 0 0 1 8.5 4.8C18.5 15.7 12 20 12 20z"/></svg>',
 happiness:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.2" fill="#0b1020"/><circle cx="15" cy="10" r="1.2" fill="#0b1020"/><path d="M8 14.5a5 5 0 0 0 8 0" stroke="#0b1020" stroke-width="1.6" fill="none"/></svg>',
 smarts:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5 14.6 9l6.9.4-5.3 4.4 1.7 6.7L12 16.9 6.1 20.5l1.7-6.7L2.5 9.4 9.4 9z"/></svg>',
 looks:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 20 12l-8 9-8-9z"/></svg>',
 reputation:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="9" r="5.5"/><path d="M8 14 6.5 22 12 19l5.5 3L16 14"/></svg>',
 discipline:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 21 19H3z"/></svg>',
 cake:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="11" width="18" height="9" rx="2"/><path d="M12 4v5"/></svg>'
};


function nameFor(reg,g){ const N=DATA.names[reg]||DATA.names.west; return pick(g==='m'?N.m:N.f); }
function surFor(reg){ const N=DATA.names[reg]||DATA.names.west; return pick(N.l); }
function cityFor(reg){ return pick(DATA.cities[reg]||DATA.cities.west); }
function companyFor(field,reg){
  const sur=surFor(reg), city=S?S.city:cityFor(reg);
  const suf=DATA.orgSuffix[field]||DATA.orgSuffix.corp;
  return pick([`${sur} ${pick(suf)}`,`${city} ${pick(suf)}`,`${sur} & ${surFor(reg)}`,`${pick(DATA.orgPrefix)} ${pick(suf)}`]);
}
function uniFor(reg){ const c=S?S.city:cityFor(reg);
  return pick([`University of ${c}`,`${c} State University`,`${surFor(reg)} College`,`${c} Metropolitan University`]); }
function schoolFor(reg){ const c=S?S.city:cityFor(reg);
  return pick([`${c} High School`,`${surFor(reg)} Academy`,`St ${nameFor(reg,'f')}\u2019s School`,`${c} Community School`]); }
function paperFor(reg){ const c=S?S.city:cityFor(reg); return pick([`The ${c} Herald`,`${c} Times`,`The Daily ${surFor(reg)}`]); }

/* ---------------- state ---------------- */
let S = null;
const SAVE_KEY='bequest.save.v1', META_KEY='bequest.meta.v1';
/* Saves survive every rename this project has been through. */
(function migrateOldNames(){
  try{
    if(localStorage.getItem('bequest.migrated'))return;
    const chains=[['lifespan','twelvemonth'],['twelvemonth','bequest'],['lifespan','bequest']];
    const keys=['save.v2','save.v1','meta.v2','meta.v1','slot1','slot2','slot3','cloud','lastslot'];
    chains.forEach(([from,to])=>{
      keys.forEach(k=>{
        const o=localStorage.getItem(from+'.'+k);
        if(o!=null&&localStorage.getItem(to+'.'+k)==null)localStorage.setItem(to+'.'+k,o);
      });
    });
    /* the v2 names used previously map onto v1 under the new brand */
    [['twelvemonth.save.v1','bequest.save.v1'],['twelvemonth.meta.v1','bequest.meta.v1'],
     ['lifespan.save.v2','bequest.save.v1'],['lifespan.meta.v2','bequest.meta.v1']].forEach(([o,n])=>{
      const v=localStorage.getItem(o); if(v!=null&&localStorage.getItem(n)==null)localStorage.setItem(n,v);
    });
    localStorage.setItem('bequest.migrated','1');
  }catch(e){}
})();
const SLOTS=3;
let META = loadMeta();
function loadMeta(){
  let m; try{ m=JSON.parse(localStorage.getItem(META_KEY)); }catch(e){}
  m=m||{}; m.lp=m.lp||0; m.done=m.done||{}; m.lives=m.lives||0;
  m.ach=m.ach||{}; m.rec=m.rec||{}; m.countriesPlayed=m.countriesPlayed||{};
  m.premium=m.premium||{plus:false,lifetime:false,since:null};
  m.adsSeen=m.adsSeen||0;
  m.eggs=m.eggs||{}; m.deathAges=m.deathAges||[]; m.taps=m.taps||0; m.perks=m.perks||{};
  /* Ships locked, so the free tier is what you actually experience.
     protoUnlocked was set here and then never read anywhere, so the
     "Switch Plus on" button rendered for every player: a button that hands
     out the paid tier. It now defaults to off and is only turned on by a
     developer setting bequest.dev in localStorage, which no player will do
     by accident. */
  if(m.premium.protoUnlocked===undefined){ m.premium.protoUnlocked=false; m.premium.plus=false; }
  try{ if(localStorage.getItem('bequest.dev')==='1') m.premium.protoUnlocked=true; }catch(e){}
  return m;
}
function saveMeta(){ try{localStorage.setItem(META_KEY,JSON.stringify(META));}catch(e){ softFail('saveMeta',e); } }
const slotKey=n=>'bequest.slot'+n;
function save(){ if(!S)return; try{
    const blob=JSON.stringify(S);
    localStorage.setItem(slotKey(S.slot||1),blob);
    localStorage.setItem(SAVE_KEY,blob);                 // autosave / quick-continue
    localStorage.setItem('bequest.lastslot',String(S.slot||1));
    if(CLOUD.on&&CLOUD.code)cloudPush(true);
  }catch(e){ softFail('save',e); } }
function hasSave(){ try{return !!localStorage.getItem(SAVE_KEY);}catch(e){ softFail('hasSave',e); return false;} }
function load(){ try{ S=JSON.parse(localStorage.getItem(SAVE_KEY)); if(!S)return false;
  RNG=mulberry32((S.seed+S.age*7919)>>>0); migrate(); return true; }catch(e){ softFail('load',e); return false;} }
function migrate(){
  if(!S)return;
  if(!S.counters)S.counters={promotions:0,businesses:0,divorces:0,relapses:0,cryptoProfit:0,debtCleared:0,maxDebt:0,heistWins:0,illnessesBeaten:0,gifts:0,partners:0};
  if(!S.mods)S.mods=Object.assign({},diffDef(S.diff||'normal').m);
  if(!S.diff)S.diff='normal';
  if(!S.slot)S.slot=1;
  if(!S.assets)S.assets=[];
  if(!S.countriesLived)S.countriesLived=[S.country];
  if(!S.cd)S.cd={}; if(!S.echoes)S.echoes=[]; if(!S.goals)S.goals=[]; if(!S.perksUsed)S.perksUsed=[]; if(!S.ledger)S.ledger={income:[],spend:[]};
  if(!S.home)S.home='parents'; if(!S.food)S.food='basic'; if(!S.subs)S.subs={};
  if(!S.cards)S.cards=[]; if(S.arrears==null)S.arrears=0; if(!S.finance)S.finance=[];
  if(S.overdue==null)S.overdue=0; if(!S.overdueItems)S.overdueItems=[];
  if(S.arrPaid==null)S.arrPaid=0; if(S.arrPlan===undefined)S.arrPlan=null;
  if(!S.career)S.career=[];
  willMigrate(S);
  schoolMigrate(S);
  courtMigrate(S);
  investMigrate(S);
  if(S.living===undefined)S.living=null;
  if(S.thrift==null)S.thrift=0;
  healthMigrate(S);
  /* a case in progress when the game was closed has to come back, or the
     charge quietly disappears and S.legalCase blocks the next one */
  if(S.legalCase&&S.alive){ QUEUE.push({type:'COURT'}); }
  if(!S.properties)S.properties=[]; if(!S.vehicles)S.vehicles=[]; if(!S.businesses)S.businesses=[];
  if(S.property&&!S.properties.length){
    S.properties.push({t:'flat',value:S.property.value,mortgage:S.property.mortgage,
      rented:!!S.property.rented,cond:70,home:true});
    S.property=null;
  }
  if(S.business&&!S.businesses.length){
    S.businesses.push({t:'cafe',value:S.business.value,staff:2,ups:[],rep:50});
    S.business=null;
  } if(!S.pets)S.pets=[]; if(S.track===undefined)S.track=null; if(!S.orientation)S.orientation='straight'; if(!S.banned)S.banned=[]; if(S.dependents==null)S.dependents=0;
  if(!S.lean){const T=['i','c','t','y','a','o','s','w','m','r','h','x','f','b'].sort(()=>R()-0.5);S.lean=T.slice(0,4);S.away=T.slice(4,7);}
  if(!S.conditions)S.conditions=[]; if(!S.record)S.record=[]; if(!S.loans)S.loans=[];
  if(S.actionsLeft==null)S.actionsLeft=3; if(!S.actLog)S.actLog={}; if(S.perf==null)S.perf=60; if(S.gpa==null)S.gpa=50; if(S.parole==null)S.parole=0;
  S.npcs.forEach(n=>{ if(!n.pers)n.pers=pick(PERSONALITIES).id; if(!n.mem)n.mem=[]; });
  Object.keys(DATA.skills).forEach(k=>{ if(S.skills[k]==null)S.skills[k]=0; });
  Object.keys(DATA.habits).forEach(k=>{ if(S.habits[k]==null)S.habits[k]=0; });
}
function slotInfo(n){
  try{ const raw=localStorage.getItem(slotKey(n)); if(!raw)return null; const d=JSON.parse(raw);
    return {name:d.name,age:d.age,alive:d.alive,job:d.job?d.job.t:(d.inSchool?'Student':'Unemployed'),
      country:(DATA.countries.find(c=>c.id===d.country)||{}).name||'',diff:d.diff||'normal',
      net:(d.money||0)+(d.savings||0)-(d.debt||0),gen:d.gen||1,bytes:raw.length};
  }catch(e){ return null; }
}
function saveToSlot(n){ if(!S)return; if(n>1&&!requirePlus('extra save slots'))return; S.slot=n; save(); popupOK('Saved',`Written to slot ${n}.`); renderAll(); }
function loadSlot(n){
  try{ const raw=localStorage.getItem(slotKey(n)); if(!raw)return popupOK('Empty slot','There is nothing saved there.');
    S=JSON.parse(raw); migrate(); RNG=mulberry32((S.seed+S.age*7919)>>>0);
    localStorage.setItem(SAVE_KEY,raw);
    app().dataset.screen='game'; setTab('life'); renderAll();
    if(!S.alive)showDeath();
  }catch(e){ popupOK('Could not load','That save appears to be corrupted.'); }
}
function deleteSlot(n){
  confirmDo('Delete slot '+n+'?','This cannot be undone.',()=>{
    localStorage.removeItem(slotKey(n)); popupOK('Deleted',`Slot ${n} is now empty.`); renderAll(); });
}
function exportSave(){
  const payload={v:2,exported:new Date().toISOString(),meta:META,slots:{}};
  for(let i=1;i<=SLOTS;i++){ const r=localStorage.getItem(slotKey(i)); if(r)payload.slots[i]=JSON.parse(r); }
  const txt=JSON.stringify(payload);
  try{
    const a=document.createElement('a');
    a.href='data:application/json;charset=utf-8,'+encodeURIComponent(txt);
    a.download='bequest-save-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    popupOK('Exported','Your saves and all progress have been downloaded as a file. Keep it somewhere safe.');
  }catch(e){ popupOK('Export failed','Your browser blocked the download.'); }
}
function importSave(){ const el=document.getElementById('importfile'); if(el)el.click(); }
function handleImport(input){
  const f=input.files&&input.files[0]; if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const d=JSON.parse(rd.result);
      if(!d.slots)throw new Error('bad file');
      Object.keys(d.slots).forEach(k=>localStorage.setItem(slotKey(k),JSON.stringify(d.slots[k])));
      if(d.meta){ META=d.meta; saveMeta(); }
      popupOK('Imported','Your saves and progress have been restored.');
      renderAll();
    }catch(e){ popupOK('Import failed','That file is not a Bequest save.'); }
    input.value='';
  };
  rd.readAsText(f);
}

/* ---- cloud sync (configurable endpoint; see settings) ---- */
let CLOUD={on:false,code:'',url:'',status:'off'};
try{ CLOUD=Object.assign(CLOUD,JSON.parse(localStorage.getItem('bequest.cloud')||'{}')); }catch(e){}
function cloudSaveCfg(){ try{localStorage.setItem('bequest.cloud',JSON.stringify(CLOUD));}catch(e){} }
function cloudPayload(){
  const payload={v:2,meta:META,slots:{}};
  for(let i=1;i<=SLOTS;i++){ const r=localStorage.getItem(slotKey(i)); if(r)payload.slots[i]=JSON.parse(r); }
  return payload;
}
/* ---------------- cloud sync: trusting nothing that comes back ----------
   CLOUD.url is typed by the player, so a response is a message from a
   stranger. Two different things need protecting and they need different
   treatment:

     the entitlement   Plus is bought with money. It is never, under any
                       circumstances, read from the network. A save restored
                       from a server you control cannot make you a paying
                       customer.

     the progress      Achievements, points and records are single-player
                       state that anyone determined could edit in
                       localStorage anyway, so the threat is not cheating,
                       it is a malformed reply wiping a legitimate player.
                       Merged by taking the better of the two, never by
                       overwriting.                                        */
function validSlot(x){
  if(!x || typeof x !== 'object' || Array.isArray(x)) return false;
  if(typeof x.name !== 'string' || x.name.length > 80) return false;
  if(typeof x.age !== 'number' || !isFinite(x.age) || x.age < 0 || x.age > 130) return false;
  if(x.npcs && !Array.isArray(x.npcs)) return false;
  if(x.stats && typeof x.stats !== 'object') return false;
  return true;
}
function cloudMergeMeta(remote){
  if(!remote || typeof remote !== 'object' || Array.isArray(remote)) return 0;
  let took = 0;
  const num = k => {
    const v = remote[k];
    if(typeof v === 'number' && isFinite(v) && v >= 0 && v > (META[k] || 0)){ META[k] = v; took++; }
  };
  const mapOf = k => {
    const v = remote[k];
    if(!v || typeof v !== 'object' || Array.isArray(v)) return;
    if(!META[k] || typeof META[k] !== 'object') META[k] = {};
    Object.keys(v).slice(0, 2000).forEach(id => {
      if(typeof id !== 'string' || id.length > 60) return;
      const rv = v[id];
      if(typeof rv === 'number'){ if(!(META[k][id] > rv)){ META[k][id] = rv; took++; } }
      else if(rv === true && !META[k][id]){ META[k][id] = true; took++; }
    });
  };
  num('lp'); num('lives'); num('taps'); num('adsSeen');
  ['ach','rec','eggs','done','countriesPlayed','perks'].forEach(mapOf);
  if(Array.isArray(remote.deathAges))
    META.deathAges = remote.deathAges.filter(n => typeof n === 'number' && n >= 0 && n <= 130).slice(-12);
  /* META.premium is deliberately absent from this function. */
  return took;
}

function cloudPush(quiet){
  if(!quiet&&!requirePlus('cloud sync'))return;
  if(!CLOUD.code)return quiet?null:popupOK('No sync code','Set a sync code first.');
  fetch((CLOUD.url||'')+'/cloud/'+encodeURIComponent(CLOUD.code),{method:'PUT',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(cloudPayload())})
   .then(r=>{ CLOUD.status=r.ok?'synced '+new Date().toLocaleTimeString():'error'; cloudSaveCfg();
     if(!quiet)popupOK(r.ok?'Uploaded':'Upload failed',r.ok?'Your progress is in the cloud.':'The server rejected it.');
     if(!quiet)renderAll(); })
   .catch(()=>{ CLOUD.status='offline'; cloudSaveCfg(); if(!quiet)popupOK('Offline','Could not reach the sync server.'); });
}
function cloudPull(){
  if(!requirePlus('cloud sync'))return;
  if(!CLOUD.code)return popupOK('No sync code','Set a sync code first.');
  fetch((CLOUD.url||'')+'/cloud/'+encodeURIComponent(CLOUD.code))
   .then(r=>r.ok?r.json():Promise.reject())
   .then(d=>{
     if(!d || typeof d!=='object' || !d.slots || typeof d.slots!=='object') throw 0;
     let wrote=0, refused=0;
     Object.keys(d.slots).slice(0,SLOTS).forEach(k=>{
       const n=parseInt(k,10);
       if(!(n>=1&&n<=SLOTS)){ refused++; return; }
       if(!validSlot(d.slots[k])){ refused++; return; }
       localStorage.setItem(slotKey(n),JSON.stringify(d.slots[k])); wrote++;
     });
     const took = d.meta ? cloudMergeMeta(d.meta) : 0;
     if(took) saveMeta();
     if(!wrote && !took) throw 0;
     CLOUD.status='pulled '+new Date().toLocaleTimeString(); cloudSaveCfg();
     popupOK('Downloaded',
       `${wrote} save${wrote===1?'':'s'} restored to this device.`
       + (refused?`\n\n${refused} did not look like a Bequest save and ${refused===1?'was':'were'} refused.`:'')
       + '\n\nBequest Plus is tied to your purchase, not to the sync, so it is never restored this way.');
     renderAll(); })
   .catch(()=>popupOK('Nothing found','No cloud save for that code, or the server is unreachable.'));
}
function setCloud(k,v){ CLOUD[k]=v; cloudSaveCfg(); }

function findEgg(id,extraText){
  const e=EGG(id); if(!e)return;
  const first=!META.eggs[id];
  META.eggs[id]={age:S?S.age:0,life:META.lives,at:Date.now()}; saveMeta();
  if(S){ S.eggsThisLife=S.eggsThisLife||[]; if(S.eggsThisLife.indexOf(id)<0)S.eggsThisLife.push(id);
    logLine(`${e.n} — ${e.d}`,'good'); }
  push({type:'EGG',egg:e,first,extra:extraText||null});
}
function hasEgg(id){ return !!META.eggs[id]; }
function eggRoll(tier){ const m=(S&&S.traits&&S.traits.indexOf('marked')>=0)?2.5:1; return R() < (EGG_TIERS[tier]||0)*m; }
function unlockedTraits(){ return Object.keys(EGG_UNLOCKS)
  .filter(k=>hasEgg(k)&&EGG_UNLOCKS[k].kind==='trait').map(k=>EGG_UNLOCKS[k].id); }
/* A direct debit is something you arrange, not something a difficulty hands
   you. Below Hard the bank sets one up for you and quietly covers a short
   balance. On Hard and Brutal you can still arrange one, but it starts off,
   and it bounces if the money is not there on the day. The skill being
   tested is keeping a balance, not remembering to tap a button every year. */
function autopayAllowed(){ return true; }
/* Free = arranged for you by default, and it cannot bounce. */
function autopayFree(){
  if(S.diff==='custom') return !!(S.mods && S.mods.autopay !== 0);
  return diffRank()<2;
}
function autopayOn(){ return S.autopay==null ? autopayFree() : !!S.autopay; }
function autopayBounces(){ return !autopayFree(); }
function isPlus(){ return !!(META.premium&&(META.premium.plus||META.premium.lifetime)); }
function requirePlus(what){
  if(isPlus())return true;
  push({type:'PLUS',what:what});
  drain();
  return false;
}
function traitName(id){ const t=DATA.traits.find(x=>x.id===id); return t?t.name:id; }
function country(){ return DATA.countries.find(c=>c.id===S.country)||DATA.countries[0]; }
function propertyEquity(){ return (S.properties||[]).reduce((n,p)=>n+p.value-p.mortgage,0); }
function vehicleValue(){ return (S.vehicles||[]).reduce((n,v)=>n+v.value,0); }
function businessValue(){ return (S.businesses||[]).reduce((n,b)=>n+b.value,0); }
function netWorth(){ return S.money+S.savings+cryptoValue()+holdingsValue()+assetValue()+propertyEquity()
  +vehicleValue()+businessValue()-S.debt-(S.cards||[]).reduce((n,c)=>n+c.bal,0)-(S.arrears||0)-(S.overdue||0); }
function cryptoValue(){ return S.crypto.units*S.crypto.price; }
function assetValue(){ return (S.assets||[]).reduce((n,a)=>n+a.value,0); }
function hasSub(tag){ return Object.keys(S.subs||{}).some(id=>S.subs[id]&&SUB(id)&&SUB(id).tag===tag); }
function hasItem(tag){
  /* ownership moved into dedicated systems, so this must see all of them */
  if(tag==='car'&&(S.vehicles||[]).some(v=>{const d=VEH(v.t);return d&&d.licence;}))return true;
  if(tag==='vehicle'&&(S.vehicles||[]).length)return true;
  return hasSub(tag)||S.items.some(i=>{const it=DATA.items.find(d=>d.id===i);return it&&(it.tag===tag||it.id===tag);});
}
function newsMod(k){ let m=0; S.news.forEach(n=>{const d=DATA.news.find(x=>x.id===n.id); if(d&&d.m[k]!=null) m+=d.m[k];}); return m; }
function stage(){ const a=S.age; return a<=5?'Infant':a<=12?'Child':a<=17?'Teen':a<=29?'Young adult':a<=54?'Adult':a<=69?'Older adult':'Elder'; }
function M(k){ return (S&&S.mods&&S.mods[k]!=null)?S.mods[k]:(k==='luck'?0:1); }
function LUCK(){ return ((S&&S.charmedUntil&&S.age<=S.charmedUntil)?0.15:0)+M('luck')+(S.traits.includes('lucky')?0.08:0)+(hasEcho('steadied')?0.05:0)-(hasEcho('scarred')?0.05:0); }
function hasEcho(id){ return !!(S.echoes&&S.echoes.some(e=>e.id===id)); }
function diffRank(){ if(!S)return 1; return S.diff==='custom'?customRank(S.mods):diffDef(S.diff).rank; }
function lpMult(){ if(!S)return 1; const base=S.diff==='custom'?customLP(S.mods):diffDef(S.diff).lp;
  return Math.min(base, S.lpCap!=null?S.lpCap:base); }
function jobLvl(j){ const p=j.pay; return p<35000?0:p<62000?1:p<100000?2:p<160000?3:p<250000?4:5; }
function maxLvl(){ return (S.careerLvl!=null)?S.careerLvl:-1; }

/* ---------------- new game ---------------- */
function newGame(opts){
  opts=opts||{};
  const dId = opts.diff || (typeof CREATE!=='undefined'&&CREATE.diff) || 'normal';
  const dDef = diffDef(dId);
  const mods = Object.assign({}, dDef.m, (dId==='custom'&&opts.mods)?opts.mods:(dId==='custom'&&typeof CREATE!=='undefined'&&CREATE.mods)?CREATE.mods:{});
  const seed=(Date.now()^ri(0,1e9))>>>0; RNG=mulberry32(seed);
  const g=opts.gender||pick(['m','f']);
  const c=opts.country||pick(DATA.countries).id;
  const reg=(DATA.countries.find(x=>x.id===c)||DATA.countries[0]).reg;
  const tw=DATA.wealthTiers, roll=ri(1,100); let acc=0, tier=tw[2];
  for(const t of tw){ acc+=t.w; if(roll<=acc){tier=t;break;} }
  let givenName=(opts.name&&opts.name.trim())||'';
  if(givenName && !opts.typed){
    // the name was rolled, not typed: it must belong to this country's pool
    const pool=DATA.names[reg];
    const first=givenName.split(' ')[0], last=givenName.split(' ').slice(1).join(' ');
    const ok=(pool.m.includes(first)||pool.f.includes(first))&&pool.l.includes(last);
    if(!ok)givenName='';                       // discard and regenerate below
  }
  const sur=surFor(reg);
  const rollable=DATA.traits.filter(t=>!t.secret);
  const tr=[]; while(tr.length<2){const t=pick(rollable); if(!tr.includes(t.id))tr.push(t.id);}
  /* Each life leans toward some kinds of story and away from others, so two
     lives never draw on the same slice of the content. */
  const THEMES=['i','c','t','y','a','o','s','w','m','r','h','x','f','b','g'];
  const shuffled=THEMES.slice().sort(()=>R()-0.5);
  const lean=shuffled.slice(0,4), away=shuffled.slice(4,7);
  const sk={}; Object.keys(DATA.skills).forEach(k=>sk[k]=0);
  sk.fitness=ri(0,15); sk.charisma=ri(0,20);
  const hb={}; Object.keys(DATA.habits).forEach(k=>hb[k]=0);
  hb.junkfood=0; hb.sleep=ri(55,80);
  S={
    diff:dId, mods:mods, assisted:false, lpCap:(dId==='custom'?customLP(mods):dDef.lp),
    seed, name:givenName||(nameFor(reg,g)+' '+sur), surname:sur, gender:g,
    country:c, city:cityFor(reg), countriesLived:[c], gen:1,
    age:0, alive:true,
    stats:{health:ri(72,100)+((META.perks&&META.perks.goodstock)?6:0),happiness:ri(70,95),smarts:ri(20,70),looks:ri(15,85),reputation:50,discipline:ri(20,60)},
    skills:sk, habits:hb, traits:tr, birthTier:tier.id,
    money:0, savings:0, debt:0, familyMoney:Math.round(ri(tier.money[0],tier.money[1])*mods.start*((META.perks&&META.perks.bornlucky)?1.6:1)),
    crypto:{units:0,price:100}, property:null, properties:[], vehicles:[], businesses:[], assets:[], business:null,
    items:[], job:null, jobYears:0, careerLvl:null, edu:0, inSchool:false, followers:0, totalWorked:0,
    lean, away, echoes:[], goals:[], perksUsed:[], track:null, home:'parents', food:'basic', subs:{}, cards:[], autopay:null, arrears:0, overdue:0, overdueItems:[], arrPaid:0, arrPlan:null, pets:[], orientation:null, outTo:false, npcs:[], flags:{}, log:[], news:[], seen:{}, cd:{}, moreView:'stats', employer:null, boss:null, school:null, paper:null, slot:(opts.slot||1),
    jailLeft:0, yearsJailed:0, crimesCommitted:0, jobsHeld:0, firedCount:0, career:[],
    peakNet:0, peakIncome:0, marriedYears:0, childrenCount:0, donated:0, illness:null,
    banned:[], dependents:0, credsLost:false, actionsLeft:2, actLog:{}, logAll:false, conditions:[], record:[], credit:null, parole:0, perf:60, gpa:50, uniTier:null, disabled:false, loans:[],
    counters:{promotions:0,businesses:0,divorces:0,relapses:0,cryptoProfit:0,debtCleared:0,
              maxDebt:0,heistWins:0,illnessesBeaten:0,gifts:0,partners:0},
    achThisLife:[]
  };
  /* most people are born into a family that already exists */
  { const roll=R();
    const count = roll<0.34?0 : roll<0.70?1 : roll<0.90?2 : 3;
    const taken=[S.name.split(' ')[0]];
    for(let i=0;i<count;i++){
      const sib=mkNPC('sibling',pick(['m','f']),ri(1,14),reg);
      /* three brothers all called Takumi is not a family, it is a bug */
      let f=nameFor(reg,sib.gender), tries=0;
      while(taken.indexOf(f)>=0&&tries++<12) f=nameFor(reg,sib.gender);
      taken.push(f);
      sib.surname=sur; sib.name=f+' '+sur;
      sib.r=ri(45,85); S.npcs.push(sib);
    }
  }
  S.npcs.push(mkNPC('mother','f',ri(20,40),reg));
  S.npcs.push(mkNPC('father','m',ri(21,45),reg));
  S.npcs.filter(n=>n.rel==='mother'||n.rel==='father').forEach(n=>{n.r=ri(60,90); n.surname=sur; n.name=nameFor(reg,n.gender)+' '+sur;});
  S.surname=S.name.split(' ').slice(1).join(' ')||sur;
  /* orientation is set at birth and discovered later, as in life */
  { let roll=ri(1,100), acc=0, o=DATA.orientations[0];
    for(const x of DATA.orientations){ const w=x.id==='gay'?(g==='m'?6:0):x.id==='lesbian'?(g==='f'?6:0):x.w;
      acc+=w; if(roll<=acc){o=x;break;} }
    S.orientation=o.id; }
  willBirth(S);
  schoolBirth(S);
  investBirth(S);
  S.living=null; S.thrift=0;
  SETTLEMENT=null;   /* the last life's estate must never leak into this one */
  S.bmonth=ri(1,12); S.bday=ri(1,28);
  if(R()<0.0007){ S.bmonth=2; S.bday=29; }
  if(R()<0.004){ S.bmonth=1; S.bday=1; S.midnightBorn=true; }
  if(tier.id===4&&R()<0.10){
    S.track={id:'royal',rank:0,progress:ri(0,6),heat:0,followers:0,standing:50,commend:0,rating:0,years:0};
    logLine('You were born into the royal house.','good');
  }
  S.school=schoolFor(reg); S.paper=paperFor(reg);
  /* a trait unlocked by an earlier discovery can be born into */
  unlockedTraits().forEach(t=>{ if(R()<0.25&&S.traits.indexOf(t)<0)S.traits.push(t); });
  applyTraitStart();
  logLine(`You were born ${g==='m'?'a boy':'a girl'} in ${S.city}, ${country().name}.`,'good');
  logLine(`Your family is ${tier.name.toLowerCase()}.`);
  { const sibs=S.npcs.filter(n=>n.rel==='sibling');
    if(sibs.length)logLine(`You have ${sibs.length===1?'an older sibling':sibs.length+' older siblings'}: ${sibs.map(n=>n.name.split(' ')[0]).join(', ')}.`); }
  logLine(`Traits: ${tr.map(traitName).join(', ')}.`);
  logLine(`Difficulty: ${dDef.n}${dId==='custom'?'':''} · Legacy Points ×${(dId==='custom'?customLP(mods):dDef.lp).toFixed(2)}`);
  { const pool=GOAL_POOL.slice().sort(()=>R()-0.5);
    S.goals=pool.slice(0,3).map(g=>({id:g.id,done:false})); }
  META.lives++; META.countriesPlayed[S.country]=true; saveMeta(); checkAch(true); save();
  if(S.bmonth===2&&S.bday===29&&!hasEgg('leapday'))setTimeout(()=>findEgg('leapday'),0);
  else if(S.midnightBorn&&!hasEgg('midnight'))setTimeout(()=>findEgg('midnight'),0);
}
function applyTraitStart(){
  const t=S.traits;
  if(t.includes('gifted'))S.stats.smarts=clamp(S.stats.smarts+15);
  if(t.includes('athletic'))S.skills.fitness=clamp(S.skills.fitness+15);
  if(t.includes('charming'))S.skills.charisma=clamp(S.skills.charisma+15);
  if(t.includes('frail'))S.stats.health=clamp(S.stats.health-15);
  if(t.includes('stubborn'))S.stats.discipline=clamp(S.stats.discipline+15);
  if(t.includes('beautiful'))S.stats.looks=clamp(S.stats.looks+25);
  if(t.includes('oldsoul'))S.stats.smarts=clamp(S.stats.smarts+8);
  if(t.includes('loner'))S.stats.discipline=clamp(S.stats.discipline+10);
  if(t.includes('nightowl')){S.habits.sleep=clamp(S.habits.sleep-30);S.skills.art=clamp(S.skills.art+8);S.skills.writing=clamp(S.skills.writing+8);}
  if(t.includes('hottemper'))S.skills.combat=clamp(S.skills.combat+12);
}
let NPCID=1;
function mkNPC(rel,g,age,reg){
  return {id:'n'+(NPCID++)+'_'+ri(100,999), name:nameFor(reg||country().reg,g)+' '+surFor(reg||country().reg),
    rel, gender:g, age, alive:true, r:ri(35,70), job:null, pers:pick(PERSONALITIES).id, mem:[],
    own:{edu:0, job:null, partner:null, kids:0, city:null, arc:pick(['steady','rising','struggling','wandering','troubled'])}};
}
function addNPC(rel,gender,age,rel0){
  const g=gender||pick(['m','f']);
  const n=mkNPC(rel,g,age,country().reg);
  if(rel==='child'){ n.name=nameFor(country().reg,g)+' '+S.surname; }
  n.r=rel0!=null?rel0:ri(40,70);
  S.npcs.push(n); return n;
}
function petsAlive(){ return (S.pets||[]).filter(p=>p.alive); }
function addPet(speciesId,fromShelter){
  const sp=DATA.petSpecies.find(x=>x.id===speciesId)||pick(DATA.petSpecies);
  const pet={ id:'p'+ri(1000,9999), sp:sp.id, name:pick(DATA.petNames),
    age:fromShelter?ri(1,4):0, alive:true, bond:ri(45,70),
    lifespan:ri(sp.life[0],sp.life[1]), ill:false };
  S.pets.push(pet); return pet;
}
function tickPets(notes){
  let cost=0;
  (S.pets||[]).forEach(p=>{
    if(!p.alive)return;
    const sp=DATA.petSpecies.find(x=>x.id===p.sp); if(!sp)return;
    p.age++;
    cost+=sp.cost;
    p.bond=clamp(p.bond-2);
    S.stats.happiness=clamp(S.stats.happiness+sp.happy*(p.bond/100));
    S.stats.health=clamp(S.stats.health+sp.health*(p.bond/100));
    if(!p.ill&&p.age>sp.life[0]*0.6&&R()<0.08){ p.ill=true; notes.push(`${p.name} is unwell.`); }
    if(p.age>=p.lifespan||(p.ill&&R()<0.25)){
      p.alive=false;
      const yrs=p.age;
      notes.push(`${p.name} died at ${yrs}.`);
      logLine(`${p.name} the ${sp.n.toLowerCase()} died.`,'bad');
      S.stats.happiness=clamp(S.stats.happiness-Math.round(6+p.bond/10));
    }
  });
  if(cost>0){
    if(S.age<18){ S.familyMoney=Math.max(0,S.familyMoney-cost); }
    else { S.money-=cost; notes.push(`Looking after your ${petsAlive().length===1?'pet':'pets'} cost ${money(cost)}.`); }
  }
}
function findNPC(rel){ return S.npcs.find(n=>n.rel===rel&&n.alive); }
function orient(){ return DATA.orientations.find(o=>o.id===S.orientation)||DATA.orientations[0]; }
function partnerGender(){
  const a=orient().attracted;
  if(a==='same')return S.gender;
  if(a==='any')return pick(['m','f']);
  return S.gender==='m'?'f':'m';
}
function canRomance(){ return orient().attracted!=='none'; }
function partner(){ return S.npcs.find(n=>(n.rel==='partner'||n.rel==='spouse')&&n.alive); }
function anyOf(rel){ return S.npcs.filter(n=>n.rel===rel&&n.alive); }

/* ---------------- text tokens & variants ---------------- */
/* An event's title, its text, its choice labels and its outcome are four
   separate tok() calls. Each used to re-roll every token, so with three
   children the title and the outcome named a different one 62% of the time,
   and no event could ever name two people at once. The cast is resolved once
   when the event is drawn and reused for all four. */
let CAST=null;
function makeCast(){
  const kids=anyOf('child'), sibs=anyOf('sibling');
  const shuf=a=>a.slice().sort(()=>R()-0.5);
  const k=shuf(kids), sb=shuf(sibs);
  const household=[partner()].concat(k).filter(Boolean);
  const origin=[findNPC('mother'),findNPC('father')].concat(sb).filter(Boolean);
  return {
    any:pick(S.npcs.filter(n=>n.alive)),
    friend:pick(anyOf('friend'))||pick(anyOf('colleague')),
    partner:partner(),
    child:k[0], child2:k[1],
    parent:findNPC('mother')||findNPC('father'),
    sibling:sb[0], sibling2:sb[1],
    colleague:pick(anyOf('colleague')),
    kids:k, household, origin
  };
}
function withCast(cast,fn){ const prev=CAST; CAST=cast; try{ return fn(); } finally { CAST=prev; } }
/* "Margot, Tom and Claire" */
function nameList(arr,max){
  const f=(arr||[]).filter(Boolean).slice(0,max||4).map(n=>n.name.split(' ')[0]);
  if(!f.length) return '';
  if(f.length===1) return f[0];
  return f.slice(0,-1).join(', ')+' and '+f[f.length-1];
}
function tok(str){
  if(!str) return '';
  /* Translate first, substitute second. The catalogue holds the English
     with its {tokens} intact, so a translator moves them around inside
     their own sentence and the substitution still lands. */
  str = T(str);
  const c=CAST||makeCast();
  const p=c.parent, f=c.friend, ch=c.child, sib=c.sibling, pt=c.partner, col=c.colleague, any=c.any;
  const first=n=>n?n.name.split(' ')[0]:null;
  return str
    .replace(/\{child2\}/g,  first(c.child2)||'your other child')
    .replace(/\{sibling2\}/g,first(c.sibling2)||'your other sibling')
    .replace(/\{kids\}/g,    nameList(c.kids)||'the children')
    .replace(/\{family\}/g,  nameList(c.household.length?c.household:c.origin)||'the family')
    .replace(/\{origin\}/g,  nameList(c.origin)||'your family')
    .replace(/\{npc\}/g,    first(any)||'someone')
    .replace(/\{friend\}/g, first(f)||'a friend')
    .replace(/\{partner\}/g,first(pt)||'your partner')
    .replace(/\{child\}/g,  first(ch)||'your child')
    .replace(/\{parent\}/g, first(p)||'your parent')
    .replace(/\{sibling\}/g,first(sib)||'your sibling')
    .replace(/\{colleague\}/g,first(col)||'a colleague')
    .replace(/\{boss\}/g,   S.boss||'your manager')
    .replace(/\{employer\}/g,S.employer||'your employer')
    .replace(/\{school\}/g, S.school||'school')
    .replace(/\{paper\}/g,  S.paper||('The '+S.city+' Herald'))
    .replace(/\{city\}/g,   S.city)
    .replace(/\{country\}/g,country().name)
    .replace(/\{job\}/g,    S.job?S.job.t:'your job')
    .replace(/\{name\}/g,   S.name.split(' ')[0])
    .replace(/\{age\}/g,    S.age)
    .replace(/\{amt\}/g,    money(ri(20,300)));
}
function variant(x){ return tok(Array.isArray(x)?pick(x):x); }

/* ---------------- log ---------------- */
function logLine(t,kind){ S.log.push({a:S.age,t,k:kind||''}); if(S.log.length>500)S.log.shift(); }

/* ---------------- effects ---------------- */
let EFF_SCALE=1, EFF_LOG=null, ACT_BLOCKED=false, PREV_YEAR=null, CHOOSER=null, CONFIRM=null;
/* Every pound in or out is recorded so the player can budget. */
function ledger(kind,label,amount){
  if(!S)return;
  S.ledger=S.ledger||{income:[],spend:[]};
  if(!amount)return;
  S.ledger[kind==='earn'?'income':'spend'].push({l:label,a:Math.round(Math.abs(amount))});
}
function ledgerTotal(kind){ return ((S.ledger&&S.ledger[kind])||[]).reduce((n,x)=>n+x.a,0); }
function sc(v){ return (EFF_SCALE===1||v<=0)?v:Math.round(v*EFF_SCALE*10)/10; }
function applyEff(e){
  if(!e) return [];
  const out=[];
  DATA.statKeys.forEach(k=>{ if(e[k]!=null){
    const d=sc(e[k]), before=S.stats[k];
    S.stats[k]=clamp(before+d);
    const real=Math.round((S.stats[k]-before)*10)/10;
    if(real!==0)out.push(`${DATA.statNames[k]} ${real>0?'+':''}${real}`);
    else if(d>0)out.push(`${DATA.statNames[k]} already at maximum`);
  }});
  if(e.money){
    if(e.money<0 && S.age<18){
      /* a child's costs come out of the household, never their own pocket */
      const need=-e.money;
      const fromChild=Math.min(S.money,need);
      S.money-=fromChild;
      S.familyMoney=Math.max(0,S.familyMoney-(need-fromChild));
      out.push(`${money(e.money)} (your family paid)`);
    } else {
      S.money+=e.money; out.push(`${e.money>0?'+':''}${money(e.money)}`);
      /* Event money never reached the ledger, so the budget bar on the year
         sheet was quietly wrong and nothing downstream could see it. */
      ledger(e.money>0?'earn':'spend', e.money>0?'Something came in':'Something came up',
             Math.abs(e.money));
    }
  }
  if(e.savings){ S.savings+=e.savings; out.push(`Savings +${money(e.savings)}`); }
  if(e.skill) for(const k in e.skill){
    if(S.skills[k]==null)S.skills[k]=0;
    let d=sc(e.skill[k]); if(META.perks&&META.perks.quicklearn&&d>0)d=d*1.25;
    const before=S.skills[k]; S.skills[k]=clamp(before+d);
    const real=Math.round((S.skills[k]-before)*10)/10;
    if(real!==0)out.push(`${DATA.skills[k].name} ${real>0?'+':''}${real}`);
    else if(d>0)out.push(`${DATA.skills[k].name} already at maximum`);
  }
  if(e.habit) for(const k in e.habit){ let d=e.habit[k]; if(d>0)d=sc(d); if(d>0&&S.traits.includes('addictive'))d=Math.round(d*1.5); if(d>0)d=Math.round(d*M('habitGrip')); else d=Math.round(d/M('habitGrip')); S.habits[k]=clamp(S.habits[k]+d); out.push(`${DATA.habits[k].name} ${d>0?'+':''}${d}`); }
  if(e.rel) for(const who in e.rel){
    const d=e.rel[who];
    let t = who==='parents'?S.npcs.filter(n=>(n.rel==='mother'||n.rel==='father')&&n.alive)
      : who==='partner'?S.npcs.filter(n=>(n.rel==='partner'||n.rel==='spouse')&&n.alive)
      : who==='friends'?anyOf('friend')
      : who==='children'?anyOf('child')
      : S.npcs.filter(n=>n.alive);
    t.forEach(n=>n.r=clamp(n.r+d));
    if(t.length) out.push(`${who} ${d>0?'+':''}${d}`);
  }
  if(e.followers){ e.followers=Math.round(sc(e.followers)); S.followers+=e.followers; out.push(`+${e.followers.toLocaleString()} followers`); }
  if(EFF_LOG)out.forEach(x=>EFF_LOG.push(x));
  return out;
}

/* ---------------- popup queue ---------------- */
let QUEUE=[];
function push(p){ QUEUE.push(p); }
function drain(){
  if(!QUEUE.length){
    const el=document.getElementById('modal');
    if(el&&el.className.indexOf('show')>=0){ el.className='modal'; a11yDialogClose(); }
    renderAll(); save(); return;
  }
  showPopup(QUEUE.shift());
}

/* ---------------- AGE UP ---------------- */
function ageUp(){
  if(!S||!S.alive) return;
  try{ PREV_YEAR = JSON.stringify(S); }catch(e){ PREV_YEAR = null; }
  S.age++; QUEUE=[];
  S.ledger={income:[],spend:[]};
  S.actionsLeft=actionsPerYear(); S.buysThisYear=0; S.lifestyleThisYear=0; S.jumpGroup=null; S.section=null; S.msection=null; S.person=null; S.listing=null;
  const notes=[];
  if(S.parole>0)S.parole--;
  /* people who depend on you do not do so forever */
  if(S.fostering&&R()<0.22){ S.fostering=false; S.dependents=Math.max(0,S.dependents-1);
    notes.push('Your foster placement has come to an end.'); }
  if(S.dependents>0&&R()<0.14){
    S.dependents--;
    notes.push(pick(['Someone who depended on you no longer does.',
      'The person staying with you has found their own place.',
      'Your caring responsibilities have eased.']));
  }
  S.record.forEach(r=>{ if(!r.spent&&S.age-r.age>=(r.sev===1?6:r.sev===2?12:99))r.spent=true; });
  willLeak();
  if(S.jailLeft>0){
    S.jailLeft--; S.yearsJailed++;
    S.stats.happiness=clamp(S.stats.happiness-8); S.stats.health=clamp(S.stats.health-3);
    S.skills.combat=clamp(S.skills.combat+4);
    notes.push(S.jailLeft>0?`You served another year in prison. ${S.jailLeft} remaining.`:'You were released from prison.');
    if(S.jailLeft===0){ S.stats.reputation=clamp(S.stats.reputation-5); S.parole=3;
      notes.push('You are on parole for three years. Any further conviction will be treated harshly.'); }
  }
  const yearIntro=birthdayText(), yearStage=stage();
  notes.push(...tickHabits());
  notes.push(...tickFinance());
  tickInvest(S,notes);
  tickHealth(S,notes);
  notes.push(...tickConditions());
  notes.push(...tickAging());
  tickNPCs(notes); tickPets(notes); tickTrack(notes); tickSchool(notes); tickNews(notes);
  /* One sheet a year. The birthday used to be its own dismissal before the
     news was even shown, which made a quiet year cost two taps and a busy
     one cost three. */
  push({type:'YEAR',title:`You turned ${S.age}`,sub:yearStage,intro:yearIntro,notes:notes.slice()});
  offerDirectDebit();
  takeForced().forEach(ev=>{ const cast=makeCast();
    push({type:'A',ev,text:withCast(cast,()=>variant(ev.x)),cast}); });
  const n = S.jailLeft>0?0:(R()<0.3?2:1)+(R()<0.15?1:0);
  pickEvents(n).forEach(ev=>{ const cast=makeCast();
    push({type:'A',ev,text:withCast(cast,()=>variant(ev.x)),cast}); });
  deathCheck();
  clampMinorMoney(); settleState();
  eggTick();
  logLine(`— Age ${S.age} —`);
  checkAch(); checkGoals(); drain();
}
function birthdayText(){
  const m={'Infant':['You are still very small. The world happens around you.','Everything is loud and enormous and mostly out of reach.'],
    'Child':['Another year of school, scraped knees and small certainties.','The world is still simple, and you are still sure about things.'],
    'Teen':['Everything feels enormous and permanent.','You are furious and hopeful in roughly equal measure.'],
    'Young adult':['Nobody is coming to tell you what to do next.','You are old enough that the decisions are yours now.'],
    'Adult':['The years are starting to move at a different speed.','Time has begun to fold in on itself.'],
    'Older adult':['You catch yourself talking about how things used to be.','The horizon has moved closer than it was.'],
    'Elder':['You notice time now in a way you did not before.','There is less ahead than behind, and you know it.']};
  return pick(m[stage()]);
}
function tickHabits(){
  const out=[]; let cost=0;
  for(const k in S.habits){
    const lvl=S.habits[k], h=DATA.habits[k]; if(!h||lvl<=5) continue;
    const sc=lvl/100;
    for(const sk in h.eff) S.stats[sk]=clamp(S.stats[sk]+Math.round(h.eff[sk]*sc*(sk==='health'&&S.traits.includes('frail')?1.4:1)));
    cost+=h.cost*sc*(1+newsMod('prices'))*M('cost');
    if(k==='gym')S.skills.fitness=clamp(S.skills.fitness+Math.round(2*sc));
    if(k==='reading')S.skills.writing=clamp(S.skills.writing+Math.round(1*sc));
    if(k==='gambling'){ const sw=Math.round((R()<0.42?1:-1)*ri(200,4000)*sc); S.money+=sw;
      if(Math.abs(sw)>1500)out.push(sw>0?`You won ${money(sw)} gambling.`:`You lost ${money(-sw)} gambling.`); }
    if(!h.good)S.habits[k]=clamp(lvl-1);
  }
  if(cost>0){
    const named=Object.keys(S.habits).filter(k=>S.habits[k]>5&&DATA.habits[k].cost>0)
      .map(k=>DATA.habits[k].name.toLowerCase());
    const what=named.length?named.join(', '):'day-to-day habits';
    if(S.age<13){
      /* nobody bills a child for the food in their house */
      S.familyMoney=Math.max(0,S.familyMoney-cost);
    } else if(S.age<18){
      const paid=Math.min(S.familyMoney,cost);
      S.familyMoney-=paid;
      const rest=cost-paid;
      if(rest>0){ S.money=Math.max(0,S.money-rest); }
      if(paid>0)out.push(`Your family spent ${money(paid)} on your ${what}.`);
    } else {
      S.money-=cost; ledger('spend','Habits: '+what,cost); out.push(`Your ${what} cost ${money(cost)} this year.`);
    }
  }
  return out;
}
function billsFor(){
  const c=country(), h=HOME(S.home), f=FOODTIER(S.food);
  const people=householdSize(S);
  const items=[];
  if(S.age>=18){
    if(h.cost>0)items.push({l:'Housing \u2014 '+h.n.toLowerCase(),a:Math.round(h.cost*c.col)});
    items.push({l:'Food \u2014 '+f.n.toLowerCase()+(people>1?` (${people} people)`:''),
                a:Math.round(f.cost*c.col*(1+(people-1)*0.6))});
    Object.keys(S.subs).forEach(id=>{
      if(!S.subs[id])return; const sub=SUB(id); if(!sub)return;
      let a=sub.cost;
      if(id==='utilities')a=Math.round(a*(0.6+h.space*0.35));
      items.push({l:sub.n,a:Math.round(a*c.col)});
    });
    (S.cards||[]).forEach(cd=>{ const def=CARD(cd.id);
      if(def&&def.fee)items.push({l:def.n+' fee',a:def.fee}); });
  }
  return items;
}
/* ---------------- how you live ----------------
   Bills were housing, food and subscriptions, all fixed tiers, none of them
   touching what you earn. So a good salary was banked rather than spent:
   outgoings sat flat near $11,000 while income climbed past $50,000, and a
   median life ended holding $1.77m in idle cash it had never decided to
   accumulate.

   The sink is the true one. You earn more and you spend more, mostly
   without choosing to: a better flat, a car you did not need, the kind of
   holiday you used to read about. It creeps up quickly and comes down
   slowly and unwillingly, discipline slows it, and you can take a year to
   deliberately pull it back at a cost to how the year feels.

   It is charged against what you actually have rather than billed, because
   nobody runs up arrears on a lifestyle: they quietly stop affording it. */
function livingFloor(){ return Math.round(3800*country().col); }
/* The share of what you earn that goes on living the way you live. It has
   to be the TARGET that discipline and thrift move, not merely the speed of
   getting there: over fifty years everybody arrives, so a lever on the
   speed alone is a lever on nothing. */
function livingRatio(s){
  s = s || S;
  const thrift = Math.max(0, Math.min(1, s.thrift || 0));
  const disc = ((s.stats ? s.stats.discipline : 50) - 50) / 300;
  return Math.max(0.30, Math.min(0.68, 0.60 - 0.18 * thrift - disc));
}
function livingTarget(income, s){
  return Math.max(livingFloor(), Math.round(income * livingRatio(s)));
}
function tickLiving(out){
  if(S.age<18) return;
  if(S.living==null) S.living=livingFloor();
  if(S.jailLeft>0){                     /* the state is housing you */
    S.living=Math.max(livingFloor(), Math.round(S.living*0.85));
    return;
  }
  /* thrift is a habit, and habits lapse */
  if(S.thrift==null) S.thrift=0;
  S.thrift=Math.max(0, S.thrift-0.045);

  const income=ledgerTotal('income');
  const target=livingTarget(income, S);
  const gap=target-S.living;
  S.living=Math.max(livingFloor(),
    Math.round(S.living + (gap>0 ? gap*0.34 : gap*0.16)));

  let cost=S.living;
  if(cost>S.money){
    /* you cannot spend what you have not got, so the life gets smaller */
    const short=cost-Math.max(0,S.money);
    cost=Math.max(0,S.money);
    S.living=Math.max(livingFloor(), S.living-Math.round(short*0.6));
    S.stats.happiness=clamp(S.stats.happiness-4);
    out.push(`You could not keep living as you were. Something had to go.`);
  }
  if(cost>0){
    S.money-=cost; ledger('spend','Living as you do',cost);
    if(income>0 && cost>income*0.62 && R()<0.25)
      out.push(`Almost everything you earned went on living the way you now live.`);
  }
}
function tickProperty(out){
  (S.properties||[]).forEach(pr=>{
    const def=PROP(pr.t);
    pr.value=Math.round(pr.value*(1+0.028+newsMod('property')/3));
    pr.cond=clamp((pr.cond==null?70:pr.cond)-(hasItem('maint')?1.5:4.5));
    if(pr.cond<35)pr.value=Math.round(pr.value*0.97);
    const maint=Math.round(pr.value*def.maint*(hasItem('maint')?0.5:1));
    S.money-=maint; ledger('spend',def.n+' upkeep',maint);
    if(pr.mortgage>0){
      const pay=Math.min(pr.mortgage,Math.round(pr.value*0.055));
      S.money-=pay; pr.mortgage-=pay; ledger('spend',def.n+' mortgage',pay);
    }
    if(pr.rented&&!pr.home){
      if(R()>0.12){ const rent=Math.round(pr.value*def.yield*(0.7+pr.cond/200));
        S.money+=rent; ledger('earn',def.n+' rent',rent); }
      else out.push(`${def.n} stood empty this year.`);
    }
    if(R()<0.06){ const bill=Math.round(pr.value*ri(2,7)/100);
      S.money-=bill; ledger('spend',def.n+' repairs',bill);
      out.push(`${def.n} needed ${money(bill)} of repairs.`); pr.cond=clamp(pr.cond+20); }
  });
}
function tickVehicles(out){
  (S.vehicles||[]).forEach(v=>{
    const def=VEH(v.t);
    v.value=Math.max(200,Math.round(v.value*(1-def.dep)));
    v.cond=clamp((v.cond==null?80:v.cond)-ri(3,9));
    const run=Math.round(def.run*country().col);
    S.money-=run; ledger('spend',def.n+' running costs',run);
    S.stats.happiness=clamp(S.stats.happiness+def.happy*0.3);
    S.stats.reputation=clamp(S.stats.reputation+def.rep*0.12);
    if(def.health)S.stats.health=clamp(S.stats.health+def.health*0.4);
    if(R()<def.fail*(v.cond<40?1.8:1)){
      let bill=Math.round(def.base*ri(4,14)/100);
      if(hasItem('carins'))bill=Math.round(bill*0.35);
      S.money-=bill; ledger('spend',def.n+' repair',bill); v.cond=clamp(v.cond+25);
      out.push(`${def.n} broke down. ${money(bill)}${hasItem('carins')?' after insurance':''}.`);
    }
  });
}
function tickBusinesses(out){
  (S.businesses||[]).forEach(b=>{
    const def=BIZ(b.t);
    const skill=(S.skills[def.skill]||0)/100;
    const upMult=1+(b.ups||[]).reduce((n,u)=>{const d=BIZ_UPGRADES.find(x=>x.id===u);return n+(d?d.rev:0);},0);
    const market=1+newsMod('invest')+(R()-0.5)*0.35;
    const revenue=Math.round(def.rev*b.staff*(0.45+skill*0.75)*upMult*market*M('earn'));
    const wages=Math.round(def.rev*b.staff*0.38);
    const profit=revenue-wages;
    S.money+=profit;
    ledger(profit>=0?'earn':'spend',def.n+(profit>=0?' profit':' losses'),Math.abs(profit));
    b.value=Math.max(0,Math.round(b.value*(1+(profit>0?0.06:-0.10))));
    out.push(profit>=0?`${def.n} made ${money(profit)}.`:`${def.n} lost ${money(-profit)}.`);
    if(R()<def.risk*0.4){
      const hit=Math.round(b.value*ri(10,30)/100);
      b.value=Math.max(0,b.value-hit);
      out.push(pick([`${def.n} lost a major customer.`,`A competitor opened nearby.`,
        `${def.n} had a bad inspection.`,`Costs rose sharply at ${def.n.toLowerCase()}.`]));
    }
    if(b.value<500){ out.push(`${def.n} has closed.`); logLine(`${def.n} closed.`,'bad'); b.dead=true; }
  });
  S.businesses=(S.businesses||[]).filter(b=>!b.dead);
  S.flags.owns_business=(S.businesses||[]).length>0;
}
function tickBills(out){
  if(S.age<18)return;
  /* Unpaid bills do not become a debt overnight. A creditor sends a final
     notice first, and you get a full year to settle it. Only bills you have
     ignored through two turns of the year go to collection as arrears. This
     is the difference between being careless once and being unable to pay. */
  if(S.overdue>0){
    S.arrears+=S.overdue;
    S.credit=Math.max(300,(S.credit==null?600:S.credit)-30);
    out.push(`The final notice expired. ${money(S.overdue)} of unpaid bills has gone to collection as arrears.`);
    logLine('Unpaid bills went to collection.','bad');
    S.overdue=0; S.overdueItems=[];
  }
  if(S.billsDue>0){
    const fee=Math.round(28*country().col)+Math.round(S.billsDue*0.05);
    S.overdue=S.billsDue+fee; S.overdueItems=S.billItems||[];
    S.credit=Math.max(300,(S.credit==null?600:S.credit)-12);
    out.push(`Final notice: last year\u2019s ${money(S.billsDue)} of bills went unpaid, plus ${money(fee)} in late fees. Settle ${money(S.overdue)} this year or it goes to collection.`);
    S.billsDue=0; S.billItems=[];
  }
  const items=billsFor();
  const total=items.reduce((n,x)=>n+x.a,0);
  if(total<=0)return;
  S.billsDue=total; S.billItems=items;
  if(autopayOn()){
    payBills(out,true);
  } else {
    out.push(`Bills of ${money(total)} are due. Pay them from the Money tab.`);
  }
}
function payBills(out,auto){
  const total=S.billsDue||0;
  if(total<=0)return false;
  /* A direct debit you arranged yourself bounces when the money is not
     there. It takes what it can, the bank charges you for the failure, and
     the rest stays outstanding — it does not become a debt on the same day. */
  if(auto&&autopayBounces()&&S.money<total){
    const took=Math.max(0,Math.min(S.money,total));
    const fee=Math.round(30*country().col);
    S.money-=took;
    if(took>0)ledger('spend','Bills (part paid)',took);
    S.credit=Math.max(300,(S.credit==null?600:S.credit)-20);
    const left=total-took+fee;
    S.billsDue=left;
    S.billItems=[{l:'Outstanding bills',a:total-took},{l:'Failed payment fee',a:fee}].filter(x=>x.a>0);
    if(out)out.push(took>0
      ? `Your direct debit bounced. Only ${money(took)} of ${money(total)} went out and the bank charged ${money(fee)}. ${money(left)} is still owed.`
      : `Your direct debit bounced — there was nothing in the account. The bank charged ${money(fee)}. ${money(left)} is owed.`);
    return true;
  }
  const use=Math.max(0,Math.min(S.money,total));
  S.money-=use;
  const short=total-use;
  (S.billItems||[]).forEach(x=>ledger('spend',x.l,x.a));
  if(short>0){
    const onCard=chargeToCard(short);
    if(onCard<short){
      /* What you genuinely cannot cover stays outstanding and takes the
         same grace year as anything else. Nothing becomes a debt the day
         you fail to pay it. */
      const left=short-onCard;
      S.credit=Math.max(300,(S.credit==null?600:S.credit)-25);
      S.billsDue=left; S.billItems=[{l:'Unpaid bills',a:left}];
      if(out)out.push(`You could not cover ${money(left)} of your bills. It stays owing.`);
      return true;
    }
    if(out)out.push(`Bills of ${money(total)} paid, ${money(onCard)} of it on credit.`);
  } else if(out)out.push(`${auto?'Bills paid automatically':'Bills paid'}: ${money(total)}.`);
  S.billsDue=0; S.billItems=[];
  return true;
}
/* arrears bite: eviction, downgrades, credit damage — but they can be
   climbed out of, because a debt nobody can ever clear is not a difficulty,
   it is a scripted ending. */
function tickArrears(out){
  if(S.arrears<=0){ S.arrPaid=0; S.arrPlan=null; return; }
  /* A repayment plan runs first. Keeping to it is the thing that makes
     arrears survivable; missing it twice tears the agreement up. */
  if(S.arrPlan){
    const due=Math.min(S.arrPlan.amt,S.arrears);
    if(S.money>=due){
      S.money-=due; S.arrears-=due; S.arrPaid+=due;
      ledger('spend','Repayment plan',due);
      S.arrPlan.missed=0;
      S.credit=Math.min(850,(S.credit==null?600:S.credit)+8);
      out.push(`Repayment plan: ${money(due)} paid.`);
    } else {
      S.arrPlan.missed=(S.arrPlan.missed||0)+1;
      out.push(`You could not make this year\u2019s ${money(due)} repayment.`);
      if(S.arrPlan.missed>=2){ S.arrPlan=null;
        out.push('Your repayment plan has collapsed and the interest is running again.'); }
    }
  }
  if(S.arrears<=0){
    out.push('Your arrears are cleared.');
    logLine('Cleared your arrears.','good');
    S.arrears=0; S.arrPlan=null; S.arrPaid=0; return;
  }
  /* Interest only runs on a debt you ignored completely. Pay anything at
     all and it stops growing — which is what a real creditor wants. */
  if(S.arrPaid>0){
    S.stats.happiness=clamp(S.stats.happiness-1);
    out.push(`${money(S.arrears)} of arrears left, and you are paying it down.`);
  } else {
    S.arrears=Math.round(S.arrears*1.08);
    S.credit=Math.max(300,(S.credit==null?600:S.credit)-15);
    S.stats.happiness=clamp(S.stats.happiness-4);
    out.push(`You owe ${money(S.arrears)} in arrears and paid nothing towards it.`);
  }
  S.arrPaid=0;
  /* Enforcement. What they can take depends on what you have. If there is
     genuinely nothing to collect the balance is written off: rock bottom,
     ruined credit, but not a life sentence. */
  if(S.arrears>Math.round(18000*country().col)&&R()<0.4){
    if(S.home!=='parents'){
      const idx=HOUSING.findIndex(h=>h.id===S.home);
      S.home=HOUSING[Math.max(0,idx-2)].id;
      out.push(`You were evicted. You are now in ${HOME(S.home).n.toLowerCase()}.`);
      logLine('You were evicted.','bad');
    }
    const liquid=Math.max(0,S.money)+Math.max(0,S.savings||0);
    const worth=liquid+propertyEquity()+vehicleValue()+businessValue();
    if(worth<S.arrears*0.25){
      const took=Math.min(Math.max(0,S.money),S.arrears);
      S.money-=took; S.arrears=0; S.arrPlan=null;
      S.credit=Math.max(300,(S.credit==null?600:S.credit)-60);
      out.push(`The debt was written off as uncollectable. They took ${money(took)} and your credit is ruined, but you owe nothing.`);
      logLine('Your arrears were written off.','bad');
    } else {
      let need=S.arrears, grabbed=0;
      const cash=Math.min(Math.max(0,S.money),need); S.money-=cash; need-=cash; grabbed+=cash;
      const sav=Math.min(Math.max(0,S.savings||0),need); S.savings-=sav; need-=sav; grabbed+=sav;
      S.arrears=Math.round(need*0.6);
      out.push(grabbed>0
        ? `Enforcement agents took ${money(grabbed)}. ${money(S.arrears)} of the debt remains.`
        : `Enforcement agents called. What they seized brought the debt down to ${money(S.arrears)}.`);
    }
  }
}
/* On a difficulty where nobody sets a direct debit up for you, the first
   bill is the moment to say so. Asked once, either way, and never again —
   a player should not be able to lose a life to a feature they never knew
   existed. */
function offerDirectDebit(){
  if(!S.alive||S.age<18||S.flags.ddAsked)return;
  if(!autopayBounces()||autopayOn())return;
  if(!(S.billsDue>0||S.overdue>0))return;
  S.flags.ddAsked=true;
  /* queued, not drained: this runs inside ageUp and must take its turn
     behind the birthday and the year summary rather than interrupting them */
  push({type:'D',title:'Set up a direct debit?',
    text:`Nobody is paying your bills for you on ${diffDef(S.diff).n}. You can arrange a direct debit so they go out on their own \u2014 but if the account is short on the day it will bounce, and the bank will charge you. Otherwise you pay them yourself from the Money tab each year.`,
    yes:()=>{ S.autopay=true;
      popupOK('Arranged','Your bills will go out automatically. Keep money in the account.');
      save(); renderAll(); }});
}
/* An agreed plan: a fixed sum each year that clears the debt in about eight,
   and freezes the interest for as long as you keep to it. */
function arrPlanAmount(){
  const income=S.job?Math.round(S.job.pay*0.77):Math.round(6500*country().col);
  return Math.max(Math.round(S.arrears/8),Math.round(income*0.05));
}
function startArrPlan(){
  if(S.arrears<=0)return popupOK('Nothing owed','You are not in arrears.');
  if(S.arrPlan)return popupOK('Already agreed',`You are paying ${money(S.arrPlan.amt)} a year.`);
  const amt=arrPlanAmount();
  confirmDo('Agree a repayment plan',
    `They will accept ${money(amt)} a year and freeze the interest while you keep to it. Miss two years and the agreement is torn up.`,
    ()=>{ S.arrPlan={amt,missed:0};
      popupOK('Agreed',`${money(amt)} a year. The interest stops while you keep to it.`);
      save(); renderAll(); });
}
function cancelArrPlan(){
  if(!S.arrPlan)return;
  S.arrPlan=null;
  popupOK('Cancelled','The plan is off and the interest will run again.');
  save(); renderAll();
}
function chargeToCard(amount){
  let left=amount, used=0;
  (S.cards||[]).forEach(cd=>{
    if(left<=0)return; const def=CARD(cd.id); if(!def)return;
    const room=Math.max(0,def.limit-cd.bal);
    const take=Math.min(room,left);
    cd.bal+=take; left-=take; used+=take;
  });
  return used;
}
function tickCards(out){
  (S.cards||[]).forEach(cd=>{
    const def=CARD(cd.id); if(!def||cd.bal<=0)return;
    const interest=Math.round(cd.bal*def.apr);
    cd.bal+=interest;
    const min=Math.round(cd.bal*0.05)+25;
    if(autopayOn()&&S.money>=min){ S.money-=min; cd.bal-=min; ledger('spend',def.n+' payment',min);
      S.credit=Math.min(850,(S.credit==null?600:S.credit)+4); }
    else if(S.money<min){ S.credit=Math.max(300,(S.credit==null?600:S.credit)-35);
      out.push(`You missed the minimum payment on your ${def.n.toLowerCase()}.`); }
    if(cd.bal>def.limit*0.95)out.push(`Your ${def.n.toLowerCase()} is at its limit.`);
    if(def.perk&&def.id==='black')S.stats.reputation=clamp(S.stats.reputation+6);
  });
}
function tickFinance(){
  const out=[], c=country();
  if(S.job&&S.jailLeft===0){
    const gross=Math.round(S.job.pay*(1+newsMod('salary'))*M('earn'));
    let tax=Math.max(0.05,(hasItem('accountant')?0.16:0.23)-newsMod('taxcut'));
    if(gross>120000)tax+=0.08;
    if(gross>250000)tax+=0.07;        // progressive bands stop the top end running away
    const net=Math.round(gross*(1-tax));
    S.money+=net; S.jobYears++; S.totalWorked++; ledger('earn','Salary ('+S.job.t+')',net);
    if(gross>S.peakIncome)S.peakIncome=gross;
    out.push(`You earned ${money(net)} after tax as ${S.job.t}.`);
    /* annual performance review */
    let dp=ri(-8,8)+(hasEcho('driven')?6:0)-(hasEcho('scarred')?5:0)+Math.round(S.stats.discipline/12)+Math.round(S.skills.business/25)
          -Math.round(workPenalty()*30)-(S.habits.drinking>55?6:0)-(S.habits.drugs>35?10:0)
          -(S.stats.happiness<30?5:0);
    S.perf=clamp((S.perf==null?60:S.perf)+dp);
    const pb=perfBand(S.perf);
    out.push(`Performance review: ${pb.n} (${Math.round(S.perf)}/100).`);
    if(pb.raise>0&&R()<0.18){ S.job.pay=Math.round(S.job.pay*(1+pb.raise)); out.push(`Pay rise: you now earn ${money(S.job.pay)}.`); }
    if(pb.fire>0&&R()<pb.fire){ out.push(`You were dismissed from ${S.employer} for poor performance.`);
      logLine('Dismissed for poor performance.','bad'); S.job=null; S.firedCount++; S.perf=55; }
    S.skills.business=clamp(S.skills.business+1);
  } else if(S.job&&S.jailLeft>0){ out.push('You lost your job while in prison.'); S.job=null; }
  if(S.age>=18){
    /* everyday incidentals on top of the itemised bills */
    const col=Math.round(2600*c.col*(1+newsMod('prices'))*M('cost'));
    S.money-=col; ledger('spend','Day-to-day spending',col);
    if(!S.job&&!S.flags.retired&&S.age<65){ const b=Math.round(6500*c.col); S.money+=b; ledger('earn','Unemployment support',b); out.push(`Unemployment support: ${money(b)}.`); }
    if(S.fostering){
      const allow=Math.round(5200*c.col), spend=Math.round(4400*c.col);
      S.money+=allow-spend;
      out.push(`Fostering allowance ${money(allow)}, and ${money(spend)} spent on them.`);
    }
    if(S.flags.retired||S.age>=67){ const p=Math.round((9000+S.peakIncome*0.12)*c.col*0.5*(S.flags.pension?1.8:1)); S.money+=p; ledger('earn','Pension',p); out.push(`Pension: ${money(p)}.`); }
  }
  tickProperty(out); tickVehicles(out); tickBusinesses(out);
  tickBills(out); tickLiving(out); financeTick(out); tickCards(out); tickArrears(out);
  if(S.savings>0)S.savings+=Math.round(S.savings*0.025);
  /* loans */
  S.loans=(S.loans||[]).filter(l=>{
    const pay=Math.round(l.principal*(l.rate+0.12));
    if(S.money>=pay){ S.money-=pay; l.left-=1; l.missed=0; S.credit=Math.min(850,(S.credit||600)+6); }
    else { l.missed=(l.missed||0)+1; S.credit=Math.max(300,(S.credit||600)-45); out.push('You missed a loan repayment.'); }
    if(l.left<=0){ out.push('A loan is fully repaid.'); S.credit=Math.min(850,(S.credit||600)+20); return false; }
    return true;
  });
  /* credit score drift */
  if(S.age>=18){
    if(S.credit==null)S.credit=600;
    if(S.debt>0)S.credit=Math.max(300,S.credit-Math.min(30,Math.round(S.debt/4000)));
    else S.credit=Math.min(850,S.credit+8);
    if(S.savings>20000)S.credit=Math.min(850,S.credit+4);
  }
  const shrewd=S.traits.includes('shrewd')?0.06:0;
  if(S.crypto.units>0)S.crypto.price=Math.max(1,Math.round(S.crypto.price*(1+(R()-0.47)*0.8+newsMod('crypto')+shrewd)));
  else S.crypto.price=Math.max(1,Math.round(S.crypto.price*(1+(R()-0.48)*0.5)));
  (S.assets||[]).forEach(a=>{
    const it=DATA.items.find(i=>i.id===a.id);
    let g=0.03+newsMod('invest')*0.3+shrewd;
    if(a.id==='art_inv')g=(R()-0.42)*0.6;
    if(a.id==='gold')g=0.02+newsMod('invest')*0.1;
    if(a.id==='shopunit'||a.id==='vineyard'){ const inc=Math.round(a.value*0.06); S.money+=inc; out.push(`${it.n} income ${money(inc)}.`); }
    a.value=Math.max(0,Math.round(a.value*(1+g)));
  });
  if(S.debt>0){ S.debt=Math.round(S.debt*1.06); if(S.debt>S.counters.maxDebt)S.counters.maxDebt=S.debt; }
  S.items.forEach(id=>{ const it=DATA.items.find(d=>d.id===id); if(it){ if(it.eff)applyEff(it.eff); if(it.skill)applyEff({skill:it.skill}); } });
  if(hasItem('laptop')&&(S.skills.writing>=50||S.skills.gaming>=50)&&!S.job){
    const inc=Math.round((S.skills.writing+S.skills.gaming)*60*M('earn'));
    S.money+=inc; out.push(`Freelance work from home earned ${money(inc)}.`);
  }
  if(S.followers>10000){
    const inc=Math.round(S.followers*0.04*(1+newsMod('fame'))*M('earn'));
    S.money+=inc; out.push(`Sponsorships paid ${money(inc)}.`);
    S.followers=Math.round(S.followers*(0.95+R()*0.2));
  }
  if(S.money<0){
    if(S.age<18){
      /* minors cannot hold debt - the shortfall falls on the household */
      S.familyMoney=Math.max(0,S.familyMoney+S.money);
      S.money=0;
    } else {
      S.debt+=-S.money; out.push(`You went into debt: ${money(-S.money)} added.`);
      S.money=0; S.stats.happiness=clamp(S.stats.happiness-5);
    }
  }
  const nw=netWorth(); if(nw>S.peakNet)S.peakNet=nw;
  return out;
}
function tickConditions(){
  const out=[];
  /* new diagnoses */
  CONDITIONS.forEach(c=>{
    if(S.conditions.some(x=>x.id===c.id))return;
    let p=conditionRisk(S,c)*M('decay');
    if(hasItem('screening'))p*=0.85;
    if(hasEcho('scarred'))p*=1.35;
    if(hasEcho('steadied'))p*=0.8;
    if(R()<p){
      addCondition(c.id,c.sev);
      S.stats.health=clamp(S.stats.health-c.sev*5);
      out.push(`You were diagnosed with ${c.n.toLowerCase()}.`);
      logLine(`Diagnosed with ${c.n}.`,'bad');
      if(hasItem('screening'))out.push('Your annual screening caught it early.');
    }
  });
  /* progression, and what they cost you */
  S.conditions.forEach(k=>{
    const c=COND(k.id); if(!c)return;
    const scale=k.treated?0.35:1;
    for(const st in c.yr){ const amt=c.yr[st]*scale*M('decay')*(st==='health'?0.7:1);
      S.stats[st]=clamp(S.stats[st]+amt); }
    if(k.age!==S.age&&!k.treated&&R()<c.prog*M('decay')&&k.sev<3){
      k.sev++; out.push(`Your ${c.n.toLowerCase()} has worsened.`);
    }
    if(k.treated&&R()<0.25)k.treated=false;          // needs ongoing management
    if(!c.chronic&&k.treated&&R()<c.cure){
      S.conditions=S.conditions.filter(x=>x!==k);
      S.counters.illnessesBeaten++;
      out.push(`You have recovered from ${c.n.toLowerCase()}.`);
      logLine(`Recovered from ${c.n}.`,'good');
    }
  });
  /* disability from severe untreated illness */
  const severe=S.conditions.filter(k=>k.sev>=3&&!k.treated&&(S.age-k.age)>=3).length;
  if(severe>=1&&!S.disabled&&R()<0.06){
    S.disabled=true; S.disabledAt=S.age; out.push('You are now registered as disabled.');
    logLine('You became disabled.','bad');
  }
  return out;
}
/* The only way a condition should ever be added. Worsens an existing one
   rather than creating a duplicate. */
function addCondition(id,sev){
  const c=COND(id); if(!c)return null;
  const have=S.conditions.find(k=>k.id===id);
  if(have){ have.sev=Math.min(3,have.sev+1); have.treated=false; return have; }
  const k={id:id,age:S.age,sev:sev||c.sev,treated:false};
  S.conditions.push(k); return k;
}
function workPenalty(){
  let w=0; S.conditions.forEach(k=>{const c=COND(k.id); if(c)w+=c.work*(k.treated?0.4:1)*(k.sev/c.sev);});
  if(S.disabled)w+=0.2;
  return Math.min(0.9,w);
}
/* What your standard of living does to you in a year, on its own. */
function livingEffect(){
  const h=HOME(S.home), f=FOODTIER(S.food);
  const crowd=Math.max(0,householdSize(S)-h.space);
  return {
    happy: h.happy*0.35 + f.happy*0.4 - crowd*2,
    health: h.health*0.3 + f.health*0.4 - crowd*0.5,
    rep: h.rep*0.15
  };
}
function tickAging(){
  const out=[], a=S.age;
  let d=0;
  if(a>30)d+=0.35; if(a>50)d+=1.0; if(a>65)d+=1.9; if(a>80)d+=3.0;
  d*=(1-S.skills.fitness/300);
  if(S.traits.includes('frail'))d*=1.4;
  if(S.traits.includes('athletic'))d*=0.85;
  if(S.traits.includes('oldsoul'))d*=0.85;
  if(META.perks&&META.perks.goodstock)d*=0.9;
  let cd=0; S.conditions.forEach(k=>{ const c=COND(k.id);
    cd += k.sev*(c&&c.fatal?0.30:0.16)*(k.treated?0.4:1); });
  d += Math.min(2.4, cd);        // several illnesses compound, but not without limit
  d*=(1-(country().life||0)/220); d*=M('decay');
  S.stats.health=clamp(S.stats.health-d);
  let hd=S.traits.includes('anxious')?-2:-1;
  if(S.stats.happiness<25)hd+=2;      // people adapt; misery is not a one-way ratchet
  if(S.stats.happiness<12)hd+=2;
  if(S.stats.health<35)hd-=3;
  if(S.debt>20000)hd-=2;
  if(partner())hd+=2;
  if(anyOf('friend').length)hd+=1;
  if(anyOf('child').some(k=>k.r>=70))hd+=1;          // children you are close to
  if(a>=60&&!partner()&&!anyOf('friend').length
     &&!anyOf('child').some(k=>k.r>=55))hd-=3;       // and old age with nobody in it
  if(!S.job&&a>=22&&a<65)hd-=3;
  if(hd<0)hd*=M('decay');
  S.stats.happiness=clamp(S.stats.happiness+hd);
  if(a>28)S.stats.looks=clamp(S.stats.looks-(a>55?1.4:0.7)*M('decay')*(S.traits.includes('beautiful')?0.75:1));
  if(S.inSchool){
    S.stats.smarts=clamp(S.stats.smarts+(S.traits.includes('gifted')?3:2));
    if(a>=SCHOOL_START&&a<=SCHOOL_END){
      /* the options event may never fire; nobody should reach sixteen
         without having chosen */
      if(a>=OPTIONS_AGE+1&&!S.options) chooseOptions('best');
      tickSubjects(S,out);
    }
    else {
      const dg=Math.round((S.stats.smarts-50)/10)+Math.round(S.stats.discipline/25)
        -(S.habits.doomscroll>45?3:0)-(S.stats.happiness<30?3:0)+ri(-3,3);
      S.gpa=clamp((S.gpa==null?50:S.gpa)+dg);
    }
  }
  if(S.habits.sleep<25){ S.stats.health=clamp(S.stats.health-1); S.stats.smarts=clamp(S.stats.smarts-1); }
  if(S.stats.health<25)out.push('Your health is failing.');
  if(partner()&&partner().rel==='spouse')S.marriedYears++;
  if(a>=14&&R()<0.006*country().crime*(S.stats.reputation<35?1.6:1)){
    const loss=Math.min(S.money,ri(50,2500));
    S.money-=loss; S.stats.health=clamp(S.stats.health-ri(2,10)); S.stats.happiness=clamp(S.stats.happiness-8);
    out.push(`You were mugged in ${S.city}. You lost ${money(loss)}.`);
  }
  return out;
}
/* Every person around you is living their own life in parallel, and you hear about it. */
function npcLife(n,notes){
  if(!n.own)n.own={edu:0,job:null,partner:null,kids:0,city:null,arc:'steady'};
  const o=n.own, a=n.age, arc=o.arc;
  const tell=t=>{ if(n.r>25||R()<0.4)notes.push(t); };
  if(a===18&&!o.edu){
    if(arc==='rising'||R()<0.35){ o.edu=3; tell(`${n.name} started university.`); }
    else { o.edu=1; tell(`${n.name} left school and started looking for work.`); }
  }
  if(a===22&&o.edu===3){ tell(`${n.name} graduated.`); }
  if(!o.job&&a>=(o.edu>=3?22:17)&&R()<0.5){
    const tier = arc==='rising'?4 : arc==='struggling'?0 : arc==='troubled'?0 : 2;
    const pool=DATA.jobs.filter(j=>jobLvl(j)<=tier&&j.edu<=o.edu);
    if(pool.length){ o.job=pick(pool).t; tell(`${n.name} started work as a ${o.job.toLowerCase()}.`); }
  }
  if(o.job&&a>28&&arc==='rising'&&R()<0.10){
    const pool=DATA.jobs.filter(j=>jobLvl(j)>=3);
    if(pool.length){ o.job=pick(pool).t; tell(`${n.name} was promoted to ${o.job.toLowerCase()}.`); }
  }
  if(o.job&&arc==='struggling'&&R()<0.07){ tell(`${n.name} lost their job.`); o.job=null; }
  if(!o.partner&&a>=20&&a<55&&R()<0.07){
    o.partner=nameFor(country().reg,pick(['m','f'])).split(' ')[0];
    tell(`${n.name} is seeing someone called ${o.partner}.`);
  }
  if(o.partner&&a>=23&&!o.married&&R()<0.10){ o.married=true; tell(`${n.name} married ${o.partner}.`); }
  if(o.married&&o.kids<3&&a<48&&R()<0.10){ o.kids++; tell(`${n.name} had a baby.`); }
  if(o.married&&R()<0.02){ o.married=false; tell(`${n.name} and ${o.partner} separated.`); o.partner=null; }
  if(a>25&&a<60&&R()<0.025){
    const c=pick(DATA.countries.filter(x=>x.id!==S.country));
    o.city=c.name; tell(`${n.name} moved to ${c.name}.`); n.r=clamp(n.r-8);
  }
  if(arc==='troubled'&&a>16&&R()<0.05){ tell(`${n.name} was arrested.`); n.r=clamp(n.r-4); }
  if(arc==='rising'&&a>30&&R()<0.03){ tell(`${n.name} has done very well for themselves.`); }
  if(a>45&&R()<0.03){ tell(`${n.name} has not been well lately.`); }
  if(a>=60&&a<70&&!o.retired&&R()<0.2){ o.retired=true; tell(`${n.name} retired.`); }
}
function tickTrack(notes){
  if(!S.track||S.jailLeft>0)return;
  const def=TRACK(S.track.id); if(!def)return;
  S.track.years=(S.track.years||0)+1;
  const before=S.track.rank;
  TRACK_RANK(S.track);
  try{ def.yearly(notes); }catch(e){ softFail('track.yearly:'+(def&&def.id),e); }
  TRACK_RANK(S.track);
  if(S.track.rank>before){
    const r=def.ranks[S.track.rank];
    notes.push(`You have risen to ${r.n}.`);
    logLine(`Became ${r.n} in ${def.n}.`,'good');
    S.stats.reputation=clamp(S.stats.reputation+4);
  }
}
function tickNPCs(notes){
  S.npcs.forEach(n=>{
    if(!n.alive)return;
    n.age++;
    npcLife(n,notes);
    n.r=clamp(n.r-(S.traits.includes('kind')?0.4:S.traits.includes('hottemper')?1.6:1.0)*M('relDecay')*((META.perks&&META.perks.wellmet)?0.7:1)*personality(n.pers).drift*(hasEcho('scarred')?1.4:hasEcho('steadied')?0.7:1));
    let p=0;
    if(n.age>60)p=0.01*(n.age-60);
    if(n.age>85)p+=0.05*(n.age-85);
    if(R()<p){ n.alive=false; notes.push(`${n.name} (your ${n.rel}) died at ${n.age}.`);
      S.stats.happiness=clamp(S.stats.happiness-(n.rel==='spouse'?25:12));
      if(n.rel==='spouse')S.flags.widowed=true; }
    if(n.rel==='partner'&&n.alive&&n.r<20&&R()<0.4){ n.rel='ex'; notes.push(`${n.name} broke up with you.`);
      S.stats.happiness=clamp(S.stats.happiness-15); S.flags.had_partner=true; }
  });
}
function tickSchool(notes){
  if(S.age===5&&!S.inSchool){
    S.inSchool=true; S.school=S.school||schoolFor(country().reg);
    const t=addNPC('teacher',null,ri(26,58),ri(45,65));
    notes.push(`You started at ${S.school}. Your teacher is ${t.name}.`);
    logLine(`Started school at ${S.school}.`);
  }
  if(S.inSchool&&S.age>5&&R()<0.22&&anyOf('teacher').length<2){
    const t=addNPC('teacher',null,ri(26,60),ri(40,60)); notes.push(`${t.name} is your new teacher this year.`);
  }
  if(S.inSchool&&S.age>=11&&!S.flags.movedSchool&&S.age===11){
    S.flags.movedSchool=true; S.school=schoolFor(country().reg);
    notes.push(`You moved up to ${S.school}.`);
  }
  if(S.inSchool&&S.age>=6&&S.age<=21&&R()<(S.traits.includes('loner')?0.12:0.35)&&anyOf('friend').length<(S.traits.includes('loner')?2:5)){
    const f=addNPC('friend',null,S.age+ri(-1,1),ri(45,70)); notes.push(`You became friends with ${f.name}.`);
  }
  if(S.job&&R()<0.25&&anyOf('colleague').length<4){
    const f=addNPC('colleague',null,S.age+ri(-10,12),ri(40,65)); notes.push(`${f.name} joined your team.`);
  }
  if(S.age===18&&!S.capsule&&R()<0.5){
    QUEUE.push({type:'CAPSULE'});
  }
  if(S.age===50&&S.capsule&&!S.capsuleOpened){
    S.capsuleOpened=true;
    QUEUE.push({type:'CAPSULE_OPEN'});
    if(!hasEgg('capsule'))findEgg('capsule');
  }
  if(S.age===18&&!S.flags.inCollege){
    S.inSchool=false;
    if(S.stats.smarts>=35){ S.edu=Math.max(S.edu,1); notes.push('You graduated high school.'); }
    else notes.push('You left school without qualifications.');
    schoolLeavingSkills(S,notes);
  }
  if(S.flags.inCollege){
    S.collegeYears=(S.collegeYears||0)+1; S.stats.smarts=clamp(S.stats.smarts+3);
    /* the subject chooser can be dismissed, and an unset S.degree is exactly
       how this whole system was dead in the first place */
    if(!S.degree){ const d0=degreesOpenTo(S)[0]; if(d0){ S.degree=d0.id; S.degreeYears=d0.years; } }
    const deg=DEGREE(S.degree), need=S.degreeYears||4;
    if(deg){ for(const k in deg.skills){ const per=Math.round(deg.skills[k]/need);
      if(S.skills[k]!=null)S.skills[k]=clamp(S.skills[k]+per); else S.stats[k]=clamp(S.stats[k]+per); } }
    if(S.collegeYears>=need){
      S.flags.inCollege=false; S.edu=Math.max(S.edu,3); S.inSchool=false;
      S.degreeDone=S.degree;
      notes.push(deg?`You graduated in ${deg.n}.`:'You graduated.');
      logLine(deg?`Graduated in ${deg.n}.`:'Graduated.','good');
      S.stats.reputation=clamp(S.stats.reputation+5);
    }
  }
  if(S.flags.inGrad){
    S.gradYears=(S.gradYears||0)+1; S.stats.smarts=clamp(S.stats.smarts+4);
    if(S.gradYears>=2){ S.flags.inGrad=false; S.edu=4; notes.push('You earned a postgraduate degree.'); }
  }
}
function tickNews(notes){
  S.news=S.news.filter(n=>{n.left--;return n.left>0;});
  if(R()<0.45){
    const d=pick(DATA.news);
    if(!S.news.some(n=>n.id===d.id)){
      S.news.push({id:d.id,left:d.d}); notes.push(S.paper+': '+d.t);
      if(d.m.health)S.stats.health=clamp(S.stats.health+d.m.health);
    }
  }
}
function eggTick(){
  const a=S.age;
  /* WINK: palindrome ages */
  if(a>=11&&a<=99&&a%11===0&&!hasEgg('palindrome')&&eggRoll('wink'))findEgg('palindrome');
  /* WINK: a stranger's note in a secondhand book */
  if((S.habits.reading>30||S.skills.writing>40)&&!hasEgg('bookmark')&&eggRoll('wink'))
    findEgg('bookmark','"If you are reading this, I got out. I hope you do too. — M, 1974"');
  /* WINK: a child born on your birthday */
  /* far more lives end up with children now, and a yearly 2% over forty of
     them is not a rare event any more */
  if(anyOf('child').length&&!hasEgg('sharedbday')&&R()<0.005)findEgg('sharedbday');
  /* RARE: sonder */
  if(a>=12&&eggRoll('rare')&&!hasEgg('sonder'))
    findEgg('sonder', sonderLife(R,pick,nameFor,surFor,cityFor,country().reg));
  /* RARE: the letter from Yination */
  if(a>=16&&eggRoll('rare')&&!hasEgg('yination'))
    findEgg('yination','The letterhead reads YINATION. There is no address, no logo and no signature. '+
      'It contains one line: "We have been following your progress." You never receive another.');
  /* RARE: the V8 in the garage */
  if(a>=17&&(S.skills.handiness>25||hasItem('toolkit'))&&eggRoll('rare')&&!hasEgg('v8'))
    findEgg('v8','Under a sheet at the back of the garage is a car nobody mentioned. '+
      'It has a V8 in it. On the third try, it catches.');
  /* MYTH: a year that did not happen */
  if(a>=25&&eggRoll('myth')&&!hasEgg('glitch')){
    findEgg('glitch','You are certain you have already lived this year. '+
      'Nobody else remembers it differently, and the calendar agrees with them.');
  }
  /* MYTH: the thirteenth */
  if(META.lives%13===0&&a===13&&!hasEgg('thirteen'))
    findEgg('thirteen','This is your thirteenth life, and you are thirteen. '+
      'For one moment you are aware of being counted.');
  /* MYTH: the far edge of a human life */
  if(a>=110&&!hasEgg('centurion'))findEgg('centurion');
}
function deathCheck(){
  let p=0; const a=S.age,h=S.stats.health;
  if(h<=0)p=1;
  else if(a<16){ p=h<25?0.02:0.0009; if(S.illness)p+=0.01; }
  else{
    p=Math.max(0,(a-42)/100*0.045)+(a>70?(a-70)*0.014:0)+(a>88?(a-88)*0.055:0);
    p+=Math.max(0,(65-h))/100*0.06;
    S.conditions.forEach(k=>{
      const c=COND(k.id); if(!c)return;
      const base = c.fatal ? (k.sev>=3?0.016:k.sev===2?0.006:0.002)
                           : (k.sev>=3?0.004:0.0008);      // depression does not usually kill you
      p += base * (k.treated?0.35:1);
    });
    if(h<20)p+=0.14;
    p*=(1-(country().life||0)/160);
  }
  p*=M('death');
  if(R()<p){ die(deathCause()); return true; }
  return false;
}
function deathCause(){
  const lethal=S.conditions.filter(k=>{const c=COND(k.id);return c&&c.fatal;})
                           .sort((a,b)=>b.sev-a.sev)[0];
  if(lethal&&(lethal.sev>=3||R()<0.55))return 'complications from '+COND(lethal.id).n.toLowerCase();
  const severe=S.conditions.filter(k=>k.sev>=3).sort((a,b)=>b.sev-a.sev)[0];
  if(severe&&R()<0.3)return 'complications from '+COND(severe.id).n.toLowerCase();
  if(S.stats.health<=0)return 'total physical collapse';
  if(S.age>85)return 'old age';
  
  return pick(['heart failure','a sudden illness','an accident','natural causes','a stroke']);
}
function die(cause){
  S.alive=false; S.cause=cause;
  /* a prosecution does not outlive the defendant, and a case left open would
     be re-queued for a dead character on the next load */
  if(S.legalCase){ logLine('The case against you was discontinued.','neutral'); S.legalCase=null; }
  logLine(`You died at ${S.age} of ${cause}.`,'bad');
  if(hasItem('lifeins'))S.money+=120000;
  QUEUE=[]; save();
  setTimeout(()=>showDeath(),150);
}

/* ---------------- events ---------------- */
function reqOk(ev){
  if(ev.once&&S.seen[ev.id])return false;
  if(S.age<ev.min||S.age>ev.max)return false;
  const last=S.cd[ev.id];
  if(last!=null && S.age-last < (ev.cd||20)) return false;
  const q=ev.req||{};
  if(q.flags&&!q.flags.every(f=>S.flags[f]))return false;
  if(q.noflags&&q.noflags.some(f=>S.flags[f]))return false;
  if(q.job&&!S.job)return false;
  if(q.nojob&&S.job)return false;
  if(q.partner&&!partner())return false;
  if(q.nopartner&&partner())return false;
  if(q.child&&!anyOf('child').length)return false;
  if(q.nochild&&S.npcs.some(n=>n.rel==='child'))return false;
  if(q.sibling&&!anyOf('sibling').length)return false;
  if(q.maxSiblings!=null&&anyOf('sibling').length>q.maxSiblings)return false;
  if(q.children2&&anyOf('child').length<2)return false;
  if(q.siblings2&&anyOf('sibling').length<2)return false;
  if(q.gathering&&(anyOf('child').length+anyOf('sibling').length+(partner()?1:0))<2)return false;
  if(q.teacher&&!anyOf('teacher').length)return false;
  if(q.condition&&!S.conditions.length)return false;
  if(q.record&&!S.record.length)return false;
  if(q.parole&&!(S.parole>0))return false;
  if(q.followers&&S.followers<q.followers)return false;
  if(q.artskill&&(S.skills.art||0)<q.artskill)return false;
  if(q.sibling&&!anyOf('sibling').length)return false;
  if(q.maxSiblings!=null&&anyOf('sibling').length>q.maxSiblings)return false;
  if(q.friend&&!anyOf('friend').length&&!anyOf('colleague').length)return false;
  if(q.property&&!(S.properties||[]).length)return false;
  if(q.noproperty&&(S.properties||[]).length)return false;
  if(q.item&&!hasItem(q.item))return false;
  if(q.poor&&S.birthTier>1)return false;
  if(q.smart&&S.stats.smarts<q.smart)return false;
  if(q.rep&&S.stats.reputation<q.rep)return false;
  if(q.parentAlive&&!S.npcs.some(n=>(n.rel==='mother'||n.rel==='father')&&n.alive))return false;
  if(q.parentDead&&!S.npcs.some(n=>(n.rel==='mother'||n.rel==='father')&&!n.alive))return false;
  if(q.anyBadHabit&&!Object.keys(DATA.habits).some(k=>!DATA.habits[k].good&&S.habits[k]>=q.anyBadHabit))return false;
  if(q.habit)for(const k in q.habit){ if(S.habits[k]<q.habit[k])return false; }
  return true;
}
function evWeight(e){
  const theme=e.id.split('_')[0];
  let w=e.w*(S.seen[e.id]?0.25:1);
  if(S.lean&&S.lean.indexOf(theme)>=0)w*=2.1;
  if(S.away&&S.away.indexOf(theme)>=0)w*=0.35;
  if(e.pathFork)w*=2.2;   /* a year should more often hand you a decision than a nudge */
  return w;
}
function pickEvents(n){
  const pool=EVENTS.filter(reqOk), out=[];
  for(let i=0;i<n&&pool.length;i++){
    const tot=pool.reduce((s,e)=>s+evWeight(e),0);
    let r=R()*tot, ch=pool[0];
    for(const e of pool){ r-=evWeight(e); if(r<=0){ch=e;break;} }
    out.push(ch); pool.splice(pool.indexOf(ch),1);
  }
  return out;
}
function resolveChoice(ev,ci){
  const ch=ev.c[ci];
  S.seen[ev.id]=true; S.cd[ev.id]=S.age;
  let lines=applyEff(ch.e);
  const extra=[], add=t=>extra.push(tok(t));

  if(ch.flag)S.flags[ch.flag]=true;
  if(ch.phoneRoll){
    const par=findNPC('mother')||findNPC('father');
    if(par&&R()<0.45+par.r/220){ S.items.push('phone'); S.flags.has_phone=true;
      add('They gave in. You have a phone.'); }
    else add('They said next year. They said that last year.');
  }
  if(ch.phoneSave){
    const c=Math.round(500*country().col);
    if(S.familyMoney>=c||S.money>=c){ if(S.money>=c)S.money-=c; else S.familyMoney-=c;
      S.items.push('phone'); S.flags.has_phone=true;
      add('Months of saved birthday money, and it is yours.'); }
    else add('You could not get near the price.');
  }
  if(ch.cryptoStart){
    const amt=Math.min(ch.cryptoStart,S.money+ch.cryptoStart);
    S.crypto.units+=amt/S.crypto.price; S.flags.holds_crypto=true;
    S.counters.cryptoProfit-=amt;
    add(`You now hold ${money(amt)} of crypto. It will do whatever it likes.`);
  }
  if(ch.onlineMeet){
    if(R()<0.72){ const f=addNPC('friend',null,S.age+ri(-3,4),ri(60,85));
      applyEff({happiness:14,skill:{charisma:5}});
      add(`They are exactly who they said. ${f.name} is a real friend now.`); }
    else { applyEff({happiness:-16,smarts:6,discipline:4});
      add('They were not who they said they were. You got out of there.'); }
  }
  if(ch.onlineVerify){
    if(R()<0.7){ const f=addNPC('friend',null,S.age+ri(-3,4),ri(55,75));
      applyEff({happiness:9}); add(`It was them. You and ${f.name} speak most days.`); }
    else { applyEff({happiness:-7,smarts:8}); add('They refused, then stopped replying. You understood.'); }
  }
  if(ch.strikeRoll){ if(R()<0.45+S.skills.charisma/300){ add('You kept your licence. Barely.'); applyEff({reputation:-6}); }
    else { S.banned.push({field:S.job?S.job.field:'medical',until:null,why:'You were struck off'});
      if(S.job)S.job=null; applyEff({happiness:-20,reputation:-16}); add('You were struck off.'); } }
  if(ch.appealRoll){ if(R()<0.4+S.stats.reputation/300){ add('The appeal succeeded. You can stay.'); applyEff({happiness:12}); }
    else { add('The appeal failed.'); const nc=pick(DATA.countries.filter(x=>x.id!==S.country));
      if(S.job)S.job=null; S.country=nc.id; S.city=cityFor(nc.reg); S.credsLost=true; applyEff({happiness:-18}); } }
  if(ch.rehabCareer){ if(R()<0.4){ add('You made it back.'); applyEff({skill:{fitness:8},happiness:10}); }
    else { S.banned.push({field:'sport',until:null,why:'Your body will not take it'}); if(S.job&&S.job.field==='sport')S.job=null;
      add('The comeback did not happen.'); applyEff({happiness:-16}); } }
  if(ch.inheritBiz){ const v=ri(40000,160000); S.businesses.push({t:pick(['cafe','shop','garage','barber']),value:v,staff:2,ups:[],rep:50}); S.flags.owns_business=true; S.counters.businesses++;
    add(`The business is yours, worth about ${money(v)}.`); }
  if(ch.ruin){ const loss=Math.round((S.money+S.savings)*0.9); S.money-=loss; S.savings=0; S.businesses=[];
    S.flags.owns_business=false; S.credit=Math.max(300,(S.credit||600)-150); add(`It cost you ${money(loss)}.`); }
  if(ch.bankrupt){ S.money=0; S.savings=0; S.debt=0; S.businesses=[]; S.flags.owns_business=false;
    S.properties=[]; S.home='room'; S.cards=[]; S.arrears=0; S.overdue=0; S.overdueItems=[]; S.arrPlan=null; S.billsDue=0; S.billItems=[]; S.credit=320; S.banned.push({field:'corp',until:S.age+8,why:'An undischarged bankruptcy bars you'});
    add('Everything was written off, and so were you, for a while.'); }
  if(ch.retrain){ S.edu=Math.max(S.edu,2); S.careerLvl=Math.max(0,(S.careerLvl==null?0:S.careerLvl)-2);
    if(S.job){S.job=null;} S.banned=[]; add('You are starting again, lower down, in something new.'); }
  if(ch.joinForces){ const j=DATA.jobs.find(x=>x.id==='soldier'); if(j){ setJob(j); add(`You enlisted. You are a ${j.t}.`); } }
  if(ch.vow){ S.flags.vow=true; S.npcs.filter(n=>n.rel==='partner'||n.rel==='spouse').forEach(n=>n.rel='ex');
    add('You will not be marrying anyone.'); }
  if(ch.bigBreak){
    if(R()<0.35+S.stats.reputation/300+LUCK()){
      const pool=DATA.jobs.filter(j=>jobLvl(j)>=4&&!jobLocked(j));
      if(pool.length){ const j=pick(pool); setJob(j); S.followers+=ri(20000,300000);
        applyEff({reputation:15,happiness:18}); add(`It came off. You are a ${j.t}.`); }
      else { applyEff({money:40000,reputation:8}); add('It came off, and it paid.'); }
    } else { applyEff({happiness:-12,money:-2000}); add('Nothing came of it.'); }
  }
  if(ch.wrongfulRoll){
    if(R()<0.4){ applyEff({money:80000,reputation:14,happiness:10}); add('You were cleared, eventually, and compensated.'); }
    else { S.jailLeft=ri(2,6); S.record.push({crime:'Wrongful conviction',age:S.age,sev:2,spent:false});
      add(`You were convicted and sentenced to ${S.jailLeft} years.`); logLine('Wrongly convicted.','bad'); }
  }
  if(ch.pension){ S.flags.pension=true; add('You are paying into a pension. Your later years will thank you.'); }
  if(ch.flipRoll){
    const cost=Math.round(90000*country().col);
    if(S.money<cost){ add('You could not raise the money.'); }
    else { S.money-=cost;
      if(R()<0.45+S.skills.handiness/220+S.skills.business/300){
        const gain=Math.round(cost*(1.3+R()*0.5)); S.money+=gain; applyEff({skill:{business:8}});
        add(`You sold it on for ${money(gain)}.`); }
      else { const back=Math.round(cost*(0.6+R()*0.3)); S.money+=back;
        add(`It sold at a loss. You got ${money(back)} back.`); } }
  }
  if(ch.secondProp){
    if(!S.properties.length){ add('You have no property to leverage.'); }
    else { const v=Math.round(S.properties[0].value*0.8); S.debt+=v;
      S.properties.push({t:'flat',value:v,mortgage:0,rented:true,cond:ri(50,80),home:false});
      add(`You borrowed ${money(v)} against your home and bought a flat to let.`); }
  }
  if(ch.drivingRisk){ if(R()<0.3){ applyEff({health:-16,money:-6000,reputation:-6});
      add('There was an accident. Everyone had been right.'); } else add('Nothing happened. This time.'); }
  if(ch.banField){
    const yrs=ch.banYears||null;
    S.banned.push({field:ch.banField,until:yrs?S.age+yrs:null,why:ch.banWhy||'You are barred from this profession'});
    if(S.job&&S.job.field===ch.banField){ add(`You can no longer work as a ${S.job.t.toLowerCase()}.`); S.job=null; S.firedCount++; }
    add(yrs?`${DATA.fieldNames[ch.banField]} is closed to you for ${yrs} years.`
           :`${DATA.fieldNames[ch.banField]} is closed to you permanently.`);
    logLine(`Barred from ${DATA.fieldNames[ch.banField]}.`,'bad');
  }
  if(ch.deport){
    const nc=pick(DATA.countries.filter(x=>x.id!==S.country));
    if(S.job){ add(`You lost your job as ${S.job.t}.`); S.job=null; }
    S.country=nc.id; S.city=cityFor(nc.reg); S.credsLost=true;
    if(!S.countriesLived.includes(nc.id))S.countriesLived.push(nc.id);
    S.npcs.filter(n=>n.alive&&n.rel==='friend').forEach(n=>n.r=clamp(n.r-25));
    add(`You now live in ${nc.name}. Your qualifications count for less here.`);
    logLine(`Forced to move to ${nc.name}.`,'bad');
  }
  if(ch.dependent){ S.dependents++; add('Someone now depends on you. You will have less time each year.'); }
  if(ch.freeDependent&&S.dependents>0){ S.dependents--; add('You have your time back.'); }
  if(ch.npcJob){
    const n=pick(S.npcs.filter(x=>x.alive&&x.own&&x.own.job));
    if(!n)add('Nothing came of it.');
    else { const pool=DATA.jobs.filter(j=>jobLvl(j)<=maxLvl()+2&&!jobLocked(j));
      if(pool.length){ const j=pool[pool.length-1]; setJob(j); S.job.pay=Math.round(S.job.pay*1.1);
        add(`${n.name} brought you in as ${j.t}.`); n.r=clamp(n.r+10); }
      else add('They could not find you anything.'); } }
  if(ch.npcGift){ const n=pick(S.npcs.filter(x=>x.alive)); const amt=ri(4000,45000);
    if(n){ S.money+=amt; n.r=clamp(n.r+8); add(`${n.name} gave you ${money(amt)}.`); } }
  if(ch.npcDrain){ const n=pick(S.npcs.filter(x=>x.alive)); const amt=ri(3000,25000);
    if(n){ S.money-=amt; n.r=clamp(n.r+16); add(`Helping ${n.name} cost you ${money(amt)}.`); } }
  if(ch.childReflect){
    const k=pick(anyOf('child'));
    if(k&&k.own&&(k.own.arc==='rising')){ applyEff({reputation:10,happiness:14}); add(`${k.name} has done well, and people know it.`); }
    else if(k){ applyEff({reputation:-6,happiness:-10}); add(`${k.name} is struggling, and people talk.`); }
  }
  if(ch.gradeBoost){ S.gpa=clamp(S.gpa+ch.gradeBoost); add(`Your grade is now ${Math.round(S.gpa)}/100.`); }
  if(ch.gradeDrop){ S.gpa=clamp(S.gpa-ch.gradeDrop); add(`Your grade slipped to ${Math.round(S.gpa)}/100.`); }
  if(ch.gradeReact){ const g=gradeBand(S.gpa);
    if(S.gpa>=70){ applyEff({rel:{parents:10},happiness:8}); add(`Grade ${g.n}. They were proud.`); }
    else if(S.gpa>=55){ add(`Grade ${g.n}. Nobody said much.`); }
    else { applyEff({rel:{parents:-9},happiness:-7}); add(`Grade ${g.n}. It did not go well at home.`); } }
  if(ch.perfBoost){ S.perf=clamp(S.perf+ch.perfBoost); add(`Your standing at work improved (${Math.round(S.perf)}/100).`); }
  if(ch.perfDrop){ S.perf=clamp(S.perf-ch.perfDrop); add(`Your standing at work suffered (${Math.round(S.perf)}/100).`); }
  if(ch.payRise){ if(!S.job)add('You have no job.');
    else if(R()<0.35+S.skills.charisma/250+(S.perf>70?0.2:0)){ S.job.pay=Math.round(S.job.pay*1.12); add(`Agreed: ${money(S.job.pay)}.`); }
    else { add('They said no.'); S.perf=clamp(S.perf-4); } }
  if(ch.whistle){ if(R()<0.5){ add('It was investigated. You were quietly let go.'); S.job=null; S.firedCount++; applyEff({reputation:10}); }
    else { add('Nothing happened, and now everyone knows it was you.'); S.perf=clamp(S.perf-25); } }
  if(ch.condition){ if(!S.conditions.some(k=>k.id===ch.condition)){
      const c=COND(ch.condition); addCondition(ch.condition,c.sev);
      add(`You now live with ${c.n.toLowerCase()}.`); } }
  /* A bad decision should risk an illness, not guarantee one. Ignoring a lump
     usually comes to nothing, which is exactly why people ignore lumps. */
  if(ch.conditionRisk){
    const cr=ch.conditionRisk;
    if(R()<cr.p){
      if(!S.conditions.some(k=>k.id===cr.id)){
        const c=COND(cr.id); addCondition(cr.id,c.sev);
        add(`It was not nothing. You now live with ${c.n.toLowerCase()}.`); }
    } else add(cr.miss||'Nothing came of it. Not this time.');
  }
  if(ch.treatOne){ if(S.conditions.length){ const k=pick(S.conditions); k.treated=true; add(`Your ${COND(k.id).n.toLowerCase()} is being properly managed.`); } }
  if(ch.quackery){ if(R()<0.15){ const k=pick(S.conditions); if(k){k.treated=true;add('Against the odds, you feel better.');} }
    else { applyEff({health:-4}); add('It did nothing.'); } }
  if(ch.creditUp){ S.credit=Math.min(850,(S.credit==null?600:S.credit)+ch.creditUp); add(`Credit score ${Math.round(S.credit)}.`); }
  if(ch.creditDown){ S.credit=Math.max(300,(S.credit==null?600:S.credit)-ch.creditDown); add(`Credit score ${Math.round(S.credit)}.`); }
  if(ch.scamRisk){ if(R()<0.7){ const l=Math.min(S.money,ri(500,9000)); S.money-=l; applyEff({happiness:-10}); add(`It was a scam. You lost ${money(l)}.`); }
    else { applyEff({money:1200}); add('Improbably, it paid out once.'); } }
  if(ch.arrestRisk){ if(R()<0.4)extra.push(...doCrime('vandalism',true)); else add('They moved on.'); }
  if(ch.paroleRisk){ if(R()<0.45){ S.jailLeft=2; add('You were recalled to prison for two years.'); logLine('Recalled to prison.','bad'); }
    else add('They believed you.'); }
  if(ch.expunge){ if(R()<0.5+S.stats.reputation/300){ S.record.forEach(r=>{ if(r.sev<=2)r.spent=true; }); add('Your older convictions have been set aside.'); }
    else add('The application was refused.'); }
  if(ch.expand){ if(!S.businesses.length)add('You have no business.');
    else { const b=S.businesses[0]; S.debt+=40000; b.value+=40000; b.staff=Math.min(BIZ(b.t).maxStaff,b.staff+2); add('You borrowed to expand.'); } }
  if(ch.bizHit&&S.businesses.length){ const b=S.businesses[0]; b.value=Math.max(0,Math.round(b.value*(1+ch.bizHit))); add('Margins are thinner now.'); }
  if(ch.item==='phone')S.flags.has_phone=true;
  if(ch.item){ if(ch.item==='pet'){ const np=addPet('dog',true); add(`${np.name} is yours now.`); } else if(!S.items.includes(ch.item)){S.items.push(ch.item); add('Added to your things.');} }
  if(ch.sibling){ const s=addNPC('sibling',null,0,70); add(`${s.name} joined the family.`); }
  if(ch.friend){ const f=addNPC('friend',null,S.age,ri(55,80)); add(`${f.name} is now your friend.`); }
  if(ch.setEdu){ S.edu=Math.max(S.edu,ch.setEdu); add(`You now hold: ${DATA.eduNames[S.edu]}.`); }
  if(ch.options){ const kept=chooseOptions(ch.options); add(`You kept ${kept.join(', ')}.`); }
  if(ch.debtPay){ S.debt=Math.max(0,S.debt-ch.debtPay); S.counters.debtCleared+=ch.debtPay; }
  if(ch.debtAdd){ S.debt+=ch.debtAdd; add(`Debt increased by ${money(ch.debtAdd)}.`); }
  if(ch.romance!=null){
    if(canRomance()&&R()<ch.romance+S.skills.charisma/300+S.stats.looks/400+LUCK()){
      const p=addNPC('partner',partnerGender(),Math.max(16,S.age+ri(-4,4)),ri(55,80));
      S.flags.had_partner=true; S.counters.partners++; add(`${p.name} said yes. You are together.`);
    } else add(canRomance()?'They turned you down.':'You realised you did not want this.');
  }
  if(ch.rollSkill){
    const rs=ch.rollSkill, lv=S.skills[rs.k]||0;
    const p=rs.p+lv/200+LUCK()-(S.traits.includes('reckless')?0.06:0);
    const amp=o=>{ if(!S.traits.includes('reckless')||!o)return o; const c=Object.assign({},o); if(c.money)c.money=Math.round(c.money*1.6); return c; };
    if(R()<p){ lines=lines.concat(applyEff(amp(rs.s))); add('It worked.'); }
    else { lines=lines.concat(applyEff(amp(rs.f))); add('It did not work out.'); }
  }
  if(ch.examRoll){
    const sc=Math.round((S.stats.smarts+ (S.gpa==null?50:S.gpa))/2)+ri(-10,10);
    add(`Your school record was graded ${gradeBand(S.gpa==null?50:S.gpa).n} \u2014 ${gradeBand(S.gpa==null?50:S.gpa).label.toLowerCase()}.`);
    if(sc>70){S.edu=Math.max(S.edu,1);applyEff({happiness:12,smarts:4,reputation:5});add('Excellent results. Doors are open.');S.flags.good_grades=true;}
    else if(sc>40){S.edu=Math.max(S.edu,1);applyEff({happiness:4});add('Passable results.');}
    else {applyEff({happiness:-12,reputation:-4});add('You failed most of them.');}
  }
  if(ch.cheatRoll){ if(R()<0.6){add('Nobody found out.');} else {applyEff({reputation:-15,happiness:-12,smarts:-4});add('You were caught cheating. It goes on your record.');} }
  if(ch.collegeRoll){
    const score=Math.round((S.stats.smarts+(S.gpa==null?50:S.gpa))/2)+(S.flags.scholarship?15:0);
    const tier=UNI_TIERS.find(t=>score>=t.need)||UNI_TIERS[UNI_TIERS.length-1];
    S.uniTier=tier.id;
    const ok=score>=40;
    const fee=Math.round(24000*country().edu*tier.cost*(S.flags.scholarship?0.2:1));
    if(ok){ add(`You were accepted by ${tier.n}. Tuition is ${money(fee)} per year.`);
      QUEUE.unshift({type:'D',title:'Accept the place?',text:'Four years of study. You will need a loan unless you can pay.',
        yes:()=>{S.flags.inCollege=true;S.inSchool=true;S.debt+=fee*4;S.flags.student_loan=true;S.school=uniFor(country().reg);S.stats.reputation=clamp(S.stats.reputation+tier.rep);logLine(`You enrolled at ${S.school}.`);
          /* S.degree was read in six places and set in none, so every degree
             in the game was unreachable. You pick one, and your subjects
             decide which ones are on the table. */
          const open=degreesOpenTo(S);
          chooseFrom('What will you read?',open.map(d=>[`${d.n} \u00b7 ${d.years} years`,0,d.id]),(label,id)=>{
            const d=DEGREE(id); if(!d)return;
            S.degree=id; S.degreeYears=d.years; S.collegeYears=0;
            logLine(`You started a degree in ${d.n}.`);
          });},
        no:()=>logLine('You declined the university place.')});
    } else { applyEff({happiness:-10}); add('You were rejected.'); }
  }
  if(ch.driveRoll){ if(R()<0.55+S.stats.discipline/300+LUCK()){S.flags.licence=true;applyEff({happiness:8});add('You passed.');} else {applyEff({happiness:-6});add('You failed. Again.');} }
  if(ch.crimeRoll)extra.push(...doCrime(ch.crimeRoll,true));
  if(ch.charmRoll){
    const ok=R()<0.35+S.skills.charisma/200+(S.traits.includes('funny')?0.1:0)-(S.traits.includes('stubborn')?0.08:0)+LUCK();
    if(ok){lines=lines.concat(applyEff(ch.charmRoll.s));add('It worked.');}
    else{lines=lines.concat(applyEff(ch.charmRoll.f));add('It did not work.');
      if(ch.charmRoll.failDivorce){const p=partner();if(p){p.rel='ex';S.counters.divorces++;S.marriedYears=0;add('They left.');}}}
  }
  if(ch.handyRoll){ if(R()<0.2+S.skills.handiness/130+LUCK()){applyEff({money:-200,skill:{handiness:6}});add('You fixed it yourself.');} else {applyEff({money:-2400});add('You made it worse.');} }
  if(ch.promoRoll)extra.push(...tryPromote(true));
  if(ch.promoPenalty)S.flags.promo_blocked=true;
  if(ch.promoBoost)S.flags.promo_boost=true;
  if(ch.fire){ if(S.job){add(`You are no longer ${S.job.t}.`);S.job=null;S.firedCount++;} }
  if(ch.fireRoll){ if(R()<0.3+S.skills.charisma/250)add('You kept your job.'); else if(S.job){add('You were let go anyway.');S.job=null;S.firedCount++;} }
  if(ch.layoffRoll){ if(R()<0.45){ if(S.job){add('Your name was on the list.');S.job=null;S.firedCount++;applyEff({happiness:-12});} } else add('You survived the cuts.'); }
  if(ch.teenJob){ const j={id:'ptjob',t:'Part-time work',pay:Math.round(11000*country().sal),field:'service',lvl:0}; S.job=j;S.jobsHeld++;add('You got the job.'); }
  if(ch.takeJob){ const j=DATA.jobs.find(x=>x.id==='assistant'); setJob(j); add(`You started as ${j.t}.`); }
  if(ch.newJob&&S.job){ S.job={...S.job,pay:Math.round(S.job.pay*ch.newJob)}; add(`Your new salary is ${money(S.job.pay)}.`); }
  if(ch.leverageRoll){ if(!S.job)add('You have no job to leverage.'); else if(R()<0.5){S.job.pay=Math.round(S.job.pay*1.15);add(`Counter-offer accepted: ${money(S.job.pay)}.`);} else {add('They called your bluff.');applyEff({reputation:-4});} }
  if(ch.startup&&S.job){ S.job={...S.job,pay:Math.round(S.job.pay*0.5)}; S.flags.startup=true; add('You joined at half pay.');
    if(R()<0.22){ const w=ri(200000,2000000); S.money+=w; add(`Years later it exited. You received ${money(w)}.`); } }
  if(ch.careerReset){ S.job=null; add('You walked away from your career.'); }
  if(ch.medical){ const c2=Math.round(3000*country().med*(hasItem('insurance')?0.5:1)); S.money-=c2; add(`Medical bills: ${money(-c2)}.`);
    if(S.conditions.length&&R()<0.5){const k=pick(S.conditions);k.treated=true;add(`Your ${COND(k.id).n.toLowerCase()} is under control.`);} }
  if(ch.rehab){ Object.keys(DATA.habits).forEach(k=>{ if(!DATA.habits[k].good)S.habits[k]=clamp(S.habits[k]-40); }); add('You came out the other side of it.'); }
  if(ch.child){ const c3=addNPC('child',null,0,85); S.childrenCount++; add(`${c3.name} was born.`); applyEff({money:-8000}); }
  if(ch.divorce){ const p=partner(); if(p){ p.rel='ex'; S.counters.divorces++; const loss=Math.round((S.money+S.savings)*0.45); S.money-=loss; S.marriedYears=0; add(`The divorce cost you ${money(loss)}.`); } }
  if(ch.inherit){ const amt=Math.round(DATA.wealthTiers[S.birthTier].money[1]*R()*0.8); S.money+=amt; add(`You inherited ${money(amt)}.`); }
  if(ch.mortgageRoll){
    const def=PROP('flat'), val=propPrice(def);
    if(netWorth()>val*0.1&&(S.job||S.savings>val*0.3)){
      S.properties.push({t:'flat',value:val,mortgage:Math.round(val*0.85),rented:false,cond:ri(60,90),home:true});
      S.money-=Math.round(val*0.15); S.home='onebed';
      add(`Approved. You bought ${def.n.toLowerCase()} worth ${money(val)}.`);
    } else { applyEff({happiness:-8}); add('The bank declined your application.'); }
  }
  if(ch.renovate&&S.properties.length){ const pr=S.properties[0]; pr.value=Math.round(pr.value*ch.renovate); pr.cond=clamp(pr.cond+25); add(`Your home is now worth ${money(pr.value)}.`); }
  if(ch.propSell&&S.properties.length){ const pr=S.properties[0]; const net=pr.value-pr.mortgage; S.money+=net; ledger('earn','Property sale',Math.max(0,net)); add(`You sold the property for ${money(net)} net.`); S.properties.shift(); if(!S.properties.length)S.home='room'; }
  if(ch.remortgage&&S.properties.length){ const pr=S.properties[0]; const a=Math.round(pr.value*0.2); pr.mortgage+=a; S.savings+=a; add(`You released ${money(a)} into savings.`); }
  if(ch.sellBiz&&S.businesses.length){ const b=S.businesses[0]; const v=Math.round(b.value*(1.2+R())); S.money+=v; S.businesses.shift(); S.flags.owns_business=S.businesses.length>0; add(`You sold the business for ${money(v)}.`); }
  if(ch.cryptoSell!=null){ const u=S.crypto.units*ch.cryptoSell, v=Math.round(u*S.crypto.price); S.crypto.units-=u; S.money+=v; S.counters.cryptoProfit+=v; if(S.crypto.units<=0.0001)S.flags.holds_crypto=false; add(`Sold for ${money(v)}.`); }
  if(ch.cryptoBuy){ const sp=Math.round(S.money*ch.cryptoBuy); if(sp>0){S.money-=sp;S.crypto.units+=sp/S.crypto.price;S.counters.cryptoProfit-=sp;add(`Bought ${money(sp)} more.`);} }
  if(ch.auditRoll){ if(R()<0.45){applyEff({money:-30000,reputation:-10});add('They found it. Penalties and a public record.');} else add('You got away with it.'); }
  if(ch.courtRoll){ add(openCase(ch.courtRoll===true?'fraud':ch.courtRoll, ri(1,4))); }
  if(ch.fraudRoll){ if(R()<0.6)add('The bank refunded you eventually.'); else {applyEff({money:-7000});add('The bank refused.');} }
  if(ch.scamLoss){ const l=Math.min(S.money+S.savings,ri(3000,40000)); S.money-=l; add(`They took ${money(l)}.`); applyEff({happiness:-14}); }
  if(ch.exRisk){ if(partner()&&R()<0.5){applyEff({rel:{partner:-25}});S.flags.cheated=true;add('Your partner found out.');} else add('You talked for hours. Nothing came of it.'); }
  if(ch.fameRoll){ const v=R()<0.2?ri(80000,600000):ri(200,9000); S.followers+=v; add(`You gained ${v.toLocaleString()} followers.`); }
  if(ch.politicsRoll){ if(R()<0.35+S.skills.charisma/250){ const j=DATA.jobs.find(x=>x.id==='councillor'); setJob(j); add('You were elected.'); } else { applyEff({money:-8000,happiness:-10}); add('You lost the election.'); } }
  if(ch.emigrate){ const nc=pick(DATA.countries.filter(x=>x.id!==S.country)); S.country=nc.id; if(!S.countriesLived.includes(nc.id))S.countriesLived.push(nc.id); S.city=cityFor(nc.reg); META.countriesPlayed[nc.id]=true; saveMeta(); S.flags.emigrated=true; add(`You moved to ${nc.name}.`); }
  if(ch.retire){ S.job=null; S.flags.retired=true; add('You retired.'); }
  if(ch.widow){ const p=partner(); if(p)p.alive=false; S.flags.widowed=true; }
  if(ch.donate){ S.donated+=Math.max(0,netWorth()); }
  if(ch.removeItem){ const i=S.items.findIndex(x=>{const it=DATA.items.find(d=>d.id===x);return it&&it.tag===ch.removeItem;}); if(i>=0)S.items.splice(i,1); }

  /* A decision should still be felt decades later. Big choices leave a mark. */
  S.echoes=S.echoes||[];
  const bigNeg=(ch.e&&(ch.e.happiness<=-12||ch.e.health<=-14));
  const bigPos=(ch.e&&(ch.e.reputation>=8||ch.e.happiness>=16));
  const bigSkill=(ch.e&&ch.e.skill&&Object.values(ch.e.skill).some(v=>v>=10));
  const echoRoom = S.echoes.length < 2;
  if(echoRoom&&bigNeg&&R()<0.30&&!S.echoes.some(e=>e.id==='scarred')){
    S.echoes.push({id:'scarred',n:'Marked by it',age:S.age,yr:{happiness:-1.6,health:-0.3}});
    add('Something in you has changed.');
  }
  if(echoRoom&&S.echoes.length<2&&bigPos&&R()<0.26&&!S.echoes.some(e=>e.id==='steadied')){
    S.echoes.push({id:'steadied',n:'Steadied',age:S.age,yr:{happiness:1.2,reputation:0.6}});
    add('You will carry this with you.');
  }
  if(echoRoom&&S.echoes.length<2&&bigSkill&&R()<0.26&&!S.echoes.some(e=>e.id==='driven')){
    S.echoes.push({id:'driven',n:'Driven',age:S.age,yr:{discipline:1.0,smarts:0.4}});
    add('You have found something you are serious about.');
  }
  if(S.echoes.length>2)S.echoes.shift();

  /* The path you take pulls the rest of the game toward it. Two players who
     answer the same event differently should drift into different lives.    */
  const steer=(theme,push)=>{
    if(!S.lean)return;
    if(push){ if(S.lean.indexOf(theme)<0)S.lean.push(theme);
              const i=S.away?S.away.indexOf(theme):-1; if(i>=0)S.away.splice(i,1); }
    if(S.lean.length>6)S.lean.shift();
  };
  if(ch.crimeRoll||ch.arrestRisk)steer('x',true);
  if(ch.collegeRoll||ch.setEdu||ch.gradeBoost)steer('s',true);
  if(ch.child||ch.romance!=null)steer('r',true);
  if(ch.startup||ch.expand||ch.takeJob||ch.promoRoll)steer('w',true);
  if(ch.condition||ch.conditionRisk||ch.medical||ch.treatOne)steer('h',true);
  if(ch.fameRoll)steer('f',true);
  if(ch.cryptoBuy!=null||ch.mortgageRoll||ch.debtAdd)steer('m',true);

  clampMinorMoney(); settleState();
  const all=lines.concat(extra);
  logLine(`${ev.t}: ${ch.l}`);
  if(all.length)push({type:'C',title:tok(ev.t),text:ch.l,res:all});
  checkAch(); drain();
}

/* ---------------- jobs ---------------- */
function setJob(j){
  S.perf=60;
  const ut=UNI_TIERS.find(t=>t.id===S.uniTier);
  const degMatch=(()=>{ const d=DEGREE(S.degreeDone); return d&&d.fields.indexOf(j.field)>=0?1.12:1; })();
  S.employer=companyFor(j.field,country().reg);
  S.boss=nameFor(country().reg,pick(['m','f']))+' '+surFor(country().reg);
  S.job={id:j.id,t:j.t,pay:Math.round(j.pay*country().sal*(ut&&j.edu>=3?ut.sal:1)*(S.credsLost?0.6:1)*degMatch),field:j.field,lvl:jobLvl(j),emp:S.employer}; S.jobYears=0; S.jobsHeld++;
  /* a working life, not just a count of jobs: the obituary needs to know
     what someone actually did for thirty years */
  S.career=S.career||[]; S.career.push({t:j.t,field:j.field,from:S.age,emp:S.employer}); S.careerLvl=Math.max(S.careerLvl==null?-1:S.careerLvl,jobLvl(j)); }
/* How far above your proven level you may reach. Time served is one route in;
   being demonstrably good at the thing is another. */
function reachAllowance(j){
  let allow = maxLvl() + 1 + (S.edu>=3?1:0) + (S.edu>=4?1:0);
  const reqs = Object.keys(j.req||{});
  if(reqs.length){
    const margins = reqs.map(k=>{
      const v = DATA.statKeys.includes(k)?S.stats[k]:(S.skills[k]||0);
      return v - j.req[k];
    });
    const worst = Math.min.apply(null, margins);
    if(worst >= 25) allow += 2;
    else if(worst >= 10) allow += 1;
  }
  const deg = DEGREE(S.degreeDone);
  if(deg && deg.fields.indexOf(j.field)>=0) allow += 1;
  if(S.job && S.job.field===j.field) allow += 1;
  return allow;
}
function jobEligible(j){
  if(S.jailLeft>0)return false;
  if(S.age<14)return false;
  if((S.banned||[]).some(b=>b.field===j.field&&(b.until==null||S.age<b.until)))return false;
  if(recordBlocks(S,j.field))return false;
  if(S.disabled&&['trade','security','sport'].includes(j.field))return false;
  if(S.edu<j.edu)return false;
  for(const k in j.req){ const v=DATA.statKeys.includes(k)?S.stats[k]:S.skills[k]; if(v<j.req[k])return false; }
  return jobLvl(j)<=reachAllowance(j);
}
function jobLocked(j){
  if(S.jailLeft>0)return 'You are in prison';
  if(S.age<14)return 'You are too young to work';
  const ban=(S.banned||[]).find(b=>b.field===j.field&&(b.until==null||S.age<b.until));
  if(ban)return ban.why;
  if(S.age<16&&j.pay>20000)return 'Full-time work starts at 16';
  const bar=recordBlocks(S,j.field);
  if(bar)return bar;
  if(S.disabled&&['trade','security','sport'].includes(j.field))return 'Not possible with your disability';
  if(S.edu<j.edu)return 'Needs '+DATA.eduNames[j.edu];
  for(const k in j.req){ const v=DATA.statKeys.includes(k)?S.stats[k]:S.skills[k];
    if(v<j.req[k])return 'Needs '+(DATA.statNames[k]||DATA.skills[k].name)+' '+j.req[k]; }
  if(jobLvl(j)>reachAllowance(j)){
    const reqs=Object.keys(j.req||{});
    if(reqs.length){
      const k=reqs[0];
      const nm=DATA.statNames[k]||(DATA.skills[k]&&DATA.skills[k].name)||k;
      return `Needs more experience, or ${nm} well above ${j.req[k]}`;
    }
    return 'Needs more experience';
  }
  return null;
}
function applyJob(j){
  if(S.age<14)return popupOK('Too young',`You are ${S.age}. Nobody will employ you yet.`);
  if(S.jailLeft>0)return popupOK('You are in prison',`You cannot take a job for another ${S.jailLeft} year${S.jailLeft>1?'s':''}.`);
  let ch=0.45+S.skills.charisma/300+S.stats.reputation/400+(hasItem('suit')?0.10:0)+newsMod('jobs')*0.3;
  if(S.yearsJailed>0)ch-=0.2;
  if(S.traits.includes('ambitious'))ch+=0.1;
  if(S.flags.placement)ch+=0.12;
  { const deg=DEGREE(S.degreeDone);
    if(deg&&deg.fields.indexOf(j.field)>=0)ch+=0.18; }
  if(hasEcho('driven'))ch+=0.12;
  if(hasEcho('scarred'))ch-=0.10;
  ch*=M('jobOdds');
  if(R()<ch){ setJob(j); logLine(`You were hired as ${j.t} at ${S.employer}.`,'good'); return popupOK('Hired',`${S.employer} has taken you on as ${j.t} on ${money(S.job.pay)} per year.\nYour manager is ${S.boss}.`); }
  S.stats.happiness=clamp(S.stats.happiness-3);
  return popupOK('Rejected','They went with another candidate.');
}
function tryPromote(ret){
  const out=[];
  if(!S.job){ out.push('You have no job.'); if(ret)return out; popupOK('No job',out[0]); return out; }
  const cur=DATA.jobs.findIndex(j=>j.id===S.job.id);
  const next=DATA.jobs.slice(cur+1).find(j=>j.field===S.job.field&&jobEligible(j)&&jobLvl(j)<=(S.job.lvl||0)+1);
  let ch=0.30+S.jobYears*0.06+S.skills.business/300+S.skills.charisma/300+perfBand(S.perf==null?60:S.perf).promo-workPenalty()*0.3;
  if(S.flags.promo_blocked)ch-=0.2;
  if(S.flags.promo_boost)ch+=0.15;
  if(hasEcho('driven'))ch+=0.14;
  if(hasEcho('scarred'))ch-=0.10;
  if(S.traits.includes('ambitious'))ch+=0.12;
  ch*=M('promoOdds');
  if(R()<ch&&next){ setJob(next); S.counters.promotions++; cue('promote','medium'); out.push(`Promoted to ${next.t} on ${money(S.job.pay)}.`); S.stats.happiness=clamp(S.stats.happiness+8); }
  else if(R()<0.15){ S.job.pay=Math.round(S.job.pay*1.05); out.push(`No promotion, but a 5% raise: ${money(S.job.pay)}.`); }
  else { out.push('You were passed over.'); S.stats.happiness=clamp(S.stats.happiness-4); }
  if(ret)return out;
  popupOK('Promotion',out.join('\n')); return out;
}

/* ---------------- crime ---------------- */
function doCrime(id,ret){
  const cr=DATA.crimes.find(c=>c.id===id), out=[];
  if(S.age<cr.minAge){ const m=[`You are only ${S.age}.`]; if(ret)return m; popupOK('Too young',m[0]); return m; }
  S.crimesCommitted++;
  let p=cr.base+(S.skills[cr.skill]||0)/250+LUCK();
  if(id==='burglary'&&hasItem('lockpick'))p+=0.15;
  if(id==='fraud'&&hasItem('hacktool'))p+=0.20;
  if(id==='cyber'&&hasItem('hacktool'))p+=0.20;
  if(id==='heist'&&hasItem('gun'))p+=0.12;
  if(hasItem('burner'))p+=0.05;
  if(hasItem('mask'))p+=0.05;
  if(hasItem('getaway'))p+=0.20;
  if(S.traits.includes('reckless'))p-=0.05;
  p-=newsMod('crimerisk');
  p-=(country().crime-1)*0.06;   // riskier countries = more policing pressure & competition
  p*=M('crimeOdds');
  p=Math.max(0.03,Math.min(0.95,p));
  if(R()<p){
    const take=ri(cr.take[0],cr.take[1]);
    S.money+=take; S.stats.happiness=clamp(S.stats.happiness+4);
    if(id==='heist'||id==='artheist')S.counters.heistWins++;
    out.push(take>0?`Success. You got away with ${money(take)}.`:'You got away with it.');
    logLine(`${cr.n}: got away with ${money(take)}.`);
  } else {
    let sent=Math.round(ri(cr.sentence[0],cr.sentence[1])*M('prison')*(S.parole>0?1.8:1));
    if(hasItem('lawyer'))sent=Math.max(0,Math.round(sent*0.4));
    if(hasItem('fakeid')&&R()<0.4)out.push('Caught, but your fake ID got you released.');
    else if(sent===0){ S.money-=ri(200,2000); S.stats.reputation=clamp(S.stats.reputation-6);
      S.record.push({crime:cr.n,age:S.age,sev:1,spent:false});
      out.push('Caught. Fined and released with a caution. It goes on your record.');
      logLine(`${cr.n}: cautioned.`,'bad'); }
    else{
      /* anything that carries a real sentence goes through a court, where the
         decisions are yours. courtFinish() applies whatever comes out. */
      out.push(openCase(cr.id,sent));
    }
    if(sent===0||hasItem('fakeid'))logLine(`${cr.n}: caught.`,'bad');
  }
  clampMinorMoney(); settleState();
  checkAch(); checkGoals();
  if(ret)return out;
  popupOK(cr.n,out.join('\n')); return out;
}

/* ---------------- achievements / challenges / records ---------------- */
let PENDING_ACH=[];
function checkAch(silent){
  if(!S)return;
  const C=S.counters||{};
  ACHIEVEMENTS.forEach(a=>{
    if(META.ach[a.id])return;
    if(a.atDeath&&S.alive)return;            // "die with..." must not fire at birth
    if(a.meta!==true&&S.age<1&&!a.atDeath)return;   // nothing is earned before you can act
    let ok=false; try{ok=!!a.f(S,C);}catch(e){ok=false; softFail('achievement:'+a.id,e);}
    if(ok){
      if(a.hard&&diffRank()<2) return;             // Hard+ only
      const pts=Math.round(a.p*lpMult()*(isPlus()?1.1:1));
      META.ach[a.id]={life:META.lives,age:S.age,diff:S.diff};
      META.lp+=pts;
      S.achThisLife=S.achThisLife||[]; S.achThisLife.push(a.id);
      logLine(`Achievement: ${a.n} (+${pts} LP)`,'good');
      if(!silent)PENDING_ACH.push(Object.assign({},a,{pts})); }
  });
  CHALLENGES.forEach(c=>{
    if(META.done[c.id])return;
    if(c.atDeath&&S.alive)return;
    let v=0; try{v=c.prog(S);}catch(e){ softFail('challenge.prog:'+c.id,e); }
    if(v>=c.goal){ const pts=Math.round(c.p*lpMult()); META.done[c.id]=true; META.lp+=pts; logLine(`Challenge complete: ${c.n} (+${pts} LP)`,'good'); }
  });
  saveMeta();
  if(!silent&&PENDING_ACH.length){ const l=PENDING_ACH.slice(); PENDING_ACH=[]; l.forEach(a=>push({type:'ACH',ach:a})); }
}
function checkGoals(){
  if(!S||!S.goals)return;
  S.goals.forEach(g=>{
    if(g.done)return;
    const def=GOAL_POOL.find(x=>x.id===g.id); if(!def)return;
    let ok=false; try{ ok=!!def.test(S); }catch(e){ softFail('challenge.test:'+(def&&def.id),e); }
    if(ok){ g.done=true; const lp=Math.round(def.lp*lpMult());
      META.lp+=lp; saveMeta();
      logLine(`Goal met: ${def.n} (+${lp} LP)`,'good');
      push({type:'GOAL',n:def.n,lp:lp});
    }
  });
}
function checkChallenges(){ checkAch(); }
function finalChallenges(){
  checkAch(true);
  RECORDS.forEach(r=>{ let v=0; try{v=r.get(S);}catch(e){ softFail('record:'+r.id,e); } if(META.rec[r.id]==null||v>META.rec[r.id])META.rec[r.id]=v; });
  saveMeta();
}
function chProgress(c){ if(!S)return 0; let v=0; try{v=c.prog(S);}catch(e){ softFail('challenge.prog:'+c.id,e); } return Math.min(1,v/c.goal); }

/* ---------------- death ---------------- */
function showDeath(){
  cue('death','death');
  finalChallenges();
  /* RARE: died at the same age a parent died */
  const par=S.npcs.filter(n=>(n.rel==='mother'||n.rel==='father')&&!n.alive);
  if(par.some(n=>n.age===S.age)&&!hasEgg('echo'))findEgg('echo');
  /* MYTH: three generations at the same age */
  META.deathAges.push(S.age); if(META.deathAges.length>12)META.deathAges.shift(); saveMeta();
  const d=META.deathAges;
  if(d.length>=3&&d[d.length-1]===d[d.length-2]&&d[d.length-2]===d[d.length-3]&&!hasEgg('curse'))
    findEgg('curse');
  /* RARE: a child with your exact name */
  if(anyOf('child').some(k=>k.name===S.name)&&!hasEgg('samename'))findEgg('samename');
  if(!isPlus()&&META.lives>3){
    META.adsSeen++; saveMeta();
    push({type:'AD'}); drain();
  }
  DEATH_STATS=false;
  /* settle the estate exactly once: renderDeath() runs again on every toggle
     and an estate that reshuffled itself as you read would be a lie */
  SETTLEMENT=settleEstate(S,netWorth());
  renderDeath();
}
function toggleDeathStats(){ DEATH_STATS=!DEATH_STATS; renderDeath(); }
/* The obituary is the screen. The numbers are still all here, behind one
   tap, because some people do want the spreadsheet - just not first. */
function renderDeath(){
  const worth=netWorth();
  const st=SETTLEMENT||(SETTLEMENT=settleEstate(S,worth));
  const o=eulogy(S,worth,st);
  const earned=DATA.ribs.filter(r=>{try{return r.f(S);}catch(e){ softFail('ribbon:'+r.id,e); return false;}});
  const lp=(S.achThisLife||[]).reduce((n,id)=>{const a=ACHIEVEMENTS.find(x=>x.id===id);return n+(a?a.p:0);},0);
  const moments=S.log.filter(l=>l.k==='good'||l.k==='bad').slice(-6);
  const el=document.getElementById('modal'); el.className='modal show';
  el.innerHTML=`<div class="sheet death">
    <div class="obit">
      <div class="obitrule"></div>
      <div class="dh">${esc(o.name)}</div>
      <div class="dsub">${esc(o.strap)}</div>
      <div class="obitrule"></div>
      <div class="obitbody">
        <p>${o.life.map(esc).join(' ')}</p>
        ${o.people.length?`<p>${o.people.map(esc).join(' ')}</p>`:''}
        ${o.estate.length?`<p>${o.estate.map(esc).join(' ')}</p>`:''}
        <p class="obitclose">${esc(o.close)}</p>
      </div>
    </div>

    ${moments.length?`<div class="sec">The years that turned it</div>
      <div class="moments">${moments.map(l=>
        `<div class="mline ${l.k}"><b>${l.a}</b> ${esc(l.t)}</div>`).join('')}</div>`:''}

    ${earned.length?`<div class="sec">Remembered as</div>
      <div class="awards">${earned.map(r=>`<span class="award">${esc(r.n)}</span>`).join('')}</div>`:''}

    ${(S.eggsThisLife&&S.eggsThisLife.length)?`<div class="sec">Found</div>
      <div class="awards">${S.eggsThisLife.map(id=>{const e=EGG(id);
        return e?`<span class="award egg">${esc(EGG_EPITAPHS[id]||e.n)}</span>`:'';}).join('')}</div>`:''}

    ${willDeathBlock(st)}

    <div class="lpline">+${lp} Legacy Points this life \u00b7 ${META.lp} total</div>

    <button class="statstoggle" onclick="toggleDeathStats()">
      ${DEATH_STATS?'\u25BE Hide the numbers':'\u25B8 The numbers'}</button>
    ${DEATH_STATS?`<div class="grid2">
      ${[['Years lived',S.age],['Peak net worth',money(S.peakNet)],['Peak income',money(S.peakIncome)],
         ['Final net worth',money(worth)],['Jobs held',S.jobsHeld],['Children',S.childrenCount],
         ['Crimes',S.crimesCommitted],['Years jailed',S.yearsJailed],['Countries lived in',(S.countriesLived||[]).length],
         ['Education',DATA.eduNames[S.edu]],
         ['Special path',S.track?(TRACK(S.track.id).n+': '+TRACK_RANK(S.track).n):'\u2014'],
         ['Difficulty',diffDef(S.diff).n+(S.assisted?' (assisted)':'')],
         ['Legacy Point rate','\u00d7'+lpMult().toFixed(2)]].map(([k,v])=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}
      </div>
      <div class="sec">Achievements this life</div>
      <div class="awards">${(S.achThisLife&&S.achThisLife.length)?S.achThisLife.map(id=>{const a=ACHIEVEMENTS.find(x=>x.id===id);return a?`<span class="award t${a.t}">${esc(a.n)}</span>`:'';}).join(''):'<span class="muted">None unlocked this life.</span>'}</div>`:''}

    ${(()=>{
      const pool=anyOf('child').length?anyOf('child'):anyOf('sibling');
      if(!pool.length)return '';
      return `<div class="sec">Carry on as</div>
        <div class="heirs">${pool.map(n=>{
          const g=settlementFor(n.id,st)||{cash:0,assets:[],heirloom:false};
          const things=g.assets.map(x=>x.name.toLowerCase()).concat(g.heirloom?['the heirloom']:[]);
          return `<button class="heir${S.will&&S.will.main===n.id?' main':''}" onclick="continueAs('${n.id}')">
            <div class="rn">${esc(n.name.split(' ')[0])}<span class="hage"> \u00b7 ${n.rel}</span></div>
            <div class="hsub dim">${g.cash>0?money(g.cash):'nothing'}${things.length?' + '+esc(things.join(', ')):''}</div>
          </button>`;}).join('')}</div>`;
    })()}
    <div class="row">
      ${(!S.usedSecondChance)?`<button class="btn" onclick="secondChance()">
        ${isPlus()?'Second Chance':'Watch an ad for a Second Chance'}</button>`:''}
      <button class="btn" onclick="toTitle()">New life</button>
    </div></div>`;
}

function secondChance(){
  if(S.usedSecondChance)return;
  S.usedSecondChance=true; S.alive=true; S.cause=null;
  S.stats.health=Math.max(35,S.stats.health);
  S.conditions.forEach(k=>{ k.treated=true; });
  logLine('You came back from the brink.','good');
  document.getElementById('modal').className='modal';
  save(); renderAll();
  popupOK('You pulled through',`Whatever it was, it was not the end. You are ${S.age} and still here.`);
}
/* The hand-off. Takes an npc id, or 'child'/'sibling' for the old call shape.
   Everything the heir is owed has to be read out of the old save before
   newGame() overwrites it. */
function continueAs(which){
  const st = SETTLEMENT || settleEstate(S,netWorth());
  let heir = (S.npcs||[]).find(n=>n.id===which&&n.alive);
  if(!heir){
    const pool = anyOf(which==='sibling'?'sibling':'child');
    heir = (S.will&&S.will.main&&pool.find(n=>n.id===S.will.main)) || pool[0];
  }
  if(!heir) return;

  const got  = settlementFor(heir.id,st) || {cash:0,assets:[],heirloom:false};
  const perk = (META.perks&&META.perks.inheritance)?1.15:1;
  const cash = Math.max(0,Math.round(got.cash*perk));
  /* deep copy: these objects still belong to the save we are about to drop */
  const things = got.assets.map(a=>({kind:a.kind,name:a.name,obj:JSON.parse(JSON.stringify(a.ref))}));
  const loom = got.heirloom&&S.heirloom ? JSON.parse(JSON.stringify(S.heirloom)) : null;
  const gen=S.gen+1, sur=S.surname, cty=S.country, from=S.name, fromGen=S.gen;

  newGame({gender:heir.gender,country:cty,name:heir.name});
  S.gen=gen; S.surname=sur; S.money=cash; S.flags.heir=true;

  if(cash>0)logLine(`You inherited ${money(cash)} from ${from}.`,'good');
  else if(st.intestate)logLine(`${from} died without a will.`,'bad');

  things.forEach(t=>{
    delete t.obj.uid;
    if(t.kind==='prop'){
      /* a baby cannot live in it, so it is held and let until they can */
      t.obj.home=false; t.obj.rented=true;
      S.properties.push(t.obj);
      logLine(`${t.name} came to you. It is let out until you are old enough.`,'good');
    } else if(t.kind==='veh'){
      S.vehicles.push(t.obj);
      logLine(`${t.name} was put away for you.`,'good');
    } else if(t.kind==='biz'){
      S.businesses.push(t.obj);
      S.flags.owns_business=true; S.counters.businesses++;
      logLine(`${t.name} is yours, run by someone else until you can.`,'good');
    }
  });

  if(loom){
    /* the deceased is written into it on the way past, then the new holder */
    loom.gens = (loom.gens||[]);
    if(!loom.gens.some(g=>g.gen===fromGen)) loom.gens.push({gen:fromGen,name:from});
    loom.gens.push({gen:gen,name:S.name});
    if(loom.gens.length>12) loom.gens=loom.gens.slice(-12);
    S.heirloom = loom;
    logLine(`You were left ${loom.name}. ${heirloomLine(loom)}`,'good');
  } else {
    S.heirloom = null;   /* newGame may have rolled one; an heir does not get both */
  }

  document.getElementById('modal').className='modal';
  SETTLEMENT=null;
  renderAll(); save();
}
function toTitle(){ document.getElementById('modal').className='modal'; document.getElementById('app').dataset.screen='title'; renderTitle(); }

/* ---------------- popups ---------------- */
function popupOK(t,x,res){
  /* if an action is running, show exactly what it changed */
  const lines = res || (EFF_LOG&&EFF_LOG.length ? EFF_LOG.slice() : []);
  if(EFF_LOG)EFF_LOG.length=0;
  push({type:'C',title:t,text:x,res:lines}); drain();
}
function confirmDo(t,x,fn){ push({type:'D',title:t,text:x,yes:fn}); drain(); }
/* One sound per popup, chosen from what the popup actually is. Results
   read their own effect chips: a year that cost you something should not
   sound like a year that paid. */
function popupCue(p){
  if(p.type==='A')        return sfx('event');
  if(p.type==='ACH')      return cue('ach','medium');
  if(p.type==='EGG')      return cue('egg','medium');
  if(p.type==='D'||p.type==='CHOOSE'||p.type==='YEAR') return sfx('open');
  if(p.type==='B'||p.type==='YEAR') return;       // the year cue already played
  const res=p.res||[];
  const neg=res.filter(r=>/^-|\s-/.test(r)).length, pos=res.length-neg;
  if(res.length&&neg>pos)  return cue('bad','medium');
  if(res.length&&pos)      return sfx('good');
  return sfx('open');
}
function showPopup(p){
  const el=document.getElementById('modal'); el.className='modal show';
  notePopup(p); popupCue(p);
  const label = p.title || (p.ev&&p.ev.t) || (p.type==='COURT'?'Court':'Message');
  if(p.type==='A'){
    const ev=p.ev;
    if(p.cast)CAST=p.cast;   /* title, labels and outcome all read the same cast */
    el.innerHTML=`<div class="sheet">
      <div class="phead"><span class="ptag">Event</span><button class="dicebtn" title="Let fate decide" onclick="fateChoice('${ev.id}')">${DICE}</button></div>
      <div class="ph">${esc(tok(ev.t))}</div>
      <div class="pb">${esc(p.text||variant(ev.x))}</div>
      <div class="choices">${ev.c.map((c,i)=>`<button class="choice" onclick="pickChoice('${ev.id}',${i})"><span>${esc(tok(c.l))}</span><i>›</i></button>`).join('')}</div>
    </div>`;
  } else if(p.type==='D'){
    CONFIRM=p;
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Decision</span></div>
      <div class="ph">${esc(p.title)}</div><div class="pb">${esc(p.text)}</div>
      <div class="choices"><button class="choice ok" onclick="cdo(1)"><span>Confirm</span><i>›</i></button>
      <button class="choice" onclick="cdo(0)"><span>Cancel</span><i>›</i></button></div></div>`;
  } else if(p.type==='EGG'){
    const e=p.egg;
    el.innerHTML=`<div class="sheet eggsheet t-${e.tier}">
      <div class="phead"><span class="ptag">${p.first?'You found something':'Found again'}</span></div>
      <div class="ph">${esc(e.n)}</div>
      ${p.extra?`<div class="eggtext">${esc(p.extra)}</div>`:''}
      <div class="pb">${esc(e.d)}</div>
      ${EGG_UNLOCKS[e.id]&&p.first?`<div class="achmeta">Unlocked: ${esc(EGG_UNLOCKS[e.id].name)} \u2014 ${esc(EGG_UNLOCKS[e.id].desc)}</div>`:''}
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>\u2026</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='CAPSULE'){
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Eighteen</span></div>
      <div class="ph">A Letter To Yourself</div>
      <div class="pb">Your school asks every leaver to write one line to be opened at fifty.
        What do you put?</div>
      <div class="choices">${[
        ['rich','"I hope you are rich."'],['loved','"I hope somebody loves you."'],
        ['known','"I hope they know your name."'],['ok','"I hope you are alright."'],
        ['nothing','Leave the page blank.']].map(([k,t])=>
        `<button class="choice" onclick="setCapsule('${k}')"><span>${esc(t)}</span><i>\u203a</i></button>`).join('')}</div></div>`;
  } else if(p.type==='CAPSULE_OPEN'){
    const c=S.capsule, nw=netWorth(), loved=S.npcs.filter(n=>n.alive&&n.r>70).length;
    const verdict = c==='rich' ? (nw>500000?'You were right to hope. You are.':'You are not rich.')
      : c==='loved' ? (loved>0?`${loved} ${loved===1?'person does':'people do'}.`:'Nobody does, at the moment.')
      : c==='known' ? (S.followers>50000||S.stats.reputation>80?'They do.':'They do not.')
      : c==='ok'   ? (S.stats.happiness>55?'You are, more or less.':'You are not, particularly.')
      : 'You left it blank. At fifty, that reads as either wisdom or cowardice.';
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Fifty</span></div>
      <div class="ph">The Letter</div>
      <div class="eggtext">${esc(c==='nothing'?'[the page is empty]':
        {rich:'"I hope you are rich."',loved:'"I hope somebody loves you."',
         known:'"I hope they know your name."',ok:'"I hope you are alright."'}[c])}</div>
      <div class="pb">${esc(verdict)}</div>
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Put it away</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='YEAR'){
    /* sort the year's news into things that mean different kinds of thing */
    const order=['Money','Work','Health','People','World','Other'];
    const buckets={ Money:[], Health:[], People:[], Work:[], World:[], Other:[] };
    const known=S.npcs.map(x=>x.name).concat(S.npcs.map(x=>x.name.split(' ')[0]));
    (p.notes||[]).forEach(n=>{
      if(/Herald|Times|Daily|NEWS/i.test(n)) buckets.World.push(n);
      else if(/review|promot|dismiss|sacked|pay rise|raise|risen to|retired|job as|standing at work|commendation|deployed/i.test(n)) buckets.Work.push(n);
      else if(/diagnos|condition|recover|injur|disabled|worsened|screening|health|unwell|died at \d+\.$/i.test(n)&&!known.some(k=>n.indexOf(k)===0)) buckets.Health.push(n);
      else if(known.some(k=>k&&n.indexOf(k)===0)||/your (mother|father|sibling|child|partner|friend)/i.test(n)) buckets.People.push(n);
      else if(/\$|cost|paid|earned|debt|pension|allowance|income|sold|bought|rent|mortgage|loan|credit|arrears|bills|profit|losses|upkeep/i.test(n)) buckets.Money.push(n);
      else buckets.Other.push(n);
    });
    const ic={Money:'\u25C6',Health:'\u2665',People:'\u263A',Work:'\u25B2',World:'\u2691',Other:'\u2022'};
    const sections=order.filter(k=>buckets[k].length).map(k=>
      `<div class="ysec"><div class="ylabel">${ic[k]} ${k}</div>
        ${buckets[k].map(n=>`<div class="yline">${esc(n)}</div>`).join('')}</div>`).join('');
    const inc=ledgerTotal('income'), sp=ledgerTotal('spend');
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">${esc(p.sub||'Notice')}</span></div>
      <div class="ph">${esc(p.title)}</div>
      ${p.intro?`<div class="pb">${esc(p.intro)}</div>`:''}
      ${(inc||sp)?`<div class="budgetbar">
        <div><div class="hlbl">In</div><div class="bgood">${money(inc)}</div></div>
        <div><div class="hlbl">Out</div><div class="bbad">${money(sp)}</div></div>
        <div><div class="hlbl">Net</div><div class="${inc-sp>=0?'bgood':'bbad'}">${money(inc-sp)}</div></div>
      </div>`:''}
      <div class="ybody">${sections}</div>
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Continue</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='COURT'){
    el.innerHTML=courtSheet();
  } else if(p.type==='CHOOSE'){
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Choose</span></div>
      <div class="ph">${esc(p.title)}</div>
      <div class="choices">${p.options.map((o,i)=>
        `<button class="choice" onclick="pickFrom(${i})"><span>${esc(o[0])}</span><i>\u203a</i></button>`).join('')}
        <button class="choice" onclick="closePopup()"><span>Not now</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='GOAL'){
    el.innerHTML=`<div class="sheet eggsheet"><div class="phead"><span class="ptag">Goal met</span></div>
      <div class="ph">${esc(p.n)}</div>
      <div class="achmeta">+${p.lp} Legacy Points</div>
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Good</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='PLUS'){
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Bequest Plus</span></div>
      <div class="ph">${esc(p.what||'A Plus feature')}</div>
      <div class="pb">This is part of Bequest Plus. <b>Every event, country, career and challenge
      stays free forever</b> \u2014 Plus only buys convenience.</div>
      <div class="choices"><button class="choice ok" onclick="closePopup();setTab('more');setMore('plus')">
        <span>See what Plus includes</span><i>\u203a</i></button>
        <button class="choice" onclick="closePopup()"><span>Not now</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='AD'){
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">Advertisement</span></div>
      <div class="adbox"><div class="adlabel">AD</div>
      <div class="hsub dim">A short ad would play here between lives.</div></div>
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Continue</span><i>\u203a</i></button>
        <button class="choice" onclick="closePopup();setTab('more');setMore('plus')"><span>Remove ads with Plus</span><i>\u203a</i></button></div></div>`;
  } else if(p.type==='ACH'){
    const a=p.ach;
    el.innerHTML=`<div class="sheet ach-pop"><div class="phead"><span class="ptag">Achievement unlocked</span></div>
      <div class="achbig"><div class="achmedal t${a.t}">${a.t===4?'★':a.t===3?'◆':a.t===2?'▲':'●'}</div>
      <div><div class="ph">${esc(a.n)}</div><div class="pb">${esc(a.d)}</div>
      <div class="achmeta">${TIER_NAMES[a.t]} · +${a.pts!=null?a.pts:a.p} Legacy Points${a.hard?' · Hard+ only':''}</div></div></div>
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Nice</span><i>›</i></button></div></div>`;
  } else {
    const res=(p.res&&p.res.length)?`<div class="reslist">${p.res.map(r=>`<span class="chip ${/-/.test(r)?'neg':'pos'}">${esc(r)}</span>`).join('')}</div>`:'';
    el.innerHTML=`<div class="sheet"><div class="phead"><span class="ptag">${p.type==='B'?(p.sub||'Notice'):'Result'}</span></div>
      <div class="ph">${esc(p.title)}</div><div class="pb">${esc(p.text||'').replace(/\n/g,'<br>')}</div>${res}
      <div class="choices"><button class="choice ok" onclick="closePopup()"><span>Continue</span><i>›</i></button></div></div>`;
  }
  a11yDialogOpen(label);
}

function setCapsule(k){ S.capsule=k; document.getElementById('modal').className='modal'; save(); drain(); }
function pickFrom(i){
  const c=CHOOSER; document.getElementById('modal').className='modal';
  if(c&&c.options[i]){ const o=c.options[i]; c.cb(o[0],o[2]); }
  CHOOSER=null; save(); renderAll();
}
function cdo(y){ const p=CONFIRM; document.getElementById('modal').className='modal'; if(y&&p.yes)p.yes(); if(!y&&p.no)p.no(); drain(); }
function pickChoice(id,i){
  /* deliberately NOT hiding the modal first: the outcome swaps into the
     same open sheet, so choosing and reading what it did is one moment
     rather than a close and a reopen. drain() closes it if there is
     nothing to show. */
  resolveChoice(EVENTS.find(e=>e.id===id),i);
}
function fateChoice(id){ const ev=EVENTS.find(e=>e.id===id); pickChoice(id,Math.floor(R()*ev.c.length)); }
function closePopup(){ document.getElementById('modal').className='modal'; a11yDialogClose(); drain(); }

/* ---------------- ACTIVITIES ---------------- */
function ACTS(){
  const a=S.age, L=[];
  const A=(id,n,grp,d,f)=>L.push({id,n,grp,d:d||'',f});

  A('doctor','Doctor visit','Health','Check-up and treatment',()=>{
    const c=Math.round(900*country().med*(hasItem('insurance')?0.5:1));
    if(!afford(c))return; charge(c);
    const g=ri(4,12); S.stats.health=clamp(S.stats.health+g);
    let t=S.age<18?`Health +${g}. Your parents paid ${money(c)}.`:`Health +${g}. Cost ${money(c)}.`;
    if(S.conditions.length){const k=pick(S.conditions);k.treated=true;t+=` They have put your ${COND(k.id).n.toLowerCase()} under management.`;}
    popupOK('Doctor',t);
  });
  S.conditions.forEach(k=>{
    const c=COND(k.id); if(!c)return;
    const waiting=k.waiting&&S.age<k.waiting;
    const pub=condCost(k,false), priv=condCost(k,true);
    if(!k.treated&&!waiting)
      A('tr_'+c.id,'Treat '+c.n.toLowerCase(),'Health',
        `Untreated \u00b7 severity ${k.sev}/3 \u00b7 ${pub?money(pub):'free'}${healthSystem().wait[1]?', and a wait':''}`,
        ()=>treatJoin(c.id));
    if(waiting)
      A('pv_'+c.id,'Go private for '+c.n.toLowerCase(),'Health',
        `Seen this year instead of ${k.waiting} \u00b7 ${money(priv)}`,()=>treatPrivate(c.id));
    if(!k.specialist)
      A('sp_'+c.id,'See a specialist about '+c.n.toLowerCase(),'Health',
        'Doubles the chance of beating it',()=>seeSpecialist(c.id));
    if(k.treated)
      A('rh_'+c.id,'Rehabilitation for '+c.n.toLowerCase(),'Health',
        `${k.rehab||0} year${(k.rehab||0)===1?'':'s'} done \u00b7 two brings the severity down`,()=>doRehab(c.id));
  });
  if(S.age>=18&&S.living>livingFloor())A('cutback','Live below your means','Money',
    `Costing ${money(S.living)} a year to live \u00b7 cut it back`,()=>{
    const before=S.living;
    /* cutting back is a decision to keep, not a one-year saving that creep
       undoes by the spring */
    S.thrift=Math.min(1, (S.thrift||0)+0.35);
    S.living=Math.max(livingFloor(), Math.round(S.living*0.72));
    applyEff({happiness:-7,discipline:5});
    popupOK('Cutting back',
      `You moved somewhere smaller, or stopped replacing things, or simply stopped.\n\n`
      +`Living on ${money(S.living)} a year instead of ${money(before)}.`);
  });
  if(S.age>=18)A('loan','Apply for a loan','Money',
    `Credit ${Math.round(S.credit==null?600:S.credit)} \u00b7 ${creditBand(S.credit==null?600:S.credit).n}`,()=>{
    const sc=S.credit==null?600:S.credit, b=creditBand(sc);
    const income=S.job?S.job.pay:Math.round(6500*country().col);
    const max=Math.round(income*b.mult);
    if(max<1000)return popupOK('Declined',`With a credit score of ${Math.round(sc)} (${b.n}) no lender will touch you.`);
    confirmDo('Borrow '+money(max)+'?',
      `Your credit score is ${Math.round(sc)} (${b.n}), so the rate is ${Math.round(b.rate*100)}%. You repay over 5 years. Missing payments will wreck your score.`,
      ()=>{ S.loans.push({principal:max,rate:b.rate,left:5,missed:0}); S.money+=max;
        S.credit=Math.max(300,sc-25);
        popupOK('Approved',`${money(max)} paid into your account at ${Math.round(b.rate*100)}%.`); });
  });
  /* ---------- PRISON: your year is not empty in there ---------- */
  if(S.jailLeft>0){
    A('pr_head','Keep your head down','Prison','Serve quietly',()=>{
      applyEff({discipline:6,happiness:-2}); S.paroleCredit=(S.paroleCredit||0)+1;
      popupOK('Another year','You gave nobody a reason to notice you.');});
    A('pr_study','Study inside','Prison','',()=>{
      applyEff({smarts:6,discipline:5}); S.paroleCredit=(S.paroleCredit||0)+1;
      if(R()<0.25&&S.edu<2){S.edu=Math.max(S.edu,2);popupOK('Qualified','You came out with a certificate.');}
      else popupOK('Study','Smarts +6.');});
    A('pr_gym','Train in the yard','Prison','',()=>{
      applyEff({skill:{fitness:9,combat:6},health:2});popupOK('The yard','Fitness +9, Combat +6.');});
    A('pr_crew','Fall in with a crew','Prison','Protection, at a price',()=>{
      applyEff({skill:{combat:10},reputation:-6,happiness:3}); S.flags.prison_crew=true;
      popupOK('A crew','Nobody troubles you now. That will follow you out.');});
    A('pr_parole','Apply for early release','Prison','',()=>{
      const ch=0.15+(S.paroleCredit||0)*0.08+S.stats.reputation/400-(S.flags.prison_crew?0.15:0);
      if(R()<ch){ const cut=Math.min(S.jailLeft,ri(1,3)); S.jailLeft-=cut;
        popupOK('Granted',`Your sentence was cut by ${cut} year${cut>1?'s':''}.`); }
      else popupOK('Refused','The board was not persuaded.');});
    A('pr_contact','Write to someone outside','Prison','',()=>{
      const n=pick(S.npcs.filter(x=>x.alive));
      if(!n)return popupOK('Nobody to write to','There is no one left outside.');
      n.r=clamp(n.r+ri(6,14)); popupOK('A letter',`${n.name} wrote back.`);});
    return L;
  }

  /* ---------- SPECIAL PATHS ---------- */
  if(S.track){
    const def=TRACK(S.track.id), r=TRACK_RANK(S.track);
    const resVal = S.track[def.res];
    def.actions.forEach(act=>{
      A('tr_'+def.id+'_'+act.id, act.n, def.n, act.d||'', ()=>{ act.run(); save(); });
    });
    if(def.id!=='royal')A('tr_leave_'+def.id,'Leave '+def.n.toLowerCase(),def.n,'Walk away for good',()=>{
      confirmDo('Leave?',`Give up your position as ${r.n}?`,()=>{
        const msg=def.leave?def.leave():'You walked away.';
        S.track=null; logLine(`Left ${def.n}.`); popupOK('Out',msg); });
    });
  } else {
    TRACKS.forEach(def=>{
      if(def.id==='royal')return;
      let ok=false; try{ ok=def.canJoin(); }catch(e){}
      if(!ok)return;
      A('join_'+def.id, def.n==='The Forces'?'Enlist':'Get involved with '+def.short.toLowerCase(),
        'Paths', def.blurb, ()=>{
        confirmDo(def.n, def.joinText+'\n\nThis becomes a parallel life with its own ranks and its own risks.',()=>{
          S.track={id:def.id,rank:0,progress:0,heat:0,followers:ri(3,25),standing:50,commend:0,rating:1200,years:0};
          TRACK_RANK(S.track);
          logLine(`You joined ${def.n}.`,'good');
          popupOK(def.n,`You are an ${def.ranks[0].n}.`);
        });
      });
    });
  }

  /* ---------- PETS ---------- */
  if(a>=6){
    A('pet_get','Get a pet','Home','From a shelter or a breeder',()=>{
      const sp=pick(DATA.petSpecies);
      const shelter=R()<0.5;
      const price=shelter?sp.adopt:Math.round(sp.adopt*4);
      confirmDo(`${shelter?'Adopt':'Buy'} a ${sp.n.toLowerCase()}?`,
        `${money(price)} up front, about ${money(sp.cost)} a year to look after.`,()=>{
        if(!afford(price))return; charge(price);
        const np=addPet(sp.id,shelter);
        applyEff({happiness:10});
        popupOK(np.name,`${np.name} the ${sp.n.toLowerCase()} is yours. ${shelter?'From the shelter.':''}`);
      });
    });
  }
  petsAlive().forEach(pt=>{
    const sp=DATA.petSpecies.find(x=>x.id===pt.sp)||DATA.petSpecies[0];
    A('pet_play_'+pt.id,`Spend time with ${pt.name}`,'Home',
      `${sp.n} \u00b7 ${pt.age} years old \u00b7 bond ${Math.round(pt.bond)}${pt.ill?' \u00b7 unwell':''}`,()=>{
      pt.bond=clamp(pt.bond+ri(8,16)); applyEff({happiness:6,health:sp.walk?2:0});
      popupOK(pt.name,`A good afternoon. Bond ${Math.round(pt.bond)}.`);});
    if(pt.ill)A('pet_vet_'+pt.id,`Take ${pt.name} to the vet`,'Home',money(Math.round(sp.cost*1.5)),()=>{
      const c=Math.round(sp.cost*1.5); if(!afford(c))return; charge(c);
      if(R()<0.7){ pt.ill=false; pt.lifespan+=ri(1,3); popupOK(pt.name,`${pt.name} is going to be alright.`); }
      else popupOK(pt.name,`There was nothing to be done. ${pt.name} has a while yet, but not long.`);});
  });

  /* ---------- IDENTITY ---------- */
  if(a>=12){
    A('id_reflect','Think about who you are','Self',
      `Currently ${DATA.orientations.find(o=>o.id===S.orientation).n.toLowerCase()}`,()=>{
      if(R()<0.25){
        const o=pick(DATA.orientations.filter(x=>x.id!==S.orientation&&!(x.id==='lesbian'&&S.gender==='m')&&!(x.id==='gay'&&S.gender==='f')));
        S.orientation=o.id; S.outTo=false;
        applyEff({happiness:6,discipline:3});
        popupOK('Something settled',`You understand yourself a little better. You are ${o.n.toLowerCase()}.`);
      } else { applyEff({happiness:4,smarts:2}); popupOK('Thinking','Nothing changed, but you feel clearer.'); }
    });
    if(S.orientation!=='straight'&&!S.outTo)
      A('id_out','Come out','Self','Tell the people around you',()=>{
        S.outTo=true;
        const warm=R()<0.55+S.stats.reputation/400;
        if(warm){ applyEff({happiness:18,rel:{all:8},discipline:5});
          popupOK('Said out loud','It went better than you had let yourself hope.'); }
        else { applyEff({happiness:-10,rel:{parents:-14},reputation:-4});
          popupOK('Said out loud','Some of them took it badly. You said it anyway.'); }
      });
    A('id_name','Change your name','Self','$300',()=>{
      if(!afford(300))return; charge(300);
      const reg=country().reg, g2=pick(['m','f']);
      const nn=nameFor(reg,g2)+' '+S.surname;
      confirmDo('Change your name?',`You would become ${nn}.`,()=>{
        logLine(`You changed your name from ${S.name} to ${nn}.`);
        S.name=nn; applyEff({happiness:6}); popupOK('Done',`You are ${nn} now.`); });
    });
    A('volunteer','Volunteer','Self','Give your time',()=>{
      applyEff({reputation:7,happiness:7,skill:{charisma:4}});
      if(R()<0.25){const f=addNPC('friend',null,S.age+ri(-15,15));popupOK('Volunteering',`Good work, and you met ${f.name}.`);}
      else popupOK('Volunteering','Reputation +7, Happiness +7.');});
  }

  /* ---------- ADOPTION AND FERTILITY ---------- */
  if(a>=25&&a<=60){
    A('adopt','Adopt a child','Family','A long process, and not certain',()=>{
      const fee=Math.round(12000*country().col);
      confirmDo('Begin adoption?',
        `Assessment, waiting and roughly ${money(fee)} in costs. Being settled and in work helps.`,()=>{
        if(!afford(fee))return; charge(fee);
        let ch=0.35+(partner()?0.2:0)+(S.job?0.15:0)+S.stats.reputation/400
               -(S.record.some(r=>!r.spent)?0.35:0)-(S.stats.health<40?0.1:0);
        if(R()<ch){
          const kid=addNPC('child',null,ri(0,9),ri(45,70));
          kid.adopted=true; S.childrenCount++;
          applyEff({happiness:22,reputation:6});
          logLine(`You adopted ${kid.name}.`,'good');
          popupOK('Approved',`${kid.name} is ${kid.age===0?'a baby':kid.age+' years old'}, and is yours now.`);
        } else {
          applyEff({happiness:-12});
          popupOK('Not this time','The panel turned you down. You may try again.');
        }
      });
    });
    A('foster','Foster a child','Family','Temporary, and paid',()=>{
      if(S.fostering)return popupOK('Already fostering','You have a placement.');
      let ch=0.5+(S.job?0.1:0)-(S.record.some(r=>!r.spent)?0.4:0);
      if(R()<ch){ S.fostering=true; S.dependents++;
        applyEff({reputation:8,happiness:5});
        popupOK('A placement','A child has come to stay with you. An allowance is paid while they are with you \u2014 it does not cover what they cost.');
      } else popupOK('Declined','You were not approved this time.');
    });
  }
  if(a>=20&&a<=50&&partner()){
    A('ivf','Fertility treatment','Family',`${money(Math.round(9000*country().med))} a round`,()=>{
      const c=Math.round(9000*country().med); if(!afford(c))return; charge(c);
      S.ivfTries=(S.ivfTries||0)+1;
      if(R()<0.35+ (S.stats.health-50)/300){
        const twins=R()<0.12;
        const k1=addNPC('child',null,0,85); S.childrenCount++;
        let t=`${k1.name} was born.`;
        if(twins){ const k2=addNPC('child',null,0,85); S.childrenCount++; t+=` And so was ${k2.name} \u2014 twins.`; }
        applyEff({happiness:26,money:-6000});
        popupOK('It worked',t);
      } else { applyEff({happiness:-10}); popupOK('Not this round','It did not take. You can try again.'); }
    });
  }
  /* ---------- CRIME ---------- */
  if(S.jailLeft===0){
    DATA.crimes.filter(c=>S.age>=c.minAge&&(!c.needJob||S.job)).forEach(c=>{
      let pc=c.base+(S.skills[c.skill]||0)/250; pc=Math.round(Math.max(3,Math.min(95,pc*100)));
      A('crime_'+c.id, c.n, 'Crime', `${pc}% success \u00b7 up to ${c.sentence[1]}y prison`,
        ()=>crimeConfirm(c.id));
    });
  }
  A('rest','Rest','Health','Take it easy this year',()=>{applyEff({health:4,happiness:5});popupOK('Rest','Health +4, Happiness +5.');});
  A('walk','Go outdoors','Health','Free',()=>{applyEff({health:2,happiness:3});popupOK('Outdoors','Health +2, Happiness +3.');});

  if(a<=5){
    A('toys','Play with toys','Childhood','',()=>{applyEff({happiness:6});popupOK('Play','Happiness +6.');});
    A('cartoons','Watch cartoons','Childhood','',()=>{applyEff({happiness:7,smarts:-2});popupOK('Cartoons','Happiness +7, Smarts −2.');});
    A('story','Ask for a story','Childhood','',()=>{applyEff({smarts:4,rel:{parents:3}});popupOK('Story time','Smarts +4.');});
  }
  if(S.inSchool&&a>=6&&a<=21){
    A('study','Study harder','School',
      subjectsActive(S).length?`Pick a subject \u00b7 average ${Math.round(S.gpa==null?50:S.gpa)}`:`Grade ${Math.round(S.gpa==null?50:S.gpa)}/100`,
      ()=>{
        if(subjectsActive(S).length) return studyPick();
        applyEff({smarts:5,happiness:-3,discipline:3});
        const before=S.gpa==null?50:S.gpa;
        S.gpa=clamp(before+ri(3,8));
        popupOK('Study',`Smarts +5, Discipline +3.\nYour grade moved from ${Math.round(before)} to ${Math.round(S.gpa)} (${gradeBand(S.gpa).n}).`);});
    A('slack','Slack off','School','Costs you grades',()=>{
      applyEff({smarts:-3,happiness:6,discipline:-3});
      const before=S.gpa==null?50:S.gpa; S.gpa=clamp(before-ri(3,8));
      popupOK('Slacking',`Happiness +6.\nYour grade slipped from ${Math.round(before)} to ${Math.round(S.gpa)}.`);});
    A('club','Join a school club','School','Pick which one',()=>{ chooseFrom('Which club?',[
        ['Debating','skill:charisma',{skill:{charisma:12},smarts:4}],
        ['Chess club','smarts',{smarts:9,skill:{gaming:5}}],
        ['Drama','confidence',{skill:{charisma:9},looks:3,happiness:6}],
        ['School band','music',{skill:{music:12},discipline:4}],
        ['Art club','art',{skill:{art:12},happiness:5}],
        ['Science club','smarts',{smarts:11,skill:{tech:6}}],
        ['Student council','standing',{reputation:9,skill:{charisma:7},discipline:4}]
      ],(name,eff)=>{
        applyEff(eff); S.gpa=clamp((S.gpa==null?50:S.gpa)+2);
        let t=`You joined ${name}.`;
        if(R()<0.55){const f=addNPC('friend',null,S.age);t+=` You met ${f.name} there.`;}
        popupOK(name,t);
      }); });
    A('sports','Play a sport','School','Pick which one',()=>{ chooseFrom('Which sport?',[
        ['Football','team',{skill:{fitness:10},happiness:6,reputation:4}],
        ['Athletics','solo',{skill:{fitness:13},discipline:5}],
        ['Swimming','endurance',{skill:{fitness:11},health:6}],
        ['Basketball','team',{skill:{fitness:9},happiness:5,skill2:true}],
        ['Boxing','contact',{skill:{fitness:8,combat:11},health:-3}],
        ['Tennis','solo',{skill:{fitness:9},discipline:4,reputation:3}]
      ],(name,eff)=>{
        applyEff(eff); applyEff({health:3});
        let t=`You took up ${name.toLowerCase()}.`;
        if(R()<0.35){ t+=' The coach thinks you have something.'; S.flags.sport_talent=true; applyEff({skill:{fitness:5}}); }
        popupOK(name,t);
      }); });
    A('homework','Do your homework properly','School','Raises your grade',()=>{
      applyEff({smarts:3,discipline:3}); S.gpa=clamp(S.gpa+ri(4,9));
      popupOK('Homework',`Your grade is now ${Math.round(S.gpa)}/100 (${gradeBand(S.gpa).n}).`);});
    A('skipschool','Skip class','School','Fun now, costs you later',()=>{
      applyEff({happiness:7,discipline:-4}); S.gpa=clamp(S.gpa-ri(5,11));
      let t=`Grade down to ${Math.round(S.gpa)}/100.`;
      if(R()<0.35){ applyEff({rel:{parents:-8}}); t+=' The school called home.'; }
      popupOK('Skipped',t);});
    A('teacherhelp','Ask a teacher for help','School','',()=>{
      const t=anyOf('teacher')[0];
      if(!t)return popupOK('No one to ask','You have no teacher you know well enough.');
      applyEff({smarts:4}); S.gpa=clamp(S.gpa+ri(3,7)); t.r=clamp(t.r+ri(5,12));
      popupOK('Extra help',`${t.name} stayed behind with you. Grade ${Math.round(S.gpa)}/100.`);});
    A('exam','Revise for exams','School','',()=>{
      applyEff({smarts:5,discipline:4,happiness:-3}); S.gpa=clamp(S.gpa+ri(6,12));
      popupOK('Revision',`Hard work. Grade ${Math.round(S.gpa)}/100 (${gradeBand(S.gpa).n}).`);});
    A('read','Read books','School','',()=>{applyEff({smarts:4,skill:{writing:4},habit:{reading:8}});popupOK('Reading','Smarts +4, Writing +4.');});
    A('music','Practice an instrument','School','',()=>{applyEff({discipline:4,happiness:3,skill:{music:7}});popupOK('Practice','Music +7.');});
    A('draw','Draw and paint','School','',()=>{applyEff({happiness:4,skill:{art:7}});popupOK('Art','Art +7.');});
    A('chores','Help with chores','Family','',()=>{applyEff({rel:{parents:8},discipline:3,money:150});popupOK('Chores','Parents +8, pocket money.');});
    A('askmoney','Ask parents for money','Family','',()=>{const p=findNPC('mother')||findNPC('father');
      if(!p)return popupOK('No one to ask','You have no parents to ask.');
      if(R()<p.r/120){const amt=ri(50,400);applyEff({money:amt,rel:{parents:-2}});popupOK('They said yes',`You got ${money(amt)}.`);}
      else popupOK('They said no','Money is tight.');});
    A('fight','Pick a fight','Trouble','',()=>{ if(R()<0.4+S.skills.combat/200){applyEff({reputation:6,skill:{combat:8},health:-5});popupOK('Fight','You won.');}
      else{applyEff({reputation:-5,health:-12,happiness:-6});popupOK('Fight','You lost badly.');}});
  }
  if(a>=13&&a<=19){
    A('ptjob','Get a part-time job','Work','',()=>{ if(S.job)return popupOK('Already working','You already have a job.');
      S.job={id:'ptjob',t:'Part-time work',pay:Math.round(11000*country().sal),field:'service',lvl:0};S.jobsHeld++;popupOK('Hired','You got part-time work.');});
    A('askout','Ask someone out','Love','',()=>{ if(partner())return popupOK('You are seeing someone','End it first.');
      if(R()<0.35+S.skills.charisma/250+S.stats.looks/350){const p=addNPC('partner',partnerGender(),S.age+ri(-2,2),ri(55,80));S.flags.had_partner=true;S.counters.partners++;popupOK('They said yes',`You are now seeing ${p.name}.`);}
      else{applyEff({happiness:-6});popupOK('Turned down','They said no.');}});
    A('party','Go to a party','Social','',()=>{applyEff({happiness:9,skill:{charisma:5},habit:{drinking:8}});
      if(R()<0.3){const f=addNPC('friend',null,S.age);popupOK('Party',`You met ${f.name}.`);}else popupOK('Party','Happiness +9.');});
    A('sidehustle','Start a side hustle','Work','',()=>{const e=Math.round(ri(200,3000)*(1+S.skills.business/100));applyEff({money:e,skill:{business:6},happiness:-2});popupOK('Side hustle',`You made ${money(e)}.`);});
  }
  if(a>=13){
    A('social','Post on social media','Fame','Needs a phone',()=>{ if(!hasItem('phone'))return popupOK('No phone','Buy a smartphone first.');
      const v=R()<0.15?ri(5000,80000):ri(10,900); S.followers+=v; applyEff({happiness:3}); popupOK('Posted',`+${v.toLocaleString()} followers. Total ${S.followers.toLocaleString()}.`);});
  }
  /* every skill has a way to train it */
  if(a>=12){
    const SKILL_ACTS={
      cooking:  {n:'Cook a proper meal',  c:60,   e:{happiness:2,health:1}},
      writing:  {n:'Write something',     c:0,    e:{smarts:1}},
      gaming:   {n:'Play games',          c:0,    e:{happiness:4,smarts:-1}},
      handiness:{n:'Fix things yourself', c:40,   e:{}},
      fitness:  {n:'Train',               c:0,    e:{health:3}},
      charisma: {n:'Work a room',         c:80,   e:{happiness:3}},
      business: {n:'Study the markets',   c:0,    e:{smarts:1}},
      combat:   {n:'Martial arts class',  c:400,  e:{health:2,discipline:2}},
      music:    {n:'Practise music',      c:0,    e:{happiness:3,discipline:2}},
      art:      {n:'Make art',            c:50,   e:{happiness:3}},
      tech:     {n:'Tinker with tech',    c:0,    e:{smarts:2}},
      medicine: {n:'Study medicine',      c:200,  e:{smarts:2,discipline:2}}
    };
    Object.keys(SKILL_ACTS).forEach(k=>{
      const sa=SKILL_ACTS[k];
      A('sk_'+k, sa.n, 'Skills', `${DATA.skills[k].name} ${Math.round(S.skills[k]||0)}/100${sa.c?' · '+money(sa.c):''}`, ()=>{
        if(sa.c&&!afford(sa.c))return; if(sa.c)S.money-=sa.c;
        const gain=ri(4,9)+(S.stats.discipline>60?2:0);
        applyEff(Object.assign({skill:{[k]:gain}},sa.e));
        const nv=S.skills[k], tierIdx=nv>=100?3:nv>=75?2:nv>=50?1:nv>=25?0:-1;
        popupOK(sa.n,`${DATA.skills[k].name} +${gain} (now ${Math.round(nv)}).`+(tierIdx>=0?`\nUnlocked: ${DATA.skills[k].tiers[tierIdx]}`:''));
      });
    });
  }
  /* every habit can be started or indulged deliberately */
  if(a>=12){
    const HAB={
      smoking:   {n:'Smoke',            min:13},
      drinking:  {n:'Have a few drinks',min:15},
      junkfood:  {n:'Eat junk food',    min:12},
      caffeine:  {n:'Live on coffee',   min:14},
      gambling:  {n:'Place a bet',      min:18},
      drugs:     {n:'Take something',   min:15},
      doomscroll:{n:'Scroll for hours', min:12},
      sleep:     {n:'Get proper sleep', min:12},
      reading:   {n:'Read for pleasure',min:12},
      gym:       {n:'Hit the gym',      min:14}
    };
    Object.keys(HAB).forEach(k=>{
      const hb=HAB[k], h=DATA.habits[k];
      if(a<hb.min)return;
      A('hb_'+k, hb.n, 'Lifestyle', `${h.name} ${Math.round(S.habits[k])}/100 · ${h.good?'good habit':'harmful'}`, ()=>{
        const d=ri(12,20);
        applyEff({habit:{[k]:d}});
        const inst={}; for(const st in h.eff) inst[st]=Math.round(h.eff[st]/2);
        if(!h.good)inst.happiness=(inst.happiness||0)+3;
        applyEff(inst);
        popupOK(hb.n,`${h.name} is now ${Math.round(S.habits[k])}/100.`+(!h.good&&S.habits[k]>60?'\nThis is getting out of hand.':''));
      });
    });
  }
  if(hasItem('stash')){
    A('sellstash','Move the contraband','Trouble','Sell your stash on',()=>{
      const i=S.items.findIndex(x=>{const it=DATA.items.find(d=>d.id===x);return it&&it.tag==='stash';});
      if(R()<0.62+S.skills.charisma/250+LUCK()){
        const v=ri(3000,14000); S.money+=v; if(i>=0)S.items.splice(i,1);
        popupOK('Sold on',`You cleared the stash for ${money(v)}.`);
      } else { if(i>=0)S.items.splice(i,1); doCrime('drugs'); }
    });
  }
  if(S.flags.inCollege){
    A('lectures','Attend every lecture','University','',()=>{
      applyEff({smarts:5,discipline:3}); S.gpa=clamp(S.gpa+ri(3,7));
      popupOK('Lectures','Smarts +5. Your standing improves.');});
    A('unisocial','University social life','University','',()=>{
      applyEff({happiness:11,skill:{charisma:6},habit:{drinking:8}}); S.gpa=clamp(S.gpa-ri(1,4));
      if(R()<0.4){const f=addNPC('friend',null,S.age+ri(-1,2));popupOK('Night out',`You met ${f.name}.`);}
      else popupOK('Night out','Happiness +11.');});
    A('placement','Apply for a placement','University','',()=>{
      if(R()<0.35+S.stats.smarts/300){ applyEff({skill:{business:10},money:3000,reputation:4});
        S.flags.placement=true; popupOK('Placement','You got a paid placement. It will help you get hired.');}
      else popupOK('Rejected','No placement this year.');});
  }
  if(a>=10){
    LEISURE.forEach(l=>{
      if(l.id==='casino'&&a<18)return;
      if((l.id==='festival'||l.id==='cruise')&&a<16)return;
      A('lei_'+l.id, l.n, 'Leisure', l.cost?money(Math.round(l.cost*country().col)):'free', ()=>{
        const c=Math.round(l.cost*country().col);
        if(c&&!afford(c))return; if(c){charge(c); ledger('spend',l.n,c);}
        if(l.gamble){
          const stake=Math.min(Math.max(200,Math.round(S.money*0.1)),25000);
          if(stake>S.money)return popupOK('Not enough','You cannot cover a stake.');
          charge(stake);
          if(R()<0.38){ const win=Math.round(stake*(1.15+R()*1.15)); S.money+=win;
            ledger('earn','A win at the casino',win); applyEff({happiness:12,habit:{gambling:12}});
            popupOK('You won',`${money(win)} up. Walking away now would be the clever thing.`); }
          else { ledger('spend','Lost at the casino',stake); applyEff({happiness:-8,habit:{gambling:14}});
            popupOK('You lost',`${money(stake)} gone.`); }
          return;
        }
        if(l.eff)applyEff(l.eff);
        if(l.skill)applyEff({skill:l.skill});
        if(l.habit)applyEff({habit:l.habit});
        popupOK(l.n,'A good use of the time.');
      });
    });
  }
  if(a>=18){
    A('gym','Go to the gym','Health','',()=>{applyEff({habit:{gym:18},health:3,skill:{fitness:6}});popupOK('Gym','Gym habit +18, Fitness +6.');});
    A('meditate','Meditate','Health','',()=>{applyEff({happiness:6,discipline:5});popupOK('Meditation','Happiness +6, Discipline +5.');});
    A('therapy','Therapy','Health','$2,600',()=>{ if(!afford(2600))return; charge(2600); applyEff({happiness:14,discipline:4}); popupOK('Therapy','Happiness +14.');});
    A('surgery','Cosmetic surgery','Health','$9,000',()=>{ if(!afford(9000))return; charge(9000);
      if(R()<0.78){applyEff({looks:14,happiness:6});popupOK('Surgery','Looks +14.');}else{applyEff({looks:-10,happiness:-14,health:-6});popupOK('Surgery','It went badly.');}});
    A('class','Take a class','Self','$1,200',()=>{ if(!afford(1200))return; charge(1200);
      const k=pick(Object.keys(DATA.skills)); applyEff({skill:{[k]:10},smarts:2}); popupOK('Class',`${DATA.skills[k].name} +10.`);});
    A('travel','Take a holiday','Self','$4,000',()=>{ if(!afford(4000))return; charge(4000); applyEff({happiness:18,health:3}); popupOK('Holiday','Happiness +18.');});
    A('donate','Donate to charity','Self','$5,000',()=>{ if(!afford(5000))return; charge(5000); S.donated+=5000; applyEff({reputation:8,happiness:6}); popupOK('Donation','Reputation +8.');});
    A('emigrate','Emigrate','Self','Move to another country',()=>{
      const nc=pick(DATA.countries.filter(x=>x.id!==S.country));
      confirmDo('Emigrate?',`Move to ${nc.name}? Salaries there are ${Math.round(nc.sal*100)}% of the US scale and living costs ${Math.round(nc.col*100)}%.`,()=>{
        S.money-=3000; S.country=nc.id; S.city=cityFor(nc.reg);
        if(!S.countriesLived.includes(nc.id))S.countriesLived.push(nc.id);
        META.countriesPlayed[nc.id]=true; saveMeta(); S.flags.emigrated=true;
        applyEff({happiness:-4,smarts:4}); popupOK('Emigrated',`You now live in ${S.city}, ${nc.name}.`);});
    });
    A('date','Go on a date','Love','',()=>{ if(partner())return popupOK('You are taken','You already have a partner.');
      if(R()<0.4+S.skills.charisma/250+S.stats.looks/350){const p=addNPC('partner',partnerGender(),Math.max(18,S.age+ri(-6,6)),ri(55,85));S.flags.had_partner=true;S.counters.partners++;popupOK('It went well',`You are now seeing ${p.name}.`);}
      else{applyEff({happiness:-5,money:-80});popupOK('It did not go well','No second date.');}});
    A('friend','Make a friend','Social','',()=>{ if(R()<0.5+S.skills.charisma/250){const f=addNPC('friend',null,S.age+ri(-8,8));popupOK('New friend',`You became friends with ${f.name}.`);}
      else popupOK('No luck','You did not click with anyone.');});
    A('party2','Throw a party','Social','$1,200',()=>{ if(!afford(1200))return; charge(1200); applyEff({happiness:12,rel:{friends:10},reputation:4,habit:{drinking:6}}); popupOK('Party','Happiness +12.');});
    A('visit','Visit family','Family','',()=>{applyEff({rel:{parents:10,children:8},happiness:5});popupOK('Family','Relationships improved.');});
  }
  const p=partner();
  if(p&&a>=16){
    if(p.rel==='partner')A('propose','Propose','Love',hasItem('ring')?'':'Needs a ring',()=>{
      if(!hasItem('ring'))return popupOK('No ring','Buy an engagement ring from the shop first.');
      const bonus=hasItem('ring2')?25:0;
      if(R()<(p.r+bonus)/110){p.rel='spouse';S.marriedYears=0;if(S.age<=21)S.flags.married_young=true;applyEff({happiness:22,reputation:5});checkAch();popupOK('They said yes',`You married ${p.name}.`);}
      else{applyEff({happiness:-20,rel:{partner:-15}});popupOK('They said no','It is over, effectively.');}});
    A('spend','Spend time together','Love','',()=>{applyEff({rel:{partner:12},happiness:6});popupOK('Together','Relationship +12.');});
    A('break','Break up','Love','',()=>confirmDo('End it?',`Break up with ${p.name}?`,()=>{p.rel='ex';S.flags.had_partner=true;applyEff({happiness:-12});popupOK('Over','You broke up.');}));
    if(p.rel==='spouse'){
      A('kid','Try for a child','Family','',()=>{
        const fertility=0.62-Math.max(0,(S.age-32))*0.03-(S.stats.health<45?0.15:0);
        if(R()<Math.max(0.05,fertility)){
          const c=addNPC('child',null,0,85); S.childrenCount++;
          let t=`${c.name} was born.`;
          if(R()<0.03){ const c2=addNPC('child',null,0,85); S.childrenCount++; t+=` And ${c2.name} \u2014 twins.`; }
          applyEff({happiness:14,money:-6000}); popupOK('A child',t);
        } else {
          S.tryCount=(S.tryCount||0)+1;
          popupOK('Not this year', S.tryCount>=3
            ? 'Still nothing. A doctor mentions there are other routes \u2014 treatment, or adoption.'
            : 'No luck yet.');
        }});
      A('divorce','Divorce','Love','',()=>confirmDo('Divorce?','You will lose roughly half your assets.',()=>{
        p.rel='ex';const loss=Math.round((S.money+S.savings)*0.45);S.money-=loss;applyEff({happiness:-22});S.marriedYears=0;S.counters.divorces++;popupOK('Divorced',`It cost you ${money(loss)}.`);}));
    }
  }
  if(a>=16&&!S.job&&!S.flags.retired)A('findjob','Look for work','Work','Opens the careers list',()=>setTab('money'));
  if(S.job&&a>=16){
    A('promote','Ask for promotion','Work','',()=>tryPromote());
    A('overtime','Work overtime','Work','Money now, experience too',()=>{
      if(!S.job)return popupOK('No job','You are not working.');
      const b=Math.round(S.job.pay*0.15);
      applyEff({money:b,health:-4,happiness:-6,discipline:3,skill:{business:3}});
      ledger('earn','Overtime',b);
      const gain=ri(4,9); S.perf=clamp((S.perf==null?60:S.perf)+gain);
      S.jobYears+=0.5;
      popupOK('Overtime',`You earned an extra ${money(b)}.\nYour standing at work rose to ${Math.round(S.perf)}/100 (${perfBand(S.perf).n}), which counts towards promotion.`);});
    A('quit','Quit your job','Work','',()=>{ if(!S.job)return popupOK('No job','You are not working.');
      return confirmDo('Quit?',`Leave your role as ${S.job.t}?`,()=>{S.job=null;applyEff({happiness:6});popupOK('Resigned','You quit.');}); });
  }
  if(a>=18&&!S.flags.inCollege&&S.edu<3)
    A('college','Enrol at university','Education',`$${Math.round(24000*country().edu).toLocaleString()}/yr`,()=>{
      const fee=Math.round(24000*country().edu*4);
      confirmDo('Enrol at university?',`Four years. Total ${money(fee)}. A loan covers it if you cannot.`,()=>{
        if(S.money>=fee)S.money-=fee; else {S.debt+=fee;S.flags.student_loan=true;}
        S.flags.inCollege=true;S.inSchool=true;S.school=uniFor(country().reg);popupOK('Enrolled',`You enrolled at ${S.school}.`);});});
  if(a>=18&&S.edu===3&&!S.flags.inGrad)
    A('grad','Enrol in grad school','Education',`$${Math.round(30000*country().edu).toLocaleString()}/yr`,()=>{
      const fee=Math.round(30000*country().edu*2);
      confirmDo('Enrol in postgraduate study?',`Two years. Cost ${money(fee)}.`,()=>{
        if(S.money>=fee)S.money-=fee; else {S.debt+=fee;S.flags.student_loan=true;}
        S.flags.inGrad=true;popupOK('Enrolled','Postgraduate study begins.');});});
  if(a>=16&&!S.flags.licence)A('lessons','Learn to drive','Self',
    `${money(Math.round(900*country().col))} for lessons and the test`,()=>{
    const c=Math.round(900*country().col);
    if(!afford(c))return; charge(c); ledger('spend','Driving lessons',c);
    if(R()<0.55+S.stats.discipline/300+LUCK()){
      S.flags.licence=true;
      popupOK('You passed','You can drive. Cars are now worth looking at.');
    } else popupOK('You failed','Three points of feedback and another fee next time.');
  });
  if(a>=16)A('cert','Take a certification','Education','$2,500',()=>{ if(!afford(2500))return; charge(2500); S.edu=Math.max(S.edu,2); popupOK('Certified','You hold a trade certificate.');});
  if(a>=18)A('startbiz',(S.businesses||[]).length?'Manage your businesses':'Start a business','Work',
    (S.businesses||[]).length?`${S.businesses.length} trading`:'Thirteen kinds, from a market stall to a nightclub',
    ()=>{ setTab('money'); openMoney('biz'); });
  if(a>=55){
    A('retire','Retire','Work','',()=>{ if(!S.job)return popupOK('Not working','You have no job to retire from.');
      confirmDo('Retire?','You will live on savings and pension.',()=>{S.job=null;S.flags.retired=true;applyEff({happiness:10});popupOK('Retired','You retired.');});});
    A('grand','Time with grandchildren','Family','',()=>{applyEff({happiness:12,rel:{children:8}});popupOK('Grandchildren','Happiness +12.');});
  }
  return L;
}
/* Under 18 your parents pay. If the household cannot afford it, you go without. */
/* One settle step that runs after anything that can move money or liberty. */
function settleState(){
  if(!S)return;
  if(S.jailLeft>0&&S.job){ logLine(`You lost your job as ${S.job.t} when you were jailed.`,'bad'); S.job=null; S.firedCount++; }
  if(S.age>=18&&S.money<0){ S.debt+=-S.money; S.money=0; }
  if(S.dependents>3)S.dependents=3;
}
function clampMinorMoney(){
  if(!S||S.age>=18)return;
  if(S.money<0){ S.familyMoney=Math.max(0,S.familyMoney+S.money); S.money=0; }
  /* deliberate borrowing (a student loan signed at 17) stands; only debt
     created by unpayable costs is absorbed by the household */
  if(S.debt>0&&!S.flags.student_loan){ S.debt=0; }
}
/* A small chooser so activities offer real options instead of a silent roll. */
function chooseFrom(title,options,cb){
  CHOOSER={options,cb};
  push({type:'CHOOSE',title,options});
  drain();
}
function afford(c){
  if(c<=0)return true;
  if(S.age<18){
    if(S.familyMoney>=c){ S.familyMoney-=c; S.paidByFamily=c; return true; }
    ACT_BLOCKED=true; cue('denied','denied');
    popupOK('Your family cannot afford it',
      `That costs ${money(c)}. Your household has ${money(S.familyMoney)}.`);
    return false;
  }
  if(S.money<c){ ACT_BLOCKED=true; cue('denied','denied'); popupOK('Not enough money',`You need ${money(c)} and have ${money(S.money)}.`); return false; }
  return true;
}
/* charge() pairs with afford(): adults pay from their own pocket, children do not */
function charge(c){ if(S.age<18){ S.paidByFamily=null; return; } S.money-=c; }
function doAct(id){
  rememberScroll();
  const a=ACTS().find(x=>x.id===id); if(!a)return;
  if(S.actionsLeft<=0){
    return popupOK('No time left this year',
      `You have already filled this year. Press AGE UP to move to ${S.age+1}.`);
  }
  const habKey=id.indexOf('hb_')===0?id.slice(3):null;
  const harmful=habKey&&DATA.habits[habKey]&&!DATA.habits[habKey].good;
  if(harmful){
    if(S.lifestyleThisYear==null)S.lifestyleThisYear=0;
    if(S.lifestyleThisYear>=1)
      return popupOK('Enough for one year','You have already indulged this year. Try something else.');
  }
  ACT_BLOCKED=false;
  noteAct(id);
  EFF_SCALE=diminish(id);
  EFF_LOG=[];
  const qBefore=QUEUE.length;
  try{ a.f(); } finally { EFF_SCALE=1; }
  EFF_LOG=null;
  /* only spend an action if something actually happened */
  const blocked=ACT_BLOCKED; ACT_BLOCKED=false;
  clampMinorMoney(); settleState();
  if(!blocked){ S.actionsLeft--; noteAction(id); if(harmful)S.lifestyleThisYear=(S.lifestyleThisYear||0)+1; }
  checkAch(); save(); renderAll();
}
function randomAct(){
  if(S.actionsLeft<=0)return popupOK('No time left this year',
    `You have already filled this year. Press AGE UP to move to ${S.age+1}.`);
  const L=ACTS(); if(!L.length)return; doAct(pick(L).id);
}

/* ---------------- RENDER ---------------- */
const app=()=>document.getElementById('app');
function renderAll(){ if(!S)return; applyTextSize(); renderHeader(); renderTab(app().dataset.tab||'life',true);
  a11ySwitches(); a11yAgeHint(); }
function initials(n){ return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function doAgeUp(){
  cue('year','year');
  const b=document.getElementById('ageBtn');
  if(b){ b.classList.add('pulse'); setTimeout(()=>b.classList.remove('pulse'),320); }
  ageUp();
}
function setTextSize(k){
  S.textSize=k;
  const el=document.getElementById('app');
  if(el)el.dataset.text=k;
  save(); renderAll();
  popupOK('Text size','Set to '+({s:'smaller',m:'normal',l:'larger',xl:'largest'}[k]||k)+'.');
}
function applyTextSize(){
  const el=document.getElementById('app');
  if(el&&S)el.dataset.text=S.textSize||'m';
}
function toggleStats(){ S.statsOpen=!S.statsOpen; renderHeader(); }
function bar(n,v,ic){ v=Math.round(v);
  const c=v>=70?'g':v>=40?'a':'r';
  return `<div class="b"><div class="bl"><span>${ic?ic+' ':''}${n}</span><span>${Math.round(v)}</span></div>
    <div class="bt"><i class="${c}" style="width:${clamp(v)}%"></i></div></div>`;
}
function actionsPerYear(){
  let n = S.age<6?3 : S.age<13?4 : S.age<18?5 : S.age<65?6 : 4;
  if(S.stats.discipline>=75)n++;                 // disciplined people fit more in
  if(META.perks&&META.perks.extraaction)n++;
  if(S.stats.health<30)n=Math.max(1,n-2);        // illness eats your year
  if(S.jailLeft>0)n=2;
  if(S.disabled)n=Math.max(1,n-1);
  if(S.dependents>0)n=Math.max(1,n-Math.min(2,S.dependents));
  return n;
}
/* Repeating the same thing yields less and less. Resting every year for
   sixty years should not make you the happiest person alive.               */
function diminish(id){
  const rec=S.actLog[id];
  if(!rec)return 1;
  const recent=rec.filter(y=>S.age-y<=8).length;
  return Math.max(0.10, 1 - recent*0.22);
}
function noteAction(id){
  (S.actLog[id]=S.actLog[id]||[]).push(S.age);
  if(S.actLog[id].length>12)S.actLog[id].shift();
}
function occupation(){
  return S.job?S.job.t
    :S.jailLeft>0?'In prison'
    :S.flags.inCollege?'University student'
    :S.age<5?'Infant'
    :S.inSchool?'At school'
    :S.age<16?'Child'
    :S.flags.retired?'Retired'
    :'Unemployed';
}
function renderHeader(){
  const h=S.stats.health, ring=Math.round(h*2.51);
  document.getElementById('hdr').innerHTML=`
    <div class="hero">
      <div class="avwrap">
        <svg class="ring" viewBox="0 0 88 88" aria-hidden="true" focusable="false"><circle class="rbg" cx="44" cy="44" r="40"/>
          <circle class="rfg ${h>=70?'g':h>=40?'a':'r'}" cx="44" cy="44" r="40"
            stroke-dasharray="${ring} 251" /></svg>
        <div class="avin">${avatarSVG(S,64)}</div>
        <div class="agepill">${S.age}</div>
      </div>
      <div class="hinfo">
        <div class="hname">${esc(S.name)}${S.gen>1?`<span class="gen">GEN ${S.gen}</span>`:''}</div>
        <div class="hjob">${esc(occupation())}</div>
        <div class="hloc">${esc(S.city)}, ${esc(country().name)}</div>
        <div class="chips">
          <span class="ch act">${S.actionsLeft}/${actionsPerYear()} actions</span>
          <span class="ch" style="color:${diffDef(S.diff).colour}">${diffDef(S.diff).n}</span>
          ${S.jailLeft>0?`<span class="ch bad">Prison ${S.jailLeft}y</span>`:''}
          ${S.parole>0?'<span class="ch bad">Parole</span>':''}
          ${S.conditions.length?`<span class="ch bad">${S.conditions.length} condition${S.conditions.length>1?'s':''}</span>`:''}
          ${S.disabled?'<span class="ch bad">Disabled</span>':''}
        </div>
      </div>
      <div class="hcash">
        <div class="hm" id="cashv">${money(S.money)}</div>
        <div class="hsub dim">${S.age<16?'household '+money(S.familyMoney):'net '+money(netWorth())}</div>
      </div>
    </div>
    <button class="statToggle" onclick="toggleStats()">${S.statsOpen?'\u25B4 Hide details':'\u25BE Show details'}</button>
    <div class="statsheet ${S.statsOpen?'open':''}" onclick="toggleStats()"><div class="statpanel" onclick="event.stopPropagation()">
      <div class="ct">Condition</div>
      ${DATA.statKeys.map(k=>bar(DATA.statNames[k],S.stats[k],DATA.statIcons[k])).join('')}
      <div class="ct mt">This year</div>
      <div class="kv"><span>Income</span><b class="bgood">${money(ledgerTotal('income'))}</b></div>
      <div class="kv"><span>Outgoings</span><b class="bbad">${money(ledgerTotal('spend'))}</b></div>
      <div class="kv"><span>Actions left</span><b>${S.actionsLeft}/${actionsPerYear()}</b></div>
      ${S.track?`<div class="kv"><span>${esc(TRACK(S.track.id).n)}</span><b>${esc(TRACK_RANK(S.track).n)}</b></div>`:''}
      <button class="btn wide mt" onclick="toggleStats();setTab('more');setMore('stats')">Full details page</button>
    </div></div>
    <div class="statrow">${DATA.statKeys.map(k=>{
      const v=Math.round(S.stats[k]), c=v>=70?'g':v>=40?'a':'r';
      return `<div class="stat ${c}" title="${DATA.statNames[k]}">
        <div class="si">${IC[k]||''}</div>
        <div class="sv">${Math.round(v)}</div>
        <div class="sbar"><i style="width:${v}%"></i></div></div>`;}).join('')}</div>`;
}
function setTab(t){ rememberScroll(); SCROLL[t]=0; app().dataset.tab=t;
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  a11ySyncTabs(t);
  const m=document.getElementById('main'); if(m)m.classList.remove('in');
  renderTab(t);
  if(m){ void m.offsetWidth; m.classList.add('in'); } }
let SCROLL={};
let DEATH_STATS=false;
let SETTLEMENT=null;
function renderTab(t,keepScroll){
  const m=document.getElementById('main');
  const prev=m?m.scrollTop:0;
  m.innerHTML=({life:viewLife,act:viewActs,ppl:viewPeople,money:viewMoney,more:viewMore}[t]||viewLife)();
  /* staying where you were is the whole point of a list of things to do */
  if(keepScroll!==false && SCROLL[t]!=null) m.scrollTop = SCROLL[t];
  else m.scrollTop = 0;
}
function rememberScroll(){
  const m=document.getElementById('main'), t=app().dataset.tab||'life';
  if(m)SCROLL[t]=m.scrollTop;
}
function nextMilestone(){
  const a=S.age;
  const M=[[5,'You start school'],[13,'Your teenage years begin'],[14,'You can take a part-time job'],
    [16,'Full-time work and driving open up'],[18,'Adulthood: banking, university, moving out'],
    [21,'Society treats you as fully grown'],[30,'Your thirties'],[40,'Middle age'],
    [50,'Your fifties'],[65,'Retirement age'],[80,'Old age'],[100,'A century']];
  const n=M.find(m=>m[0]>a);
  return n?{age:n[0],label:n[1],inYears:n[0]-a}:null;
}
const GROUP_META={
  'School':      {i:'\u270E', d:'Lessons, clubs, teachers and your grade', o:1},
  'University':  {i:'\u2605', d:'Lectures, placements and student life', o:2},
  'Education':   {i:'\u2691', d:'Degrees, certificates and retraining', o:3},
  'Work':        {i:'\u25B2', d:'Your job, promotions and overtime', o:4},
  'Paths':       {i:'\u25C6', d:'Special lives with their own ranks', o:5},
  'Skills':      {i:'\u2726', d:'Twelve things you can get better at', o:6},
  'Health':      {i:'\u2665', d:'Doctors, treatment, rest and the gym', o:7},
  'Lifestyle':   {i:'\u25CF', d:'Habits, good and bad', o:8},
  'Leisure':     {i:'\u263A', d:'Holidays, hobbies and going out', o:9},
  'Love':        {i:'\u2661', d:'Dating, marriage and everything after', o:10},
  'Family':      {i:'\u2637', d:'Children, parents, adoption and fostering', o:11},
  'Social':      {i:'\u263B', d:'Friends, parties and reputation', o:12},
  'Home':        {i:'\u2302', d:'Your pets and your household', o:13},
  'Self':        {i:'\u25CB', d:'Identity, giving and starting over', o:14},
  'Money':       {i:'\u00A4', d:'Borrowing and everyday finance', o:15},
  'Fame':        {i:'\u2691', d:'Followers, posts and public life', o:16},
  'Trouble':     {i:'\u26A0', d:'Fights and bad ideas', o:17},
  'Crime':       {i:'\u2620', d:'Everything from shoplifting to an art heist', o:18},
  'Prison':      {i:'\u2338', d:'How you spend your sentence', o:0}
};
function groupMeta(g){ return GROUP_META[g]||{i:'\u2022',d:'',o:50}; }
function openSection(g){ rememberScroll(); S.section=g; renderTab('act',false); }
function closeSection(){ S.section=null; renderTab('act',false); }
function nextMilestone(){
  const a=S.age;
  const M=[[5,'You start school'],[13,'Your teenage years begin'],[14,'You can take a part-time job'],
    [16,'Full-time work and driving open up'],[18,'Adulthood: banking, university, moving out'],
    [21,'Society treats you as fully grown'],[30,'Your thirties'],[40,'Middle age'],
    [50,'Your fifties'],[65,'Retirement age'],[80,'Old age'],[100,'A century']];
  const n=M.find(m=>m[0]>a);
  return n?{age:n[0],label:n[1],inYears:n[0]-a}:null;
}
function viewLife(){
  const news=S.news.map(n=>DATA.news.find(d=>d.id===n.id)).filter(Boolean);
  const fam=S.npcs.filter(n=>n.alive&&['mother','father','sibling','spouse','partner','child'].includes(n.rel)).slice(0,4);
  const ms=nextMilestone();
  const showAll=S.logAll;
  const recent=S.log.slice().reverse().slice(0, showAll?600:26);

  /* The hero card and the story are always here. Everything else competes for
     three slots, most urgent first, so this page cannot silt up again. */
  const slots=[];
  const add=(pri,html)=>slots.push({pri,html});
  if(S.inSchool&&S.age>=SCHOOL_START&&S.age<=SCHOOL_END){ const sc=subjectsCard(); if(sc)add(4,sc); }
  if((S.conditions||[]).length){ const hc=healthCard(); if(hc)add(2,hc); }
  { const bc=broadcastCard(); if(bc)add(0,bc); }

  if(S.billsDue>0||S.overdue>0||S.arrears>0)add(1,`<div class="card" style="border-color:rgba(224,86,91,.5)">
      <div class="ct" style="color:var(--r)">Needs dealing with</div>
      ${S.billsDue>0?`<div class="kv"><span>Bills due</span><b class="bad">${money(S.billsDue)}</b></div>`:''}
      ${S.overdue>0?`<div class="kv"><span>Final notice</span><b class="bad">${money(S.overdue)}</b></div>`:''}
      ${S.arrears>0?`<div class="kv"><span>Arrears</span><b class="bad">${money(S.arrears)}</b></div>`:''}
      <div class="hsub dim">${S.overdue>0
        ? 'Settle the final notice this year or it goes to collection as arrears.'
        : S.arrears>0&&!S.arrPlan ? 'Paying anything at all stops the interest for a year.'
        : 'Bills left unpaid get one year\u2019s grace, then become a debt.'}</div>
      <div class="nact"><button onclick="setTab('money');openMoney('living')">Deal with it</button></div></div>`);

  if(S.inSchool){
    const g=gradeBand(S.gpa==null?50:S.gpa), t=anyOf('teacher')[0];
    add(2,`<div class="card school"><div class="ctrow"><div class="ct">School</div>
        <div class="gradechip ${g.n==='A'||g.n==='B'?'g':g.n==='C'?'a':'r'}">${g.n}</div></div>
      <div class="rn">${esc(S.school||'School')}</div>
      <div class="hsub dim">${esc(g.label)}${t?` \u00b7 taught by ${esc(t.name)}`:''}</div>
      <div class="bt" style="margin-top:8px"><i class="${g.n==='A'||g.n==='B'?'g':g.n==='C'?'a':'r'}"
        style="width:${clamp(S.gpa==null?50:S.gpa)}%"></i></div>
      <div class="nact"><button onclick="doAct('study')">Study</button>
        <button onclick="setTab('act');openSection('School')">All school options</button></div></div>`);
  }

  if(S.track){
    const def=TRACK(S.track.id), r=TRACK_RANK(S.track), next=def.ranks[S.track.rank+1];
    const pct=next?Math.min(100,Math.round((S.track.progress-r.need)/(next.need-r.need)*100)):100;
    add(3,`<div class="card trackcard" style="border-color:${def.colour}55">
      <div class="ctrow"><div class="ct" style="color:${def.colour}">${esc(def.n)}</div>
        <div class="hsub dim">${esc(def.resN)} ${Math.round(S.track[def.res]||0).toLocaleString()}</div></div>
      <div class="rn">${esc(r.n)}</div>
      <div class="hsub dim">${next?`${next.need-S.track.progress} more to ${esc(next.n)}`:'You are at the top.'}</div>
      <div class="bt" style="margin-top:8px"><i class="${pct>66?'g':pct>33?'a':'r'}" style="width:${pct}%"></i></div>
      <div class="nact"><button onclick="setTab('act');openSection('${def.n}')">What can I do</button></div></div>`);
  }

  if(S.age>=20&&S.home==='parents'&&S.job&&!S.flags.hideMoveNudge)
    add(4,`<div class="card"><div class="ct">Still at home</div>
      <div class="hsub">You are ${S.age}, earning, and living with your parents.</div>
      <div class="nact"><button onclick="setTab('money');openMoney('living')">Look at places</button>
        <button onclick="S.flags.hideMoveNudge=true;renderTab('life')">Not yet</button></div></div>`);

  if(news.length)add(5,`<div class="card news"><div class="ct">${esc(S.paper||'World')}</div>
    ${news.slice(0,3).map(n=>`<div class="ni">${esc(n.t)}</div>`).join('')}</div>`);

  if(fam.length)add(6,`<div class="card"><div class="ct">Around you</div>
    <div class="famrow">${fam.map(n=>`<button class="fam" onclick="setTab('ppl');openPerson('${n.id}')">
      <div class="famav">${avatarMini(n,42)}</div>
      <div class="famn">${esc(n.name.split(' ')[0])}</div>
      <div class="fambar"><i class="${n.r>=70?'g':n.r>=40?'a':'r'}" style="width:${clamp(n.r)}%"></i></div>
    </button>`).join('')}</div></div>`);

  const shown=slots.sort((a,b)=>a.pri-b.pri).slice(0,3);
  const hidden=slots.length-shown.length;

  let h=`<div class="card hi">
    <div class="histat"><span>${occupation()}</span><b>${stage()}</b></div>
    <div class="hisplit">
      <div><div class="hlbl">Age</div><div class="hbig">${S.age}</div></div>
      <div><div class="hlbl">${S.age<16?'Household':'Net worth'}</div>
        <div class="hbig sm">${money(S.age<16?S.familyMoney:netWorth())}</div></div>
      <div><div class="hlbl">Wellbeing</div>
        <div class="hbig sm ${S.stats.health>=60?'g':'a'}">${Math.round((S.stats.health+S.stats.happiness)/2)}</div></div>
    </div>
    ${ms?`<div class="milestone"><span>${IC.cake}</span>
      <div><b>${esc(ms.label)}</b><div class="hsub dim">in ${ms.inYears} year${ms.inYears>1?'s':''} \u00b7 age ${ms.age}</div></div></div>`:''}
  </div>`;

  /* Teaching sits directly under the hero card, above whatever the life is
     shouting about, and only ever one at a time. It does not compete for
     the three optional slots. */
  h+=coachCard();

  h+=shown.map(x=>x.html).join('');
  if(hidden>0)h+=`<div class="hsub dim" style="text-align:center;padding:2px 0 6px">
    ${hidden} more card${hidden>1?'s':''} hidden to keep this readable</div>`;

  h+=`<div class="card"><div class="ctrow"><div class="ct">Your story</div>
      <div class="hsub dim">most recent first</div></div>
    <div class="timeline">${recent.map(l=>l.t.startsWith('\u2014')
      ?`<div class="tyear">${esc(l.t.replace(/\u2014/g,'').trim())}</div>`
      :`<div class="tline ${l.k}"><span class="tdot"></span><div><div class="tt">${esc(l.t)}</div></div></div>`).join('')}
    </div>
    ${S.log.length>26?`<button class="showmore" onclick="S.logAll=!S.logAll;renderTab('life')">
      ${showAll?'Show less':'Show all '+S.log.length+' entries'}</button>`:''}</div>`;

  return h;
}
function viewActs(){
  const L=ACTS(), max=actionsPerYear();
  const groups={};
  L.forEach(a=>{ (groups[a.grp]=groups[a.grp]||[]).push(a); });

  const budget=`<div class="card"><div class="ctrow"><div class="ct">This year \u00b7 age ${S.age}</div>
      <button class="dicebtn" title="Do something at random" onclick="randomAct()">${DICE}</button></div>
    <div class="acthead"><div class="pips">${Array.from({length:max},(_,i)=>
      `<span class="pip ${i<S.actionsLeft?'on':''}"></span>`).join('')}</div>
      <div class="hsub">${S.actionsLeft} of ${max} action${max>1?'s':''} left</div></div></div>`;

  /* a section is open: show only that */
  if(S.section && groups[S.section]){
    const m=groupMeta(S.section);
    return `<div class="card secthead">
        <button class="backbtn" onclick="closeSection()">\u2039 All sections</button>
        <div class="secttitle">${m.i} ${esc(S.section)}</div>
        <div class="hsub dim">${esc(m.d)}</div>
        <div class="acthead" style="margin-top:9px"><div class="pips">${Array.from({length:max},(_,i)=>
          `<span class="pip ${i<S.actionsLeft?'on':''}"></span>`).join('')}</div>
          <div class="hsub">${S.actionsLeft} left</div></div>
      </div>
      <div class="card">${groups[S.section].map(a=>{
        const dm=diminish(a.id);
        return `<button class="row ${S.actionsLeft<=0?'spent':''} ${a.grp==='Crime'?'danger':''}" onclick="doAct('${a.id}')">
          <div><div class="rn">${esc(a.n)}</div>${a.d?`<div class="hsub dim">${esc(a.d)}</div>`:''}</div>
          ${dm<1?`<i class="dim2">${Math.round(dm*100)}%</i>`:'<i>\u203a</i>'}</button>`;}).join('')}</div>`;
  }

  /* otherwise: the hub */
  const names=Object.keys(groups).sort((a,b)=>groupMeta(a).o-groupMeta(b).o);
  return budget + `<div class="card"><div class="ct">What do you want to do?</div>
    <div class="hubgrid">${names.map(g=>{
      const m=groupMeta(g);
      return `<button class="hub ${g==='Crime'?'danger':''}" onclick="openSection('${g}')">
        <div class="hubi">${m.i}</div>
        <div class="hubn">${esc(g)}</div>
        <div class="hubc">${groups[g].length} option${groups[g].length>1?'s':''}</div>
      </button>`;}).join('')}</div>
    <div class="hsub dim mt">Repeating the same thing gives less each time. A varied life goes further.</div>
  </div>`;
}
function randomCrime(){
  if(S.actionsLeft<=0)return popupOK('No time left this year',
    `You have already filled this year. Press AGE UP to move to ${S.age+1}.`);
  const l=DATA.crimes.filter(c=>S.age>=c.minAge&&(!c.needJob||S.job));
  if(l.length)crimeConfirm(pick(l).id);
}
function crimeConfirm(id){
  if(S.actionsLeft<=0)return popupOK('No time left this year',
    `You have already filled this year. Press AGE UP to move to ${S.age+1}.`);
  const c=DATA.crimes.find(x=>x.id===id);
  confirmDo(c.n,`If you are caught you could serve up to ${c.sentence[1]} years in prison.`,()=>{
    S.actionsLeft--; noteAction('crime_'+id); doCrime(id); checkAch(); save(); renderAll(); });
}
function openPerson(id){ rememberScroll(); S.person=id; renderTab('ppl',false); }
function closePerson(){ S.person=null; renderTab('ppl',false); }
function personActions(n){
  return PERSON_ACTIONS.filter(a=>{
    if(a.rel!=='*'&&a.rel.split(',').indexOf(n.rel)<0)return false;
    if(a.min!=null&&n.age<a.min)return false;
    if(a.max!=null&&n.age>a.max)return false;
    if(a.id==='cheat'&&!S.npcs.some(x=>x.alive&&(x.rel==='partner'||x.rel==='spouse')))return false;
    return true;
  });
}
function doPersonAction(id,actId){
  const n=S.npcs.find(x=>x.id===id); if(!n||!n.alive)return;
  const a=PERSON_ACTIONS.find(x=>x.id===actId); if(!a)return;
  if(n.lastSeen===S.age&&a.id!=='cutoff')
    return popupOK('Already this year',`You have already spent time with ${n.name.split(' ')[0]} this year.`);
  if(a.cost&&!afford(a.cost))return;
  if(a.cost){ charge(a.cost); ledger('spend',a.n+' \u2014 '+n.name.split(' ')[0],a.cost); }
  n.lastSeen=S.age;
  n.mem=n.mem||[]; n.mem.push({a:S.age,t:a.id});
  let line='';
  try{ line=a.run(n)||''; }catch(e){ line='Nothing came of it.'; }
  if(n.cut){ n.rel='ex'; }
  popupOK(a.n,line);
  save(); renderAll();
}
function personPage(n){
  const P=personality(n.pers), o=n.own||{};
  const story=[o.job?('works as a '+o.job.toLowerCase()):null,
    o.married?('married'+(o.partner?' to '+esc(o.partner):'')):(o.partner?('seeing '+esc(o.partner)):null),
    o.kids?(o.kids+' child'+(o.kids>1?'ren':'')):null,
    o.edu>=3?'went to university':null,
    o.city?('living in '+esc(o.city)):null,
    o.retired?'retired':null].filter(Boolean);
  const acts=personActions(n);
  const spent=n.lastSeen===S.age;
  return `<div class="card secthead"><button class="backbtn" onclick="closePerson()">\u2039 Everyone</button>
      <div class="personhead"><div class="npcav">${avatarMini(n,54)}</div>
        <div><div class="secttitle">${esc(n.name)}</div>
        <div class="hsub dim">Your ${esc(n.rel)} \u00b7 ${n.age} \u00b7 ${P.n}</div></div></div>
      <div class="bt" style="margin-top:10px"><i class="${n.r>=70?'g':n.r>=40?'a':'r'}" style="width:${clamp(n.r)}%"></i></div>
      <div class="hsub dim" style="margin-top:4px">Relationship ${Math.round(n.r)}/100</div>
    </div>
    <div class="card"><div class="ct">Their life</div>
      <div class="hsub">${story.length?story.join(' \u00b7 '):'You do not know much about what they do.'}</div>
      ${(n.mem&&n.mem.length)?`<div class="hsub dim mt">You have shared ${n.mem.length} moment${n.mem.length>1?'s':''}.</div>`:''}
    </div>
    <div class="card"><div class="ct">What would you like to do?</div>
      ${spent?'<div class="hsub dim mb">You have already seen them this year.</div>':''}
      ${acts.map(a=>`<button class="row ${spent&&a.id!=='cutoff'?'spent':''}"
        onclick="doPersonAction('${n.id}','${a.id}')">
        <div><div class="rn">${esc(a.n)}</div>${a.d?`<div class="hsub dim">${esc(a.d)}</div>`:''}</div>
        <i class="price">${a.cost?money(a.cost):'\u203a'}</i></button>`).join('')}
    </div>`;
}
function viewPeople(){
  const live=S.npcs.filter(n=>n.alive);
  if(S.person){
    const n=live.find(x=>x.id===S.person);
    if(n)return personPage(n);
    S.person=null;
  }
  if(!live.length)return '<div class="card"><div class="ct">People</div><div class="muted">There is nobody left.</div></div>';
  const order=['spouse','partner','child','mother','father','sibling','friend','colleague','teacher','ex'];
  const groups={};
  live.forEach(n=>{ (groups[n.rel]=groups[n.rel]||[]).push(n); });
  const keys=Object.keys(groups).sort((a,b)=>{
    const ia=order.indexOf(a), ib=order.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  return keys.map(g=>`<div class="card"><div class="ct">${g}${groups[g].length>1?'s':''} \u00b7 ${groups[g].length}</div>
    ${groups[g].map(n=>`<button class="row" onclick="openPerson('${n.id}')">
      <div class="npcwho"><div class="npcav">${avatarMini(n,38)}</div>
        <div><div class="rn">${esc(n.name)}${n.lastSeen===S.age?' <span class="owned">seen</span>':''}</div>
        <div class="hsub dim">${n.age} \u00b7 ${personality(n.pers).n} \u00b7 ${Math.round(n.r)}/100${
          n.own&&n.own.job?' \u00b7 '+esc(n.own.job.toLowerCase()):''}</div></div></div>
      <i>\u203a</i></button>`).join('')}</div>`).join('');
}
function npcAct(id,what){
  const n=S.npcs.find(x=>x.id===id); if(!n)return;
  if(n.lastSeen===S.age)return popupOK('Already this year',
    `You have already spent time with ${n.name.split(' ')[0]} this year.`);
  n.lastSeen=S.age;
  const P=personality(n.pers);
  if(what==='talk'){ const d=Math.round(ri(3,10)*P.talk); n.r=clamp(n.r+d);
    n.mem.push({a:S.age,t:'talked'}); applyEff({happiness:2});
    popupOK('Conversation',`You spoke with ${n.name}. They are ${P.n.toLowerCase()}. Relationship +${d}.`); }
  if(what==='gift'){ if(!afford(300))return; charge(300); S.counters.gifts++; const d=ri(8,18); n.r=clamp(n.r+d); popupOK('Gift',`${n.name} appreciated it. +${d}.`); }
  if(what==='argue'){ const d=Math.round(ri(8,20)/P.forgive); n.r=clamp(n.r-d);
    n.mem.push({a:S.age,t:'argued'}); applyEff({happiness:-3});
    popupOK('Argument',`You argued with ${n.name}. \u2212${d}.`+(P.forgive<1?' They are not the forgiving type.':'')); }
  save(); renderAll();
}
const SHOP_MIN_AGE={Tech:8,Self:6,Health:10,Lifestyle:12,Vehicle:16,'Black market':14,Assets:18};
function openMoney(sec){ rememberScroll(); S.msection=sec; renderTab('money',false); }
function closeMoney(){ S.msection=null; renderTab('money',false); }

function moneyOverview(){
  const inc=ledgerTotal('income'), sp=ledgerTotal('spend');
  const L=S.ledger||{income:[],spend:[]};
  return `<div class="card"><div class="ct">Last year</div>
   <div class="budgetbar">
     <div><div class="hlbl">Income</div><div class="bgood">${money(inc)}</div></div>
     <div><div class="hlbl">Outgoings</div><div class="bbad">${money(sp)}</div></div>
     <div><div class="hlbl">Net</div><div class="${inc-sp>=0?'bgood':'bbad'}">${money(inc-sp)}</div></div>
   </div>
   ${(L.income.length||L.spend.length)?`<div class="ledger">
     ${L.income.map(x=>`<div class="lrow"><span>${esc(x.l)}</span><b class="bgood">+${money(x.a)}</b></div>`).join('')}
     ${L.spend.map(x=>`<div class="lrow"><span>${esc(x.l)}</span><b class="bbad">\u2212${money(x.a)}</b></div>`).join('')}
   </div>`:'<div class="hsub dim">Nothing recorded yet. Age up a year.</div>'}</div>
   ${S.age>=18?`<div class="card"><div class="ctrow"><div class="ct">How you live</div>
     <div class="hsub dim">${money(S.living||livingFloor())} a year</div></div>
     <div class="hsub dim">${
       (S.thrift||0)>0.3 ? 'You are deliberately living below what you earn.'
       : inc>0 && (S.living||0) > inc*0.6 ? 'Almost everything you earn goes on living the way you live.'
       : 'Your way of living creeps up with what you earn, unless you stop it.'}</div>
     <div class="bt"><i class="${inc>0&&(S.living||0)>inc*0.6?'r':inc>0&&(S.living||0)>inc*0.45?'a':'g'}"
       style="width:${Math.min(100,Math.round(inc>0?(S.living||0)/inc*100:20))}%"></i></div>
     <div class="hsub dim">${inc>0?Math.round((S.living||0)/inc*100):0}% of what came in last year</div>
     ${(S.living||0)>livingFloor()?`<div class="row mt"><button class="btn" onclick="gotoGroup('Money')">Live below your means</button></div>`:''}
   </div>`:''}
   <div class="card"><div class="ct">Where you stand</div>
   ${[['Cash',money(S.money)],['Savings',money(S.savings)],
      ['Crypto',money(cryptoValue())],
      ['Property',propertyEquity()?money(propertyEquity()):'\u2014'],
      ['Vehicles',vehicleValue()?money(vehicleValue()):'\u2014'],
      ['Business',businessValue()?money(businessValue()):'\u2014'],
      ['Other assets',assetValue()?money(assetValue()):'\u2014'],
      ['Debt','<span class="bad">'+money(S.debt)+'</span>'],
      ['Finance',financeTotal()?money(financeTotal())+'/yr':'\u2014'],
      ['Credit score',S.age>=18?Math.round(S.credit==null?600:S.credit)+' <small class="dim">'+creditBand(S.credit==null?600:S.credit).n+'</small>':'\u2014'],
      ['Net worth','<b>'+money(netWorth())+'</b>']]
     .map(([k,v])=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
}
function moneyBanking(){
  if(S.age<18)return '<div class="card"><div class="muted">Banking opens at 18.</div></div>';
  return `<div class="card"><div class="ct">Banking</div>
   <div class="kv"><span>Cash</span><b>${money(S.money)}</b></div>
   <div class="kv"><span>Savings (2.5%/yr)</span><b>${money(S.savings)}</b></div>
   <div class="kv"><span>Debt</span><b class="bad">${money(S.debt)}</b></div>
   <div class="kv"><span>Loans</span><b>${(S.loans&&S.loans.length)?S.loans.length+' active':'\u2014'}</b></div>
   <div class="grid3 mt">
     <button class="mini" onclick="fin('dep')">Save $5k</button>
     <button class="mini" onclick="fin('wd')">Withdraw $5k</button>
     <button class="mini" onclick="fin('debt')">Repay $5k</button>
   </div></div>
   <div class="card"><div class="ct">Investments</div>
   <div class="kv"><span>Crypto</span><b>${money(cryptoValue())} <small class="dim">@ ${money(S.crypto.price)}</small></b></div>
   <div class="grid3 mt">
     <button class="mini" onclick="fin('buyc')">Buy $2k crypto</button>
     <button class="mini" onclick="fin('sellc')">Sell all</button>
   </div></div>`;
}
function setJobFilter(v){ S.jobFilter=v; renderTab('money',true); }
function moneyCareers(){
  if(S.age<14)return `<div class="card"><div class="muted">You are ${S.age}. Part-time work opens at 14.</div></div>`;
  const q=(S.jobFilter||'').toLowerCase();
  const openOnly=S.jobOpenOnly;
  return `<div class="card"><div class="ct">Find work</div>
    <input class="search" placeholder="Search jobs, e.g. nurse or chef" value="${esc(S.jobFilter||'')}"
      oninput="setJobFilter(this.value)">
    <button class="row" onclick="S.jobOpenOnly=!S.jobOpenOnly;renderTab('money',true)" data-switch="${openOnly?'on':'off'}">
      <div class="rn">Only show jobs I can apply for</div><i>${openOnly?'\u2713':'\u25CB'}</i></button></div>
   <div class="card"><div class="ct">Careers</div>
   ${Object.keys(DATA.fieldNames).map(f=>{
      let js=DATA.jobs.filter(j=>j.field===f);
      if(q)js=js.filter(j=>j.t.toLowerCase().includes(q)||DATA.fieldNames[f].toLowerCase().includes(q));
      if(openOnly)js=js.filter(j=>!jobLocked(j));
      if(!js.length)return '';
      return `<div class="fieldhdr">${DATA.fieldNames[f]}</div>`+js.map(j=>{const lk=jobLocked(j);
        return `<button class="row ${lk?'locked':''}" ${lk?'':`onclick="applyJobId('${j.id}')"`}>
          <div><div class="rn">${esc(j.t)}</div><div class="hsub dim">${money(Math.round(j.pay*country().sal))}/yr${lk?' \u00b7 '+esc(lk):''}</div></div>
          <i>${lk?'\u1F512':'\u203a'}</i></button>`;}).join('');
    }).join('')}</div>`;
}
function moneyShop(cat){
  const min=SHOP_MIN_AGE[cat]||0;
  if(S.age<min)return `<div class="card"><div class="muted">Not available until you are ${min}.</div></div>`;
  return `<div class="card"><div class="ct">${esc(cat)}</div>
    <div class="hsub dim mb">${3-(S.buysThisYear||0)} purchase${3-(S.buysThisYear||0)===1?'':'s'} left this year</div>
    ${DATA.items.filter(i=>i.cat===cat&&!i.secret).map(i=>{const own=S.items.includes(i.id);
      return `<button class="row ${own?'locked':''}" ${own?'':`onclick="buy('${i.id}')"`}>
        <div><div class="rn">${esc(i.n)}${own?' <span class="owned">owned</span>':''}</div>
        <div class="hsub dim">${esc(i.d)}</div></div>
        <i class="price">${own?'\u2713':money(Math.round(i.c*(1+newsMod('prices'))))}</i></button>`;}).join('')}
    ${hasEgg('v8')&&cat==='Vehicle'?`<button class="row ${S.items.includes('v8car')?'locked':''}"
      ${S.items.includes('v8car')?'':'onclick="buyV8()"'}>
      <div><div class="rn">The V8${S.items.includes('v8car')?' <span class="owned">owned</span>':''}</div>
      <div class="hsub dim">The car from the garage.</div></div>
      <i class="price">${S.items.includes('v8car')?'\u2713':money(9000)}</i></button>`:''}</div>`;
}
function moneyProperty(){ return moneyPropertyMarket(); }
function setHome(id){
  const h=HOME(id), c=country();
  const income=S.job?S.job.pay:(S.savings>50000?40000:0);
  if(h.need>income&&h.id!=='parents')
    return popupOK('Refused',`${h.n} needs about ${money(Math.round(h.need*c.col))} a year of income. You have ${money(Math.round(income))}.`);
  const dep=Math.round(h.dep*c.col);
  if(dep>0&&!afford(dep))return;
  if(dep>0){ charge(dep); ledger('spend','Deposit on '+h.n.toLowerCase(),dep); }
  S.home=id; logLine(`You moved into ${h.n.toLowerCase()}.`);
  popupOK('Moved in',`${h.n}. ${dep>0?'Deposit of '+money(dep)+' paid.':''}`);
  save(); renderAll();
}
function setFood(id){ S.food=id; popupOK('Shopping',`You now ${FOODTIER(id).n.toLowerCase()}.`); save(); renderAll(); }
function toggleSub(id){
  S.subs=S.subs||{};
  const sub=SUB(id);
  if(S.subs[id]){
    S.subs[id]=false;
    let extra='';
    if(id==='utilities'){ S.flags.noUtilities=true; extra=' The heating goes off and the house gets cold.'; }
    if(id==='healthins')extra=' Medical bills will now cost you full price.';
    if(id==='homemaint')extra=' Your property will fall apart faster.';
    popupOK('Cancelled',`${sub.n} cancelled, saving ${money(Math.round(sub.cost*country().col))} a year.${extra}`);
  }
  else { S.subs[id]=true; if(id==='utilities')S.flags.noUtilities=false;
    popupOK('Started',`${sub.n} \u2014 about ${money(Math.round(sub.cost*country().col))} a year.`); }
  save(); renderAll();
}
function toggleAutopay(){
  S.autopay=!autopayOn();
  popupOK('Direct debit', S.autopay
    ? (autopayBounces()
        ? 'Set up. Your bills will go out automatically \u2014 but if the account is short on the day it will bounce, and the bank will charge you for it.'
        : 'Bills will be paid automatically.')
    : 'Cancelled. You will pay your bills yourself each year.');
  save(); renderAll();
}
function payBillsNow(){
  if(!(S.billsDue>0))return popupOK('Nothing due','Your bills are settled.');
  payBills(null,false); popupOK('Paid','Your bills are settled.'); save(); renderAll();
}
/* Settling the final notice is the whole point of the grace year, so it is
   its own button and it can be part-paid. */
function payOverdueNow(){
  if(!(S.overdue>0))return popupOK('Nothing overdue','You have no final notice outstanding.');
  const pay=Math.min(Math.max(0,S.money),S.overdue);
  if(pay<=0)return popupOK('No money','You have nothing to pay it with.');
  S.money-=pay; S.overdue-=pay; ledger('spend','Overdue bills',pay);
  if(S.overdue<=0){
    S.overdue=0; S.overdueItems=[];
    S.credit=Math.min(850,(S.credit==null?600:S.credit)+12);
    popupOK('Settled','The final notice is cleared. Nothing goes to collection.');
  } else {
    popupOK('Part paid',`${money(pay)} paid. ${money(S.overdue)} still owed before the year turns.`);
  }
  save(); renderAll();
}
function payArrears(){
  if(S.arrears<=0)return popupOK('Nothing owed','You are not in arrears.');
  const pay=Math.min(Math.max(0,S.money),S.arrears);
  if(pay<=0)return popupOK('No money','You have nothing to pay with.');
  S.money-=pay; S.arrears-=pay; ledger('spend','Arrears',pay);
  S.arrPaid=(S.arrPaid||0)+pay;          // any payment freezes this year's interest
  S.credit=Math.min(850,(S.credit==null?600:S.credit)+10);
  popupOK('Paid',S.arrears>0
    ? `${money(pay)} off your arrears. ${money(S.arrears)} remaining, and the interest is frozen this year.`
    : `${money(pay)} paid. Your arrears are cleared.`);
  save(); renderAll();
}
function applyCard(id){
  const def=CARD(id), sc=S.credit==null?600:S.credit;
  if((S.cards||[]).some(c=>c.id===id))return popupOK('You have one','You already hold that card.');
  if(sc<def.minScore)return popupOK('Declined',
    `${def.n} needs a score of ${def.minScore}. Yours is ${Math.round(sc)}.`);
  S.cards=S.cards||[]; S.cards.push({id:id,bal:0});
  S.credit=Math.max(300,sc-10);
  popupOK('Approved',`${def.n}, limit ${money(def.limit)} at ${Math.round(def.apr*100)}% APR.`);
  save(); renderAll();
}
function payCard(id,all){
  const cd=(S.cards||[]).find(c=>c.id===id); if(!cd||cd.bal<=0)return popupOK('Nothing owed','That card is clear.');
  const want=all?cd.bal:Math.min(cd.bal,Math.round(cd.bal*0.25)+50);
  const pay=Math.min(S.money,want);
  if(pay<=0)return popupOK('No money','You cannot pay anything towards it.');
  S.money-=pay; cd.bal-=pay; ledger('spend',CARD(id).n+' payment',pay);
  S.credit=Math.min(850,(S.credit==null?600:S.credit)+6);
  popupOK('Paid',`${money(pay)} off. ${money(cd.bal)} remaining.`); save(); renderAll();
}
function moneyLiving(){
  if(S.age<18)return '<div class="card"><div class="muted">You live with your family. This opens at 18.</div></div>';
  const c=country(), h=HOME(S.home), f=FOODTIER(S.food), people=householdSize(S);
  const items=billsFor(), total=items.reduce((n,x)=>n+x.a,0);
  const income=(S.job?Math.round(S.job.pay*0.77):Math.round(6500*c.col))
    + (S.businesses||[]).length*0 ;
  const gap=income-total;
  return `<div class="card"><div class="ctrow"><div class="ct">Your commitments</div>
      <div class="hsub dim">${money(total)}/yr</div></div>
    <div class="budgetbar">
      <div><div class="hlbl">Coming in</div><div class="bgood">${money(income)}</div></div>
      <div><div class="hlbl">Committed</div><div class="bbad">${money(total)}</div></div>
      <div><div class="hlbl">Left over</div><div class="${gap>=0?'bgood':'bbad'}">${money(gap)}</div></div>
    </div>
    ${gap<0?`<div class="hardnote" style="color:var(--r)">You are committed to ${money(-gap)} more than you earn. Cut something, or find better work.</div>`:''}
    ${items.map(x=>`<div class="lrow"><span>${esc(x.l)}</span><b>${money(x.a)}</b></div>`).join('')}
    <div class="kv mt"><span>Household</span><b>${people} ${people===1?'person':'people'} \u00b7 ${h.space} space${h.space===1?'':'s'}</b></div>
    ${S.billsDue>0?`<div class="hardnote">${money(S.billsDue)} due now</div>
      <button class="btn wide mt" onclick="payBillsNow()">Pay ${money(S.billsDue)}</button>`:''}
    ${S.overdue>0?`<div class="hardnote" style="color:var(--a)">Final notice \u2014 ${money(S.overdue)} from last year. Settle it before the year turns or it goes to collection.</div>
      <button class="btn wide mt" onclick="payOverdueNow()">Settle ${money(S.overdue)}</button>`:''}
    ${S.arrears>0?`<div class="hardnote" style="color:var(--r)">${money(S.arrears)} in arrears${S.arrPlan?` \u00b7 plan: ${money(S.arrPlan.amt)}/yr, interest frozen`:' \u00b7 growing 8% a year until you pay something'}</div>
      <button class="btn wide mt" onclick="payArrears()">Pay what you can</button>
      ${S.arrPlan
        ? `<button class="row mt" onclick="cancelArrPlan()"><div><div class="rn">Repayment plan</div>
             <div class="hsub dim">${money(S.arrPlan.amt)} a year \u00b7 interest frozen${S.arrPlan.missed?` \u00b7 ${S.arrPlan.missed} missed`:''}</div></div><i>\u2715</i></button>`
        : `<button class="row mt" onclick="startArrPlan()"><div><div class="rn">Agree a repayment plan</div>
             <div class="hsub dim">${money(arrPlanAmount())} a year and the interest stops</div></div><i>\u203a</i></button>`}`:''}
    <button class="row mt" onclick="toggleAutopay()" data-switch="${autopayOn()?'on':'off'}"><div><div class="rn">Direct debit</div>
      <div class="hsub dim">${autopayOn()
        ? (autopayBounces()?'On \u2014 but it bounces if the account is short':'On \u2014 bills settle themselves')
        : (autopayBounces()?'Off \u2014 arrange one, or pay each year yourself':'Off \u2014 you pay each year')}</div></div>
      <i>${autopayOn()?'\u2713':'\u25CB'}</i></button>
  </div>
  <div class="card"><div class="ct">Where you live</div>
    ${HOUSING.map(x=>{const cur=x.id===S.home, income=S.job?S.job.pay:0;
      const afford=x.need<=income||x.id==='parents';
      return `<button class="row ${cur?'locked':''}" ${cur?'':`onclick="setHome('${x.id}')"`}>
        <div><div class="rn">${esc(x.n)}${cur?' <span class="owned">current</span>':''}</div>
        <div class="hsub dim">${x.cost?money(Math.round(x.cost*c.col))+'/yr':'free'}${x.dep?' \u00b7 '+money(Math.round(x.dep*c.col))+' deposit':''}
        ${x.need?' \u00b7 needs '+money(Math.round(x.need*c.col))+' income':''}${afford?'':' \u00b7 <span class="bad">out of reach</span>'}</div></div>
        <i>${cur?'\u2713':'\u203a'}</i></button>`;}).join('')}
  </div>
  <div class="card"><div class="ct">How you eat</div>
    ${FOOD.map(x=>{const cur=x.id===S.food;
      return `<button class="row ${cur?'locked':''}" ${cur?'':`onclick="setFood('${x.id}')"`}>
        <div><div class="rn">${esc(x.n)}${cur?' <span class="owned">current</span>':''}</div>
        <div class="hsub dim">${money(Math.round(x.cost*c.col))}/yr \u00b7 Health ${x.health>0?'+':''}${x.health}, Happiness ${x.happy>0?'+':''}${x.happy}</div></div>
        <i>${cur?'\u2713':'\u203a'}</i></button>`;}).join('')}
  </div>
  ${[...new Set(SUBS.map(x=>x.cat))].map(cat=>`<div class="card"><div class="ct">${cat}</div>
    ${SUBS.filter(x=>x.cat===cat).map(x=>{const on=!!(S.subs||{})[x.id];
      return `<button class="row" onclick="toggleSub('${x.id}')" data-switch="${on?'on':'off'}">
        <div><div class="rn">${esc(x.n)}${on?' <span class="owned">active</span>':''}</div>
        <div class="hsub dim">${money(Math.round(x.cost*c.col))}/yr${x.d?' \u00b7 '+esc(x.d):''}</div></div>
        <i>${on?'\u2713':'\u25CB'}</i></button>`;}).join('')}</div>`).join('')}`;
}
function moneyCards(){
  if(S.age<18)return '<div class="card"><div class="muted">Credit opens at 18.</div></div>';
  const sc=Math.round(S.credit==null?600:S.credit), band=creditBand(sc);
  return `<div class="card"><div class="ct">Credit</div>
    <div class="budgetbar"><div><div class="hlbl">Score</div><div>${sc}</div></div>
      <div><div class="hlbl">Band</div><div>${band.n}</div></div>
      <div><div class="hlbl">Owed</div><div class="bbad">${money((S.cards||[]).reduce((n,c)=>n+c.bal,0))}</div></div></div>
    <div class="hsub dim">Paying on time lifts your score. Missing payments, debt and arrears drag it down.</div>
  </div>
  ${(S.cards||[]).length?`<div class="card"><div class="ct">Your cards</div>
    ${S.cards.map(cd=>{const def=CARD(cd.id);
      return `<div class="npc"><div class="npcline"><div><div class="rn">${esc(def.n)}</div>
        <div class="hsub dim">${money(cd.bal)} of ${money(def.limit)} \u00b7 ${Math.round(def.apr*100)}% APR</div></div></div>
        <div class="bt"><i class="${cd.bal/def.limit>0.8?'r':cd.bal/def.limit>0.4?'a':'g'}"
          style="width:${Math.min(100,Math.round(cd.bal/def.limit*100))}%"></i></div>
        <div class="nact"><button onclick="payCard('${cd.id}',false)">Pay some</button>
          <button onclick="payCard('${cd.id}',true)">Pay it off</button></div></div>`;}).join('')}</div>`:''}
  <div class="card"><div class="ct">Available to you</div>
    ${CARDS.map(def=>{const have=(S.cards||[]).some(c=>c.id===def.id), ok=sc>=def.minScore;
      return `<button class="row ${have||!ok?'locked':''}" ${(have||!ok)?'':`onclick="applyCard('${def.id}')"`}>
        <div><div class="rn">${esc(def.n)}${have?' <span class="owned">held</span>':''}</div>
        <div class="hsub dim">Needs ${def.minScore} \u00b7 ${money(def.limit)} limit \u00b7 ${Math.round(def.apr*100)}% APR${def.fee?' \u00b7 '+money(def.fee)+' a year':''}<br>${esc(def.perk)}</div></div>
        <i>${have?'\u2713':ok?'\u203a':'\u1F512'}</i></button>`;}).join('')}</div>`;
}

/* ---------------- PROPERTY MARKET ---------------- */
function propPrice(def){ return Math.round(def.base*country().col*(1+newsMod('property')/2)); }
function buyProperty(id,withMortgage){
  const def=PROP(id), price=propPrice(def);
  const sc=S.credit==null?600:S.credit, band=creditBand(sc);
  if(withMortgage){
    const income=S.job?S.job.pay:0;
    const maxLoan=Math.round(income*band.mult*1.6);
    const deposit=Math.round(price*0.15);
    if(price-deposit>maxLoan)
      return popupOK('Refused',`On ${money(income)} of income and a score of ${Math.round(sc)}, the most you can borrow is ${money(maxLoan)}. ${def.n} needs ${money(price-deposit)}.`);
    if(!afford(deposit))return;
    charge(deposit); ledger('spend','Deposit on '+def.n.toLowerCase(),deposit);
    S.properties.push({t:id,value:price,mortgage:price-deposit,rented:false,cond:ri(55,90),home:false});
    popupOK('Bought',`${def.n} for ${money(price)}. ${money(deposit)} deposit, ${money(price-deposit)} borrowed.`);
  } else {
    if(!afford(price))return;
    charge(price); ledger('spend','Bought '+def.n.toLowerCase(),price);
    S.properties.push({t:id,value:price,mortgage:0,rented:false,cond:ri(55,90),home:false});
    popupOK('Bought',`${def.n}, owned outright for ${money(price)}.`);
  }
  save(); renderAll();
}
function sellProperty(i){
  const pr=S.properties[i]; if(!pr)return; const def=PROP(pr.t);
  const net=Math.round(pr.value*(0.94+pr.cond/1000))-pr.mortgage;
  confirmDo('Sell '+def.n.toLowerCase()+'?',`You would clear about ${money(net)} after the mortgage and fees.`,()=>{
    S.money+=net; ledger('earn','Sold '+def.n.toLowerCase(),Math.max(0,net));
    const wasHome=pr.home; S.properties.splice(i,1);
    if(wasHome)S.home='room';
    popupOK('Sold',`${money(net)} in your account.`); save(); renderAll(); });
}
function toggleLet(i){ const pr=S.properties[i]; if(!pr)return;
  if(pr.home)return popupOK('You live there','You cannot let out the home you live in.');
  pr.rented=!pr.rented; popupOK(pr.rented?'Let out':'Empty',
    pr.rented?'Tenants move in next year.':'You have taken it off the market.'); save(); renderAll(); }
function makeHome(i){ const pr=S.properties[i]; if(!pr)return;
  S.properties.forEach(x=>x.home=false); pr.home=true; pr.rented=false;
  const match={bedsit:'studio',flat:'onebed',terrace:'terrace',semi:'family',detached:'large',estate:'luxury',farm:'family'};
  if(match[pr.t])S.home=match[pr.t];
  popupOK('Moved in',`You live in ${PROP(pr.t).n.toLowerCase()} now. No rent to pay.`); save(); renderAll(); }
function repairProperty(i){ const pr=S.properties[i]; if(!pr)return;
  const cost=Math.round(pr.value*0.04); if(!afford(cost))return;
  charge(cost); ledger('spend','Renovation',cost); pr.cond=clamp(pr.cond+ri(25,45));
  pr.value=Math.round(pr.value*1.03);
  popupOK('Renovated',`${condWord(pr.cond)} now, and worth a little more.`); save(); renderAll(); }

/* ---------------- VEHICLES ---------------- */
function vehPrice(def){ return Math.round(def.base*country().col); }
function buyVehicle(id){
  const def=VEH(id), price=vehPrice(def);
  if(def.licence&&!S.flags.licence)
    return popupOK('No licence','You need a driving licence first.');
  if(!afford(price))return;
  charge(price); ledger('spend','Bought '+def.n.toLowerCase(),price);
  S.vehicles.push({t:id,value:price,cond:ri(80,100)});
  popupOK('Bought',`${def.n} for ${money(price)}. Running costs about ${money(Math.round(def.run*country().col))} a year.`);
  save(); renderAll();
}
function sellVehicle(i){ const v=S.vehicles[i]; if(!v)return;
  const def=VEH(v.t), net=Math.round(v.value*(0.75+v.cond/400));
  confirmDo('Sell '+def.n.toLowerCase()+'?',`A dealer offers ${money(net)}.`,()=>{
    S.money+=net; ledger('earn','Sold '+def.n.toLowerCase(),net); S.vehicles.splice(i,1);
    popupOK('Sold',`${money(net)}.`); save(); renderAll(); }); }
function serviceVehicle(i){ const v=S.vehicles[i]; if(!v)return;
  const def=VEH(v.t), cost=Math.round(def.base*0.04*country().col);
  if(!afford(cost))return; charge(cost); ledger('spend','Service',cost);
  v.cond=clamp(v.cond+ri(25,40));
  popupOK('Serviced',`${def.n} is ${condWord(v.cond).toLowerCase()} again.`); save(); renderAll(); }

/* ---------------- BUSINESSES ---------------- */
function startBusiness(id){
  const def=BIZ(id), cost=Math.round(def.cost*country().col);
  if(S.age<18)return popupOK('Too young','You cannot register a business yet.');
  confirmDo('Start '+def.n.toLowerCase()+'?',
    `${money(cost)} to set up. It earns more the better your ${DATA.skills[def.skill].name} is, and it can fail.`,()=>{
    if(!afford(cost))return; charge(cost); ledger('spend','Started '+def.n.toLowerCase(),cost);
    S.businesses.push({t:id,value:cost,staff:1,ups:[],rep:50});
    S.flags.owns_business=true; S.counters.businesses++;
    logLine(`You started ${def.n.toLowerCase()}.`,'good');
    popupOK('Trading',`${def.n} is open. Hire people to grow it.`); save(); renderAll(); });
}
function hireStaff(i,n){
  const b=S.businesses[i]; if(!b)return; const def=BIZ(b.t);
  if(b.staff+n>def.maxStaff)return popupOK('No room',`${def.n} cannot support more than ${def.maxStaff}.`);
  const cost=Math.round(def.rev*0.12*n*country().col);
  if(!afford(cost))return; charge(cost); ledger('spend','Recruitment',cost);
  b.staff+=n; popupOK('Hired',`${b.staff} ${def.n_staff}${b.staff>1?'s':''} now.`); save(); renderAll();
}
function fireStaff(i){ const b=S.businesses[i]; if(!b||b.staff<=0)return;
  b.staff--; applyEff({reputation:-2}); popupOK('Let go','One fewer wage to pay.'); save(); renderAll(); }
function upgradeBusiness(i,upId){
  const b=S.businesses[i]; if(!b)return;
  const up=BIZ_UPGRADES.find(u=>u.id===upId);
  if((b.ups||[]).includes(upId))return popupOK('Already done','You have already done that.');
  const cost=Math.round(b.value*up.cost);
  if(!afford(cost))return; charge(cost); ledger('spend',up.n,cost);
  b.ups=b.ups||[]; b.ups.push(upId); b.value=Math.round(b.value*1.08);
  popupOK(up.n,`Done. Revenue should rise by about ${Math.round(up.rev*100)}%.`); save(); renderAll();
}
function sellBusiness(i){
  const b=S.businesses[i]; if(!b)return; const def=BIZ(b.t);
  const offer=Math.round(b.value*(1.1+R()*0.8));
  confirmDo('Sell '+def.n.toLowerCase()+'?',`A buyer offers ${money(offer)}.`,()=>{
    S.money+=offer; ledger('earn','Sold '+def.n.toLowerCase(),offer);
    S.businesses.splice(i,1); S.flags.owns_business=(S.businesses||[]).length>0;
    popupOK('Sold',`${money(offer)}.`); save(); renderAll(); });
}
function moneyPropertyMarket(){
  const owned=(S.properties||[]);
  return `<div class="card"><div class="ct">What you own</div>
    ${owned.length?owned.map((pr,i)=>{const def=PROP(pr.t);
      return `<div class="npc"><div class="npcline"><div><div class="rn">${esc(def.n)}${pr.home?' <span class="owned">your home</span>':pr.rented?' <span class="owned">let</span>':''}</div>
        <div class="hsub dim">${money(pr.value)}${pr.mortgage?' \u00b7 '+money(pr.mortgage)+' owed':' \u00b7 owned outright'} \u00b7 ${condWord(pr.cond)}</div></div></div>
        <div class="bt"><i class="${pr.cond>65?'g':pr.cond>40?'a':'r'}" style="width:${Math.round(pr.cond)}%"></i></div>
        <div class="nact">
          ${pr.home?'':`<button onclick="toggleLet(${i})">${pr.rented?'Stop letting':'Let it out'}</button>`}
          ${pr.home?'':`<button onclick="makeHome(${i})">Move in</button>`}
          <button onclick="repairProperty(${i})">Renovate</button>
          <button onclick="sellProperty(${i})">Sell</button></div></div>`;}).join('')
      :'<div class="hsub dim">You do not own any property.</div>'}</div>
    <div class="card"><div class="ct">Looking to buy?</div>
      <button class="row" onclick="openMoney('mkt_property')"><div><div class="rn">Go to the property market</div>
      <div class="hsub dim">Individual places for sale this year</div></div><i>\u203a</i></button></div>`;
}
function moneyVehicles(){
  const owned=(S.vehicles||[]);
  return `<div class="card"><div class="ct">Your vehicles</div>
    ${owned.length?owned.map((v,i)=>{const def=VEH(v.t);
      return `<div class="npc"><div class="npcline"><div><div class="rn">${esc(def.n)}</div>
        <div class="hsub dim">${money(v.value)} \u00b7 ${condWord(v.cond)} \u00b7 ${money(Math.round(def.run*country().col))}/yr</div></div></div>
        <div class="bt"><i class="${v.cond>65?'g':v.cond>40?'a':'r'}" style="width:${Math.round(v.cond)}%"></i></div>
        <div class="nact"><button onclick="serviceVehicle(${i})">Service</button>
          <button onclick="sellVehicle(${i})">Sell</button></div></div>`;}).join('')
      :'<div class="hsub dim">You do not own a vehicle.</div>'}
    ${!S.flags.licence?'<div class="hardnote">You have no driving licence, so most of these are out of reach.</div>':''}</div>
    <div class="card"><div class="ct">Looking to buy?</div>
      <button class="row" onclick="openMoney('mkt_vehicle')"><div><div class="rn">Go to the vehicle market</div>
      <div class="hsub dim">What is actually for sale this year</div></div><i>\u203a</i></button></div>`;
}
function moneyBusinesses(){
  const owned=(S.businesses||[]);
  return `<div class="card"><div class="ct">Your businesses</div>
    ${owned.length?owned.map((b,i)=>{const def=BIZ(b.t);
      return `<div class="npc"><div class="npcline"><div><div class="rn">${esc(def.n)}</div>
        <div class="hsub dim">Worth ${money(b.value)} \u00b7 ${b.staff}/${def.maxStaff} staff \u00b7 runs on ${DATA.skills[def.skill].name}</div></div></div>
        ${(b.ups||[]).length?`<div class="hsub dim">Improvements: ${b.ups.map(u=>esc((BIZ_UPGRADES.find(x=>x.id===u)||{}).n||u)).join(', ')}</div>`:''}
        <div class="nact"><button onclick="hireStaff(${i},1)">Hire</button>
          <button onclick="fireStaff(${i})">Let one go</button>
          <button onclick="sellBusiness(${i})">Sell</button></div>
        <div class="nact">${BIZ_UPGRADES.filter(u=>!(b.ups||[]).includes(u.id)).map(u=>
          `<button onclick="upgradeBusiness(${i},'${u.id}')">${esc(u.n)}</button>`).join('')}</div>
      </div>`;}).join('') :'<div class="hsub dim">You do not own a business.</div>'}</div>
    <div class="card"><div class="ct">Start something</div>
    ${BUSINESSES.map(def=>`<button class="row" onclick="startBusiness('${def.id}')">
      <div><div class="rn">${esc(def.n)}</div>
      <div class="hsub dim">${money(Math.round(def.cost*country().col))} to start \u00b7 up to ${def.maxStaff} staff \u00b7 needs ${DATA.skills[def.skill].name}</div></div>
      <i>\u203a</i></button>`).join('')}</div>`;
}
/* ---------------- THE MARKET ---------------- */
function marketRefresh(force){
  if(!S.market)S.market={year:-1,vehicle:[],property:[],item:[]};
  if(!force && S.market.year===S.age) return;
  const col=country().col, rnd=R, ri2=ri;
  const pickN=(arr,n)=>{ const c=arr.slice().sort(()=>rnd()-0.5); return c.slice(0,n); };
  S.market.vehicle = pickN(VEHICLES, 6).map(d=>makeVehicleListing(d,rnd,ri2,col));
  S.market.property = pickN(PROPERTY_TYPES, 5).map(d=>makePropertyListing(d,rnd,ri2,col));
  S.market.item = pickN(DATA.items.filter(i=>!i.secret), 8).map(d=>makeItemListing(d,rnd,ri2,col));
  S.market.year = S.age;
  S.market.sold = [];
}
function listingName(l){
  if(l.kind==='vehicle'){ const d=VEH(l.t);
    return `${l.age===0?'New':(new Date().getFullYear()-l.age)} ${d.n.replace(/^An? /,'')}`; }
  if(l.kind==='property')return PROP(l.t).n;
  return (DATA.items.find(i=>i.id===l.t)||{n:l.t}).n;
}
function listingDetail(l){
  const m=MOTIVES.find(x=>x.id===l.motive)||MOTIVES[0];
  const bits=[];
  if(l.kind==='vehicle'){
    bits.push(`${l.miles.toLocaleString()} miles`, l.colour, condWord(l.cond).toLowerCase());
    if(l.warranty)bits.push('warranty');
  } else if(l.kind==='property'){
    bits.push(esc(l.addr), condWord(l.cond).toLowerCase());
    if(l.needsWork)bits.push('needs work');
    if(l.tenant)bits.push('tenant in place');
  } else {
    bits.push(l.used?('used \u00b7 '+condWord(l.cond).toLowerCase()):'new');
  }
  bits.push(SELLER(l.seller).n.toLowerCase());
  return bits.join(' \u00b7 ') + (m.n?` \u2014 ${m.n.toLowerCase()}`:'');
}
function openListing(id){ rememberScroll(); S.listing=id; renderTab('money',false); }
function closeListing(){ S.listing=null; renderTab('money',false); }
function findListing(id){
  if(!S.market)return null;
  return ['vehicle','property','item'].map(k=>(S.market[k]||[]).find(l=>l.id===id)).find(Boolean);
}
function removeListing(id){
  ['vehicle','property','item'].forEach(k=>{
    S.market[k]=(S.market[k]||[]).filter(l=>l.id!==id);
  });
}
function makeOffer(id,pctBelow){
  const l=findListing(id); if(!l)return;
  const offer=Math.round(l.ask*(1-pctBelow));
  const o=haggleOutcome(l,offer,S.skills.charisma||0,S.skills.business||0,R);
  if(o.result==='accept'){ l.price=o.price; l.agreed=true;
    popupOK('Agreed',`They will take ${money(o.price)}.`); }
  else if(o.result==='counter'){ l.price=o.price; l.countered=true;
    popupOK('They came back',`They will not go that low, but they would take ${money(o.price)}.`); }
  else if(o.result==='insulted'){ removeListing(id); S.listing=null;
    popupOK('They have withdrawn it','They took the offer badly and have taken it off the market.'); }
  else { l.haggleFailed=true; popupOK('No',`They are holding at ${money(l.ask)}.`); }
  save(); renderAll();
}
function financeTick(out){
  S.finance=(S.finance||[]).filter(f=>{
    const pay=f.annual;
    if(S.money>=pay){ S.money-=pay; f.left--; ledger('spend',f.l+' instalment',pay);
      S.credit=Math.min(850,(S.credit==null?600:S.credit)+3); }
    else { const onCard=chargeToCard(pay);
      if(onCard<pay){ S.arrears+=(pay-onCard); S.credit=Math.max(300,(S.credit==null?600:S.credit)-45);
        out.push(`You missed an instalment on ${f.l}.`); } else f.left--;
    }
    if(f.left<=0){ out.push(`${f.l} is paid off.`); return false; }
    return true;
  });
}
function financeTotal(){ return (S.finance||[]).reduce((n,f)=>n+f.annual,0); }
function buyListing(id,method){
  const l=findListing(id); if(!l)return;
  const price=l.price;
  if(method==='cash'){
    if(!afford(price))return;
    charge(price); ledger('spend','Bought '+listingName(l),price);
  } else {
    const sc=S.credit==null?600:S.credit, band=creditBand(sc);
    if(sc<560)return popupOK('Declined','No lender will finance this for you at your credit score.');
    const deposit=Math.round(price*0.15);
    if(!afford(deposit))return;
    const term=l.kind==='property'?25:l.kind==='vehicle'?5:2;
    const principal=price-deposit;
    const annual=Math.round(principal*(1/term + band.rate));
    const income=S.job?S.job.pay:Math.round(6500*country().col);
    if(annual+financeTotal() > income*0.45)
      return popupOK('Declined',`The repayments would be ${money(annual)} a year on top of ${money(financeTotal())} you already owe. They will not lend it.`);
    charge(deposit); ledger('spend','Deposit on '+listingName(l),deposit);
    S.finance=S.finance||[];
    S.finance.push({l:listingName(l),annual:annual,left:term,principal:principal});
  }
  if(l.kind==='vehicle')S.vehicles.push({t:l.t,value:Math.round(price*0.92),cond:l.cond,warranty:!!l.warranty});
  if(l.kind==='property')S.properties.push({t:l.t,value:price,mortgage:0,rented:!!l.tenant,cond:l.cond,home:false});
  if(l.kind==='item'){ const it=DATA.items.find(i=>i.id===l.t);
    if(it&&it.cat==='Assets'){ S.assets=S.assets||[]; S.assets.push({id:it.id,value:price}); }
    else if(!S.items.includes(l.t))S.items.push(l.t);
    if(it&&it.once)applyEff(it.once);
  }
  removeListing(id); S.listing=null;
  popupOK('Bought',`${listingName(l)} for ${money(price)}${method==='finance'?', on finance':''}.`);
  save(); renderAll();
}
function listingPage(l){
  const canFin=l.kind!=='item'||l.price>2000;
  const m=MOTIVES.find(x=>x.id===l.motive)||MOTIVES[0];
  return `<div class="card secthead"><button class="backbtn" onclick="closeListing()">\u2039 Back to the market</button>
      <div class="secttitle">${esc(listingName(l))}</div>
      <div class="hsub dim">${listingDetail(l)}</div>
      <div class="budgetbar"><div><div class="hlbl">Asking</div><div>${money(l.ask)}</div></div>
        ${l.price!==l.ask?`<div><div class="hlbl">Agreed</div><div class="bgood">${money(l.price)}</div></div>`:''}
        <div><div class="hlbl">Condition</div><div>${condWord(l.cond)}</div></div></div>
      ${m.n?`<div class="hsub">${esc(m.n)}.</div>`:''}
      <div class="hsub dim">${esc(SELLER(l.seller).d)}</div>
    </div>
    ${(!l.agreed&&!l.haggleFailed)?`<div class="card"><div class="ct">Make an offer</div>
      <div class="hsub dim mb">Offer too little and they may take it off the market.</div>
      ${[0.05,0.12,0.22,0.35].map(p=>`<button class="row" onclick="makeOffer('${l.id}',${p})">
        <div><div class="rn">Offer ${money(Math.round(l.ask*(1-p)))}</div>
        <div class="hsub dim">${Math.round(p*100)}% below asking</div></div><i>\u203a</i></button>`).join('')}
    </div>`:''}
    <div class="card"><div class="ct">Buy it</div>
      <button class="row" onclick="buyListing('${l.id}','cash')">
        <div><div class="rn">Pay in full</div><div class="hsub dim">${money(l.price)} now</div></div><i>\u203a</i></button>
      ${canFin?`<button class="row" onclick="buyListing('${l.id}','finance')">
        <div><div class="rn">Buy on finance</div>
        <div class="hsub dim">15% deposit, then yearly instalments. Your credit decides the rate.</div></div><i>\u203a</i></button>`:''}
    </div>`;
}
function marketView(kind,title){
  marketRefresh();
  if(S.listing){ const l=findListing(S.listing); if(l)return listingPage(l); S.listing=null; }
  const list=(S.market[kind]||[]);
  const owned = kind==='vehicle'?(S.vehicles||[]).length : kind==='property'?(S.properties||[]).length : 0;
  return `<div class="card"><div class="ctrow"><div class="ct">${esc(title)} \u00b7 this year</div>
      <div class="hsub dim">${list.length} available</div></div>
    <div class="hsub dim mb">What is for sale changes every year. If you do not take it, somebody else will.</div>
    ${list.length?list.map(l=>`<button class="row" onclick="openListing('${l.id}')">
      <div><div class="rn">${esc(listingName(l))}</div>
      <div class="hsub dim">${listingDetail(l)}</div></div>
      <i class="price">${money(l.price)}</i></button>`).join('')
      :'<div class="hsub dim">Nothing for sale this year.</div>'}
    ${financeTotal()?`<div class="hardnote">You are already paying ${money(financeTotal())} a year on finance.</div>`:''}
  </div>`;
}
function viewMoney(){
  const cats=[...new Set(DATA.items.filter(i=>!i.secret).map(i=>i.cat))];
  if(S.msection){
    const sec=S.msection;
    const body = sec==='overview'?moneyOverview() : sec==='bank'?moneyBanking()
      : sec==='careers'?moneyCareers() : sec==='property'?moneyProperty()
      : sec==='living'?moneyLiving() : sec==='cards'?moneyCards()
      : sec==='estate'?(moneyPropertyMarket()) : sec==='vehicles'?(moneyVehicles())
      : sec==='mkt_vehicle'?marketView('vehicle','Vehicles for sale')
      : sec==='mkt_property'?marketView('property','Property for sale')
      : sec==='mkt_item'?marketView('item','Things for sale')
      : sec==='biz'?moneyBusinesses()
      : sec==='will'?willView()
      : sec==='invest'?moneyInvest()
      : sec.indexOf('shop:')===0?moneyShop(sec.slice(5)) : moneyOverview();
    const title = sec==='overview'?'Budget' : sec==='bank'?'Banking' : sec==='careers'?'Careers'
      : sec==='property'?'Property' : sec==='living'?'Living costs' : sec==='cards'?'Credit'
      : sec==='estate'?'Your property' : sec==='vehicles'?'Your vehicles' : sec==='biz'?'Businesses'
      : sec==='will'?'Your will' : sec==='invest'?'Investments'
      : sec==='mkt_vehicle'?'Vehicle market' : sec==='mkt_property'?'Property market' : sec==='mkt_item'?'Marketplace'
      : sec.slice(5);
    return `<div class="card secthead"><button class="backbtn" onclick="closeMoney()">\u2039 Money</button>
      <div class="secttitle">${esc(title)}</div></div>` + body;
  }
  const tiles=[['overview','\u25A6','Budget','In, out and net worth'],
               ['living','\u2302','Living costs','Home, food, bills, subscriptions'],
               ['cards','\u25A4','Credit','Score, cards and balances'],
               ['bank','\u00A4','Banking','Savings, debt, investments'],
               ['careers','\u25B2','Careers','Every job and what it needs'],
               ['mkt_property','\u2302','Property market','Individual places, haggle and finance'],
               ['mkt_vehicle','\u25B6','Vehicle market','Real cars with real mileage'],
               ['mkt_item','\u25CF','Marketplace','New and secondhand goods'],
               ['estate','\u229E','Your property','Let, renovate and sell'],
               ['vehicles','\u229F','Your vehicles','Service and sell'],
               ['biz','\u25A3','Businesses','Start, staff, upgrade and sell'],
               ['invest','\u25CE','Investments','Shares, bonds, gold and what they do'],
               ['will','\u25C8','Your will','Who gets what, and what it costs them']]
    .concat(cats.map(c=>['shop:'+c,'\u25CF',c,'Shop']));
  return `<div class="card"><div class="ctrow"><div class="ct">Money</div>
      <div class="hsub dim">${money(S.money)}</div></div>
    <div class="hubgrid">${tiles.map(([id,ic,n,d])=>
      `<button class="hub" onclick="openMoney('${id}')"><div class="hubi">${ic}</div>
        <div class="hubn">${esc(n)}</div><div class="hubc">${esc(d)}</div></button>`).join('')}</div></div>`;
}
function applyJobId(id){ applyJob(DATA.jobs.find(x=>x.id===id)); save(); renderAll(); }
function buy(id){
  const it=DATA.items.find(i=>i.id===id);
  if(!it)return;
  const minAge=SHOP_MIN_AGE[it.cat]||0;
  if(S.age<minAge)return popupOK('Too young',`You cannot buy that until you are ${minAge}.`);
  if(S.buysThisYear==null)S.buysThisYear=0;
  if(S.buysThisYear>=3)return popupOK('Enough for one year','You have already done your shopping this year.');
  const price=Math.round(it.c*(1+newsMod('prices')));
  if(!afford(price))return;
  charge(price);
  ledger('spend','Bought '+it.n,price);
  if(it.cat==='Assets'){ S.assets=S.assets||[]; S.assets.push({id:it.id,value:it.c}); }
  else if(!S.items.includes(id)) S.items.push(id);
  if(it.once)applyEff(it.once);
  S.buysThisYear++;
  popupOK('Purchased',`You bought a ${it.n} for ${money(price)}.`);
  checkAch(); save(); renderAll();
}
function buyV8(){
  if(!afford(9000))return; charge(9000); ledger('spend','The V8',9000);
  if(!S.items.includes('v8car'))S.items.push('v8car');
  popupOK('The V8','It still smells of somebody else\u2019s life.');
  save(); renderAll();
}
function fin(w){
  if(S.age<18)return popupOK('Too young','You need to be 18 to use banking and investments.');
  if(w==='dep'){ if(!afford(5000))return; charge(5000);S.savings+=5000; }
  if(w==='wd'){ const a=Math.min(5000,S.savings); S.savings-=a;S.money+=a; }
  if(w==='buyc'){ if(!afford(2000))return; charge(2000);S.crypto.units+=2000/S.crypto.price;S.counters.cryptoProfit-=2000;S.flags.holds_crypto=true; }
  if(w==='sellc'){ const v=Math.round(cryptoValue()); S.money+=v;S.counters.cryptoProfit+=v;S.crypto.units=0;S.flags.holds_crypto=false; popupOK('Sold',`You sold your crypto for ${money(v)}.`); }
  if(w==='debt'){ const a=Math.min(5000,S.debt,S.money); S.money-=a;S.debt-=a;S.counters.debtCleared+=a; }
  if(w==='buyp'){ setTab('money'); openMoney('estate'); return; }
  checkAch(); save(); renderAll();
}
function gotoGroup(g){
  setTab('act'); S.jumpGroup=g; renderTab('act');
  setTimeout(()=>{ const el=document.getElementById('grp-'+g);
    if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth',block:'start'}); },40);
}
function setMore(v){ S.moreView=v; renderTab('more'); }
function viewMore(){
  const v=S.moreView||'stats';
  const seg=`<div class="seg">${[['stats','Stats'],['ach','Awards'],['goals','Goals'],['rec','Records'],['save','Saves'],['shop','Shop']]
    .map(([k,l])=>`<button class="${v===k?'on':''}" onclick="setMore('${k}')">${l}</button>`).join('')}</div>`;
  return seg+({ach:viewAch,chal:viewChal,goals:viewGoals,rec:viewRec,save:viewSaves,shop:viewShop,plus:viewShop}[v]||viewStats)();
}
function viewAch(){
  const un=Object.keys(META.ach).length, tot=ACHIEVEMENTS.length;
  const pts=ACHIEVEMENTS.filter(a=>META.ach[a.id]).reduce((n,a)=>n+a.p,0);
  let h=`<div class="card"><div class="achhead"><div><b>${un}</b> / ${tot} unlocked</div><div class="pts">${pts} LP</div></div>
    <div class="bt big"><i class="g" style="width:${Math.round(un/tot*100)}%"></i></div></div>`;
  ACH_CATS.forEach(cat=>{
    const l=ACHIEVEMENTS.filter(a=>a.c===cat), got=l.filter(a=>META.ach[a.id]).length;
    h+=`<div class="card"><div class="ct">${cat} — ${got}/${l.length}</div>`;
    l.forEach(a=>{ const done=!!META.ach[a.id], hide=a.hidden&&!done, gated=a.hard&&!done&&diffRank()<2;
      h+=`<div class="achrow ${done?'done':''}"><div class="achmedal t${a.t} ${done?'':'off'}">${a.t===4?'★':a.t===3?'◆':a.t===2?'▲':'●'}</div>
        <div class="achtx"><div class="rn">${hide?'Hidden achievement':esc(a.n)}</div>
        <div class="hsub dim">${hide?'Keep playing to reveal.':esc(a.d)}${done?` · <span class="ok">age ${META.ach[a.id].age}</span>`:''}${gated?' · <span class="hardonly">Hard+ only</span>':''}</div></div>
        <div class="pts">${a.p}</div></div>`; });
    h+='</div>';
  });
  return h;
}
function viewChal(){
  return `<div class="card"><div class="ct">Challenges · ${META.lp} Legacy Points</div>
  <div class="hsub dim mb">Progress shown for your current life. Completion is permanent.</div>
  ${CHALLENGES.map(c=>{const d=!!META.done[c.id],pr=d?1:chProgress(c);
    return `<div class="chal ${d?'done':''}"><div class="npcline"><div><div class="rn">${d?'✓ ':''}${esc(c.n)}</div>
      <div class="hsub dim">${esc(c.d)}</div></div><span class="pts">${c.p}</span></div>
      <div class="bt"><i class="${d?'g':'a'}" style="width:${Math.round(pr*100)}%"></i></div></div>`;}).join('')}</div>`;
}
function viewRec(){
  return `<div class="card"><div class="ct">Lifetime records</div>
  <div class="hsub dim mb">Best result across all ${META.lives} lives.</div>
  ${RECORDS.map(r=>`<div class="kv"><span>${esc(r.n)}</span><b>${META.rec[r.id]!=null?r.fmt(META.rec[r.id]):'—'}</b></div>`).join('')}</div>
  <div class="card"><div class="ct">Totals</div>
  ${[['Lives played',META.lives],['Legacy Points',META.lp],
     ['Achievements',Object.keys(META.ach).length+' / '+ACHIEVEMENTS.length],
     ['Challenges',Object.keys(META.done).length+' / '+CHALLENGES.length],
     ['Countries lived in',Object.keys(META.countriesPlayed).length+' / '+DATA.countries.length]]
    .map(([k,v])=>`<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
}
function buyPerk(id){
  const p=PERK(id); if(!p)return;
  if(p.kind==='forever'&&META.perks[id])return popupOK('Already yours','You own that permanently.');
  if(p.kind==='life'&&(S.perksUsed||[]).includes(id))return popupOK('Already used','You have used that this life.');
  if(META.lp<p.cost)return popupOK('Not enough Legacy Points',
    `${p.n} costs ${p.cost} LP. You have ${META.lp}.`);
  confirmDo(p.n,`${p.d}\n\nThis costs ${p.cost} Legacy Points. You have ${META.lp}.`,()=>{
    META.lp-=p.cost;
    if(p.kind==='forever'){ META.perks[id]=true; saveMeta();
      popupOK(p.n,'Bought. It applies to this life and every life after it.'); renderAll(); return; }
    saveMeta();
    S.perksUsed=S.perksUsed||[]; S.perksUsed.push(id);
    if(id==='windfall'){ S.money+=25000; ledger('earn','A stroke of luck',25000); popupOK(p.n,'$25,000 arrived.'); }
    if(id==='secondwind'){ S.stats.health=Math.max(85,S.stats.health);
      if(S.conditions.length)S.conditions.shift();
      popupOK(p.n,'You feel like yourself again.'); }
    if(id==='headstart'){ chooseFrom('Which skill?',Object.keys(DATA.skills).map(k=>[DATA.skills[k].name,'',k]),
      (name,k)=>{ S.skills[k]=Math.max(50,S.skills[k]||0); popupOK(name,`You already know your way around. ${name} 50.`); }); }
    if(id==='cleanslate'){ S.record.forEach(r=>r.spent=true); popupOK(p.n,'Your record is spent.'); }
    if(id==='goodyear'){ S.charmedUntil=S.age+5; popupOK(p.n,'Things will go your way for a while.'); }
    if(id==='reputation'){ S.stats.reputation=Math.max(75,S.stats.reputation); popupOK(p.n,'People speak well of you.'); }
    if(id==='debtwipe'){ S.arrears=0; S.overdue=0; S.overdueItems=[]; S.arrPlan=null; (S.cards||[]).forEach(c=>c.bal=0); popupOK(p.n,'Settled.'); }
    save(); renderAll();
  });
}
function viewShop(){
  const lifePerks=PERKS.filter(p=>p.kind==='life'), forever=PERKS.filter(p=>p.kind==='forever');
  return `<div class="card plushero ${isPlus()?'on':''}">
      <div class="ct">Legacy Points</div>
      <div class="ph">${META.lp.toLocaleString()} LP</div>
      <div class="pb">Earned by achievements, challenges and goals. Spend them on advantages
        for this life, or on permanent ones that apply to every life you play from now on.</div>
    </div>
    <div class="card"><div class="ct">This life only</div>
      <div class="hsub dim mb">Used once, on the character you are playing now.</div>
      ${lifePerks.map(p=>{const used=(S.perksUsed||[]).includes(p.id), can=META.lp>=p.cost;
        return `<button class="row ${used?'locked':''}" ${used?'':`onclick="buyPerk('${p.id}')"`}>
          <div><div class="rn">${esc(p.n)}${used?' <span class="owned">used</span>':''}</div>
          <div class="hsub dim">${esc(p.d)}</div></div>
          <i class="price ${can?'':'dim2'}">${p.cost} LP</i></button>`;}).join('')}
    </div>
    <div class="card"><div class="ct">Every life from now on</div>
      <div class="hsub dim mb">Bought once, kept for ever.</div>
      ${forever.map(p=>{const own=!!META.perks[p.id], can=META.lp>=p.cost;
        return `<button class="row ${own?'locked':''}" ${own?'':`onclick="buyPerk('${p.id}')"`}>
          <div><div class="rn">${esc(p.n)}${own?' <span class="owned">owned</span>':''}</div>
          <div class="hsub dim">${esc(p.d)}</div></div>
          <i class="price ${can||own?'':'dim2'}">${own?'\u2713':p.cost+' LP'}</i></button>`;}).join('')}
    </div>
    ${viewPlus()}`;
}
function viewGoals(){
  const gs=(S.goals||[]).map(g=>({g,def:GOAL_POOL.find(x=>x.id===g.id)})).filter(x=>x.def);
  return `<div class="card"><div class="ct">This life\u2019s goals</div>
    <div class="hsub dim mb">Three drawn when you were born. New ones every life.</div>
    ${gs.map(({g,def})=>`<div class="chal ${g.done?'done':''}">
      <div class="npcline"><div><div class="rn">${g.done?'\u2713 ':''}${esc(def.n)}</div></div>
        <span class="pts">${def.lp} LP</span></div></div>`).join('')}
    <div class="hsub dim mt">Goals are per life. Achievements and challenges are permanent.</div>
  </div>` + viewChal();
}
function viewPlus(){
  const on=isPlus();
  const FREE=['Every event, country, career, skill and challenge','Full generational play and heirs',
    'All four difficulties','Achievements, Legacy Points and records','Autosave and one save slot',
    'Local backup to a file','Completely offline','One Second Chance per life'];
  const PLUS=['No advertisements, ever','Fate Control \u2014 adjust your own stats',
    'Rewind \u2014 undo the year you just lived','Custom difficulty with all twelve sliders',
    'Three save slots and cloud sync','A 10% Legacy Point bonus','Early access to new event packs'];
  return `<div class="card plushero ${on?'on':''}">
    <div class="ct">Bequest Plus</div>
    <div class="ph">${on?'You have Plus':'Support the game, keep it fair'}</div>
    <div class="pb">Everything that is <b>content</b> is free forever. Plus buys convenience,
      never advantage in a story.</div>
    ${on?`<div class="hardnote">\u2713 Active${META.premium.lifetime?' \u00b7 Lifetime':''}</div>`:`
    <div class="prices">
      <button class="pricecard" onclick="buyPlus('monthly')"><b>$2.99</b><span>per month</span></button>
      <button class="pricecard best" onclick="buyPlus('yearly')"><b>$14.99</b><span>per year</span>
        <i>7-day trial \u00b7 save 58%</i></button>
      <button class="pricecard" onclick="buyPlus('lifetime')"><b>$29.99</b><span>once, forever</span></button>
    </div>`}
  </div>
  <div class="card"><div class="ct">Free forever</div>
    ${FREE.map(x=>`<div class="tick free">\u2713 ${x}</div>`).join('')}</div>
  <div class="card"><div class="ct">Included with Plus</div>
    ${PLUS.map(x=>`<div class="tick ${on?'free':'locked'}">${on?'\u2713':'\u25cb'} ${x}</div>`).join('')}</div>
  <div class="card"><div class="ct">Our promise</div>
    <div class="hsub">No content is ever locked behind payment. No energy timers. No loot boxes.
      Nothing you can buy makes your character better at living. If your subscription lapses,
      every save you made stays yours.</div></div>
  ${devUnlocked()?`<div class="card"><div class="ct">Prototype controls</div>
    <div class="hsub dim mb">Developer build. Not shown to players.</div>
    <button class="row" onclick="togglePlus()"><div><div class="rn">${on?'Switch Plus off':'Switch Plus on'}</div>
      <div class="hsub dim">For testing both sides of the paywall</div></div><i>\u203a</i></button></div>`:''}
  <div class="card">
    <button class="row" onclick="popupOK('Restore','No previous purchases were found on this device.')">
      <div class="rn">Restore purchases</div><i>\u203a</i></button></div>`;
}
function buyPlus(kind){
  confirmDo('Confirm purchase',
    kind==='lifetime'?'Unlock Bequest Plus forever for $29.99?'
    :kind==='yearly'?'Start a 7-day free trial, then $14.99 per year?'
    :'Subscribe for $2.99 per month?',()=>{
    META.premium.plus=true;
    if(kind==='lifetime')META.premium.lifetime=true;
    META.premium.since=Date.now(); saveMeta();
    popupOK('Thank you','Plus is active. Nothing in the story changed \u2014 only the conveniences.');
    renderAll();
  });
}
function devUnlocked(){ return !!(META.premium&&META.premium.protoUnlocked); }
function togglePlus(){
  /* the entitlement is not a toggle outside a developer build */
  if(!devUnlocked()) return;
  META.premium.plus=!isPlus(); META.premium.lifetime=false; saveMeta(); renderAll();
  popupOK('Prototype',`Plus is now ${isPlus()?'ON':'OFF'}.`);
}
function viewSaves(){
  let h='<div class="card"><div class="ct">Local save slots</div>';
  for(let i=1;i<=SLOTS;i++){
    const s2=slotInfo(i), cur=S&&S.slot===i;
    h+=`<div class="slot ${cur?'cur':''}">
      <div class="npcline"><div><div class="rn">Slot ${i}${cur?' <span class="owned">current</span>':''}</div>
      <div class="hsub dim">${s2?`${esc(s2.name)} · age ${s2.age}${s2.alive?'':' (deceased)'} · ${esc(s2.job)}<br>${esc(s2.country)} · ${diffDef(s2.diff).n}${s2.gen>1?' · Gen '+s2.gen:''}`:'Empty'}</div></div></div>
      <div class="nact"><button onclick="saveToSlot(${i})">Save here</button>
        ${s2?`<button onclick="loadSlot(${i})">Load</button><button onclick="deleteSlot(${i})">Delete</button>`:''}</div></div>`;
  }
  h+='<div class="hsub dim mt">Your current life autosaves to its slot after every action.</div></div>';
  h+=`<div class="card"><div class="ct">Backup file</div>
    <button class="row" onclick="exportSave()"><div><div class="rn">Export everything to a file</div>
      <div class="hsub dim">All slots, achievements and Legacy Points as one .json</div></div><i>\u2193</i></button>
    <button class="row" onclick="importSave()"><div><div class="rn">Import from a file</div>
      <div class="hsub dim">Restores slots and progress. Overwrites what is here.</div></div><i>\u2191</i></button>
    <input type="file" id="importfile" accept="application/json,.json" style="display:none" onchange="handleImport(this)"></div>`;
  h+=`<div class="card"><div class="ct">Cloud sync <span class="plus">PLUS</span></div>
    <div class="hsub dim mb">Enter the same sync code on another device to carry your progress across. Status: <b>${esc(CLOUD.status)}</b></div>
    <label class="cl">Sync code<input value="${esc(CLOUD.code)}" placeholder="choose any phrase" oninput="setCloud('code',this.value)"></label>
    <label class="cl">Server<input value="${esc(CLOUD.url)}" placeholder="leave blank to use this server" oninput="setCloud('url',this.value)"></label>
    <div class="hsub dim">Your saves are sent to whatever server you name here, so only
      name one you trust. Saves coming back are checked before they are written, and
      Bequest Plus is never restored from a sync \u2014 it belongs to your purchase.</div>
    <label class="clrow"><input type="checkbox" ${CLOUD.on?'checked':''} onchange="setCloud('on',this.checked)"> Upload automatically after every save</label>
    <div class="grid3 mt"><button class="mini" onclick="cloudPush()">Upload now</button>
      <button class="mini" onclick="cloudPull()">Download</button></div></div>`;
  return h;
}
function viewStats(){
  return `<div class="card"><div class="ct">Skills</div>
   ${Object.keys(DATA.skills).map(k=>{const v=S.skills[k]||0;const t=v>=100?3:v>=75?2:v>=50?1:v>=25?0:-1;
     return `<div class="sk">${bar(DATA.skills[k].name,v)}<div class="hsub dim">${t>=0?'Unlocked: '+DATA.skills[k].tiers[t]:'At 25: '+DATA.skills[k].tiers[0]}</div></div>`;}).join('')}</div>
   <div class="card"><div class="ct">Habits</div>
   ${Object.keys(DATA.habits).map(k=>{const h=DATA.habits[k],v=S.habits[k];
     return `<div class="sk">${bar(h.name+(h.good?' ✓':''),v)}
       <div class="hsub dim">${v>5?`${h.cost?money(Math.round(h.cost*v/100))+'/yr · ':''}${Object.entries(h.eff).map(([a,b])=>`${DATA.statNames[a]||a} ${b>0?'+':''}${Math.round(b*v/100*10)/10}`).join(', ')}`:'Not a habit.'}</div>
       <div class="nact">${v>5&&!h.good?`<button onclick="quitHabit('${k}')">Try to quit</button>`:''}${h.good?`<button onclick="startHabit('${k}')">Do more</button>`:''}</div></div>`;}).join('')}</div>
   <div class="card"><div class="ct">Profile</div>
   ${[['Life stage',stage()],['Education',DATA.eduNames[S.edu]+(S.uniTier?' · '+(UNI_TIERS.find(t=>t.id===S.uniTier)||{}).n:'')],
      ['School grade',S.age<19?gradeBand(Math.round(S.gpa==null?50:S.gpa)).n+' ('+Math.round(S.gpa==null?50:S.gpa)+')':'—'],
      ['Work performance',S.job?perfBand(S.perf).n+' ('+Math.round(S.perf)+')':'—'],
      ['Criminal record',S.record.length?S.record.map(r=>r.crime+' at '+r.age+(r.spent?' (spent)':'')).join(', '):'Clean'],
      ['On parole',S.parole>0?S.parole+' years remaining':'No'],
      ['Disabled',S.disabled?'Yes':'No'],['Followers',S.followers.toLocaleString()],
      ['Traits',S.traits.map(traitName).join(', ')],
      ['Conditions',S.conditions.length?S.conditions.map(k=>COND(k.id).n+(k.treated?' (managed)':'')).join(', '):'None'],['Crimes',S.crimesCommitted],
      ['Special path',S.track?(TRACK(S.track.id).n+' \u00b7 '+TRACK_RANK(S.track).n):'None'],
      ['Orientation',DATA.orientations.find(o=>o.id===S.orientation).n+(S.outTo?' (out)':'')],
      ['Pets',petsAlive().length?petsAlive().map(p=>p.name+' the '+(DATA.petSpecies.find(x=>x.id===p.sp)||{}).n.toLowerCase()).join(', '):'None'],
      ['Countries lived in',(S.countriesLived||[]).length],
      ['Formative moments',(S.echoes&&S.echoes.length)?S.echoes.map(e=>e.n+' ('+e.age+')').join(', '):'None yet'],['Born',DATA.wealthTiers[S.birthTier].name]]
     .map(([k,v])=>`<div class="kv"><span>${k}</span><b>${esc(String(v))}</b></div>`).join('')}</div>
   <div class="card"><div class="ct">Reading</div>
   <div class="hsub dim mb">This is a game made of text. Set it to a size you can read comfortably.</div>
   <div class="grid3">
     ${[['s','Smaller'],['m','Normal'],['l','Larger'],['xl','Largest']].map(([k,n])=>
       `<button class="mini ${(S.textSize||'m')===k?'on':''}" onclick="setTextSize('${k}')">${n}</button>`).join('')}
   </div></div>
   <div class="card"><div class="ct">Problem reports</div>
   <div class="hsub dim mb">If the game breaks, it keeps a note of what it was doing.
     The note stays on this device. It never contains your name, anybody else's name,
     or your save \u2014 only the shape of the life: age, country, difficulty, what was on
     screen.</div>
   <button class="row" onclick="setCrashOptIn(${crashOptIn()?'false':'true'})" data-switch="${crashOptIn()?'on':'off'}"><div>
     <div class="rn">Allow reports to be sent</div>
     <div class="hsub dim">${crashOptIn()?'Allowed \u2014 but there is nowhere to send them yet'
       :'Off. Nothing leaves this device.'}</div></div>
     <i>${crashOptIn()?'\u2713':'\u25CB'}</i></button>
   ${crashLog().length?`<button class="row" onclick="crashScreen()"><div>
     <div class="rn">See the last problem</div>
     <div class="hsub dim">${crashLog().length} recorded</div></div><i>\u203a</i></button>
   <button class="row" onclick="crashClear();renderAll()"><div>
     <div class="rn">Delete the reports</div></div><i>\u203a</i></button>`
     :'<div class="hsub dim">Nothing has gone wrong so far.</div>'}
   </div>

   <div class="card"><div class="ct">Sound and feel</div>
   <div class="hsub dim mb">Cues are generated by the app, so they cost nothing to download and work offline.</div>
   <button class="row" onclick="setSound(${soundOn()?'false':'true'})" data-switch="${soundOn()?'on':'off'}"><div><div class="rn">Sound</div>
     <div class="hsub dim">${soundOn()?'On \u2014 years, events, outcomes':'Off \u2014 silent'}</div></div>
     <i>${soundOn()?'\u2713':'\u25CB'}</i></button>
   <button class="row" onclick="setHaptics(${hapticsOn()?'false':'true'})" data-switch="${hapticsOn()?'on':'off'}"><div><div class="rn">Vibration</div>
     <div class="hsub dim">${hapticsOn()?'On':'Off'}</div></div>
     <i>${hapticsOn()?'\u2713':'\u25CB'}</i></button>
   ${soundOn()?`<div class="hsub dim" style="margin:10px 0 6px">Volume</div>
   <div class="grid3">
     ${[['0.25','Quiet'],['0.5','Low'],['0.7','Normal'],['1','Loud']].map(([v,n])=>
       `<button class="mini ${Math.abs(soundCfg().vol-parseFloat(v))<0.02?'on':''}" onclick="setVolume(${v})">${n}</button>`).join('')}
   </div>`:''}</div>
   <div class="card"><div class="ct">Game</div>
   <button class="row" onclick="coachReplay()"><div><div class="rn">How to play</div>
     <div class="hsub dim">Replay the introduction and bring the tips back</div></div><i>\u203a</i></button>
   <button class="row" onclick="save();popupOK('Saved','Your life has been saved.')"><div class="rn">Save now</div><i>›</i></button>
   <button class="row" onclick="lowerDiff()"><div><div class="rn">Lower the difficulty</div>
     <div class="hsub dim">Currently ${diffDef(S.diff).n}${S.assisted?' · assisted':''} · Legacy Points \u00d7${lpMult().toFixed(2)}</div></div><i>\u203a</i></button>
   <button class="row danger" onclick="confirmDo('Abandon this life?','Your character will be lost.',()=>{localStorage.removeItem(SAVE_KEY);toTitle();})"><div class="rn">Abandon life</div><i>›</i></button></div>`;
}
function lowerDiff(){
  const cur=S.diff==='custom'?customRank(S.mods):diffDef(S.diff).rank;
  const lower=DIFFICULTIES.filter(d=>d.id!=='custom'&&d.rank<cur);
  if(!lower.length)return popupOK('Already at the easiest','There is nothing below Easy.');
  const t=lower[lower.length-1];
  confirmDo('Lower difficulty to '+t.n+'?',
    `This life will be marked Assisted and your Legacy Points will be capped at \u00d7${t.lp.toFixed(2)} for everything you earn from here on. It cannot be raised again.`,
    ()=>{ S.diff=t.id; S.mods=Object.assign({},t.m); S.assisted=true;
      S.lpCap=Math.min(S.lpCap!=null?S.lpCap:t.lp, t.lp);
      logLine(`You lowered the difficulty to ${t.n}. This life is now Assisted.`);
      popupOK('Difficulty lowered',`Now playing on ${t.n}. Legacy Points capped at \u00d7${t.lp.toFixed(2)}.`); });
}
function rewindYear(){
  if(!requirePlus('Rewind'))return;
  if(!PREV_YEAR)return popupOK('Nothing to rewind','Age up at least once first.');
  confirmDo('Rewind to age '+(S.age-1)+'?','This undoes the year you just lived. It cannot be redone.',()=>{
    try{ S=JSON.parse(PREV_YEAR); PREV_YEAR=null; migrate();
      RNG=mulberry32((S.seed+S.age*7919+ri(1,9999))>>>0);
      logLine('You went back a year.'); save(); renderAll();
      popupOK('Rewound',`You are ${S.age} again. The year plays out differently this time.`);
    }catch(e){ popupOK('Could not rewind','That year could not be restored.'); }
  });
}
function fateControl(k,delta){
  if(!requirePlus('Fate Control'))return;
  S.stats[k]=clamp(S.stats[k]+delta); save(); renderAll();
}
function quitHabit(k){
  let ch=(0.25+S.stats.discipline/200)/M('habitGrip'); if(S.traits.includes('ironwill'))ch+=0.25;
  if(R()<ch){ const was=S.habits[k]; S.habits[k]=clamp(S.habits[k]-ri(25,50)); applyEff({happiness:-6,discipline:5});
    if(k==='smoking'&&was>50&&S.habits[k]<20)S.flags.quit_smoking_long=true;
    popupOK('Progress',`You cut back on ${DATA.habits[k].name.toLowerCase()}. Now ${Math.round(S.habits[k])}.`); }
  else { S.habits[k]=clamp(S.habits[k]+8); S.counters.relapses++; applyEff({happiness:-8}); popupOK('Relapse',`You relapsed.`); }
  checkAch(); save(); renderAll();
}
function startHabit(k){ S.habits[k]=clamp(S.habits[k]+18); popupOK(DATA.habits[k].name,`${DATA.habits[k].name} +18.`); save(); renderAll(); }

/* ---------------- title / creation ---------------- */
function tapLogo(){
  META.taps=(META.taps||0)+1; saveMeta();
  if(META.taps===13&&!hasEgg('thirteen')){
    META.eggs.thirteen={age:0,life:META.lives,at:Date.now()}; saveMeta();
    alert('Thirteen taps. Something counted you.\n\nUnlocked: The Thirteenth Start.');
  }
  renderTitle();
}
function renderTitle(){
  document.getElementById('screen-title').innerHTML=`<div class="title">
    <img class="logo" src="ICON" alt="" onclick="tapLogo()">
    <h1>BEQUEST</h1><p class="tag">One year at a time.</p>
    <div class="tbtns"><button class="btn primary" onclick="showCreate()">New life</button>
      ${hasSave()?'<button class="btn" onclick="resume()">Continue</button>':''}</div>
    <div class="meta">${META.lives} lives · ${META.lp} Legacy Points<br>
      ${Object.keys(META.ach).length}/${ACHIEVEMENTS.length} achievements · ${Object.keys(META.done).length}/${CHALLENGES.length} challenges</div>
    <div class="note">Prototype build${Object.keys(META.eggs||{}).length?` \u00b7 ${Object.keys(META.eggs).length}/${EGGS.length} found`:''}</div></div>`;
}
let CREATE={name:'',gender:'',country:'',typed:false,diff:'normal',mods:null,showCompare:false,showCustom:false};
function showCreate(){ app().dataset.screen='create'; renderCreate(); }
function pctLabel(k,v){
  const kn=DIFF_KNOBS.find(x=>x.k===k);
  if(kn.toggle) return v?'On':'Off';
  if(kn.add) return (v>=0?'+':'')+Math.round(v*100)+' pts';
  const d=Math.round((v-1)*100);
  return d===0?'baseline':(d>0?'+':'')+d+'%';
}
function knobTone(k,v){
  const kn=DIFF_KNOBS.find(x=>x.k===k);
  if(kn.toggle) return v?'kind':'tough';
  let harder = kn.add ? v<0 : (kn.dir==='up_harder' ? v>1 : v<1);
  let easier = kn.add ? v>0 : (kn.dir==='up_harder' ? v<1 : v>1);
  return harder?'tough':easier?'kind':'';
}
function renderCreate(){
  const d=diffDef(CREATE.diff);
  const mods=CREATE.diff==='custom'?(CREATE.mods||Object.assign({},diffDef('normal').m)):d.m;
  if(CREATE.diff==='custom'&&!CREATE.mods)CREATE.mods=mods;
  const lp=CREATE.diff==='custom'?customLP(mods):d.lp;
  const rank=CREATE.diff==='custom'?customRank(mods):d.rank;

  document.getElementById('screen-create').innerHTML=`<div class="title create">
    <h2>New life</h2>

    <label>Name <div class="inrow"><input id="cname" value="${esc(CREATE.name)}" placeholder="random"
      oninput="CREATE.name=this.value;CREATE.typed=true"><button class="dicebtn" onclick="rnd('name')">${DICE}</button></div></label>
    <label>Gender <div class="inrow"><select onchange="CREATE.gender=this.value">
      <option value=""${CREATE.gender?'':' selected'}>Random</option>
      <option value="m"${CREATE.gender==='m'?' selected':''}>Male</option>
      <option value="f"${CREATE.gender==='f'?' selected':''}>Female</option></select>
      <button class="dicebtn" onclick="rnd('gender')">${DICE}</button></div></label>
    <label>Country <div class="inrow"><select onchange="countryChanged(this.value)">
      <option value=""${CREATE.country?'':' selected'}>Random</option>
      ${DATA.countries.map(c=>`<option value="${c.id}"${CREATE.country===c.id?' selected':''}>${c.name}</option>`).join('')}</select>
      <button class="dicebtn" onclick="rnd('country')">${DICE}</button></div></label>
    <button class="btn wide" onclick="rnd('all')">${DICE} Randomise everything</button>

    <label style="margin-top:6px">Difficulty</label>
    <div class="diffpick">${DIFFICULTIES.map(x=>`<button class="dchip ${CREATE.diff===x.id?'on':''}"
      style="${CREATE.diff===x.id?`border-color:${x.colour};color:${x.colour}`:''}"
      onclick="setDiff('${x.id}')">${x.n}${x.premium?' <span class="plus">PLUS</span>':''}</button>`).join('')}</div>

    <div class="diffcard" style="border-color:${d.colour}44">
      <div class="dtitle" style="color:${d.colour}">${d.n}
        <span class="lpx">Legacy Points ×${lp.toFixed(2)}</span></div>
      <div class="dblurb">${esc(d.blurb)}</div>
      <div class="knobgrid">
        ${DIFF_KNOBS.map(kn=>`<div class="knob ${knobTone(kn.k,mods[kn.k])}">
          <span>${kn.n}</span><b>${pctLabel(kn.k,mods[kn.k])}</b></div>`).join('')}
      </div>
      ${rank>=2?'<div class="hardnote">\u2605 Unlocks Hard-only achievements</div>'
               :'<div class="hardnote dim">Hard-only achievements need Hard or above</div>'}
      ${CREATE.diff==='custom'?`<button class="btn wide mt" onclick="CREATE.showCustom=!CREATE.showCustom;renderCreate()">
        ${CREATE.showCustom?'Hide':'Edit'} the twelve values</button>`:''}
      ${(CREATE.diff==='custom'&&CREATE.showCustom)?renderCustomSliders(mods):''}
      <button class="linkbtn" onclick="CREATE.showCompare=!CREATE.showCompare;renderCreate()">
        ${CREATE.showCompare?'\u25be Hide':'\u25b8 Compare all difficulties'}</button>
      ${CREATE.showCompare?renderCompare():''}
    </div>

    <div class="tbtns"><button class="btn primary" onclick="startLife()">Begin</button>
      <button class="btn" onclick="toTitle()">Back</button></div>
    <div class="note">Family wealth, genetics and traits are always rolled at birth.
      Difficulty is locked for this life, though you may lower it later \u2014 the life is then marked Assisted.</div></div>`;
}
function setDiff(id){ if(id==='custom'&&!isPlus()){ push({type:'PLUS',what:'custom difficulty'}); drain(); return; } CREATE.diff=id; if(id==='custom'&&!CREATE.mods)CREATE.mods=Object.assign({},diffDef('normal').m); renderCreate(); }
function setKnob(k,v){
  CREATE.mods=CREATE.mods||Object.assign({},diffDef('normal').m);
  CREATE.mods[k]=parseFloat(v); renderCreate();
}
function resetKnobs(id){ CREATE.mods=Object.assign({},diffDef(id).m); renderCreate(); }
function renderCustomSliders(m){
  return `<div class="sliders">
    <div class="srow-head">Presets as a starting point:
      ${['easy','normal','hard','brutal'].map(x=>`<button class="tiny" onclick="resetKnobs('${x}')">${diffDef(x).n}</button>`).join('')}</div>
    ${DIFF_KNOBS.map(kn=>kn.toggle
      ? `<div class="srow"><div class="slabel"><span>${kn.n}</span>
           <b class="${m[kn.k]?'kind':'tough'}">${m[kn.k]?'On':'Off'}</b></div>
         <button class="btn wide" onclick="setKnob('${kn.k}',${m[kn.k]?0:1})">${m[kn.k]?'Turn off':'Turn on'}</button>
         <div class="sdesc">${esc(kn.d)}</div></div>`
      : `<div class="srow">
      <div class="slabel"><span>${kn.n}</span><b class="${knobTone(kn.k,m[kn.k])}">${pctLabel(kn.k,m[kn.k])}</b></div>
      <input type="range" min="${kn.min}" max="${kn.max}" step="${kn.add?0.01:0.05}" value="${m[kn.k]}"
        oninput="setKnob('${kn.k}',this.value)">
      <div class="sdesc">${esc(kn.d)}</div></div>`).join('')}</div>`;
}
function renderCompare(){
  const ds=DIFFICULTIES.filter(d=>d.id!=='custom');
  return `<div class="cmpwrap"><table class="cmp">
    <thead><tr><th>Setting</th>${ds.map(d=>`<th style="color:${d.colour}">${d.n}</th>`).join('')}</tr></thead>
    <tbody>
      ${DIFF_KNOBS.map(kn=>`<tr><td>${kn.n}</td>${ds.map(d=>
        `<td class="${knobTone(kn.k,d.m[kn.k])}">${pctLabel(kn.k,d.m[kn.k])}</td>`).join('')}</tr>`).join('')}
      <tr class="cmpfoot"><td>Legacy Points</td>${ds.map(d=>`<td>\u00d7${d.lp.toFixed(1)}</td>`).join('')}</tr>
      <tr class="cmpfoot"><td>Hard-only awards</td>${ds.map(d=>`<td>${d.rank>=2?'\u2713':'\u2014'}</td>`).join('')}</tr>
    </tbody></table></div>`;
}
function rnd(what){
  /* Roll country FIRST, then draw the name from that country's own name pool,
     so a Japanese character is never called Chidi Okafor.                      */
  if(what==='country'||what==='all')CREATE.country=pick(DATA.countries).id;
  if(what==='gender'||what==='all')CREATE.gender=pick(['m','f']);
  if(what==='name'||what==='all'){
    if(!CREATE.country)CREATE.country=pick(DATA.countries).id;   // pin it so they agree
    const g=CREATE.gender||pick(['m','f']);
    const reg=DATA.countries.find(c=>c.id===CREATE.country).reg;
    CREATE.name=nameFor(reg,g)+' '+surFor(reg);
    CREATE.typed=false;
  }
  renderCreate();
}
function countryChanged(v){
  CREATE.country=v;
  /* a rolled (not typed) name must follow the country */
  if(CREATE.name&&!CREATE.typed){
    const cid=v||pick(DATA.countries).id;
    const reg=DATA.countries.find(c=>c.id===cid).reg;
    CREATE.name=nameFor(reg,CREATE.gender||pick(['m','f']))+' '+surFor(reg);
  }
  renderCreate();
}
function startLife(){
  newGame({name:CREATE.name,typed:CREATE.typed,gender:CREATE.gender||null,country:CREATE.country||null,diff:CREATE.diff,mods:CREATE.mods});
  app().dataset.screen='game'; setTab('life'); renderAll();
  cue('born','medium');
  /* First life on this device: explain the loop before asking them to live it. */
  if(coachOpeningDue()) openingShow(0);
}
function resume(){ if(load()){ migrate(); app().dataset.screen='game'; setTab('life'); renderAll(); if(!S.alive)showDeath(); } }

/* ---------------- boot ---------------- */
if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('DOMContentLoaded',()=>{
  installCrashHandlers();
  a11yInit();
  renderTitle();
  bindTapSounds();
  document.getElementById('ageBtn').addEventListener('click',()=>{
    if(!S||!S.alive)return;
    if(S.actionsLeft>0&&!S.skipAgeWarning&&S.age>=5){
      return confirmDo(`Age up with ${S.actionsLeft} action${S.actionsLeft>1?'s':''} left?`,
        'A year you do not use is gone for good.',()=>{ S.skipAgeWarningOnce=true; doAgeUp(); });
    }
    doAgeUp();
  });
  const topLevelHttp = (location.protocol==='http:'||location.protocol==='https:') && window.top===window.self;
  if(topLevelHttp && !/[?&]nosw/.test(location.search) && 'serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(reg=>{
      reg.addEventListener('updatefound',()=>{
        const w=reg.installing;
        if(w)w.addEventListener('statechange',()=>{ if(w.state==='installed'&&navigator.serviceWorker.controller)location.reload(); });
      });
      reg.update();
    }).catch(()=>{});
  } else if('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  }
});
