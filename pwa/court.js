/* BEQUEST — arrest, plea, trial, sentence, appeal.

   Getting caught used to be one line of arithmetic. A single roll decided
   whether you were caught, and if you were, a second roll decided how many
   years you served. There was nothing to decide and nothing to spend money
   on, which made crime the only system in the game with no play in it.

   Now being caught is the beginning rather than the end:

     charged -> how do you plead -> who represents you -> verdict -> appeal

   The decisions are real ones and they trade off against each other. Pleading
   guilty takes a third off the sentence and gives up any chance of walking.
   Fighting it costs money you may not have and, if you lose, costs you the
   discount as well. Good representation is the difference between the two,
   and it is expensive exactly when you can least afford it.

   Everything is queued through push(), never confirmDo(), because a case can
   open from inside ageUp() and draining the queue from in there re-enters the
   year.                                                                     */

/* Who is standing up for you. cost is before cost-of-living. */
const COUNSEL = [
  { id:'duty',      n:'The duty solicitor',   cost:0,     acquit:0.00, mitigate:0.00,
    d:'Whoever is on the rota. Met you twenty minutes ago.' },
  { id:'solicitor', n:'A decent solicitor',   cost:4200,  acquit:0.14, mitigate:0.12,
    d:'Knows the court and the prosecutor. Will read the file properly.' },
  { id:'barrister', n:'A silk',               cost:26000, acquit:0.30, mitigate:0.26,
    d:'Expensive, and the room changes when they stand up.' }
];
const COUNSEL_BY = id => COUNSEL.find(c => c.id === id) || COUNSEL[0];

function courtMigrate(s){ if(s.legalCase === undefined) s.legalCase = null; }
function counselCost(c){ return Math.round(c.cost * (typeof country === 'function' ? country().col : 1)); }

/* ---- opening a case ---- */
function openCase(crimeId, baseSentence){
  const cr = DATA.crimes.find(c => c.id === crimeId) || { id:crimeId, n:'An offence', sentence:[0,1] };
  /* How much the prosecution actually has. Being careful, and being the sort
     of person a jury believes, both help. */
  let ev = 45 + ri(0, 35) + baseSentence * 3;
  ev -= Math.round((S.skills.charisma || 0) / 8);
  ev -= Math.round((S.stats.reputation || 50) / 12);
  if(hasItem('burner')) ev -= 8;
  if(hasItem('mask'))   ev -= 10;
  if((S.record || []).filter(r => !r.spent).length >= 2) ev += 12;   /* known to them */
  S.legalCase = {
    crime: cr.id, name: cr.n,
    base: baseSentence,
    evidence: Math.max(8, Math.min(97, ev)),
    stage: 'plea', plea: null, counsel: null, spent: 0,
    outcome: null, sentence: 0, appealed: false, note: null
  };
  push({ type:'COURT' });
  return `You were arrested and charged with ${cr.n.toLowerCase()}.`;
}

function evidenceWord(e){
  return e >= 80 ? 'overwhelming' : e >= 62 ? 'strong' : e >= 45 ? 'decent' : e >= 30 ? 'thin' : 'barely there';
}

/* ---- the decisions ---- */
function courtPlead(how){
  const c = S.legalCase; if(!c) return;
  c.plea = how;
  c.stage = 'counsel';
  renderPopup();
}
function courtCounsel(id){
  const c = S.legalCase; if(!c) return;
  const def = COUNSEL_BY(id), cost = counselCost(def);
  if(cost > 0){
    const pot = S.money + S.savings;
    if(pot < cost){ c.note = `You cannot raise ${money(cost)}.`; return renderPopup(); }
    /* Math.min on a negative balance would have paid you to hire someone */
    const fromCash = Math.max(0, Math.min(S.money, cost));
    S.money -= fromCash; S.savings -= (cost - fromCash);
    ledger('spend', 'Legal fees', cost);
  }
  c.counsel = id; c.spent += cost; c.note = null;
  courtResolve();
}

/* ---- the verdict ---- */
function courtResolve(){
  const c = S.legalCase; if(!c) return;
  const def = COUNSEL_BY(c.counsel);

  if(c.plea === 'guilty'){
    /* no trial: a third off for not making everyone sit through one */
    c.outcome = 'convicted';
    /* a real discount, or there is no reason ever to plead */
    c.sentence = Math.max(0, Math.round(c.base * (0.55 - def.mitigate * 0.8)));
    c.note = 'You pleaded guilty. The sentence was reduced for it.';
  } else {
    let p = 0.22
          - (c.evidence - 50) / 110
          + def.acquit
          + (S.skills.charisma || 0) / 500
          + (S.stats.reputation - 50) / 600
          + LUCK() / 2;
    if(hasItem('fakeid')) p += 0.10;
    p = Math.max(0.02, Math.min(0.88, p));
    if(R() < p){
      c.outcome = 'acquitted';
      c.sentence = 0;
      c.note = 'Not guilty. You walked out of the building.';
    } else {
      c.outcome = 'convicted';
      /* you ran the trial and lost, so the discount is gone: that is the
         whole weight behind the plea decision */
      c.sentence = Math.max(0, Math.round(c.base * (1 - def.mitigate * 0.6)));
      c.note = 'The jury did not believe you.';
    }
  }
  c.stage = 'verdict';
  renderPopup();
}

