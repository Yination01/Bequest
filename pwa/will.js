/* BEQUEST — the will.

   The game is called Bequest and until now dying handed a flat 70% of net
   worth to whichever child happened to be first in the array. The house, the
   business and the car were simply deleted.

   This module lets you say who gets what, and makes that decision cost
   something. Three rules carry the weight:

     1. Without a will the estate is liquidated. Everything you built is sold
        by strangers and the cash is split by a formula, minus a large slice
        to probate. With a will, things pass in kind — the heir wakes up
        owning the actual house.
     2. Leaving someone out is not free. They may find out while you are
        alive, and they may contest it once you are not.
     3. One object can outlive all of it. An heirloom carries its own history
        forward and accumulates the names of everyone who held it.

   Everything here must be deterministic for a given save: the death screen
   re-renders whenever the player toggles something, and an estate that
   resettled itself mid-read would be a lie. All chance is resolved by
   hashing the save's seed, never by calling the RNG.                       */

/* ---------------- deterministic chance ---------------- */
function wHash(s, salt){
  const h = (((s && s.seed) >>> 0) + (salt >>> 0) * 2654435761) >>> 0;
  /* one more avalanche round, or neighbouring salts correlate */
  let x = h ^ (h >>> 15); x = Math.imul(x, 2246822507) >>> 0;
  x = x ^ (x >>> 13); x = Math.imul(x, 3266489909) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}
function wHashId(s, id, salt){
  let h = ((s && s.seed) >>> 0) ^ ((salt >>> 0) * 2654435761);
  const t = String(id);
  for(let i = 0; i < t.length; i++) h = (Math.imul(h, 31) + t.charCodeAt(i)) >>> 0;
  return wHash({ seed: h }, 7);
}

/* ---------------- heirlooms ----------------
   Deliberately small and deliberately not very valuable. The point of an
   heirloom is not that it is worth money.                                  */
const HEIRLOOMS = [
  { id:'watch',   n:'a gold pocket watch',      cost:4200,  v:3800  },
  { id:'ring',    n:'a signet ring',            cost:2600,  v:2400  },
  { id:'locket',  n:'a silver locket',          cost:900,   v:700   },
  { id:'violin',  n:'a violin',                 cost:7400,  v:6800  },
  { id:'bible',   n:'a family bible',           cost:400,   v:250   },
  { id:'clock',   n:'a longcase clock',         cost:5200,  v:5000  },
  { id:'painting',n:'a portrait of the family', cost:9500,  v:8000  },
  { id:'desk',    n:'a writing desk',           cost:3100,  v:2700  },
  { id:'medal',   n:'a service medal',          cost:0,     v:600   },
  { id:'rifle',   n:'a shotgun in a case',      cost:2900,  v:2500  }
];
const HEIRLOOM = id => HEIRLOOMS.find(h => h.id === id) || HEIRLOOMS[0];

/* An heirloom is worth more for having been kept. Not much more. */
function heirloomValue(h){
  if(!h) return 0;
  const gens = (h.gens || []).length;
  return Math.round((h.v || 0) * (1 + Math.min(gens, 8) * 0.22));
}
function heirloomAge(h){ return (h && h.gens) ? h.gens.length : 0; }
function heirloomLine(h){
  if(!h) return '';
  const g = heirloomAge(h);
  if(g <= 1) return 'Yours. Nobody has inherited it yet.';
  const first = h.gens[0];
  return `Held by ${wNum(g)} generations. ${first && first.name ? first.name.split(' ')[0] + ' had it first.' : ''}`.trim();
}

