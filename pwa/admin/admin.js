/* BEQUEST — Admin Console.

   Built to the shape of Football-Legend's console: a passphrase gate, a
   sidebar, a PAGES object, cards and tables. What differs is what sits
   behind it, because Bequest has no Supabase and no accounts.

   Football-Legend administers a player base. This administers a device.
   It reads and writes the same localStorage the game uses, so it must be
   opened from the same origin as the game: serve pwa/ and visit
   /admin/. Opening it from a file:// path will show an empty console,
   because that is a different origin and a different storage jar.

   REMOTE MODE. Everything here is written against a small adapter with two
   implementations. DeviceStore talks to localStorage. CloudStore talks to
   the same /cloud/:code endpoint the game's sync uses. The moment a real
   server exists, the console administers it with no page changes. Until
   then remote mode is inert and says so.

   WHAT THIS IS NOT. The passphrase is a speed bump on hardware the owner
   already holds. It is not an authorisation boundary and must never be
   treated as one. If remote mode is pointed at a real server, that server
   does its own authorisation and trusts nothing this page sends.         */

'use strict';

/* these must match game.js exactly; a test resolves them from source */
var META_KEY = 'bequest.meta.v1';
var SAVE_KEY = 'bequest.save.v1';
var PASS_KEY = 'bequest.admin.pass';
var SESSION_KEY = 'bequest.admin.session';
var page = 'overview';
var store = null;
var NAV = [
  ['overview',  'Overview',   'device at a glance'],
  ['saves',     'Saves',      'inspect and edit'],
  ['grants',    'Grants',     'points, perks, eggs'],
  ['codes',     'Codes',      'generate and check'],
  ['events',    'Events',     'force one to fire'],
  ['broadcast', 'Broadcast',  'a note in the game'],
  ['problems',  'Problems',   'crash reports'],
  ['tools',     'Tools',      'export, import, reset']
];

function $(s){ return document.querySelector(s); }
function esc(s){ return String(s == null ? '' : s)
  .replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
function toast(m){ var t = $('#toast'); t.textContent = m; t.className = 'toast on';
  setTimeout(function(){ t.className = 'toast'; }, 1800); }
function money(n){ n = Math.round(Number(n) || 0);
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(); }
function hash(s){ var h = 2166136261;
  for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36); }

/* ---------- the storage adapter ---------- */
var SLOTS = 3;
function DeviceStore(){
  this.name = 'This device';
  this.remote = false;
}
DeviceStore.prototype.meta = function(){
  try { return JSON.parse(localStorage.getItem(META_KEY) || '{}') || {}; }
  catch(e){ return {}; }
};
DeviceStore.prototype.setMeta = function(m){
  localStorage.setItem(META_KEY, JSON.stringify(m));
};
DeviceStore.prototype.slots = function(){
  var out = [];
  for(var i = 1; i <= SLOTS; i++){
    var raw = null;
    try { raw = localStorage.getItem('bequest.slot' + i); } catch(e){}
    out.push({ n: i, save: raw ? JSON.parse(raw) : null });
  }
  return out;
};
DeviceStore.prototype.setSlot = function(n, save){
  if(save === null) localStorage.removeItem('bequest.slot' + n);
  else localStorage.setItem('bequest.slot' + n, JSON.stringify(save));
};
DeviceStore.prototype.crashes = function(){
  try { return JSON.parse(localStorage.getItem('bequest.crashlog') || '[]') || []; }
  catch(e){ return []; }
};
DeviceStore.prototype.clearCrashes = function(){ localStorage.removeItem('bequest.crashlog'); };

function CloudStore(url, code){
  this.name = 'Remote: ' + code;
  this.remote = true; this.url = url; this.code = code;
}
CloudStore.prototype.unavailable = function(){
  return 'Remote mode has no server behind it yet. When one exists, this '
       + 'console talks to it through the same /cloud/:code endpoint the game '
       + 'already uses, and the SERVER must do the authorisation.';
};

