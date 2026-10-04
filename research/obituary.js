/* BEQUEST - the obituary, measured.

   ROADMAP item 8 claims a specific quality bar for the death screen: eight and
   a half sentences, 250 distinct opening lines over 250 lives, 61 distinct
   closing lines with the commonest at 16%. The claim was measured once, by a
   tool that was not committed. This is the instrument, so the numbers can be
   checked and cannot quietly go stale the way the event count did.

   What it counts, so the numbers cannot be misread:

     a sentence     a run ending in . ! or ? inside the text blocks
     the life block eulogy().life: how the life opened, what work it did
     the full text  life + people + estate + close, which is what is shown
     a leak         a {placeholder}, a raw "undefined", or a raw "NaN"

   Run:  node research/obituary.js [lives]      default 250, about 2.5 minutes
*/
'use strict';
const { load, runLife } = require('./steer.js');
const G = load();

const N = parseInt(process.argv[2] || '250', 10);
const sentences = a => (a.join(' ').match(/[.!?](\s|$)/g) || []).length;

const life = [], full = [], openings = [], closings = [];
let leaks = 0;

for (let seed = 1; seed <= N; seed++) {
  const s = runLife(G, seed);
  const e = G.eulogy(s, G.netWorth());
  const lifeText = (e.life || []).filter(Boolean);
  const fullText = lifeText.concat(e.people || [], e.estate || [], [e.close].filter(Boolean));
  life.push(sentences(lifeText));
  full.push(sentences(fullText));
  openings.push(lifeText[0] || '');
  closings.push(e.close || '');
  const raw = JSON.stringify(e);
  if (/\{[a-z]|undefined|NaN/.test(raw)) leaks++;
}

const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const uniq = a => new Set(a).size;
const counts = new Map();
closings.forEach(c => counts.set(c, (counts.get(c) || 0) + 1));
const commonest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0];

console.log(`\n${N} seeded lives, played by the scripted player in research/steer.js\n`);
console.log(`  sentences per obituary, full text  ${mean(full).toFixed(1)}`);
console.log(`  sentences per obituary, life block ${mean(life).toFixed(1)}`);
console.log(`  distinct opening lines             ${uniq(openings)} of ${N}`);
console.log(`  distinct closing lines             ${uniq(closings)}`);
console.log(`  commonest closing line             ${(100 * commonest[1] / N).toFixed(0)}%`);
console.log(`  lines leaking a placeholder        ${leaks}`);
console.log('\n  A low opening count is the one that matters: identical openings are the');
console.log('  first thing a player notices on a second death.\n');