/* Some families already have one when you arrive. Called from newGame. */
function willBirth(s){
  s.will = { made:0, updated:0, main:null, shares:{}, gifts:{}, told:false, cut:[] };
  s.heirloom = null;
  if(s.birthTier >= 2 && wHash(s, 41) < 0.14){
    const d = HEIRLOOMS[Math.floor(wHash(s, 42) * HEIRLOOMS.length)] || HEIRLOOMS[0];
    const prior = 1 + Math.floor(wHash(s, 43) * 3);
    const gens = [];
    for(let i = 0; i < prior; i++) gens.push({ gen: s.gen - prior + i, name: 'A ' + s.surname });
    gens.push({ gen: s.gen, name: s.name });
    s.heirloom = { id:d.id, name:d.n, v:d.v, gens, origin:'family' };
  }
}
function willMigrate(s){
  if(!s.will) s.will = { made:0, updated:0, main:null, shares:{}, gifts:{}, told:false, cut:[] };
  if(!s.will.shares) s.will.shares = {};
  if(!s.will.gifts)  s.will.gifts  = {};
  if(!s.will.cut)    s.will.cut    = [];
  if(s.heirloom === undefined) s.heirloom = null;
}

/* ---------------- what there is to leave ----------------
   Assets get a uid the first time anyone looks at them through this screen.
   If the thing is sold before you die the bequest simply lapses, which is
   what happens in life and has a name: ademption.                          */
let WUID = 1;
function wUid(o, k){ if(!o.uid) o.uid = k + (WUID++) + '_' + Math.floor(Math.random() * 9000 + 1000); return o.uid; }

function willAssets(s){
  s = s || S;
  const out = [];
  (s.properties || []).forEach(p => {
    const eq = Math.max(0, (p.value || 0) - (p.mortgage || 0));
    out.push({ uid: wUid(p, 'p'), kind:'prop', ref:p, name: PROP(p.t).n, worth: eq,
               note: (p.home ? 'your home' : p.rented ? 'let out' : 'empty')
                     + (p.mortgage > 0 ? ' \u00b7 ' + money(p.mortgage) + ' still owing' : '') });
  });
  (s.vehicles || []).forEach(v => {
    out.push({ uid: wUid(v, 'v'), kind:'veh', ref:v, name: VEH(v.t).n, worth: v.value || 0,
               note: condWord(v.cond) });
  });
  (s.businesses || []).forEach(b => {
    out.push({ uid: wUid(b, 'b'), kind:'biz', ref:b, name: BIZ(b.t).n, worth: b.value || 0,
               note: (b.staff || 0) + ' staff' });
  });
  if(s.heirloom)
    out.push({ uid:'heirloom', kind:'heirloom', ref:s.heirloom,
               name: s.heirloom.name.replace(/^a /, 'A ').replace(/^an /, 'An '),
               worth: heirloomValue(s.heirloom), note: heirloomLine(s.heirloom) });
  return out;
}

/* Who is allowed to be in a will. Blood and the people you chose: children,
   a spouse or partner, siblings, and a friend close enough to count. */
function willHeirs(s){
  s = s || S;
  const rank = { spouse:0, partner:1, child:2, sibling:3, friend:4 };
  return (s.npcs || [])
    .filter(n => n.alive && rank[n.rel] != null && (n.rel !== 'friend' || n.r >= 80))
    .sort((a, b) => (rank[a.rel] - rank[b.rel]) || (b.r - a.r));
}
function willHeir(s, id){ return (s.npcs || []).find(n => n.id === id) || null; }

/* ---------------- editing the will ---------------- */
function willFee(){ return Math.round(900 * (typeof country === 'function' ? country().col : 1)); }
function willShareTotal(s){
  s = s || S;
  return Object.keys(s.will.shares).reduce((n, k) => n + (s.will.shares[k] || 0), 0);
}
function willCanWrite(s){
  s = s || S;
  return s.age >= 18 && willHeirs(s).length > 0;
}