/* ---------- the gate ---------- */
function passSet(){ return !!localStorage.getItem(PASS_KEY); }
function signIn(){
  var v = $('#pw').value || '';
  if(!v) return toast('Enter the passphrase');
  if(!passSet()){
    if(v.length < 8) return toast('Use at least 8 characters');
    localStorage.setItem(PASS_KEY, hash(v));
    sessionStorage.setItem(SESSION_KEY, '1');
    toast('Passphrase set');
    return boot();
  }
  if(hash(v) !== localStorage.getItem(PASS_KEY)) return toast('Wrong passphrase');
  sessionStorage.setItem(SESSION_KEY, '1');
  boot();
}
function signOut(){ sessionStorage.removeItem(SESSION_KEY); boot(); }
function renderLock(){
  var first = !passSet();
  $('#app').innerHTML =
    '<div class="lock"><div class="logo">BEQUEST <i>ADMIN</i></div>'
    + '<p class="muted">Console</p>'
    + '<div class="panel">'
    + (first
       ? '<p class="muted" style="margin-top:0">No passphrase is set on this device. '
         + 'Choose one now. It is stored as a hash, on this device only.</p>'
       : '<p class="muted" style="margin-top:0">Enter the console passphrase.</p>')
    + '<input id="pw" type="password" placeholder="passphrase" '
    + 'onkeydown="if(event.key===\'Enter\')signIn()">'
    + '<div class="row"><button class="btn grow" onclick="signIn()">'
    + (first ? 'Set and open' : 'Open console') + '</button></div>'
    + '</div>'
    + '<p class="muted" style="font-size:12px;margin-top:16px">This is a local tool for '
    + 'the owner of this device. The passphrase is a speed bump, not a security '
    + 'boundary, and this page is never shipped inside the app.</p></div>';
}

/* ---------- shell ---------- */
function boot(){
  if(!sessionStorage.getItem(SESSION_KEY)) return renderLock();
  if(!store) store = new DeviceStore();
  render();
}
function go(p){ page = p; render(); }
function render(){
  var nav = NAV.map(function(n){
    return '<button class="' + (page === n[0] ? 'on' : '') + '" onclick="go(\'' + n[0] + '\')">'
      + n[1] + '<span>' + n[2] + '</span></button>';
  }).join('');
  $('#app').innerHTML =
    '<div class="layout"><div class="side">'
    + '<div class="brand"><div><span class="b1">BEQUEST</span> <span class="b2">ADMIN</span></div>'
    + '<div class="sub">' + esc(store.name) + '</div></div>'
    + '<div class="nav">' + nav + '</div>'
    + '<div class="me">Local console<button onclick="signOut()">Lock</button></div>'
    + '</div><div class="main" id="main"></div></div>';
  try { PAGES[page](); }
  catch(e){ $('#main').innerHTML = '<div class="warn">This page failed: ' + esc(e.message) + '</div>'; }
}
function card(k, v, s){
  return '<div class="card"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + '</div>'
    + '<div class="s">' + esc(s || '') + '</div></div>';
}
function head(title, crumb){
  return '<h1>' + esc(title) + '</h1><div class="crumb">' + esc(crumb) + '</div>';
}

/* ---------- pages ---------- */
var PAGES = {};

