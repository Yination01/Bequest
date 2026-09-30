/* BEQUEST — knowing when something broke.

   The game had no global error handler. A thrown error anywhere outside the
   fourteen local try/catch blocks left the screen frozen with no message, and
   the player had no way to tell anyone what happened. The try/catch blocks
   themselves were worse in their way: a save that failed to write, a corrupt
   load, an achievement predicate that threw — all swallowed in silence, for
   years potentially, because nothing ever looked.

   This records both, on the device, and goes nowhere.

   DELIBERATELY NO TRANSPORT. crashSink() is the single seam a destination
   plugs into later — an endpoint, Crashlytics, Sentry, whatever is chosen.
   Until one exists, reports stay in localStorage and the only way anything
   leaves the phone is the player pressing Copy. Sending is gated on an
   explicit opt-in that defaults to off, so the claim that the game collects
   nothing stays true as written.

   WHAT A REPORT MAY NOT CONTAIN: the player's name, any NPC's name, their
   employer, school or manager, any log line, or the save. A life is
   described by its shape — age, country, difficulty, what was on screen,
   what they had just done — which is enough to reproduce nearly everything
   and is not about anybody. There is a test that puts a distinctive name in
   the save and fails if it appears anywhere in a report.                   */

const CRASH_KEY = 'bequest.crashlog';
const CRASH_MAX = 12;             /* a ring buffer; old reports fall off   */
const CRASH_STACK_LINES = 12;

let CRASH_ACTS = [];              /* the last few things the player did    */
let CRASH_POPUP = null;           /* what was on screen when it went wrong */
let CRASH_LAST = null;            /* most recent report, for the screen    */
let CRASH_INSTALLED = false;

/* ---- the seam ----
   Returns false because nothing is wired up. A destination replaces the
   body of this one function and honours crashOptIn(). */
function crashSink(report){ return false; }
function crashOptIn(){ return !!(typeof META !== 'undefined' && META && META.crashOptIn); }
function setCrashOptIn(v){
  if(typeof META === 'undefined' || !META) return;
  META.crashOptIn = !!v;
  if(typeof saveMeta === 'function') saveMeta();
  if(typeof renderAll === 'function') renderAll();
}

/* ---- context: the shape of the life, never the life ---- */
function moneyBand(n){
  n = Number(n) || 0;
  const a = Math.abs(n);
  const b = a < 100 ? '0' : a < 1000 ? '<1k' : a < 10000 ? '1k-10k'
          : a < 100000 ? '10k-100k' : a < 1000000 ? '100k-1m' : '1m+';
  return (n < 0 ? '-' : '') + b;
}
function crashContext(){
  const s = (typeof S !== 'undefined') ? S : null;
  const ctx = {
    acts: CRASH_ACTS.slice(-6),
    popup: CRASH_POPUP
  };
  if(!s) return ctx;
  try{
    ctx.age    = s.age;
    ctx.alive  = !!s.alive;
    ctx.gen    = s.gen;
    ctx.country= s.country;                       /* a country, not an address */
    ctx.diff   = s.diff;
    ctx.edu    = s.edu;
    ctx.job    = s.job ? s.job.field : null;      /* the field, not the title  */
    ctx.money  = moneyBand(s.money);
    ctx.worth  = moneyBand(typeof netWorth === 'function' ? netWorth() : 0);
    ctx.npcs   = (s.npcs || []).length;
    ctx.kids   = (s.npcs || []).filter(n => n.rel === 'child').length;
    ctx.conds  = (s.conditions || []).map(k => k.id);
    ctx.flags  = Object.keys(s.flags || {}).filter(k => s.flags[k]).slice(0, 14);
    /* the tab lives on the DOM, not the save */
    ctx.screen = (typeof document !== 'undefined' && document.getElementById
                  && document.getElementById('app') && document.getElementById('app').dataset)
                 ? (document.getElementById('app').dataset.tab || null) : null;
    ctx.section= s.section || s.msection || null;
    ctx.actionsLeft = s.actionsLeft;
    ctx.inSchool = !!s.inSchool;
    ctx.jail   = s.jailLeft || 0;
    ctx.case   = s.legalCase ? s.legalCase.stage : null;
    ctx.holds  = Object.keys(s.holdings || {});
    /* log KINDS only: the text has names in it */
    ctx.recent = (s.log || []).slice(-6).map(l => ({ a: l.a, k: l.k || '' }));
    ctx.queue  = (typeof QUEUE !== 'undefined' && QUEUE) ? QUEUE.map(p => p.type) : [];
  }catch(e){ ctx.ctxError = String(e && e.message || e); }
  return ctx;
}

function trimStack(stack){
  return String(stack || '').split('\n').slice(0, CRASH_STACK_LINES)
    .map(l => l.trim().replace(/https?:\/\/[^\s)]+/g, m => m.split('/').pop()))
    .join('\n');
}

/* ---- recording ---- */
function crashLog(){
  try{ return JSON.parse(localStorage.getItem(CRASH_KEY) || '[]') || []; }
  catch(e){ return []; }
}
function crashSave(list){
  try{ localStorage.setItem(CRASH_KEY, JSON.stringify(list.slice(-CRASH_MAX))); }catch(e){}
}
function crashClear(){ try{ localStorage.removeItem(CRASH_KEY); }catch(e){} CRASH_LAST = null; }