function willSetShare(id, pct){
  const w = S.will, heirs = willHeirs(S);
  if(!heirs.some(h => h.id === id)) return;
  pct = Math.max(0, Math.min(100, Math.round(pct)));
  /* never let the total run past 100: the last mover is capped, not the will */
  const others = Object.keys(w.shares).filter(k => k !== id)
    .reduce((n, k) => n + (w.shares[k] || 0), 0);
  w.shares[id] = Math.min(pct, 100 - others);
  if(!w.shares[id]) delete w.shares[id];
  w.cut = w.cut.filter(x => x !== id);
  if(!w.main || !willHeir(S, w.main)) w.main = willMainGuess(S);
  willTouch(); save(); renderTab('money', true);
}
function willEven(){
  const w = S.will, kids = willHeirs(S).filter(n => n.rel === 'child');
  const pool = kids.length ? kids : willHeirs(S).slice(0, 1);
  if(!pool.length) return;
  w.shares = {};
  const base = Math.floor(100 / pool.length);
  pool.forEach((n, i) => { w.shares[n.id] = base + (i < 100 - base * pool.length ? 1 : 0); });
  w.cut = [];
  w.main = w.main && w.shares[w.main] ? w.main : pool[0].id;
  willTouch(); save(); renderTab('money', true);
}
function willSetGift(uid, heirId){
  const w = S.will;
  if(!heirId) delete w.gifts[uid]; else w.gifts[uid] = heirId;
  willTouch(); save(); renderTab('money', true);
}
function willCut(id){
  const w = S.will;
  if(w.cut.indexOf(id) < 0){ w.cut.push(id); delete w.shares[id];
    Object.keys(w.gifts).forEach(k => { if(w.gifts[k] === id) delete w.gifts[k]; });
    if(w.main === id) w.main = willMainGuess(S);
  } else w.cut = w.cut.filter(x => x !== id);
  willTouch(); save(); renderTab('money', true);
}
function willSetMain(id){ S.will.main = id; willTouch(); save(); renderTab('money', true); }
function willMainGuess(s){
  const named = willHeirs(s).filter(n => n.rel === 'child' && (s.will.shares[n.id] || 0) > 0);
  const kids  = willHeirs(s).filter(n => n.rel === 'child');
  return (named[0] || kids[0] || null) && (named[0] || kids[0]).id;
}
/* Any edit after the will is signed means it has to be signed again. */
function willTouch(){ if(S.will.made) S.will.updated = S.age; }

function willWrite(){
  if(!willCanWrite(S)) return popupOK('Not yet', 'You need someone to leave something to first.');
  const fee = willFee();
  if(!afford(fee)) return;
  confirmDo('Have the will drawn up?', `A solicitor will charge ${money(fee)} to write and witness it.`, () => {
    charge(fee); ledger('spend','Solicitor',fee);
    S.will.made = S.age; S.will.updated = S.age;
    if(!S.will.main) S.will.main = willMainGuess(S);
    if(!willShareTotal(S)) willEven();
    cue('good', 'medium');
    logLine('You had your will drawn up.', 'good');
    save(); renderAll();
    popupOK('Signed and witnessed', 'It will be read out when you are not in the room.');
  });
}

/* Telling them is a real decision. The ones who do well by it think better
   of you. The ones who do not are not going to wait until you are dead. */
function willTell(){
  if(!S.will.made) return popupOK('Nothing to tell', 'You have not made a will yet.');
  confirmDo('Tell the family what is in it?',
    'They will know exactly where they stand. Some of them will be pleased.', () => {
    const res = [];
    willHeirs(S).forEach(n => {
      const got = (S.will.shares[n.id] || 0) > 0 || Object.keys(S.will.gifts).some(k => S.will.gifts[k] === n.id);
      const cut = S.will.cut.indexOf(n.id) >= 0;
      const d = cut ? -26 : got ? +7 : -14;
      n.r = Math.max(0, Math.min(100, n.r + d));
      res.push(`${n.name.split(' ')[0]} ${d > 0 ? '+' : ''}${d}`);
    });
    S.will.told = true;
    cue(res.some(r => r.indexOf('-') > 0) ? 'bad' : 'good', 'medium');
    logLine('You told the family what was in your will.', 'neutral');
    save(); renderAll();
    popupOK('They know', 'Nobody will be surprised now.', res);
  });
}

