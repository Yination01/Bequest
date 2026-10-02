/* BEQUEST — coaching.

   The old onboarding was a single card at age 0, which is close to none: the
   systems that decide whether a stranger keeps playing — actions, school,
   people, work, bills — do not appear for another sixteen years of game time.

   This replaces it with two things:

     1. A short opening that explains the loop. Shown once, three panes,
        skippable, and replayable from More.
     2. One tip at the moment each system first matters. At most one a year,
        each shown once per install, dismissed by reading it or by outliving
        it, so nothing stacks up and nothing nags.

   Tips live in META, not in the save, because a player who has learned the
   game should not be taught it again on their second life.                  */

const COACH_OPENING = [
  { t:'Age Up moves time', target:'ageBtn',
    x:'This is the clock. Tap AGE UP when you are ready to move to the next year. Unused actions disappear when you do.' },
  { t:'Life shows what is happening', target:'tab-life',
    x:'Life is your home screen: this year’s story, urgent notices, family, school, work and the next milestone.' },
  { t:'Activities are your choices', target:'tab-act',
    x:'Activities spends the limited actions you receive each year on study, work, health, skills, relationships and risks.' },
  { t:'People need attention', target:'tab-ppl',
    x:'People shows family, partners, friends and rivals. Relationships drift when you leave them alone.' },
  { t:'Money explains the numbers', target:'tab-money',
    x:'Money holds banking, bills, careers, homes, vehicles, businesses, shopping and investments.' },
  { t:'The menu holds everything else', target:'menuBtn',
    x:'Open Menu for your Profile, awards, goals, records, shop, saves, Settings and Help. You can replay this tour from Help.' }
];

/* Each tip names one thing, points at where to do it, and then goes away.
   `to` is the age at which it expires unread — a player who is already past
   the moment should not be taught it late.                                   */
const COACH_TIPS = [
  { id:'ageup', to:2,
    t:'Press AGE UP to begin',
    x:'The button at the bottom is the clock. A year passes, things happen, and you '
     +'choose what to do about them. Everything else waits for it.',
    when:S => S.age<=1 },

  { id:'acts', to:9,
    t:'Your year is not only what happens to you',
    x:'The Activities tab gives you a few actions each year. Even as a child they matter — '
     +'studying, reading and sport now become grades, skills and options later.',
    go:["setTab('act')", 'Show me'],
    when:S => S.age>=5 },

  { id:'stats', to:13,
    t:'Everything compounds',
    x:'Health, happiness, looks, smarts, discipline and reputation move a little every '
     +'year, in the direction you push them. Menu \u203a Profile shows where you stand and '
     +'what is drifting.',
    go:["openMenuPage('stats')", 'Show me'],
    when:S => S.age>=9 },

  { id:'school', to:15,
    t:'Grades decide what you can become',
    x:'Your grade average opens or closes university, and university opens or closes '
     +'about half the careers in the game. Studying is rarely the interesting choice '
     +'and almost always the profitable one.',
    go:["setTab('act');openSection('School')", 'School options'],
    when:S => S.age>=11 && S.inSchool },

  { id:'people', to:18,
    t:'People drift if you let them',
    x:'Every relationship decays a little each year you do not tend it. The People tab '
     +'is where you keep the ones you want to keep — and they are the ones who show up '
     +'at the end.',
    go:["setTab('ppl')", 'Who is around'],
    when:S => S.age>=13 && S.npcs && S.npcs.some(n=>n.alive) },

  { id:'work', to:24,
    t:'Work is under Money \u203a Careers',
    x:'Jobs have requirements — stats, skills, sometimes a degree. You will not meet '
     +'them all at first. Take what you can get: time served in a field counts towards '
     +'the next rung up.',
    go:["setTab('money');openMoney('careers')", 'Find work'],
    when:S => S.age>=16 },

  { id:'money', to:24,
    t:'From here the bills are yours',
    x:'Housing, food and anything you subscribe to fall due every year. Unpaid bills get '
     +'one year\u2019s grace as a final notice, and then become arrears that grow. '
     +'Money \u203a Living costs is where you see them coming.',
    go:["setTab('money');openMoney('living')", 'Living costs'],
    when:S => S.age>=18 },

  { id:'paths', to:99,
    t:'You are on a path now',
    x:'Paths run alongside an ordinary life and have their own ranks, their own risks '
     +'and their own ending. You can still do everything else — but this will start '
     +'making demands.',
    when:S => !!S.track }
];