PAGES.overview = function(){
  var m = store.meta(), slots = store.slots();
  var used = slots.filter(function(s){ return s.save; });
  var ach = Object.keys(m.ach || {}).length;
  var eggs = Object.keys(m.eggs || {}).length;
  var crashes = store.crashes();
  $('#main').innerHTML = head('Overview', 'Everything on this device. Nothing here has ever left it.')
    + '<div class="cards">'
    + card('Lives played', m.lives || 0, 'all time')
    + card('Legacy Points', (m.lp || 0).toLocaleString(), 'spendable')
    + card('Saves in use', used.length + ' of ' + SLOTS, used.length ? 'slot ' + used.map(function(s){return s.n;}).join(', ') : 'none')
    + card('Achievements', ach, 'unlocked')
    + card('Easter eggs', eggs, 'found')
    + card('Problem reports', crashes.length, crashes.length ? 'see Problems' : 'none recorded')
    + '</div>'
    + (m.premium && (m.premium.plus || m.premium.lifetime)
        ? '<div class="note">Bequest Plus is <b>active</b> on this device'
          + (m.premium.lifetime ? ' (lifetime)' : '') + '.</div>'
        : '')
    + (m.premium && m.premium.protoUnlocked
        ? '<div class="warn">Developer build: the prototype controls are visible in the game. '
          + 'Clear <code>bequest.dev</code> before producing a store build.</div>'
        : '')
    + '<div class="card"><table><tr><th>Slot</th><th>Who</th><th>Age</th><th>Worth</th><th>Flag</th></tr>'
    + slots.map(function(s){
        if(!s.save) return '<tr><td>' + s.n + '</td><td class="muted" colspan="4">empty</td></tr>';
        var f = (m.flags || {})[s.n];
        return '<tr><td>' + s.n + '</td><td>' + esc(s.save.name || '?') + '</td><td>'
          + esc(s.save.age) + '</td><td>' + money(s.save.money) + '</td><td>'
          + (f ? '<span class="pill r">' + esc(f.reason) + '</span>' : '<span class="muted">-</span>')
          + '</td></tr>';
      }).join('')
    + '</table></div>';
};

PAGES.saves = function(){
  var slots = store.slots(), m = store.meta();
  $('#main').innerHTML = head('Saves', 'Inspect, edit and flag the lives on this device.')
    + slots.map(function(s){
        if(!s.save) return '<div class="card"><b>Slot ' + s.n + '</b> <span class="muted">empty</span></div>';
        var v = s.save, f = (m.flags || {})[s.n];
        return '<div class="card"><div class="row" style="margin:0 0 10px">'
          + '<b class="grow">Slot ' + s.n + ': ' + esc(v.name) + '</b>'
          + (f ? '<span class="pill r">flagged</span>' : '')
          + '</div><table>'
          + '<tr><th>Age</th><th>Gen</th><th>Country</th><th>Money</th><th>Job</th><th>Children</th></tr>'
          + '<tr><td>' + esc(v.age) + '</td><td>' + esc(v.gen) + '</td><td>' + esc(v.country)
          + '</td><td>' + money(v.money) + '</td><td>' + esc(v.job ? v.job.t : 'none')
          + '</td><td>' + ((v.npcs || []).filter(function(n){return n.rel === 'child';}).length) + '</td></tr>'
          + '</table>'
          + '<div class="row">'
          + '<input class="grow" id="fld' + s.n + '" placeholder="field, e.g. money or stats.health">'
          + '<input class="grow" id="val' + s.n + '" placeholder="new value">'
          + '<button class="btn" onclick="editField(' + s.n + ')">Set</button>'
          + '<button class="btn sec" onclick="dumpSave(' + s.n + ')">Raw</button>'
          + '<button class="btn sec" onclick="flagSlot(' + s.n + ')">' + (f ? 'Unflag' : 'Flag') + '</button>'
          + '<button class="btn bad" onclick="wipeSlot(' + s.n + ')">Delete</button>'
          + '</div><div id="dump' + s.n + '"></div></div>';
      }).join('');
};
function editField(n){
  var path = ($('#fld' + n).value || '').trim();
  var raw = $('#val' + n).value;
  if(!path) return toast('Name a field');
  var slots = store.slots(), save = slots[n - 1].save;
  if(!save) return toast('That slot is empty');
  var parts = path.split('.'), o = save;
  for(var i = 0; i < parts.length - 1; i++){
    if(o[parts[i]] == null || typeof o[parts[i]] !== 'object') return toast('No such field: ' + path);
    o = o[parts[i]];
  }
  var leaf = parts[parts.length - 1];
  if(!(leaf in o)) return toast('No such field: ' + path);
  var before = o[leaf];
  var next = raw;
  if(typeof before === 'number'){ next = Number(raw); if(isNaN(next)) return toast('Needs a number'); }
  else if(typeof before === 'boolean'){ next = (raw === 'true' || raw === '1'); }
  o[leaf] = next;
  store.setSlot(n, save);
  toast(path + ': ' + before + ' -> ' + next);
  render();
}
function dumpSave(n){
  var save = store.slots()[n - 1].save;
  $('#dump' + n).innerHTML = '<pre>' + esc(JSON.stringify(save, null, 1).slice(0, 12000)) + '</pre>';
}
function flagSlot(n){
  var m = store.meta();
  m.flags = m.flags || {};
  if(m.flags[n]) delete m.flags[n];
  else {
    var why = prompt('Why is this save flagged?', 'looks edited');
    if(why === null) return;
    m.flags[n] = { reason: String(why).slice(0, 120), at: Date.now() };
  }
  store.setMeta(m); render();
}
function wipeSlot(n){
  if(!confirm('Delete slot ' + n + '? This cannot be undone.')) return;
  store.setSlot(n, null); toast('Slot ' + n + ' deleted'); render();
}

