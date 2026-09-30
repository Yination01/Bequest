const fs=require('fs'), path=require('path');
const PWA=path.join(__dirname,'..','pwa');
const stub=()=>({innerHTML:'',className:'',dataset:{},scrollTop:0,scrollHeight:0,addEventListener(){},classList:{toggle(){},add(){},remove(){}},value:'',click(){},files:[]});
global.document={getElementById:()=>stub(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>stub(),body:{appendChild(){},removeChild(){}}};
global.window=undefined; global.fetch=()=>Promise.reject(); global.alert=()=>{};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
global.setTimeout=f=>f();
const F=['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js','assets.js','social.js','shop.js','market.js','avatar.js','easter.js','achievements.js','sound.js','eulogy.js','will.js','school.js','court.js','invest.js','health.js','coach.js','game.js'];
const SRC=F.map(f=>fs.readFileSync(path.join(PWA,f),'utf8')).join('\n')+`
showPopup=function(p){ if(p.type==='A')resolveChoice(p.ev,Math.floor(Math.random()*p.ev.c.length));
  else if(p.type==='D'){ if(p.yes&&Math.random()<0.6)p.yes(); drain(); } else drain(); };
showDeath=function(){ finalChallenges(); };
module.exports={api:{get S(){return S},DATA,EVENTS,ACHIEVEMENTS,CHALLENGES,CONDITIONS,EGGS,
 newGame,ageUp,ACTS,doAct,applyJob,jobEligible,jobLocked,tryPromote,doCrime,netWorth,drain,
 finalChallenges,reqOk,anyOf,partner,viewMoney,viewLife,viewPeople,viewActs,COND}};`;
fs.writeFileSync('/tmp/auditm.js',SRC);
const G=require('/tmp/auditm.js').api;

const found=[];
const flag=(cat,msg)=>found.push(cat+': '+msg);

/* ---- 1. unreachable content ---- */
const fired=new Set(), actsSeen=new Set(), jobsHeld=new Set();
const impossible={married_to_dead:0, job_in_prison:0, child_before_13:0,
  partner_is_parent:0, negative_money_adult:0, dependents_stuck:0,
  banned_forever_no_job:0, pregnant_old:0, condition_dup:0, npc_older_than_parent:0};
for(let i=0;i<220;i++){
  G.newGame({}); let g=0;
  while(G.S.alive && g++<140){
    G.ageUp(); if(!G.S.alive) break;
    let b=0; while(G.S.actionsLeft>0 && b++<8){ const a=G.ACTS(); if(!a.length)break;
      const pick=a[Math.floor(Math.random()*a.length)]; actsSeen.add(pick.id); G.doAct(pick.id); }
    if(G.S.age>=18&&!G.S.job&&!G.S.flags.retired&&!G.S.flags.inCollege){
      const p=G.DATA.jobs.filter(G.jobEligible); if(p.length&&Math.random()<0.7){G.applyJob(p[Math.floor(Math.random()*p.length)]);G.drain();}}
    if(G.S.job){ jobsHeld.add(G.S.job.id); if(G.S.jailLeft>0) impossible.job_in_prison++; }
    const sp=G.partner();
    if(sp && !sp.alive) impossible.married_to_dead++;
    if(G.anyOf('child').length && G.S.age<13) impossible.child_before_13++;
    if(G.S.money<0 && G.S.age>=18) impossible.negative_money_adult++;
    if(G.S.dependents>3) impossible.dependents_stuck++;
    const ids=G.S.conditions.map(c=>c.id);
    if(new Set(ids).size!==ids.length) impossible.condition_dup++;
    G.S.npcs.forEach(n=>{ if(n.alive&&(n.rel==='mother'||n.rel==='father')&&n.age<=G.S.age+12) impossible.npc_older_than_parent++; });
    if(G.S.banned&&G.S.banned.length&&G.S.jailLeft===0){
      const open=G.DATA.jobs.filter(j=>!G.jobLocked(j)).length;
      if(open===0&&G.S.age<60&&!G.S.flags.retired) impossible.banned_forever_no_job++;
    }
  }
  G.S.log.forEach(()=>{});
  Object.keys(G.S.seen).forEach(k=>fired.add(k));
}
const neverFired=G.EVENTS.filter(e=>!fired.has(e.id));
if(neverFired.length) flag('UNREACHABLE EVENTS', neverFired.length+' never fired in 220 lives: '+neverFired.slice(0,12).map(e=>e.id).join(', '));
Object.entries(impossible).forEach(([k,v])=>{ if(v>0) flag('IMPOSSIBLE STATE', k+' occurred '+v+' times'); });

/* ---- 2. content never offered ---- */
const allActIds=new Set();
[1,4,8,12,16,19,25,35,45,60,75,90].forEach(age=>{
  let t=0; do{ G.newGame({}); let g=0; while(G.S.alive&&G.S.age<age&&g++<140)G.ageUp(); t++; }while(!G.S.alive&&t<20);
  if(G.S.alive) G.ACTS().forEach(a=>allActIds.add(a.id));
});
/* ---- 3. jobs nobody can ever hold ---- */
const neverHeld=G.DATA.jobs.filter(j=>!jobsHeld.has(j.id));
if(neverHeld.length>25) flag('CAREER REACH', neverHeld.length+' of '+G.DATA.jobs.length+' jobs never reached: '+neverHeld.slice(0,10).map(j=>j.id).join(', '));

/* ---- 4. achievements that can never fire ---- */
const src=fs.readFileSync(path.join(PWA,'game.js'),'utf8');
const unreachableAch=G.ACHIEVEMENTS.filter(a=>{
  try{ const fake={stats:{},skills:{},habits:{},npcs:[],conditions:[],record:[],counters:{},flags:{},items:[],traits:[],
    age:0,peakNet:0,peakIncome:0,followers:0,edu:0,jobsHeld:0,firedCount:0,crimesCommitted:0,yearsJailed:0,
    childrenCount:0,marriedYears:0,donated:0,gen:1,alive:true,birthTier:2,skills:{},countriesLived:[]};
    a.f(fake,{}); return false; }catch(e){ return true; }
});
if(unreachableAch.length) flag('ACHIEVEMENT ERROR', unreachableAch.length+' throw on a blank state: '+unreachableAch.slice(0,6).map(a=>a.id).join(', '));

/* ---- 5. formatting / display ---- */
G.newGame({}); let gg=0; while(G.S.alive&&G.S.age<40&&gg++<60)G.ageUp();
if(G.S.alive){
  const html=(G.viewMoney()+G.viewLife()+G.viewPeople()+G.viewActs()).replace(/<svg[\s\S]*?<\/svg>/g,'');
  if(/NaN/.test(html)) flag('DISPLAY','NaN rendered on a screen');
  if(/undefined/.test(html)) flag('DISPLAY','"undefined" rendered on a screen');
  if(/\$-/.test(html)) flag('DISPLAY','malformed negative currency like $-100');
  if(/\.\d{3,}/.test(html)) flag('DISPLAY','unrounded long decimals shown');
}
const blocking = found.filter(f => f.startsWith('IMPOSSIBLE STATE') || f.startsWith('DISPLAY') || f.startsWith('ACHIEVEMENT ERROR'));
const advisory = found.filter(f => !blocking.includes(f));
if (advisory.length) { console.log('Advisory:'); advisory.forEach(f => console.log('  ' + f)); }
if (blocking.length) { console.log('\nBLOCKING:'); blocking.forEach(f => console.log('  ' + f)); }
else console.log('\nNo impossible states found.');
process.exit(blocking.length ? 1 : 0);