function courtAppeal(){
  const c = S.legalCase; if(!c || c.appealed) return;
  const def = COUNSEL_BY(c.counsel);
  const cost = Math.round(9000 * (typeof country === 'function' ? country().col : 1));
  const pot = S.money + S.savings;
  if(pot < cost){ c.note = `An appeal costs ${money(cost)} and you cannot raise it.`; return renderPopup(); }
  const fromCash = Math.max(0, Math.min(S.money, cost));
  S.money -= fromCash; S.savings -= (cost - fromCash);
  ledger('spend', 'Appeal', cost);
  c.spent += cost; c.appealed = true;

  const p = 0.16 + def.acquit / 2 + (c.evidence < 45 ? 0.16 : 0) + LUCK() / 3;
  const r = R();
  if(r < p * 0.4){
    c.outcome = 'quashed'; c.sentence = 0;
    c.note = 'The conviction was quashed. It should never have been brought.';
  } else if(r < p){
    c.sentence = Math.max(0, Math.round(c.sentence * 0.5));
    c.note = 'The sentence was reduced on appeal.';
  } else {
    c.note = 'The appeal was refused, and it cost you.';
  }
  c.stage = 'verdict';
  renderPopup();
}

/* ---- applying it to the life ---- */
function courtFinish(){
  const c = S.legalCase;
  document.getElementById('modal').className = 'modal';
  if(!c){ drain(); return; }
  const sev = c.sentence >= 6 ? 3 : c.sentence >= 2 ? 2 : 1;

  if(c.outcome === 'acquitted' || c.outcome === 'quashed'){
    S.stats.reputation = clamp(S.stats.reputation - 4);
    S.stats.happiness  = clamp(S.stats.happiness + 6);
    logLine(`${c.name}: acquitted.`, 'good');
  } else if(c.sentence <= 0){
    S.money -= ri(200, 2000);
    S.stats.reputation = clamp(S.stats.reputation - 6);
    S.record.push({ crime:c.name, age:S.age, sev:1, spent:false });
    logLine(`${c.name}: fined.`, 'bad');
  } else {
    S.jailLeft = c.sentence;
    S.stats.reputation = clamp(S.stats.reputation - 15);
    S.record.push({ crime:c.name, age:S.age, sev, spent:false });
    if(S.job){ S.job = null; S.firedCount++; }
    logLine(`${c.name}: ${c.sentence} year${c.sentence > 1 ? 's' : ''}.`, 'bad');
  }
  S.legalCase = null;
  clampMinorMoney(); settleState(); checkAch(); checkGoals();
  save();
  drain();
}

/* ---- the screen ---- */
function courtSheet(){
  const c = S.legalCase;
  if(!c) return '<div class="sheet"><div class="ph">No case</div><div class="choices">'
    + '<button class="choice ok" onclick="courtFinish()"><span>Continue</span><i>\u203a</i></button></div></div>';
  const head = `<div class="phead"><span class="ptag">Court</span></div>`;
  const note = c.note ? `<div class="pb">${esc(c.note)}</div>` : '';

  if(c.stage === 'plea'){
    /* must match courtResolve(), or the screen promises one number and the
       court hands down another */
    const disc = Math.max(0, Math.round(c.base * 0.55));
    return `<div class="sheet">${head}
      <div class="ph">${esc(c.name)}</div>
      <div class="pb">The case against you is ${evidenceWord(c.evidence)}. If it goes against you
        the starting point is ${c.base} year${c.base === 1 ? '' : 's'}.</div>
      <div class="bt"><i class="${c.evidence > 62 ? 'r' : c.evidence > 40 ? 'a' : 'g'}" style="width:${c.evidence}%"></i></div>
      <div class="hsub dim">Evidence against you</div>
      ${note}
      <div class="choices">
        <button class="choice" onclick="courtPlead('guilty')"><span>Plead guilty
          <small class="dim"> \u00b7 about ${disc} year${disc === 1 ? '' : 's'}, less with good counsel</small></span><i>\u203a</i></button>
        <button class="choice" onclick="courtPlead('notguilty')"><span>Plead not guilty
          <small class="dim"> \u00b7 a trial, and no discount if you lose</small></span><i>\u203a</i></button>
      </div></div>`;
  }

  if(c.stage === 'counsel'){
    return `<div class="sheet">${head}
      <div class="ph">Who is representing you?</div>
      <div class="pb">You have ${money(S.money + S.savings)} to hand.</div>
      ${note}
      <div class="choices">${COUNSEL.map(x => {
        const cost = counselCost(x);
        const can = cost === 0 || (S.money + S.savings) >= cost;
        return `<button class="choice${can ? '' : ' dim'}" onclick="courtCounsel('${x.id}')">
          <span>${esc(x.n)} <small class="dim">\u00b7 ${cost ? money(cost) : 'free'}</small>
          <br><small class="dim">${esc(x.d)}</small></span><i>\u203a</i></button>`;
      }).join('')}</div></div>`;
  }

  /* verdict */
  const won = c.outcome === 'acquitted' || c.outcome === 'quashed';
  const line = won ? 'Not guilty'
    : c.sentence > 0 ? `${c.sentence} year${c.sentence > 1 ? 's' : ''} in prison`
    : 'A fine and a record';
  const canAppeal = !won && !c.appealed && c.sentence > 0;
  return `<div class="sheet">${head}
    <div class="ph">${esc(line)}</div>
    ${note}
    ${c.spent > 0 ? `<div class="hsub dim">Legal costs: ${money(c.spent)}</div>` : ''}
    <div class="choices">
      ${canAppeal ? `<button class="choice" onclick="courtAppeal()"><span>Appeal
        <small class="dim"> \u00b7 ${money(Math.round(9000 * (typeof country === 'function' ? country().col : 1)))}</small></span><i>\u203a</i></button>` : ''}
      <button class="choice ok" onclick="courtFinish()"><span>${won ? 'Go home' : 'Accept it'}</span><i>\u203a</i></button>
    </div></div>`;
}

/* Re-render the sheet in place without touching the queue. */
function renderPopup(){
  const el = document.getElementById('modal');
  el.className = 'modal show';
  el.innerHTML = courtSheet();
}