PAGES.grants = function(){
  var m = store.meta();
  $('#main').innerHTML = head('Grants', 'Give this device something. The game reads it on next load.')
    + '<div class="cards">'
    + card('Legacy Points', (m.lp || 0).toLocaleString(), 'current')
    + card('Perks owned', Object.keys(m.perks || {}).length, '')
    + card('Plus', (m.premium && (m.premium.plus || m.premium.lifetime)) ? 'active' : 'off', '')
    + '</div>'
    + '<div class="card"><b>Legacy Points</b>'
    + '<div class="row"><input class="grow" id="lpAmt" type="number" value="500">'
    + '<button class="btn" onclick="grantLP()">Add</button>'
    + '<button class="btn sec" onclick="grantLP(true)">Set exactly</button></div></div>'
    + '<div class="card"><b>Bequest Plus</b>'
    + '<div class="note" style="margin:10px 0">Plus is the one thing a code can never grant, '
    + 'because it is bought with money. Setting it here affects this device only and is for '
    + 'testing both sides of the paywall.</div>'
    + '<div class="row"><button class="btn sec" onclick="grantPlus(\'sub\')">Subscription on</button>'
    + '<button class="btn sec" onclick="grantPlus(\'lifetime\')">Lifetime on</button>'
    + '<button class="btn bad" onclick="grantPlus(\'off\')">Off</button></div></div>'
    + '<div class="card"><b>Unlock by id</b>'
    + '<div class="row"><select id="grantKind" class="grow">'
    + '<option value="ach">Achievement</option><option value="eggs">Easter egg</option>'
    + '<option value="perks">Perk</option></select>'
    + '<input class="grow" id="grantId" placeholder="id, e.g. selfmade">'
    + '<button class="btn" onclick="grantId()">Unlock</button></div>'
    + '<div class="muted" style="font-size:12px;margin-top:8px">Currently unlocked: '
    + (Object.keys(m.ach || {}).length + ' achievements, '
      + Object.keys(m.eggs || {}).length + ' eggs, '
      + Object.keys(m.perks || {}).length + ' perks') + '</div></div>';
};
function grantLP(exact){
  var m = store.meta(), v = Number($('#lpAmt').value) || 0;
  m.lp = exact ? Math.max(0, v) : Math.max(0, (m.lp || 0) + v);
  store.setMeta(m); toast('Legacy Points: ' + m.lp); render();
}
function grantPlus(kind){
  var m = store.meta();
  m.premium = m.premium || {};
  m.premium.plus = kind !== 'off';
  m.premium.lifetime = kind === 'lifetime';
  if(kind !== 'off' && !m.premium.since) m.premium.since = Date.now();
  store.setMeta(m); toast('Plus ' + (kind === 'off' ? 'off' : kind)); render();
}
function grantId(){
  var m = store.meta(), k = $('#grantKind').value, id = ($('#grantId').value || '').trim();
  if(!id) return toast('Name an id');
  m[k] = m[k] || {};
  m[k][id] = (k === 'eggs') ? { age: 0, life: m.lives || 0, at: Date.now() } : true;
  store.setMeta(m); toast(k + '.' + id + ' unlocked'); render();
}

