const fs = require('fs');
const path = require('path');
const PWA = path.resolve('/home/user/Bequest/pwa');

const stub = () => ({
  innerHTML: '', className: '', dataset: {}, scrollTop: 0, scrollHeight: 0,
  addEventListener() {}, classList: { toggle() {}, add() {}, remove() {}, contains(c) { return (this._c || '').includes(c); } },
  setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k] || null; },
  querySelectorAll: () => [], querySelector: () => stub(),
  value: '', click() {}, files: []
});

global.document = {
  getElementById: () => stub(), querySelectorAll: () => [], querySelector: () => stub(),
  addEventListener() {}, createElement: () => stub(), body: { appendChild() {}, removeChild() {} }
};
global.window = undefined;
global.fetch = () => Promise.reject(new Error('offline'));
global.alert = () => {};
global.localStorage = {
  _d: {}, getItem(k) { return this._d[k] || null; },
  setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; }
};
global.setTimeout = f => f();

const FILES = [
  'data.js', 'events.js', 'difficulty.js', 'systems.js', 'careers.js',
  'economy.js', 'assets.js', 'social.js', 'shop.js', 'market.js',
  'avatar.js', 'easter.js', 'achievements.js', 'sound.js', 'eulogy.js',
  'will.js', 'school.js', 'court.js', 'invest.js', 'health.js',
  'crash.js', 'adminlink.js', 'a11y.js', 'i18n.js', 'coach.js', 'game.js'
];
const SRC = FILES.map(f => fs.readFileSync(path.join(PWA, f), 'utf8')).join('\n') + `
showPopup=function(p){
  if(p.type==='A') resolveChoice(p.ev, Math.floor(Math.random()*p.ev.c.length));
  else if(p.type==='D'){ if(p.yes && Math.random()<0.6) p.yes(); drain(); }
  else if(p.type==='COURT'){
    if(courtPlead) courtPlead(Math.random()<0.5?'guilty':'notguilty');
    if(courtCounsel) courtCounsel('duty');
    if(courtFinish) courtFinish();
  }
  else drain();
};
showDeath=function(){ finalChallenges(); };
module.exports={ api: {
  get S(){ return S; }, set S(v){ S=v; },
  DATA, EVENTS, ACHIEVEMENTS, CHALLENGES, CONDITIONS, EGGS,
  newGame, ageUp, ACTS, doAct, applyJob, jobEligible, jobLocked, tryPromote, doCrime, netWorth, drain,
  finalChallenges, reqOk, anyOf, partner, viewMoney, viewLife, viewPeople, viewActs, COND,
  openMoney, closeMoney, gameBack, promptExitGame, dismissExitPrompt, confirmExitGame,
  confirmBuyListing, confirmStartBusiness, buyListing, startBusiness, setTextSize, setVolume,
  PERSON_ACTIONS, TRACKS
}};`;

const bundlePath = '/tmp/stress_bundle.js';
fs.writeFileSync(bundlePath, SRC);
const G = require(bundlePath).api;

const LOG_FILE = '/home/user/audit_long_run.log';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  process.stdout.write(line);
}

log('=== STARTING 1-HOUR COMPREHENSIVE STRESS AUDIT ===');
log(`Node version: ${process.version}, PID: ${process.pid}`);

let totalLives = 0;
let totalTurns = 0;
let totalActions = 0;
let totalPurchases = 0;
let totalBackTaps = 0;
let totalInvariantChecks = 0;
let failures = [];

const startTime = Date.now();
const TARGET_DURATION_MS = 60 * 60 * 1000; // 1 hour

function checkInvariants(S) {
  totalInvariantChecks++;
  if (!S) return;

  // 1. Money integrity
  if (isNaN(S.money) || S.money === null || S.money === undefined) {
    throw new Error(`Corrupt money value: ${S.money} at age ${S.age}`);
  }

  // 2. Stats bounds
  for (const k of ['health', 'happiness', 'looks', 'smarts', 'discipline', 'reputation']) {
    const val = S.stats[k];
    if (val < -0.1 || val > 100.1 || isNaN(val)) {
      throw new Error(`Stat out of bounds: ${k} = ${val} at age ${S.age}`);
    }
  }

  // 3. Age-gating check
  if (S.age < 16) {
    if (S.vehicles && S.vehicles.length > 0) {
      // Check if it's not a toy/bicycle
      const cars = S.vehicles.filter(v => v.t !== 'bicycle');
      if (cars.length > 0) throw new Error(`Minor under 16 owns motor vehicle: ${JSON.stringify(cars)}`);
    }
  }
  if (S.age < 18) {
    if (S.properties && S.properties.length > 0) {
      throw new Error(`Minor under 18 owns real estate property: ${JSON.stringify(S.properties)}`);
    }
    if (S.businesses && S.businesses.length > 0) {
      throw new Error(`Minor under 18 owns commercial business`);
    }
  }

  // 4. Partner integrity
  const p = G.partner();
  if (p && !p.alive) {
    throw new Error(`Character married/partnered with deceased NPC: ${p.name}`);
  }
}