function recordCrash(kind, where, message, stack){
  const report = {
    v: (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0'),
    at: Date.now(),
    kind: kind,
    where: String(where || ''),
    msg: String(message || '').slice(0, 300),
    stack: trimStack(stack),
    ctx: crashContext()
  };
  CRASH_LAST = report;
  const list = crashLog(); list.push(report); crashSave(list);
  /* nothing leaves the device unless a destination exists AND they said yes */
  if(crashOptIn()){ try{ crashSink(report); }catch(e){} }
  return report;
}

/* A failure that does not throw its way to the top: a save that would not
   write, an achievement predicate that blew up, a corrupt load. These were
   all swallowed by bare catch blocks. */
function softFail(where, err, extra){
  try{
    const msg = (err && err.message) ? err.message : String(err == null ? (extra || 'failed') : err);
    return recordCrash('soft', where, msg, err && err.stack);
  }catch(e){ return null; }
}

/* ---- what the player sees ---- */
function crashReportText(r){
  r = r || CRASH_LAST || crashLog().slice(-1)[0];
  if(!r) return 'No problems have been recorded.';
  const c = r.ctx || {};
  return [
    'Bequest ' + r.v + '  ' + r.kind,
    'where: ' + r.where,
    r.msg,
    '',
    r.stack,
    '',
    'age ' + c.age + '  gen ' + c.gen + '  ' + c.country + '  ' + c.diff,
    'screen ' + c.screen + '/' + c.section + '  popup ' + c.popup,
    'did: ' + (c.acts || []).join(' > '),
    'queue: ' + (c.queue || []).join(',') + '  actions ' + c.actionsLeft,
    'money ' + c.money + '  worth ' + c.worth + '  npcs ' + c.npcs + '  conds ' + (c.conds || []).join(',')
  ].join('\n');
}

/* The house quality bar: "No backend details in user-facing errors: friendly
   message client-side; full details (stack traces, connection strings,
   internal hosts) logged server-side only; exposure is a UX fail and a
   security vulnerability." So the screen shows what went wrong in words and
   the stack travels only via Copy. */
function crashSummary(r){
  r = r || CRASH_LAST || crashLog().slice(-1)[0];
  if(!r) return 'Nothing has gone wrong.';
  const c = r.ctx || {};
  const what = r.kind === 'soft' ? 'A background task failed' : 'The game stopped responding';
  return `${what} while you were ${c.screen ? 'on the ' + c.screen + ' screen' : 'playing'}`
    + (c.age != null ? `, at ${c.age}` : '') + '.';
}
function crashCopy(){
  const t = crashReportText();
  try{
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t);
    else {
      const ta = document.createElement('textarea');
      ta.value = t; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    if(typeof popupOK === 'function') popupOK('Copied', 'The report is on your clipboard.');
  }catch(e){
    if(typeof popupOK === 'function') popupOK('Could not copy', t);
  }
}

function crashScreen(){
  const el = (typeof document !== 'undefined') ? document.getElementById('modal') : null;
  if(!el) return;
  el.className = 'modal show';
  el.innerHTML = `<div class="sheet">
    <div class="phead"><span class="ptag">Something went wrong</span></div>
    <div class="ph">That was not supposed to happen</div>
    <div class="pb">The game hit a problem. Your save is untouched \u2014 it was written at the
      start of the year and nothing since has been committed. You can carry on.</div>
    <div class="pb">If it keeps happening, Copy the report and send it on. It describes the
      shape of this life \u2014 age, country, what was on screen \u2014 and contains no names and
      no save.</div>
    <div class="crashsum">${esc(crashSummary())}</div>
    <div class="choices">
      <button class="choice" onclick="crashCopy()"><span>Copy the report</span><i>\u203a</i></button>
      <button class="choice ok" onclick="closePopup()"><span>Carry on</span><i>\u203a</i></button>
    </div></div>`;
}

/* ---- installation ---- */
function noteAct(id){ CRASH_ACTS.push(String(id)); if(CRASH_ACTS.length > 12) CRASH_ACTS.shift(); }
function notePopup(p){
  try{ CRASH_POPUP = p ? (p.type + (p.ev ? ':' + p.ev.id : '')) : null; }catch(e){ CRASH_POPUP = null; }
}

function installCrashHandlers(){
  if(CRASH_INSTALLED) return;
  if(typeof window === 'undefined' || !window || !window.addEventListener) return;
  CRASH_INSTALLED = true;
  window.addEventListener('error', ev => {
    try{
      recordCrash('error', (ev.filename || '').split('/').pop() + ':' + (ev.lineno || 0),
        ev.message, ev.error && ev.error.stack);
      crashScreen();
    }catch(e){}
  });
  window.addEventListener('unhandledrejection', ev => {
    try{
      const r = ev.reason;
      recordCrash('promise', 'promise', (r && r.message) || String(r), r && r.stack);
    }catch(e){}
  });
}