PAGES.codes = function(){
  var m = store.meta(), used = m.redeemed || {};
  $('#main').innerHTML = head('Codes', 'Short codes the game can verify with no server.')
    + '<div class="warn">A code is checked against a secret inside the app bundle. '
    + 'Anyone who unpacks the APK can read it and mint their own. That is why codes grant '
    + 'points, perks and eggs, and never Plus.</div>'
    + '<div class="card"><b>Generate</b>'
    + '<div class="row"><select id="cType" class="grow">'
    + '<option value="LP">Legacy Points</option><option value="PERK">Perk</option>'
    + '<option value="EGG">Easter egg</option></select>'
    + '<input class="grow" id="cVal" placeholder="amount, or the id">'
    + '<button class="btn" onclick="genCode()">Make code</button></div>'
    + '<div id="codeOut"></div>'
    + '<div class="muted" style="font-size:12px;margin-top:10px">Legacy Point amounts are '
    + 'written in base 36, so 500 becomes <code>DW</code>. Type the plain number here.</div></div>'
    + '<div class="card"><b>Check a code</b>'
    + '<div class="row"><input class="grow" id="cCheck" placeholder="LP-DW-XXXX">'
    + '<button class="btn sec" onclick="checkCode()">Check</button></div>'
    + '<div id="checkOut"></div></div>'
    + '<div class="card"><b>Redeemed on this device</b>'
    + (Object.keys(used).length
        ? '<table><tr><th>Code</th><th>When</th></tr>'
          + Object.keys(used).map(function(c){
              return '<tr><td><code>' + esc(c) + '</code></td><td>'
                + new Date(used[c]).toLocaleString() + '</td></tr>'; }).join('')
          + '</table>'
        : '<div class="muted">None yet.</div>')
    + '</div>';
};
/* the same algorithm as adminlink.js, kept in step by a test */
var CODE_SECRET = 'bequest-v1-code-salt';
function codeHash(body){
  var h = 2166136261, s = body + '|' + CODE_SECRET;
  for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36).toUpperCase().slice(0, 4);
  }
function padCheck(c){ return c.length < 4 ? new Array(5 - c.length).join('0') + c : c; }
function makeCode(type, value){
  var body = String(type).toUpperCase() + '-' + String(value).toUpperCase();
  return body + '-' + padCheck(codeHash(body));
}
function genCode(){
  var t = $('#cType').value, raw = ($('#cVal').value || '').trim();
  if(!raw) return toast('Give an amount or an id');
  var v = (t === 'LP') ? (Number(raw) || 0).toString(36) : raw;
  var code = makeCode(t, v);
  $('#codeOut').innerHTML = '<div class="row"><pre style="flex:1 1 auto;margin:0">' + esc(code)
    + '</pre><button class="btn sec" onclick="copyText(\'' + esc(code) + '\')">Copy</button></div>';
}
function checkCode(){
  var c = ($('#cCheck').value || '').trim().toUpperCase(), p = c.split('-');
  var ok = p.length === 3 && padCheck(codeHash(p[0] + '-' + p[1])) === p[2];
  $('#checkOut').innerHTML = '<div class="' + (ok ? 'note' : 'warn') + '" style="margin:12px 0 0">'
    + (ok ? 'Valid: grants ' + esc(p[0]) + ' ' + esc(p[0] === 'LP' ? parseInt(p[1], 36) : p[1])
          : 'Not a valid code.') + '</div>';
}
function copyText(t){
  navigator.clipboard ? navigator.clipboard.writeText(t) : 0; toast('Copied');
}