// Main stress loop
let batchIndex = 0;
while (Date.now() - startTime < TARGET_DURATION_MS) {
  batchIndex++;
  const batchStart = Date.now();
  let batchLives = 0;

  for (let i = 0; i < 50; i++) {
    const diff = ['easy', 'normal', 'hard', 'custom'][Math.floor(Math.random() * 4)];
    G.newGame({ diff });
    let lifeTurns = 0;

    while (G.S.alive && lifeTurns++ < 130) {
      totalTurns++;

      // Invariant check
      checkInvariants(G.S);

      // Random actions during turn
      let actionCount = 0;
      while (G.S.actionsLeft > 0 && actionCount++ < 6) {
        const acts = G.ACTS();
        if (!acts.length) break;
        const act = acts[Math.floor(Math.random() * acts.length)];
        G.doAct(act.id);
        totalActions++;
      }

      // Test new social actions
      if (G.S.npcs && G.S.npcs.length) {
        const npc = G.S.npcs[Math.floor(Math.random() * G.S.npcs.length)];
        if (npc && npc.alive) {
          const acts = G.PERSON_ACTIONS.filter(a => a.rel === '*' || (a.rel && a.rel.includes(npc.rel)));
          if (acts.length && Math.random() < 0.4) {
            const a = acts[Math.floor(Math.random() * acts.length)];
            try { a.run(npc); } catch (e) {
              failures.push(`PERSON_ACTION ${a.id} failed: ${e.message}`);
            }
          }
        }
      }

      // Test market interactions & age gates
      if (Math.random() < 0.3) {
        const sec = ['mkt_property', 'mkt_vehicle', 'cards', 'biz', 'invest', 'overview'][Math.floor(Math.random() * 6)];
        G.openMoney(sec);
        if (G.S.age < 18 && (sec === 'mkt_property' || sec === 'cards' || sec === 'biz')) {
          if (G.S.msection === sec) throw new Error(`Age gate failed for ${sec} at age ${G.S.age}`);
        }
        if (G.S.age < 16 && sec === 'mkt_vehicle') {
          if (G.S.msection === sec) throw new Error(`Age gate failed for vehicle at age ${G.S.age}`);
        }
        G.closeMoney();
      }

      // Test Android Back Button at random states
      if (Math.random() < 0.25) {
        totalBackTaps++;
        const backRes = G.gameBack();
        if (backRes !== true) throw new Error(`gameBack returned false unexpectedly`);
      }

      // Age up to next turn
      G.ageUp();
    }

    G.finalChallenges();
    totalLives++;
    batchLives++;
  }

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const remainingSec = Math.max(0, Math.round((TARGET_DURATION_MS - (Date.now() - startTime)) / 1000));
  const livesPerSec = (totalLives / (elapsedSec || 1)).toFixed(1);

  log(`[Audit Cycle ${batchIndex}] Simulated ${totalLives} lives (${totalTurns} turns, ${totalInvariantChecks} checks) | Speed: ${livesPerSec} lives/s | Elapsed: ${elapsedSec}s, Remaining: ${remainingSec}s | Failures: ${failures.length}`);

  if (failures.length > 0) {
    log(`CRITICAL FAILURES DETECTED:\n${failures.join('\n')}`);
    process.exit(1);
  }
}

log(`=== AUDIT COMPLETE: 1 HOUR COMPLETED SUCCESSFULLY ===`);
log(`Total Lives Simulated: ${totalLives}`);
log(`Total Turns Executed: ${totalTurns}`);
log(`Total Invariant Checks: ${totalInvariantChecks}`);
log(`Total Back Taps Tested: ${totalBackTaps}`);
log(`Failures: 0 (All invariants held perfectly)`);
