/* BEQUEST — final integrity audit.
   Checks things the unit suite does not: cross-references between modules,
   save/load fidelity with every subsystem populated, runtime performance,
   and whether any content is unreachable in practice.                      */
'use strict';
const fs=require('fs'), path=require('path');
const PWA=path.join(__dirname,'..','pwa');
const stub=()=>({innerHTML:'',className:'',dataset:{},scrollTop:0,scrollHeight:0,addEventListener(){},
  classList:{toggle(){},add(){},remove(){}},value:'',click(){},files:[]});
global.document={getElementById:()=>stub(),querySelectorAll:()=>[],addEventListener(){},
  createElement:()=>stub(),body:{appendChild(){},removeChild(){}}};
global.window=undefined; global.fetch=()=>Promise.reject(); global.alert=()=>{};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},
  removeItem(k){delete this._d[k]},clear(){this._d={}}};
global.setTimeout=f=>f();
const F=['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js','assets.js',
  'social.js','shop.js','market.js','avatar.js','easter.js','achievements.js','coach.js','game.js'];
const SRC=F.map(f=>fs.readFileSync(path.join(PWA,f),'utf8')).join('\n')+`
showPopup=function(p){ if(p.type==='A')resolveChoice(p.ev,Math.floor(Math.random()*p.ev.c.length));
 else if(p.type==='D'){ if(p.yes&&Math.random()<0.5)p.yes(); drain(); } else drain(); };
showDeath=function(){ finalChallenges(); };
module.exports={api:{get S(){return S},set S(v){S=v},get META(){return META},
 DATA,EVENTS,ACHIEVEMENTS,CHALLENGES,RECORDS,DIFFICULTIES,DIFF_KNOBS,CONDITIONS,COND,TRACKS,TRACK,
 HOUSING,FOOD,SUBS,CARDS,PROPERTY_TYPES,VEHICLES,BUSINESSES,BIZ_UPGRADES,PERSON_ACTIONS,LEISURE,
 DEGREES,PERKS,GOAL_POOL,EGGS,SELLERS,MOTIVES,UNI_TIERS,PERSONALITIES,
 newGame,ageUp,ACTS,doAct,save,load,slotInfo,loadSlot,migrate,netWorth,marketRefresh,
 viewLife,viewActs,viewPeople,viewMoney,viewMore,renderHeader,finalChallenges,drain}};`;
const tmp=path.join(require('os').tmpdir(),'bequest-final.js');
fs.writeFileSync(tmp,SRC);
const G=require(tmp).api;

const issues=[], notes=[];
const fail=(c,m)=>issues.push(c+': '+m);
const note=(c,m)=>notes.push(c+': '+m);

/* ---- 1. cross-references ---- */
const skillKeys=Object.keys(G.DATA.skills);
G.BUSINESSES.forEach(b=>{ if(!skillKeys.includes(b.skill)) fail('XREF','business '+b.id+' uses unknown skill '+b.skill); });
G.TRACKS.forEach(t=>t.ranks.forEach(r=>{ if(r.pay==null) fail('XREF','track '+t.id+' rank without pay'); }));
G.DEGREES.forEach(d=>Object.keys(d.skills).forEach(k=>{
  if(!skillKeys.includes(k)&&!G.DATA.statKeys.includes(k)) fail('XREF','degree '+d.id+' teaches unknown '+k); }));
G.DEGREES.forEach(d=>d.fields.forEach(f=>{ if(!G.DATA.fieldNames[f]) fail('XREF','degree '+d.id+' opens unknown field '+f); }));
G.CONDITIONS.forEach(c=>{ if(c.fatal===undefined) fail('XREF','condition '+c.id+' has no fatal flag'); });
G.PERSON_ACTIONS.forEach(a=>{ if(a.rel!=='*') a.rel.split(',').forEach(r=>{
  if(!['mother','father','sibling','child','partner','spouse','friend','colleague','teacher','ex'].includes(r))
    fail('XREF','person action '+a.id+' targets unknown relationship '+r); }); });

/* ---- 2. every difficulty defines every knob ---- */
G.DIFFICULTIES.forEach(d=>G.DIFF_KNOBS.forEach(k=>{
  if(d.m[k.k]===undefined) fail('DIFF',d.id+' is missing knob '+k.k); }));

