/* BEQUEST - year pacing, measured.

   ROADMAP item 9 changed how many sheets a year costs. The figures in the
   roadmap ("4.80 sheets a year to 3.86") came from a one-off tool that was
   never committed, so nobody, CI included, could reproduce them. This is the
   instrument, so the number stops being a memory.

   Definitions, because "a sheet" means nothing without one:

     sheet         every dismissable popup the engine shows: an event, a
                   notice, a confirmation, a result, a goal, a paywall.
     year tick     the paperwork of turning a year: birthday, notices, events,
                   achievements. `ageUp()` shows these.
     action sheet  a popup caused by something the player chose to do. The
                   player asked for it, so it is a different kind of tap.

   The scripted player lives a plausible life (see research/steer.js). A pacing
   number without a stated player is not a measurement, which is why the policy
   is named in the output too.

   Run:  node research/pacing.js [lives]        default 50, about 35 seconds
*/
'use strict';
const { load, runLife } = require('./steer.js');
const G = load();

const N = parseInt(process.argv[2] || '50', 10);

/* Decide what counts as a decision rather than a tap: a sheet that asks the
   player to pick between options, or to say yes or no. */
const DECISION = { A:1, C:1, CHOOSE:1, COURT:1, D:1 };

const origPopup = G.showPopup;
const realAgeUp = G.ageUp;

const years = [];            /* every year, as { tick, act } sheet counts */
const tickTypes = {};

let sink = null;             /* where popups are counted right now */
let tickSink = [], actSink = [] , started = false;

G.showPopup = function (p) {
  if (sink) {
    sink.push(p.type);
    if (sink === tickSink) tickTypes[p.type] = (tickTypes[p.type] || 0) + 1;
  }
  return origPopup(p);
};
/* A year begins inside ageUp() and ends when the next one begins: everything
   shown in between, including the results of the actions the player spent, is
   that year's paperwork. */
G.ageUp = function () {
  if (started) years.push({ tick: tickSink.length, act: actSink.length });
  started = true; tickSink = []; actSink = []; sink = tickSink;
  let r;
  try { r = realAgeUp(); } catch (e) { sink = actSink; throw e; }
  sink = actSink;
  return r;
};

for (let seed = 1; seed <= N; seed++) runLife(G, seed);
if (started) years.push({ tick: tickSink.length, act: actSink.length });

const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const tickCounts = years.map(y => y.tick), actCounts = years.map(y => y.act);
const all = years.map(y => y.tick + y.act);
const fourPlus = all.filter(n => n >= 4).length;
const decisions = Object.entries(tickTypes).filter(([t]) => DECISION[t]).reduce((n, [, c]) => n + c, 0);
const taps = Object.values(tickTypes).reduce((n, c) => n + c, 0) - decisions;

console.log(`\n${N} seeded lives, ${years.length} years, played by the scripted player in research/steer.js\n`);
console.log(`  sheets per year, all              ${mean(all).toFixed(2)}`);
console.log(`  year-tick sheets per year         ${mean(tickCounts).toFixed(2)}`);
console.log(`  action sheets per year            ${mean(actCounts).toFixed(2)}`);
console.log(`  years costing four or more        ${(100 * fourPlus / Math.max(1, all.length)).toFixed(0)}%`);
console.log(`\n  year tick, decisions vs taps      ${(decisions / Math.max(1, tickCounts.length)).toFixed(2)} decisions, ${(taps / Math.max(1, tickCounts.length)).toFixed(2)} taps per year`);
console.log('  year-tick sheets by type: ' +
  Object.entries(tickTypes).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', '));
console.log('\n  Figures are comparable only under this policy: a different robot spends its');
console.log('  years differently and will report a different number.\n');
