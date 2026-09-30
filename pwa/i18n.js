/* BEQUEST — one language today, any language later.

   The roadmap asked for this to be planned "before the library reaches 500
   events". It reached 533 first, so this is late, and the measurement is
   the point of it: 3,197 strings and 19,443 words, of which 91% is the
   event library. About £1,900 a language at trade rates.

   THE DESIGN, AND WHY IT IS NOT t('some.key')

   The obvious approach is to wrap every string in a call with an invented
   id. That would mean editing 533 events, inventing 3,197 ids, and living
   with the certainty that an id and its string eventually drift apart. It
   would also put a function call in the middle of prose that has been
   tuned line by line.

   Instead the catalogue is keyed by a hash of the English. The content
   files never change. A translator receives a JSON file of English to
   Other, and a missing entry falls back to the English that is already
   sitting in the source. There is no such thing as a missing-key crash and
   no such thing as a half-translated build that shows raw ids.

   The cost of that choice, stated plainly: editing an English string
   changes its key, so its translation is orphaned and falls back to the
   new English until somebody retranslates it. That is the right failure.
   The alternative is a stable id quietly pointing at a translation of a
   sentence that no longer exists.                                        */

let I18N = { locale: 'en', map: null, missing: null };

/* Must match tools/extract-strings.js exactly. A test asserts it does. */
function i18nKey(s){
  let h = 2166136261;
  const t = String(s);
  for(let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}

/* The whole runtime. Identity when no locale is loaded, so English pays
   nothing for this existing. */
function T(s){
  if(!I18N.map || typeof s !== 'string' || !s) return s;
  const hit = I18N.map[i18nKey(s.trim())];
  if(hit) return hit;
  if(I18N.missing) I18N.missing[s] = (I18N.missing[s] || 0) + 1;
  return s;
}

function setLocale(code, map){
  I18N.locale = code || 'en';
  I18N.map = map || null;
  if(map) localiseData();
  return I18N.locale;
}
function currentLocale(){ return I18N.locale; }
/* Turn on collection to find out what a translator still owes you. */
function trackMissing(on){ I18N.missing = on ? {} : null; }
function missingStrings(){ return I18N.missing ? Object.keys(I18N.missing) : []; }

/* ---- the tables ----
   Event prose goes through tok(), which is a single chokepoint. The data
   tables are rendered directly from their objects, so they are translated
   once, in place, when a locale is set. Idempotent: translating an already
   translated table is a lookup miss and a no-op. */
function localiseData(){
  const each = (arr, fields) => (arr || []).forEach(o => {
    if(!o) return;
    fields.forEach(f => { if(typeof o[f] === 'string') o[f] = T(o[f]); });
  });
  const vals = (obj, fields) => Object.values(obj || {}).forEach(o => {
    if(!o || typeof o !== 'object') return;
    fields.forEach(f => { if(typeof o[f] === 'string') o[f] = T(o[f]); });
  });
  try{
    if(typeof DATA !== 'undefined' && DATA){
      each(DATA.jobs, ['t']); each(DATA.crimes, ['n']);
      each(DATA.items, ['n','d']); each(DATA.news, ['t']); each(DATA.ribs, ['n']);
      vals(DATA.skills, ['name']); vals(DATA.habits, ['name']);
      if(Array.isArray(DATA.eduNames)) DATA.eduNames = DATA.eduNames.map(T);
      if(DATA.statNames) Object.keys(DATA.statNames).forEach(k => DATA.statNames[k] = T(DATA.statNames[k]));
      if(DATA.fieldNames) Object.keys(DATA.fieldNames).forEach(k => DATA.fieldNames[k] = T(DATA.fieldNames[k]));
    }
    if(typeof ACHIEVEMENTS !== 'undefined') each(ACHIEVEMENTS, ['n','d']);
    if(typeof CHALLENGES !== 'undefined')   each(CHALLENGES, ['n','d']);
    if(typeof CONDITIONS !== 'undefined')   each(CONDITIONS, ['n']);
    if(typeof PERSONALITIES !== 'undefined')each(PERSONALITIES, ['n']);
    if(typeof PROPERTY_TYPES !== 'undefined')each(PROPERTY_TYPES, ['n']);
    if(typeof VEHICLES !== 'undefined')     each(VEHICLES, ['n']);
    if(typeof BUSINESSES !== 'undefined')   each(BUSINESSES, ['n']);
    if(typeof DEGREES !== 'undefined')      each(DEGREES, ['n']);
    if(typeof SUBJECTS !== 'undefined')     each(SUBJECTS, ['n']);
    if(typeof ASSETS !== 'undefined')       each(ASSETS, ['n','d']);
    if(typeof HEIRLOOMS !== 'undefined')    each(HEIRLOOMS, ['n']);
    if(typeof COUNSEL !== 'undefined')      each(COUNSEL, ['n','d']);
  }catch(e){ if(typeof softFail === 'function') softFail('localiseData', e); }
}

/* ---- proving the pipeline without a translator ----
   A pseudo-locale answers the two questions a real translation would:
   does every string actually pass through the lookup, and does the layout
   survive a language that runs a third longer than English. Accents make
   an untranslated string obvious on screen; the padding catches a button
   that only fits because English is short.                              */
const PSEUDO_MAP = { a:'\u00e1', e:'\u00e9', i:'\u00ed', o:'\u00f3', u:'\u00fa',
                     A:'\u00c1', E:'\u00c9', I:'\u00cd', O:'\u00d3', U:'\u00da' };
function pseudoLocale(strings){
  const map = {};
  (strings || []).forEach(s => {
    if(typeof s !== 'string' || !s.trim()) return;
    /* leave {tokens} alone: mangling them would break substitution, and a
       real translator is told to leave them alone too */
    const body = s.replace(/\{(\w+)\}|[A-Za-z]/g,
      (m, tokenName) => tokenName ? m : (PSEUDO_MAP[m] || m));
    map[i18nKey(s.trim())] = '\u27e6' + body + '\u2027\u2027\u2027\u27e7';
  });
  return map;
}
