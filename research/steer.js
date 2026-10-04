/* BEQUEST - the scripted player, in one place.

   Three research tools and one suite test all need "a plausible life": somebody
   who spends their actions, takes a job, chases a promotion, learns to drive,
   buys a phone and a cheap car and a bedsit, dates, proposes, adopts, starts a
   business. Two of those tools used to carry their own private copy of that
   policy, which is how a robot ends up behaving differently in two documents
   that quote the same table.

   This file owns the policy. `pwa/tests/suite.js` carries its own copy on
   purpose, because the suite must not depend on anything outside pwa/; if you
   change the policy here, change it there too. The comment in each place says
   so.

   Determinism matters as much as the policy. `game.js` seeds its RNG from
   Date.now(), and `newGame()` rolls the character (name, country, smarts) from
   that same stream, so two runs of the same seed used to produce two different
   people. Pinning the clock before the bundle is required and reseeding from
   S.seed after birth makes a life reproducible; the bulk runs in the reporting
   tools depend on exactly that.

   Usage:
     const { load, runLife } = require('./steer.js');
     const G = load();
     runLife(G, 7, { onYear(sheets, tick) { ... } });      // one seeded life
*/
'use strict';
const fs = require('fs'), path = require('path');
const PWA = path.join(__dirname, '..', 'pwa');

const stub = () => ({ innerHTML:'', className:'', dataset:{}, scrollTop:0, scrollHeight:0,
  addEventListener(){}, classList:{toggle(){},add(){},remove(){},contains(){return false;}},
  setAttribute(){}, value:'', click(){}, files:[] });

/* A pinned clock, set before the bundle loads: see the note at the top. */
const CLOCK = 1700000000000;
Date.now = () => CLOCK;

function load() {
  global.document = { getElementById:()=>stub(), querySelectorAll:()=>[], addEventListener(){},
    createElement:()=>stub(), body:{appendChild(){},removeChild(){}} };
  global.window = undefined;
  global.fetch = () => Promise.reject(new Error('offline'));
  global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v},
    removeItem(k){delete this._d[k]}, clear(){this._d={}} };
  global.setTimeout = f => f();

  const FILES = ['data.js','events.js','difficulty.js','systems.js','careers.js','economy.js',
    'assets.js','social.js','shop.js','market.js','avatar.js','easter.js','achievements.js',
    'sound.js','eulogy.js','will.js','school.js','court.js','invest.js','health.js','crash.js',
    'adminlink.js','a11y.js','i18n.js','coach.js','game.js'];
  const SRC = FILES.map(f => fs.readFileSync(path.join(PWA, f), 'utf8')).join('\n') + `
showPopup=function(p){
  if(p.type==='A')resolveChoice(p.ev,Math.floor(Math.random()*p.ev.c.length));
  else if(p.type==='D'){ if(p.yes&&Math.random()<0.6)p.yes(); drain(); } else drain(); };
showDeath=function(){ finalChallenges(); };
module.exports={api:{get S(){return S}, set S(v){S=v}, DATA,EVENTS,ACHIEVEMENTS,CHALLENGES,
 CONDITIONS,EGGS,HEIRLOOMS,SUBJECTS,DEGREES,newGame,ageUp,ACTS,doAct,applyJob,jobEligible,
 jobLocked,tryPromote,doCrime,netWorth,drain,finalChallenges,reqOk,anyOf,partner,hasItem,buy,save,load,
 buyVehicle,buyProperty,eulogy,subjectsTaken,subjectGrade,subjectBest:bestSubjects,
 get FIRED(){return FIRED}, set FIRED(v){FIRED=v},
 set AUTOCHOICE(v){AUTOCHOICE=v}, set AUTOCONFIRM(v){AUTOCONFIRM=v},
 set AUTOPLEA(v){AUTOPLEA=v}, set AUTOCOUNSEL(v){AUTOCOUNSEL=v},
 get showPopup(){return showPopup}, set showPopup(v){showPopup=v}}};`;
  const tmp = path.join(require('os').tmpdir(), 'bequest-steer-bundle.js');
  fs.writeFileSync(tmp, SRC);
  return require(tmp).api;
}

/* One seeded life, played by the scripted player. `onYear(sheets, tickSheets)`
   is called once a year if given, with the popups the engine showed during the
   year tick and a way to ask what type each one was. */
function runLife(G, seed, opts) {
  opts = opts || {};
  G.newGame({});
  G.FIRED = [];
  G.S.seed = seed; G.save(); G.load();      /* load() reseeds the RNG from S.seed */
  G.AUTOCHOICE = seed % 4;                  /* nothing is left to chance in the choices */
  G.AUTOCONFIRM = (seed % 2 === 0);
  G.AUTOPLEA = (seed % 3 === 0 ? 'guilty' : 'notguilty');
  G.AUTOCOUNSEL = 'duty';

  let guard = 0;
  while (G.S.alive && guard++ < 140) {
    G.ageUp(); if (!G.S.alive) break;
    let budget = 0;
    while (G.S.actionsLeft > 0 && budget++ < 8) {
      const acts = G.ACTS(); if (!acts.length) break;
      /* uniform random is not a player: the action list contains fourteen
         crimes, and the occasional felony is already three times the human
         average. See research/compare.js for the long version of this note. */
      const lawful = acts.filter(a => a.grp !== 'Crime');
      const pool = (lawful.length && Math.random() > 0.03) ? lawful : acts;
      G.doAct(pool[Math.floor(Math.random() * pool.length)].id); G.drain();
    }
    if (G.S.age >= 18 && !G.S.job && !G.S.flags.retired && !G.S.flags.inCollege) {
      const p = G.DATA.jobs.filter(G.jobEligible);
      if (p.length) { G.applyJob(p[p.length - 1]); G.drain(); }
    }
    if (G.S.job && Math.random() < 0.5) { G.tryPromote(); G.drain(); }
    /* the ordinary life: shopping, family, a business */
    try {
      const acts = G.ACTS(), has = id => acts.some(a => a.id === id);
      if (G.S.age >= 16 && !G.S.flags.licence && Math.random() < 0.8 && has('lessons')) G.doAct('lessons');
      if (!G.hasItem('phone') && G.S.money >= 900) G.buy('phone');
      if (G.S.flags.licence && !(G.S.vehicles || []).length && G.S.money >= 2600) G.buyVehicle('banger');
      if (!(G.S.properties || []).length && G.S.money >= 60000) G.buyProperty('bedsit');
      if (G.S.age >= 20 && !G.S.partner && has('date')) G.doAct('date');
      if (G.S.partner && G.S.age >= 25 && has('propose')) G.doAct('propose');
      const kids = (G.S.npcs || []).filter(n => n.rel === 'child' && n.alive).length;
      if (G.S.age >= 30 && G.S.partner && kids < 2) { if (has('ivf')) G.doAct('ivf'); else if (has('adopt')) G.doAct('adopt'); }
      if (G.S.age >= 32 && !(G.S.businesses || []).length && G.S.money >= 60000 && has('startbiz')) G.doAct('startbiz');
    } catch (e) { /* gated or unaffordable: the player just moves on */ }
    G.drain();
    if (opts.onYear) opts.onYear();
  }
  G.AUTOCHOICE = null; G.AUTOCONFIRM = null; G.AUTOPLEA = null; G.AUTOCOUNSEL = null;
  return G.S;
}

module.exports = { load, runLife, CLOCK };