PAGES.events = function(){
  var m = store.meta(), forced = m.forced || [];
  $('#main').innerHTML = head('Events', 'Force an event to fire on the next year, to reproduce a report.')
    + '<div class="card"><b>Force an event</b>'
    + '<div class="row"><input class="grow" id="evId" placeholder="event id, e.g. g_kidsfight">'
    + '<button class="btn" onclick="queueEvent()">Queue it</button>'
    + '<button class="btn sec" onclick="clearQueue()">Clear all</button></div>'
    + '<div class="muted" style="font-size:12px;margin-top:8px">The game drains this before '
    + 'drawing random events, so a queued event fires on the very next AGE UP. Requirements '
    + 'are bypassed, which is the point.</div></div>'
    + '<div class="card"><b>Queued</b>'
    + (forced.length
        ? '<table><tr><th>Event</th><th></th></tr>' + forced.map(function(id, i){
            return '<tr><td><code>' + esc(id) + '</code></td><td style="text-align:right">'
              + '<button class="btn sec" onclick="unqueue(' + i + ')">Remove</button></td></tr>';
          }).join('') + '</table>'
        : '<div class="muted">Nothing queued.</div>')
    + '</div>';
};
function queueEvent(){
  var id = ($('#evId').value || '').trim();
  if(!id) return toast('Name an event id');
  var m = store.meta(); m.forced = m.forced || [];
  if(m.forced.indexOf(id) < 0) m.forced.push(id);
  store.setMeta(m); toast('Queued ' + id); render();
}
function unqueue(i){
  var m = store.meta(); (m.forced || []).splice(i, 1); store.setMeta(m); render();
}
function clearQueue(){ var m = store.meta(); m.forced = []; store.setMeta(m); render(); }

PAGES.broadcast = function(){
  var m = store.meta(), b = m.broadcast;
  $('#main').innerHTML = head('Broadcast', 'A note shown at the top of the Life tab until dismissed.')
    + '<div class="card"><b>Message</b>'
    + '<div style="margin-top:10px"><textarea id="bcText" placeholder="Something short and plain.">'
    + esc(b ? b.text : '') + '</textarea></div>'
    + '<div class="row"><button class="btn" onclick="putBroadcast()">Publish</button>'
    + '<button class="btn bad" onclick="killBroadcast()">Remove</button></div></div>'
    + (b ? '<div class="card"><b>Live now</b><div class="muted" style="margin-top:6px">'
         + esc(b.text) + '</div><div class="muted" style="font-size:12px;margin-top:8px">'
         + (b.seen ? 'The player has dismissed it.' : 'Not yet dismissed.') + '</div></div>'
       : '');
};
function putBroadcast(){
  var t = ($('#bcText').value || '').trim();
  if(!t) return toast('Write something first');
  var m = store.meta();
  m.broadcast = { text: t.slice(0, 240), until: 0, seen: false };
  store.setMeta(m); toast('Published'); render();
}
function killBroadcast(){ var m = store.meta(); m.broadcast = null; store.setMeta(m); render(); }

PAGES.problems = function(){
  var list = store.crashes().slice().reverse();
  $('#main').innerHTML = head('Problems', 'Crash and soft-failure reports held on this device.')
    + '<div class="note">These never left the phone. There is no destination configured, and '
    + 'sending is gated on an opt-in that defaults to off.</div>'
    + (list.length
        ? '<div class="card"><div class="row" style="margin:0 0 10px">'
          + '<b class="grow">' + list.length + ' report' + (list.length === 1 ? '' : 's') + '</b>'
          + '<button class="btn bad" onclick="wipeCrashes()">Delete all</button></div>'
          + list.map(function(r){
              var c = r.ctx || {};
              return '<div style="border-top:1px solid var(--line);padding-top:10px;margin-top:10px">'
                + '<span class="pill ' + (r.kind === 'soft' ? 'a' : 'r') + '">' + esc(r.kind) + '</span> '
                + '<code>' + esc(r.where) + '</code> '
                + '<span class="muted">' + new Date(r.at).toLocaleString() + '</span>'
                + '<div style="margin-top:6px">' + esc(r.msg) + '</div>'
                + '<div class="muted" style="font-size:12px;margin-top:4px">age ' + esc(c.age)
                + ' · ' + esc(c.country) + ' · ' + esc(c.diff) + ' · screen ' + esc(c.screen)
                + ' · did ' + esc((c.acts || []).join(' > ')) + '</div>'
                + '<pre style="margin-top:8px">' + esc(r.stack || '') + '</pre></div>';
            }).join('')
          + '</div>'
        : '<div class="card"><span class="muted">Nothing has gone wrong on this device.</span></div>');
};
function wipeCrashes(){ if(confirm('Delete all reports?')){ store.clearCrashes(); render(); } }