/* ---- 3. save/load fidelity with everything populated ---- */
G.newGame({});
let g=0; while(G.S.alive&&G.S.age<45&&g++<80)G.ageUp();
if(G.S.alive){
  G.S.properties=[{t:'flat',value:200000,mortgage:50000,rented:true,cond:70,home:true}];
  G.S.vehicles=[{t:'saloon',value:20000,cond:70}];
  G.S.businesses=[{t:'cafe',value:60000,staff:3,ups:['marketing'],rep:50}];
  G.S.cards=[{id:'standard',bal:900}]; G.S.finance=[{l:'Car',annual:3000,left:3,principal:9000}];
  G.S.subs={utilities:true,gym:true}; G.S.goals=[{id:'g_home',done:true}];
  G.S.track={id:'mob',rank:1,progress:9,heat:30,followers:0,standing:0,commend:0,rating:0,years:4};
  G.S.pets=[{id:'p1',sp:'dog',name:'Bandit',age:4,alive:true,bond:70,lifespan:13,ill:false}];
  G.marketRefresh(true);
  const before=JSON.stringify(G.S);
  G.S.slot=2; G.save();
  G.S=null; G.loadSlot(2);
  const after=JSON.stringify(G.S);
  if(!G.S) fail('SAVE','the save would not load back');
  else {
    const a=JSON.parse(before), b=JSON.parse(after);
    ['properties','vehicles','businesses','cards','finance','subs','goals','track','pets','market']
      .forEach(k=>{ if(JSON.stringify(a[k])!==JSON.stringify(b[k])) fail('SAVE','"'+k+'" did not survive a save/load'); });
  }
}

/* ---- 4. a save written before these systems existed must still load ---- */
G.newGame({}); let h=0; while(G.S.alive&&G.S.age<30&&h++<50)G.ageUp();
const legacy=JSON.parse(JSON.stringify(G.S));
['properties','vehicles','businesses','cards','finance','subs','goals','perksUsed','pets','market',
 'home','food','arrears','ledger','conditions','record','track','echoes','lean','away']
  .forEach(k=>delete legacy[k]);
legacy.property={value:150000,mortgage:0,rented:false};
legacy.business={value:30000};
global.localStorage.setItem('bequest.slot1',JSON.stringify(legacy));
G.S=null;
try{ G.loadSlot(1);
  if(!G.S) fail('MIGRATE','an old save failed to load');
  else{
    if(!Array.isArray(G.S.properties)||!G.S.properties.length) fail('MIGRATE','old single property was not carried over');
    if(!Array.isArray(G.S.businesses)||!G.S.businesses.length) fail('MIGRATE','old single business was not carried over');
    let k=0; while(G.S.alive&&k++<8)G.ageUp();
  }
}catch(e){ fail('MIGRATE','an old save crashed the game: '+e.message); }

/* ---- 5. performance ---- */
const t0=Date.now();
for(let i=0;i<60;i++){ G.newGame({}); let n=0; while(G.S.alive&&n++<130)G.ageUp(); }
const perLife=(Date.now()-t0)/60;
note('PERF','a full life simulates in '+perLife.toFixed(1)+' ms');
if(perLife>120) fail('PERF','a life takes '+perLife.toFixed(0)+' ms, which will feel slow on a phone');
const t1=Date.now();
G.newGame({}); let q=0; while(G.S.alive&&G.S.age<40&&q++<60)G.ageUp();
for(let i=0;i<40;i++){ G.viewLife(); G.viewActs(); G.viewPeople(); G.viewMoney(); G.renderHeader(); }
const perRender=(Date.now()-t1)/40;
note('PERF','one full screen render takes '+perRender.toFixed(1)+' ms');
if(perRender>50) fail('PERF','rendering takes '+perRender.toFixed(0)+' ms a frame');

/* ---- 6. bundle ---- */
const bundle=fs.statSync(path.join(PWA,'index.html')).size;
note('SIZE','the shipped bundle is '+(bundle/1024).toFixed(0)+' KB');
if(bundle>900*1024) fail('SIZE','the bundle has grown past 900 KB');

/* ---- 7. content reach ---- */
const fired=new Set(); const actsSeen=new Set();
for(let i=0;i<140;i++){
  G.newGame({}); let n=0;
  while(G.S.alive&&n++<130){ G.ageUp(); if(!G.S.alive)break;
    let b=0; while(G.S.actionsLeft>0&&b++<8){ const L=G.ACTS(); if(!L.length)break;
      const a=L[Math.floor(Math.random()*L.length)]; actsSeen.add(a.id); G.doAct(a.id); } }
  Object.keys(G.S.seen).forEach(k=>fired.add(k));
}
const never=G.EVENTS.filter(e=>!fired.has(e.id));
note('REACH',never.length+' of '+G.EVENTS.length+' events never fired in 140 lives');
note('REACH',actsSeen.size+' distinct activities were offered');

console.log('=== BEQUEST FINAL AUDIT ===\n');
notes.forEach(n=>console.log('  · '+n));
console.log();
if(issues.length){ console.log('PROBLEMS ('+issues.length+'):'); issues.forEach(i=>console.log('  ! '+i)); }
else console.log('No integrity problems found.');
process.exit(issues.length?1:0);