/* If you cut someone out and say nothing, word still gets round. */
function willLeak(){
  if(!S.will.made || S.will.told) return;
  const wronged = willHeirs(S).filter(n =>
    S.will.cut.indexOf(n.id) >= 0 ||
    ((S.will.shares[n.id] || 0) === 0 && n.rel === 'child' &&
     !Object.keys(S.will.gifts).some(k => S.will.gifts[k] === n.id)));
  if(!wronged.length) return;
  if(R() > 0.06) return;
  const n = pick(wronged);
  n.r = Math.max(0, n.r - 18);
  S.will.leaked = true;
  logLine(`${n.name.split(' ')[0]} found out what is in your will.`, 'bad');
}

/* ---------------- commissioning one ---------------- */
function heirloomOffer(){
  if(S.heirloom) return popupOK('You already have one', `${S.heirloom.name.replace(/^an? /, '')} \u2014 ${heirloomLine(S.heirloom)}`);
  const col = typeof country === 'function' ? country().col : 1;
  const opts = HEIRLOOMS.filter(h => h.cost > 0).map(h =>
    [`${h.n.replace(/^a /, 'A ').replace(/^an /, 'An ')} \u2014 ${money(Math.round(h.cost * col))}`, 0, h.id]);
  chooseFrom('Something to last', opts, (label, id) => commissionHeirloom(id));
}
function commissionHeirloom(id){
  const d = HEIRLOOM(id), col = typeof country === 'function' ? country().col : 1;
  const cost = Math.round(d.cost * col);
  if(S.heirloom) return;
  if(!afford(cost)) return;
  charge(cost); ledger('spend','Heirloom',cost);
  S.heirloom = { id:d.id, name:d.n, v:d.v, gens:[{ gen:S.gen, name:S.name }], origin:'made' };
  cue('good', 'medium');
  logLine(`You bought ${d.n}, meaning to keep it.`, 'good');
  save(); renderAll();
}

/* ---------------- settling the estate ----------------
   Pure and deterministic: same save in, same settlement out, every time.  */
