/* BEQUEST — the half of the admin console that lives inside the game.

   The console itself is pwa/admin/. This file is what it acts through:
   redeem codes, broadcasts, and forced events. It is in the game bundle
   because the game has to honour these things; the console is a separate
   page and is never shipped inside the app.

   HONEST LIMITS, because the quality bar is explicit about this:

   - A code is verified against a secret that is inside the bundle. Anyone
     who unpacks the APK can read it and mint their own codes. That is
     unavoidable for an offline game and it is why codes here grant only
     cosmetic and convenience things, never anything that costs money to
     produce. Plus is deliberately NOT grantable by code.
   - The console's passphrase is a speed bump on a device the owner already
     controls, not an authorisation boundary. If remote mode is ever pointed
     at a real server, that server must do its own authorisation and must
     not trust anything this page says.                                    */

const CODE_SECRET = 'bequest-v1-code-salt';
const CODE_GRANTS = {
  lp:   { n:'Legacy Points', apply:(v)=>{ META.lp = (META.lp||0) + v; } },
  perk: { n:'A perk',        apply:(v)=>{ META.perks = META.perks||{}; META.perks[v] = true; } },
  egg:  { n:'An easter egg', apply:(v)=>{ META.eggs = META.eggs||{}; if(!META.eggs[v]) META.eggs[v] = {age:0,life:META.lives||0,at:Date.now()}; } }
};

/* A short, readable, offline-verifiable code: TYPE-VALUE-CHECK */
function codeHash(body){
  let h = 2166136261;
  const s = body + '|' + CODE_SECRET;
  for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
}
function makeCode(type, value){
  const body = String(type).toUpperCase() + '-' + String(value).toUpperCase();
  return body + '-' + codeHash(body);
}
function readCode(code){
  const parts = String(code || '').trim().toUpperCase().split('-');
  if(parts.length !== 3) return null;
  const body = parts[0] + '-' + parts[1];
  if(codeHash(body) !== parts[2]) return null;
  const type = parts[0].toLowerCase();
  if(!CODE_GRANTS[type]) return null;
  return { type, raw: parts[1] };
}

function redeemCode(code){
  const parsed = readCode(code);
  if(!parsed) return popupOK('Not a valid code', 'Check it and try again.');
  META.redeemed = META.redeemed || {};
  const key = String(code).trim().toUpperCase();
  if(META.redeemed[key]) return popupOK('Already used', 'That code has been redeemed on this device.');
  const g = CODE_GRANTS[parsed.type];
  const value = parsed.type === 'lp' ? Math.max(0, Math.min(100000, parseInt(parsed.raw, 36) || 0))
                                     : parsed.raw.toLowerCase();
  g.apply(value);
  META.redeemed[key] = Date.now();
  saveMeta();
  cue('ach', 'medium');
  popupOK('Redeemed', `${g.n}: ${value}.`);
  renderAll();
}

/* ---- broadcasts ---- */
function broadcast(){ return (META.broadcast && META.broadcast.text) ? META.broadcast : null; }
function setBroadcast(text, until){
  META.broadcast = text ? { text: String(text).slice(0, 240), until: until || 0, seen: false } : null;
  saveMeta();
}
function dismissBroadcast(){ if(META.broadcast){ META.broadcast.seen = true; saveMeta(); renderAll(); } }
function broadcastCard(){
  const b = broadcast();
  if(!b || b.seen) return '';
  if(b.until && Date.now() > b.until) return '';
  return `<div class="card tip coach"><div class="ctrow"><div class="ct">A note from the developer</div></div>
    <div class="hsub">${esc(b.text)}</div>
    <div class="row mt"><button class="btn" onclick="dismissBroadcast()">Got it</button></div></div>`;
}

/* ---- forced events, for reproducing a report ---- */
function forceEvent(id){
  const ev = EVENTS.find(e => e.id === id);
  if(!ev) return false;
  META.forced = META.forced || [];
  if(META.forced.indexOf(id) < 0) META.forced.push(id);
  saveMeta();
  return true;
}
function clearForced(){ META.forced = []; saveMeta(); }
/* drained by ageUp before the random draw */
function takeForced(){
  const list = (META.forced || []).slice();
  if(!list.length) return [];
  META.forced = []; saveMeta();
  return list.map(id => EVENTS.find(e => e.id === id)).filter(Boolean);
}

/* ---- flags, the local equivalent of a ban ---- */
function flagSave(slot, reason){
  META.flags = META.flags || {};
  META.flags[slot] = reason ? { reason: String(reason).slice(0, 120), at: Date.now() } : null;
  if(!reason) delete META.flags[slot];
  saveMeta();
}
function saveFlag(slot){ return (META.flags || {})[slot] || null; }
