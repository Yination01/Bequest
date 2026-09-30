#!/usr/bin/env node
/* BEQUEST — pull every user-facing string out of the content files.
 *
 * The catalogue is keyed by a hash of the English source, not by an invented
 * id. That means the content files never change: no t('evt.c_bully.title')
 * scattered through 533 events, no chance of a key and a string drifting
 * apart, and no risk to prose that has been tuned line by line. Translation
 * becomes "produce a JSON file", and a missing entry silently falls back to
 * the English that is already there.
 *
 *   node tools/extract-strings.js            report the scale
 *   node tools/extract-strings.js --write    write locales/en.json
 */
const fs = require('fs'), path = require('path');
const PWA = path.join(__dirname, '..', 'pwa');

function hashKey(s){
  let h = 2166136261;
  for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}

function load(file, expose){
  const src = fs.readFileSync(path.join(PWA, file), 'utf8');
  const g = {};
  new Function('g', src + ';' + expose)(g);
  return g;
}

const out = new Map();          /* key -> {en, where, words} */
const add = (s, where) => {
  if(typeof s !== 'string') return;
  const t = s.trim();
  if(!t || t.length < 2) return;
  if(/^[\s\d.,:;!?%$+\-\u2014\u2013]*$/.test(t)) return;   /* punctuation and numbers */
  if(/^\\u[0-9a-f]{4}$/i.test(t)) return;                  /* a lone glyph */
  const k = hashKey(t);
  if(!out.has(k)) out.set(k, { en: t, where: where, words: t.split(/\s+/).length });
};

/* ---- events: the bulk of it ---- */
const ev = load('events.js', 'g.EVENTS=EVENTS;');
ev.EVENTS.forEach(e => {
  add(e.t, 'event.title');
  (Array.isArray(e.x) ? e.x : [e.x]).forEach(x => add(x, 'event.text'));
  (e.c || []).forEach(c => add(c.l, 'event.choice'));
});

/* ---- the data tables the player reads ---- */
const d = load('data.js', 'g.DATA=DATA;');
(d.DATA.jobs || []).forEach(j => add(j.t, 'job'));
(d.DATA.crimes || []).forEach(c => add(c.n, 'crime'));
(d.DATA.items || []).forEach(i => { add(i.n, 'item'); add(i.d, 'item.desc'); });
(d.DATA.news || []).forEach(n => add(n.t, 'news'));
(d.DATA.ribs || []).forEach(r => add(r.n, 'ribbon'));
Object.values(d.DATA.skills || {}).forEach(s => add(s.name, 'skill'));
Object.values(d.DATA.habits || {}).forEach(h => add(h.name, 'habit'));
(d.DATA.eduNames || []).forEach(n => add(n, 'education'));
Object.values(d.DATA.statNames || {}).forEach(n => add(n, 'stat'));
Object.values(d.DATA.fieldNames || {}).forEach(n => add(n, 'field'));

/* ---- the rest of the content modules ---- */
const pairs = [
  ['achievements.js', 'g.A=ACHIEVEMENTS;g.C=typeof CHALLENGES!=="undefined"?CHALLENGES:[];', g => {
    (g.A || []).forEach(a => { add(a.n, 'achievement'); add(a.d, 'achievement.desc'); });
    (g.C || []).forEach(c => { add(c.n, 'challenge'); add(c.d, 'challenge.desc'); });
  }],
  ['systems.js', 'g.C=CONDITIONS;g.P=typeof PERSONALITIES!=="undefined"?PERSONALITIES:[];', g => {
    (g.C || []).forEach(c => add(c.n, 'condition'));
    (g.P || []).forEach(p => add(p.n, 'personality'));
  }],
  ['assets.js', 'g.P=PROPERTY_TYPES;g.V=VEHICLES;g.B=BUSINESSES;', g => {
    (g.P || []).forEach(x => add(x.n, 'property'));
    (g.V || []).forEach(x => add(x.n, 'vehicle'));
    (g.B || []).forEach(x => add(x.n, 'business'));
  }],
  ['social.js', 'g.D=DEGREES;', g => (g.D || []).forEach(x => add(x.n, 'degree'))],
  ['school.js', 'g.S=SUBJECTS;', g => (g.S || []).forEach(x => add(x.n, 'subject'))],
  ['invest.js', 'g.A=ASSETS;', g => (g.A || []).forEach(x => { add(x.n, 'asset'); add(x.d, 'asset.desc'); })],
  ['will.js', 'g.H=HEIRLOOMS;', g => (g.H || []).forEach(x => add(x.n, 'heirloom'))],
  ['court.js', 'g.C=COUNSEL;', g => (g.C || []).forEach(x => { add(x.n, 'counsel'); add(x.d, 'counsel.desc'); })],
  ['coach.js', 'g.T=typeof COACH_TIPS!=="undefined"?COACH_TIPS:[];', g =>
    (g.T || []).forEach(t => { add(t.t, 'tip'); add(t.d || t.body, 'tip.body'); })],
];
pairs.forEach(([file, expose, fn]) => { try { fn(load(file, expose)); } catch(e){
  console.error('  ! could not read ' + file + ': ' + e.message); } });

/* ---- report ---- */
const rows = [...out.values()];
const byWhere = {};
rows.forEach(r => { byWhere[r.where] = byWhere[r.where] || { n:0, w:0 };
  byWhere[r.where].n++; byWhere[r.where].w += r.words; });
const totalWords = rows.reduce((n, r) => n + r.words, 0);

console.log(`${rows.length} translatable strings, ${totalWords.toLocaleString()} words\n`);
Object.keys(byWhere).sort((a,b) => byWhere[b].w - byWhere[a].w).forEach(k =>
  console.log(`  ${k.padEnd(18)} ${String(byWhere[k].n).padStart(5)} strings  ${String(byWhere[k].w).padStart(6)} words`));

const rate = 0.10;
console.log(`\nat $${rate.toFixed(2)} a word, one language is about $${Math.round(totalWords * rate).toLocaleString()}.`);
console.log(`five languages, about $${Math.round(totalWords * rate * 5).toLocaleString()}.`);

if(process.argv.includes('--write')){
  const dir = path.join(__dirname, '..', 'locales');
  fs.mkdirSync(dir, { recursive: true });
  const cat = {};
  rows.sort((a,b) => a.where.localeCompare(b.where) || a.en.localeCompare(b.en));
  rows.forEach(r => { cat[hashKey(r.en)] = r.en; });
  fs.writeFileSync(path.join(dir, 'en.json'), JSON.stringify(cat, null, 1));
  const meta = { generated: new Date().toISOString().slice(0,10), strings: rows.length,
                 words: totalWords, sections: byWhere };
  fs.writeFileSync(path.join(dir, 'en.meta.json'), JSON.stringify(meta, null, 1));
  console.log(`\nwrote locales/en.json (${rows.length} entries) and en.meta.json`);
}