function settleEstate(s, gross){
  s = s || S;
  willMigrate(s);
  gross = Number(gross);
  if(!isFinite(gross)) gross = 0;

  const w = s.will || {};
  const heirs = willHeirs(s);
  const assets = willAssets(s);
  const out = {
    gross, intestate: !w.made, probateRate: 0, probate: 0, legal: 0,
    contested: [], allocations: [], lapsed: [], heirloomTo: null,
    heirloomLost: false, lost: 0, net: 0
  };

  /* Debt does not pass on. There is nothing to settle. */
  if(gross <= 0){
    out.net = 0;
    if(s.heirloom) out.heirloomLost = true;
    return out;
  }

  /* --- no will: strangers sell it and the courts take a slice --- */
  if(!w.made){
    out.probateRate = 0.12;
    out.probate = Math.round(gross * out.probateRate);
    out.net = gross - out.probate;
    const kids = heirs.filter(n => n.rel === 'child');
    const sp   = heirs.filter(n => n.rel === 'spouse' || n.rel === 'partner');
    const sib  = heirs.filter(n => n.rel === 'sibling');
    const take = kids.length ? kids : sp.length ? sp : sib;
    if(!take.length){ out.lost = out.net; return out; }
    const each = Math.floor(out.net / take.length);
    take.forEach(n => out.allocations.push({ id:n.id, name:n.name, rel:n.rel, cash:each, assets:[], heirloom:false }));
    /* everything is liquidated, including the thing that was not about money */
    if(s.heirloom) out.heirloomLost = true;
    return out;
  }

  /* --- a will: 4% and things pass as things --- */
  out.probateRate = 0.04;
  out.probate = Math.round(gross * out.probateRate);

  const alloc = {};
  const ensure = n => alloc[n.id] || (alloc[n.id] = { id:n.id, name:n.name, rel:n.rel, cash:0, assets:[], heirloom:false });

  let gifted = 0;
  assets.forEach(a => {
    const to = w.gifts[a.uid];
    if(!to) return;
    const n = willHeir(s, to);
    if(!n || !n.alive){ out.lapsed.push(a); return; }   /* named someone who went first */
    if(a.kind === 'heirloom'){ ensure(n).heirloom = true; out.heirloomTo = n.id; return; }
    ensure(n).assets.push(a);
    gifted += a.worth;
  });
  /* an heirloom nobody was left goes in the sale with everything else */
  if(s.heirloom && !out.heirloomTo) out.heirloomLost = true;

  let cash = Math.max(0, gross - out.probate - gifted);

  const shareIds = Object.keys(w.shares).filter(id => {
    const n = willHeir(s, id); return n && n.alive && w.shares[id] > 0;
  });
  const shareSum = shareIds.reduce((n, id) => n + w.shares[id], 0);
  if(shareIds.length && shareSum > 0){
    shareIds.forEach(id => {
      const n = willHeir(s, id);
      ensure(n).cash += Math.floor(cash * (w.shares[id] / shareSum));
    });
  } else if(cash > 0){
    /* a will that disposes of the things but not the money: it still has to
       go somewhere, and it goes where the law would have sent it */
    const kids = heirs.filter(n => n.rel === 'child');
    const fall = kids.length ? kids : heirs.slice(0, 1);
    if(fall.length){ const each = Math.floor(cash / fall.length); fall.forEach(n => ensure(n).cash += each); }
    else out.lost += cash;
  }

  /* --- contesting ---
     A living child or spouse who was left nothing, and did not think much of
     you, has both the standing and the motive. */
  const wronged = heirs.filter(n => {
    if(n.rel !== 'child' && n.rel !== 'spouse' && n.rel !== 'partner') return false;
    const a = alloc[n.id];
    return !a || (a.cash <= 0 && !a.assets.length && !a.heirloom);
  });
  wronged.forEach(n => {
    let p = 0.10 + Math.max(0, (60 - n.r)) / 110;          /* resentment does the work */
    if((w.cut || []).indexOf(n.id) >= 0) p += 0.15;        /* named and excluded */
    if(w.told) p *= 0.55;                                  /* they had the row while you were alive */
    /* nobody instructs a solicitor over a few thousand pounds */
    p *= Math.max(0, Math.min(1, gross / 60000));
    if(wHashId(s, n.id, 91) < p) out.contested.push({ id:n.id, name:n.name, rel:n.rel, r:n.r });
  });

  if(out.contested.length){
    /* Lawyers first. Then the court gives the claimants a third of the cash
       between them, taken pro rata from everyone who was left some. */
    out.legal = Math.round(Math.min(gross * 0.18, 140000));
    const paid = Object.keys(alloc).filter(id => alloc[id].cash > 0);
    const pot  = paid.reduce((n, id) => n + alloc[id].cash, 0);
    const fees = Math.min(out.legal, pot);
    paid.forEach(id => { alloc[id].cash -= Math.round(fees * (alloc[id].cash / pot)); });

    const after = paid.reduce((n, id) => n + Math.max(0, alloc[id].cash), 0);
    const forced = Math.round(after / 3);
    if(forced > 0){
      paid.forEach(id => { alloc[id].cash -= Math.round(forced * (Math.max(0, alloc[id].cash) / after)); });
      const each = Math.floor(forced / out.contested.length);
      out.contested.forEach(c => { const n = willHeir(s, c.id); ensure(n).cash += each; });
    }
  }

  Object.keys(alloc).forEach(id => { alloc[id].cash = Math.max(0, alloc[id].cash); out.allocations.push(alloc[id]); });
  out.allocations.sort((a, b) => (b.cash + b.assets.reduce((n, x) => n + x.worth, 0))
                               - (a.cash + a.assets.reduce((n, x) => n + x.worth, 0)));
  out.net = gross - out.probate - out.legal;
  return out;
}