PAGES.tools = function(){
  $('#main').innerHTML = head('Tools', 'Move everything off this device, or start it again.')
    + '<div class="card"><b>Export</b>'
    + '<div class="muted" style="margin:6px 0 0">Everything the game stores, as one file.</div>'
    + '<div class="row"><button class="btn" onclick="exportAll()">Download</button>'
    + '<button class="btn sec" onclick="showAll()">Show it</button></div>'
    + '<div id="allOut"></div></div>'
    + '<div class="card"><b>Import</b>'
    + '<div style="margin-top:10px"><textarea id="impText" placeholder="Paste an export here."></textarea></div>'
    + '<div class="row"><button class="btn" onclick="importAll()">Replace everything</button></div></div>'
    + '<div class="card"><b>Remote mode</b>'
    + '<div class="muted" style="margin:6px 0 10px">Administer a sync server instead of this device.</div>'
    + '<div class="row"><input class="grow" id="rUrl" placeholder="https://your-server">'
    + '<input class="grow" id="rCode" placeholder="sync code">'
    + '<button class="btn sec" onclick="useRemote()">Connect</button>'
    + (store.remote ? '<button class="btn sec" onclick="useDevice()">Back to device</button>' : '')
    + '</div></div>'
    + '<div class="card"><b>Danger</b>'
    + '<div class="row"><button class="btn bad" onclick="resetAll()">Erase everything on this device</button>'
    + '</div></div>';
};
function everything(){
  var out = {};
  for(var i = 0; i < localStorage.length; i++){
    var k = localStorage.key(i);
    if(k.indexOf('bequest.') === 0 && k.indexOf('bequest.admin') !== 0) out[k] = localStorage.getItem(k);
  }
  return out;
}
function showAll(){ $('#allOut').innerHTML = '<pre>' + esc(JSON.stringify(everything(), null, 1)) + '</pre>'; }
function exportAll(){
  var blob = new Blob([JSON.stringify(everything(), null, 1)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bequest-device-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click(); toast('Exported');
}
function importAll(){
  var raw = $('#impText').value || '';
  var d;
  try { d = JSON.parse(raw); } catch(e){ return toast('That is not valid JSON'); }
  if(!d || typeof d !== 'object') return toast('That is not an export');
  if(!confirm('Replace everything on this device?')) return;
  Object.keys(d).forEach(function(k){
    if(k.indexOf('bequest.') === 0 && k.indexOf('bequest.admin') !== 0) localStorage.setItem(k, d[k]);
  });
  toast('Imported'); render();
}
function useRemote(){
  var u = ($('#rUrl').value || '').trim(), c = ($('#rCode').value || '').trim();
  if(!u || !c) return toast('Need a server and a code');
  var s = new CloudStore(u, c);
  alert(s.unavailable());
}
function useDevice(){ store = new DeviceStore(); render(); }
function resetAll(){
  if(!confirm('Erase every Bequest save and setting on this device?')) return;
  if(!confirm('Really? This cannot be undone.')) return;
  Object.keys(everything()).forEach(function(k){ localStorage.removeItem(k); });
  toast('Erased'); render();
}

boot();
