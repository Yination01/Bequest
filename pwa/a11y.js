/* BEQUEST — reachable without a touchscreen or a working pair of eyes.

   The quality bar is blunt about this: "Treat accessibility as a compliance
   requirement: non-compliance is a legal liability; AI tools do not ship
   accessible output by default, so explicitly ask for it." Before this file
   the whole 742 KB bundle carried one aria attribute and no roles at all: a
   five-item tab bar that announced nothing, toggle switches that read as
   plain buttons, and modal sheets a screen reader could walk straight past.

   Four things are fixed here, and each is a specific line in that bar.

     tabs       Arrows move, Home and End jump, Tab leaves the strip.
                Roving tabindex, so the bar is one stop and not five.
     switches   role=switch with aria-checked, so the state is spoken
                rather than inferred from the tick glyph.
     dialogs    role=dialog, focus moves in and comes back out to whatever
                opened it, Escape closes anything dismissible, and focus
                cannot wander behind the sheet.
     speech     A polite live region, so the year's news is heard instead
                of silently appearing.

   The focus ring is deliberately not the same as the selected state. The
   bar calls that out and it is the mistake that makes keyboard use feel
   broken even when it works.                                             */

const TAB_ORDER = ['life','act','ppl','money','more'];

/* The game also runs headless, in the test harness and in the research
   tools, where document is a stub with only the handful of methods those
   tools needed. Accessibility work must never be the reason a simulated
   life cannot run, so every entry point checks for the DOM it uses rather
   than assuming one. */
function domReady(){
  return typeof document !== 'undefined' && document
    && typeof document.querySelector === 'function'
    && typeof document.querySelectorAll === 'function';
}
let LAST_FOCUS = null;

function a11yTabs(){
  if(!domReady()) return;
  const nav = document.querySelector('nav.nav');
  if(!nav || nav.dataset.a11y) return;
  nav.dataset.a11y = '1';
  nav.addEventListener('keydown', e => {
    const btns = Array.from(nav.querySelectorAll('[role="tab"]'));
    const here = btns.indexOf(document.activeElement);
    if(here < 0) return;
    let to = -1;
    if(e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (here + 1) % btns.length;
    else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (here - 1 + btns.length) % btns.length;
    else if(e.key === 'Home') to = 0;
    else if(e.key === 'End') to = btns.length - 1;
    else return;
    e.preventDefault();
    btns[to].focus();
    const t = btns[to].dataset.t;
    if(t && typeof setTab === 'function') setTab(t);
  });
}

/* setTab() paints .on; the roles have to follow it or the bar lies. */
function a11ySyncTabs(active){
  if(!domReady()) return;
  const nav = document.querySelector('nav.nav');
  if(!nav) return;
  nav.querySelectorAll('[role="tab"]').forEach(b => {
    const on = b.dataset.t === active;
    b.setAttribute('aria-selected', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
  const main = document.getElementById('main');
  if(main) main.setAttribute('aria-labelledby', 'tab-' + active);
}

/* Any row that toggles something is a switch, not a button. Rows opt in by
   carrying data-switch="on" or "off", which every caller already knows. */
function a11ySwitches(root){
  if(!domReady()) return;
  (root || document).querySelectorAll('[data-switch]').forEach(el => {
    el.setAttribute('role', 'switch');
    el.setAttribute('aria-checked', el.dataset.switch === 'on' ? 'true' : 'false');
    if(!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON') el.tabIndex = 0;
  });
}

/* The AGE UP button says how many actions are still unspent, because the
   badge that says so is a visual. */
function a11yAgeHint(){
  if(!domReady()) return;
  const h = document.getElementById('ageHint');
  if(!h || typeof S === 'undefined' || !S) return;
  const n = S.actionsLeft || 0;
  h.textContent = n > 0
    ? `${n} action${n === 1 ? '' : 's'} still unused this year.`
    : 'No actions left this year.';
}

/* Spoken, not shown. Used for the things that otherwise just appear. */
function say(text){
  if(!domReady()) return;
  const el = document.getElementById('live');
  if(!el || !text) return;
  /* a screen reader ignores an identical string written twice */
  el.textContent = '';
  setTimeout(() => { el.textContent = String(text).slice(0, 300); }, 30);
}

/* ---- dialogs ---- */
function a11yDialogOpen(label){
  if(!domReady()) return;
  const m = document.getElementById('modal');
  if(!m) return;
  if(document.activeElement && document.activeElement !== document.body)
    LAST_FOCUS = document.activeElement;
  m.setAttribute('aria-label', label || 'Message');
  /* the first real control in the sheet, so a keyboard lands inside it */
  const first = m.querySelector('button, [href], input, select, textarea');
  if(first && first.focus) { try { first.focus(); } catch(e){} }
}
function a11yDialogClose(){
  if(!domReady()) return;
  const back = LAST_FOCUS;
  LAST_FOCUS = null;
  if(back && back.focus && document.contains(back)) { try { back.focus(); } catch(e){} }
}

/* Escape closes anything that can be dismissed, and focus cannot leave an
   open sheet by tabbing behind it. */
function a11yGlobalKeys(){
  if(!domReady() || !document.body) return;
  if(document.body.dataset.a11yKeys) return;
  document.body.dataset.a11yKeys = '1';
  document.addEventListener('keydown', e => {
    const m = document.getElementById('modal');
    const open = m && m.className.indexOf('show') >= 0;
    if(!open) return;
    if(e.key === 'Escape'){
      /* only if there is a way out that is not a decision */
      const outs = Array.from(m.querySelectorAll('button')).filter(b =>
        /continue|close|got it|carry on|not now|cancel|ok\b|put it away|\u2026/i.test(b.textContent || ''));
      if(outs.length){ e.preventDefault(); outs[outs.length - 1].click(); }
      return;
    }
    if(e.key !== 'Tab') return;
    const f = Array.from(m.querySelectorAll('button, [href], input, select, textarea'))
      .filter(x => !x.disabled && x.offsetParent !== null);
    if(!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    else if(f.indexOf(document.activeElement) < 0){ e.preventDefault(); first.focus(); }
  });
}

function a11yInit(){
  if(!domReady()) return;
  a11yTabs();
  a11yGlobalKeys();
  a11ySwitches();
  a11yAgeHint();
}