function settlementFor(id, st){
  return (st.allocations || []).find(a => a.id === id) || null;
}

/* ---------------- the screen you write it on ---------------- */
function willView(){
  willMigrate(S);
  const w = S.will, heirs = willHeirs(S), assets = willAssets(S);
  const worth = netWorth();
  const total = willShareTotal(S);

  if(S.age < 18)
    return '<div class="card"><div class="muted">You cannot make a will until you are 18.</div></div>';

  const status = w.made
    ? `<div class="kv"><span>Drawn up</span><b>age ${w.made}${w.updated > w.made ? ', revised at ' + w.updated : ''}</b></div>
       <div class="kv"><span>Probate will take</span><b>4%</b></div>
       <div class="kv"><span>The family</span><b>${w.told ? 'know what is in it' : w.leaked ? 'have heard rumours' : 'have not been told'}</b></div>`
    : `<div class="hardnote">You have not made a will. If you die now the estate is sold off,
       <b>12% goes to probate</b>, and what is left is split by a formula \u2014 the house, the business
       and anything you meant to keep will all be turned into cash first.</div>`;

  const heirRows = heirs.length ? heirs.map(n => {
    const cut = w.cut.indexOf(n.id) >= 0;
    const pct = w.shares[n.id] || 0;
    const gifts = assets.filter(a => w.gifts[a.uid] === n.id);
    return `<div class="npc"><div class="npcline"><div>
        <div class="rn">${esc(n.name)}${w.main === n.id ? ' <span class="award t1">main heir</span>' : ''}</div>
        <div class="hsub dim">${esc(n.rel)} \u00b7 ${n.r >= 70 ? 'close' : n.r >= 40 ? 'in touch' : 'distant'}${
          gifts.length ? ' \u00b7 ' + esc(gifts.map(g => g.name.toLowerCase()).join(', ')) : ''}</div></div>
        <div class="hsub"><b>${cut ? '\u2014' : pct + '%'}</b></div></div>
      ${cut ? '<div class="hsub dim">Cut out of the will.</div>' : `
      <div class="nact">
        <button onclick="willSetShare('${n.id}',${Math.max(0, pct - 10)})">\u2212</button>
        <button onclick="willSetShare('${n.id}',${Math.min(100, pct + 10)})">+</button>
        ${w.main === n.id || n.rel !== 'child' ? '' : `<button onclick="willSetMain('${n.id}')">Make main heir</button>`}
      </div>`}
      <div class="nact"><button onclick="willCut('${n.id}')">${cut ? 'Put back in' : 'Cut out'}</button></div>
    </div>`;
  }).join('') : '<div class="hsub dim">There is nobody to leave anything to yet.</div>';

  const assetRows = assets.length ? assets.map(a => {
    const to = w.gifts[a.uid], n = to ? willHeir(S, to) : null;
    const opts = ['<option value="">Sold with the rest</option>']
      .concat(heirs.map(h => `<option value="${h.id}"${to === h.id ? ' selected' : ''}>${esc(h.name)}</option>`)).join('');
    return `<div class="npc"><div class="npcline"><div>
        <div class="rn">${esc(a.name)}${a.kind === 'heirloom' ? ' <span class="award t2">heirloom</span>' : ''}</div>
        <div class="hsub dim">${money(a.worth)} \u00b7 ${esc(a.note)}</div></div></div>
      <div class="nact"><select class="willsel" onchange="willSetGift('${a.uid}',this.value)">${opts}</select></div>
      ${n && !n.alive ? '<div class="hsub bad">They are no longer alive.</div>' : ''}</div>`;
  }).join('') : '<div class="hsub dim">You own nothing that can be handed over as it is.</div>';

  /* what it would actually come to if you died this year */
  const st = settleEstate(S, worth);
  const preview = st.allocations.length ? st.allocations.map(a => {
    const things = a.assets.map(x => x.name.toLowerCase()).concat(a.heirloom ? ['the heirloom'] : []);
    return `<div class="kv"><span>${esc(a.name.split(' ')[0])}</span><b>${money(a.cash)}${
      things.length ? ' + ' + esc(things.join(', ')) : ''}</b></div>`;
  }).join('') : '<div class="hsub dim">Nobody would get anything.</div>';

  return `<div class="card"><div class="ctrow"><div class="ct">Your will</div>
      <div class="hsub dim">${money(worth)} to leave</div></div>
    ${status}
    <div class="row mt">
      <button class="btn primary" onclick="willWrite()">${w.made ? 'Have it redrawn \u2014 ' + money(willFee()) : 'Have one drawn up \u2014 ' + money(willFee())}</button>
      ${w.made ? '<button class="btn" onclick="willTell()">Tell the family</button>' : ''}
    </div></div>

  <div class="card"><div class="ctrow"><div class="ct">Who gets the money</div>
      <div class="hsub ${total === 100 ? 'dim' : 'bad'}">${total}% allocated</div></div>
    ${total !== 100 && heirs.length ? `<div class="hardnote">${total > 100 ? 'That is more than there is.'
      : 'The rest would be split by the law, not by you.'}</div>` : ''}
    <div class="row"><button class="btn" onclick="willEven()">Split evenly between the children</button></div>
    ${heirRows}</div>

  <div class="card"><div class="ct">Who gets the things</div>
    <div class="hsub dim">Anything you do not name is sold and added to the money.</div>
    ${assetRows}
    ${!S.heirloom && S.age >= 25 ? `<div class="row mt"><button class="btn" onclick="heirloomOffer()">Have something made to last</button></div>` : ''}</div>

  <div class="card"><div class="ct">If you died this year</div>
    <div class="kv"><span>Estate</span><b>${money(st.gross)}</b></div>
    <div class="kv"><span>Probate at ${Math.round(st.probateRate * 100)}%</span><b class="bad">\u2212${money(st.probate)}</b></div>
    ${st.contested.length ? `<div class="kv"><span>Contested by ${esc(st.contested.map(c => c.name.split(' ')[0]).join(', '))}</span><b class="bad">\u2212${money(st.legal)}</b></div>` : ''}
    ${preview}
    ${st.heirloomLost ? '<div class="hardnote">The heirloom would be sold with everything else.</div>' : ''}
    ${st.contested.length ? '<div class="hardnote">Someone you left out would take it to court. Telling them while you are alive makes that less likely.</div>' : ''}
  </div>`;
}

