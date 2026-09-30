/* BEQUEST — being ill somewhere.

   Treating a condition was one button: pay the money, the condition becomes
   managed, done. The country you live in changed the price and nothing else,
   so a strong public health service was pure upside — cheaper care, no cost
   anywhere. That is not what living under one is like.

   The trade-off is time. `country().med` is a price multiplier in the data,
   and a low one means the state is paying, which means you wait. A high one
   means you are paying, which means you are seen on Thursday. So:

     public   free, or nearly, and a wait measured in years
     mixed    some of both
     private  no wait at all, and it costs what it costs

   On top of that: a specialist, who improves the odds of actually beating
   the thing rather than managing it, and rehabilitation afterwards, which is
   dull, takes years, and is the difference between recovering and coping.  */

function healthSystem(){
  const m = (typeof country === 'function' ? country().med : 1);
  if(m <= 0.40) return { id:'public',  n:'the health service', wait:[1,4], pay:0.0,  self:1.9 };
  if(m >= 0.85) return { id:'private', n:'a private system',   wait:[0,0], pay:1.0,  self:1.0 };
  return              { id:'mixed',   n:'a mixed system',     wait:[0,2], pay:0.45, self:1.4 };
}
function healthMigrate(s){
  (s.conditions || []).forEach(k => {
    if(k.waiting === undefined)   k.waiting = 0;    /* age the appointment lands */
    if(k.specialist === undefined)k.specialist = false;
    if(k.rehab === undefined)     k.rehab = 0;
  });
}

function condCost(k, selfPay){
  const c = COND(k.id); if(!c) return 0;
  const sys = healthSystem();
  const mul = selfPay ? sys.self : sys.pay;
  const ins = hasItem('insurance') ? 0.45 : 1;
  return Math.max(0, Math.round(c.cost * (typeof country === 'function' ? country().med : 1) * mul * ins * k.sev / c.sev));
}
function waitYears(k){
  const sys = healthSystem();
  if(sys.wait[1] === 0) return 0;
  /* the worse it is, the sooner they see you */
  const urgency = k.sev >= 3 ? 2 : k.sev === 2 ? 1 : 0;
  return Math.max(0, ri(sys.wait[0], sys.wait[1]) - urgency);
}

/* ---- the four things you can do about it ---- */
function treatJoin(id){
  const k = (S.conditions || []).find(x => x.id === id); if(!k) return;
  const cost = condCost(k, false);
  if(cost > 0 && !afford(cost)) return;
  if(cost > 0){ charge(cost); ledger('spend', 'Treatment', cost); }
  const w = waitYears(k);
  if(w <= 0){
    applyTreatment(k, false);
  } else {
    k.waiting = S.age + w;
    cue('open', 'light');
    popupOK('On the list',
      `You have been referred. The wait for ${COND(k.id).n.toLowerCase()} is about ${w} year${w > 1 ? 's' : ''}.`
      + `\n\nIt will carry on as it is until then.`);
  }
  save(); renderAll();
}
function treatPrivate(id){
  const k = (S.conditions || []).find(x => x.id === id); if(!k) return;
  const cost = condCost(k, true);
  if(!afford(cost)) return;
  charge(cost); ledger('spend', 'Private treatment', cost);
  k.waiting = 0;
  applyTreatment(k, true);
  save(); renderAll();
}
function seeSpecialist(id){
  const k = (S.conditions || []).find(x => x.id === id); if(!k) return;
  if(k.specialist) return popupOK('Already under a specialist', 'You are already being seen by one.');
  const cost = Math.round(2600 * (typeof country === 'function' ? country().med : 1)
                          * healthSystem().self * (hasItem('insurance') ? 0.5 : 1));
  if(!afford(cost)) return;
  charge(cost); ledger('spend', 'Specialist', cost);
  k.specialist = true;
  applyEff({ happiness: 3 });
  popupOK('A specialist', `Somebody who has seen a thousand of these is now looking at yours. `
    + `It roughly doubles the chance of beating it rather than living with it.`);
  save(); renderAll();
}
function doRehab(id){
  const k = (S.conditions || []).find(x => x.id === id); if(!k) return;
  if(!k.treated) return popupOK('Not yet', 'Rehabilitation comes after treatment.');
  const cost = Math.round(1400 * (typeof country === 'function' ? country().med : 1) * healthSystem().pay);
  if(cost > 0 && !afford(cost)) return;
  if(cost > 0){ charge(cost); ledger('spend', 'Rehabilitation', cost); }
  k.rehab = (k.rehab || 0) + 1;
  const c = COND(k.id);
  S.stats.health = clamp(S.stats.health + 4 + k.sev * 2);
  applyEff({ discipline: 4, happiness: -2 });
  let t = `Another year of it. Dull, repetitive, and your ${c.n.toLowerCase()} is easier to live with for it.`;
  if(k.rehab >= 2 && k.sev > 1){ k.sev--; t += `\n\nThe severity has come down to ${k.sev}/3.`; }
  popupOK('Rehabilitation', t);
  save(); renderAll();
}