function coachSeen(id){ return !!(META.tips && META.tips[id]); }
function coachMark(id){
  META.tips = META.tips || {};
  if(META.tips[id]) return;
  META.tips[id] = true; saveMeta();
}
/* One tip at a time, in list order. Anything whose moment has passed is
   retired unread, so a tip can never surface years after it was useful. */
function coachTip(){
  if(!S || !S.alive || META.tipsOff) return null;
  COACH_TIPS.forEach(c => {
    if(!coachSeen(c.id) && c.to != null && S.age > c.to) coachMark(c.id);
  });
  return COACH_TIPS.find(c => !coachSeen(c.id) && c.when(S)) || null;
}
function coachCard(){
  const c = coachTip();
  if(!c) return '';
  return `<div class="card tip coach">
    <div class="ctrow"><div class="ct">${esc(c.t)}</div><div class="hsub dim">tip</div></div>
    <div class="hsub">${esc(c.x)}</div>
    <div class="nact">${c.go?`<button onclick="${c.go[0]}">${esc(c.go[1])}</button>`:''}
      <button onclick="coachDismiss('${c.id}')">Got it</button></div></div>`;
}
function coachDismiss(id){ coachMark(id); renderTab('life'); }

/* ---- the opening ---- */
let COACH_STEP = 0;
function coachOpeningDue(){ return !(META.tips && META.tips.opening); }
function coachClearTarget(){
  if(typeof document==='undefined'||!document.querySelectorAll)return;
  document.querySelectorAll('.coach-target').forEach(el=>el.classList.remove('coach-target'));
}
function coachTarget(id){
  coachClearTarget();
  const el=document.getElementById(id); if(el)el.classList.add('coach-target');
}
function openingShow(i){
  COACH_STEP = i;
  const p = COACH_OPENING[i], last = i === COACH_OPENING.length-1;
  coachTarget(p.target);
  const el = document.getElementById('modal');
  // Steps 0-4 point to bottom targets (Age Up, tabs): place tour card at top.
  // Step 5 points to top-right menuBtn: place tour card at bottom.
  const posClass = i === 5 ? ' card-at-bottom tour-top' : ' card-at-top tour-bottom';
  el.className = 'modal show modal-tour' + posClass;
  el.innerHTML = `<div class="sheet tour-card"><div class="phead">
      <span class="ptag">Interface tour</span>
      <span class="hsub dim">${i+1} of ${COACH_OPENING.length}</span></div>
    <div class="ph">${esc(p.t)}</div><div class="pb">${esc(p.x)}</div>
    <div class="choices">
      <button class="choice ok" onclick="${last?'openingDone()':`openingShow(${i+1})`}">
        <span>${last?'Start living':'Next'}</span><i>\u203a</i></button>
      ${last?'':'<button class="choice" onclick="openingSkipPrompt()"><span>Skip tour</span><i>\u203a</i></button>'}
    </div></div>`;
}
function openingSkipPrompt(){
  coachClearTarget();
  const el=document.getElementById('modal'); el.className='modal show modal-tour tour-bottom';
  el.innerHTML=`<div class="sheet tour-card"><div class="ptag">Tutorials</div><div class="ph">Keep helpful tips?</div>
    <div class="pb">Short tips normally appear later when school, work, bills and other systems first matter.</div>
    <div class="choices"><button class="choice ok" onclick="coachSetTips(true);openingDone()"><span>Keep later tips</span><i>\u203a</i></button>
    <button class="choice" onclick="coachSetTips(false);openingDone()"><span>Turn off later tips</span><i>\u203a</i></button></div></div>`;
}
function coachSetTips(on){ META.tipsOff=!on; saveMeta(); if(S)renderAll(); }
function openingDone(){
  coachClearTarget(); coachMark('opening');
  const el = document.getElementById('modal');
  if(el){ el.className = 'modal'; delete el.dataset.menu; }
  drain();
}
/* Replay it deliberately — also the escape hatch for anyone who skipped. */
function coachReplay(){
  META.tips = {}; META.tipsOff=false; saveMeta();
  openingShow(0);
}