/* ---------------- the death screen block ---------------- */
function willDeathBlock(st){
  if(!st) return '';
  const rows = st.allocations.map(a => {
    const things = a.assets.map(x => x.name.toLowerCase()).concat(a.heirloom ? ['the heirloom'] : []);
    return `<div class="kv"><span>${esc(a.name)}</span><b>${money(a.cash)}${things.length ? ' + ' + esc(things.join(', ')) : ''}</b></div>`;
  }).join('');
  const notes = [];
  if(st.intestate) notes.push('There was no will. Everything was sold and ' + money(st.probate) + ' went to probate.');
  else notes.push('The will was read. ' + money(st.probate) + ' went to probate.');
  if(st.contested.length) notes.push(st.contested.map(c => c.name.split(' ')[0]).join(' and ')
    + ' contested it. The lawyers took ' + money(st.legal) + '.');
  if(st.heirloomLost) notes.push('The heirloom was sold with the rest.');
  if(st.lost > 0) notes.push(money(st.lost) + ' went unclaimed.');
  return `<div class="sec">What was left</div>
    ${rows || '<div class="hsub dim">There was nothing to leave.</div>'}
    ${notes.map(n => `<div class="hsub dim">${esc(n)}</div>`).join('')}`;
}

/* words, for the small numbers that read badly as digits */
function wNum(n){
  const w = ['no','one','two','three','four','five','six','seven','eight','nine','ten'];
  return w[n] != null ? w[n] : String(n);
}