/* Treatment landing, from the waiting list or from paying. */
function applyTreatment(k, wasPrivate){
  const c = COND(k.id); if(!c) return;
  k.treated = true;
  k.waiting = 0;
  S.stats.health = clamp(S.stats.health + c.sev * 3 + (wasPrivate ? 2 : 0));
  let cure = c.cure * (k.specialist ? 2 : 1);
  if(!c.chronic && R() < cure){
    S.conditions = S.conditions.filter(x => x !== k);
    S.counters.illnessesBeaten++;
    logLine(`Recovered from ${c.n}.`, 'good');
    cue('good', 'medium');
    popupOK('Treated', `You have fully recovered from ${c.n.toLowerCase()}.`
      + (k.specialist ? '\n\nThe specialist made the difference.' : ''));
    return;
  }
  cue('good', 'light');
  popupOK('Treated', `Your ${c.n.toLowerCase()} is being managed. Its effects are reduced by about two thirds.`
    + (c.chronic ? '\n\nIt will not go away, but it is under control.' : ''));
}

/* One year: waiting lists move, and waiting has a cost. */
function tickHealth(s, notes){
  s = s || S;
  healthMigrate(s);
  (s.conditions || []).forEach(k => {
    if(!k.waiting) return;
    if(s.age >= k.waiting){
      k.waiting = 0; k.treated = true;
      const c = COND(k.id);
      s.stats.health = clamp(s.stats.health + (c ? c.sev * 3 : 3));
      if(c && !c.chronic && R() < c.cure * (k.specialist ? 2 : 1)){
        s.conditions = s.conditions.filter(x => x !== k);
        s.counters.illnessesBeaten++;
        if(notes) notes.push(`Your ${c.n.toLowerCase()} was treated at last, and it has gone.`);
      } else if(notes && c){
        notes.push(`Your appointment for ${c.n.toLowerCase()} finally came round.`);
      }
    } else if(notes && R() < 0.3){
      notes.push(`Still waiting to be seen about your ${(COND(k.id) || {n:'condition'}).n.toLowerCase()}.`);
    }
  });
}

/* ---- the card ---- */
function healthCard(){
  const list = S.conditions || [];
  if(!list.length) return '';
  const sys = healthSystem();
  const rows = list.map(k => {
    const c = COND(k.id); if(!c) return '';
    const waiting = k.waiting && S.age < k.waiting;
    const status = waiting ? `waiting until ${k.waiting}`
      : k.treated ? 'managed' : 'untreated';
    const pub = condCost(k, false), priv = condCost(k, true);
    return `<div class="npc"><div class="npcline"><div>
        <div class="rn">${esc(c.n)}${k.specialist ? ' <span class="award t1">specialist</span>' : ''}</div>
        <div class="hsub dim">severity ${k.sev}/3 \u00b7 ${status}${k.rehab ? ` \u00b7 ${k.rehab} year${k.rehab > 1 ? 's' : ''} of rehab` : ''}</div>
      </div></div>
      <div class="nact">
        ${(!k.treated && !waiting) ? `<button onclick="treatJoin('${k.id}')">${
            sys.wait[1] ? `Get referred${pub ? ' \u00b7 ' + money(pub) : ' \u00b7 free'}` : `Treat it \u00b7 ${money(pub)}`}</button>` : ''}
        ${(waiting || !k.treated) ? `<button onclick="treatPrivate('${k.id}')">Go private \u00b7 ${money(priv)}</button>` : ''}
        ${!k.specialist ? `<button onclick="seeSpecialist('${k.id}')">See a specialist</button>` : ''}
        ${k.treated ? `<button onclick="doRehab('${k.id}')">Rehabilitation</button>` : ''}
      </div></div>`;
  }).join('');
  return `<div class="card"><div class="ctrow"><div class="ct">Your health</div>
      <div class="hsub dim">${esc(sys.n)}</div></div>
    ${sys.id === 'public' ? '<div class="hsub dim">Treatment is free here. The wait is the price.</div>'
      : sys.id === 'private' ? '<div class="hsub dim">No waiting here. You pay for all of it.</div>'
      : '<div class="hsub dim">Some of it is covered. The rest is yours, and there is still a wait.</div>'}
    ${rows}</div>`;
}
