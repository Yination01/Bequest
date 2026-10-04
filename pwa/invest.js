/* BEQUEST — somewhere to put money that is not a savings account.

   There was one investment in the game: crypto, whose price moved by up to
   forty per cent a year on a coin flip. Nothing else. Savings paid 2.5% and
   property was a separate system, so "investing" was a single lever with no
   decision in it beyond how much to pull.

   Six asset classes now, and the point of them is that they do not move
   together. Every year the market has a mood; each asset responds to it by
   its own beta and then adds noise of its own. Gold has a negative beta, so
   it is the only thing that goes up in a bad year, and bonds barely notice.
   That makes a spread of holdings genuinely different from one big bet,
   which is the only reason a portfolio is interesting.                     */

const ASSETS = [
  { id:'bonds',  n:'Government bonds',  mean:0.031, sd:0.045, beta:0.10, min:500,
    d:'Dull, and that is the entire point of them.' },
  { id:'index',  n:'An index fund',     mean:0.072, sd:0.150, beta:1.00, min:500,
    d:'The whole market at once, for a very small fee.' },
  { id:'reit',   n:'A property fund',   mean:0.058, sd:0.175, beta:0.75, min:2000,
    d:'Bricks, at one remove, without the tenants.' },
  { id:'shares', n:'Individual shares', mean:0.086, sd:0.320, beta:1.30, min:1000,
    d:'You will be certain you have picked well. Some of you will be right.' },
  { id:'em',     n:'Emerging markets',  mean:0.098, sd:0.290, beta:1.55, min:1000,
    d:'Growth, interrupted.' },
  { id:'gold',   n:'Gold',              mean:0.022, sd:0.150, beta:-0.35, min:1000,
    d:'Does nothing for years, then everything in one of them.' }
];
const ASSET = id => ASSETS.find(a => a.id === id) || ASSETS[0];

function investBirth(s){
  s.holdings = {};
  s.stockMarket = { last:0, year:0 };
  s.investIn = 0;      /* everything ever put in  */
  s.investOut = 0;     /* everything ever taken out */
}
function investMigrate(s){
  if(!s.holdings) s.holdings = {};
  /* The mood used to live on s.market, which belongs to the property and
     vehicle marketplace in game.js. Move it off, and never recreate it there. */
  if(!s.stockMarket) s.stockMarket = { last:(s.market && s.market.last) || 0, year:0 };
  if(s.market && s.market.last !== undefined) delete s.market.last;
  if(s.investIn == null) s.investIn = 0;
  if(s.investOut == null) s.investOut = 0;
}

function holdingsValue(s){
  s = s || S;
  return Object.keys(s.holdings || {}).reduce((n, k) => n + (s.holdings[k] || 0), 0);
}
function holdingOf(s, id){ return Math.round((s.holdings || {})[id] || 0); }

/* A normal-ish draw without needing a library. */
function gauss(){ return ((R() + R() + R() + R() + R() + R()) - 3) / 1.2; }

/* One year of markets. Returns notes worth telling the player about. */
function tickInvest(s, notes){
  s = s || S;
  investMigrate(s);
  /* The market's mood, with the occasional bad year that is much worse than
     the spread alone would ever produce. */
  let mkt = gauss() * 0.13;
  if(R() < 0.055) mkt = -0.22 - R() * 0.26;          /* a crash */
  else if(R() < 0.05) mkt = 0.20 + R() * 0.18;       /* a run */
  /* The investment market keeps its own record. It used to write into S.market,
     which is the property/vehicle/item marketplace in game.js: the mood tick set
     S.market.year = S.age every year, and marketRefresh() then saw the year as
     already handled and returned before generating a single listing, so both
     marketplaces were permanently empty. Separate objects, separate concerns. */
  if(!s.stockMarket) s.stockMarket = { last: 0, year: -1 };
  s.stockMarket.last = mkt;
  s.stockMarket.year = s.age;

  const held = Object.keys(s.holdings).filter(k => s.holdings[k] > 0);
  if(!held.length) return;

  let before = 0, after = 0;
  held.forEach(id => {
    const a = ASSET(id);
    const r = a.mean + a.beta * mkt + gauss() * a.sd * 0.55;
    before += s.holdings[id];
    s.holdings[id] = Math.max(0, s.holdings[id] * (1 + r));
    after += s.holdings[id];
  });
  const pct = before > 0 ? (after - before) / before : 0;
  if(notes && Math.abs(pct) >= 0.06)
    notes.push(`Your investments ${pct > 0 ? 'gained' : 'lost'} ${money(Math.abs(Math.round(after - before)))} `
      + `(${pct > 0 ? '+' : '\u2212'}${Math.abs(pct * 100).toFixed(0)}%).`);
  if(mkt <= -0.22 && notes) notes.push('The markets had a very bad year.');
}

/* ---- buying and selling ---- */
function investBuy(id, amount){
  const a = ASSET(id);
  amount = Math.round(amount);
  if(S.age < 18) return popupOK('Too young', 'You need to be 18 to invest.');
  if(amount < a.min) return popupOK('Below the minimum', `${a.n} takes ${money(a.min)} or more.`);
  if(!afford(amount)) return;
  charge(amount); ledger('spend', a.n, amount);
  S.holdings[id] = (S.holdings[id] || 0) + amount;
  S.investIn += amount;
  S.flags.invests = true;
  cue('moneyOut', 'light');
  save(); renderAll();
}
function investSell(id, part){
  const a = ASSET(id);
  const have = S.holdings[id] || 0;
  if(have <= 0) return;
  const take = part >= 1 ? have : have * part;
  const got = Math.round(take);
  S.holdings[id] = have - take;
  if(S.holdings[id] < 1) delete S.holdings[id];
  S.money += got; S.investOut += got;
  ledger('earn', 'Sold ' + a.n.toLowerCase(), got);
  cue('moneyIn', 'light');
  popupOK('Sold', `You sold ${money(got)} of ${a.n.toLowerCase()}.`);
  save(); renderAll();
}
function investPick(id){
  const a = ASSET(id);
  const steps = [a.min, a.min * 4, a.min * 20].filter(v => v <= S.money);
  if(!steps.length) return popupOK('Not enough', `${a.n} takes ${money(a.min)} or more, and you have ${money(S.money)}.`);
  if(S.money >= a.min) steps.push(-1);   /* everything */
  chooseFrom(`How much into ${a.n.toLowerCase()}?`,
    steps.map(v => [v === -1 ? `Everything you have \u00b7 ${money(S.money)}` : money(v), 0, String(v)]),
    (label, v) => investBuy(id, +v === -1 ? S.money : +v));
}

/* How spread out the money is, 0 (one bet) to 1 (evenly across everything). */
function spread(s){
  s = s || S;
  const vals = ASSETS.map(a => (s.holdings || {})[a.id] || 0);
  const tot = vals.reduce((n, v) => n + v, 0);
  if(tot <= 0) return 0;
  const shares = vals.map(v => v / tot);
  const hhi = shares.reduce((n, x) => n + x * x, 0);      /* 1 = all in one */
  const best = 1 / ASSETS.length;
  return Math.max(0, Math.min(1, (1 - hhi) / (1 - best)));
}

/* ---- the screen ---- */
function moneyInvest(){
  if(S.age < 18) return '<div class="card"><div class="muted">Investing opens at 18.</div></div>';
  investMigrate(S);
  const tot = holdingsValue(S);
  const m = (S.stockMarket && S.stockMarket.last) || 0;
  const mood = m <= -0.22 ? 'a very bad year' : m < -0.06 ? 'a poor year'
    : m > 0.18 ? 'a very good year' : m > 0.05 ? 'a good year' : 'a flat year';

  const rows = ASSETS.map(a => {
    const held = holdingOf(S, a.id);
    return `<div class="npc"><div class="npcline"><div>
        <div class="rn">${esc(a.n)}</div>
        <div class="hsub dim">${esc(a.d)}</div></div>
        <div class="hsub"><b>${held ? money(held) : '\u2014'}</b></div></div>
      <div class="hsub dim">typical ${(a.mean * 100).toFixed(1)}% a year \u00b7 ${
        a.sd > 0.25 ? 'very volatile' : a.sd > 0.15 ? 'volatile' : a.sd > 0.08 ? 'steady' : 'very steady'}${
        a.beta < 0 ? ' \u00b7 rises when the market falls' : ''}</div>
      <div class="nact"><button onclick="investPick('${a.id}')">Buy</button>
        ${held ? `<button onclick="investSell('${a.id}',0.5)">Sell half</button>
                  <button onclick="investSell('${a.id}',1)">Sell all</button>` : ''}</div></div>`;
  }).join('');

  const sp = spread(S);
  const gain = S.investOut + tot - S.investIn;
  return `<div class="card"><div class="ctrow"><div class="ct">Your portfolio</div>
      <div class="hsub dim">${money(tot)}</div></div>
    ${tot > 0 ? `<div class="kv"><span>Put in over your life</span><b>${money(S.investIn)}</b></div>
      <div class="kv"><span>Taken out</span><b>${money(S.investOut)}</b></div>
      <div class="kv"><span>Ahead by</span><b class="${gain >= 0 ? 'g' : 'bad'}">${gain >= 0 ? '' : '\u2212'}${money(Math.abs(gain))}</b></div>
      <div class="kv"><span>Spread across</span><b>${Math.round(sp * 100)}%</b></div>
      <div class="bt"><i class="${sp > 0.6 ? 'g' : sp > 0.3 ? 'a' : 'r'}" style="width:${Math.round(sp * 100)}%"></i></div>
      <div class="hsub dim">${sp > 0.6 ? 'Well spread. A bad year in one thing will not take the lot.'
        : sp > 0.3 ? 'Somewhat concentrated.'
        : 'Almost all of it is in one thing.'}</div>`
      : '<div class="hsub dim">You hold nothing. Savings pay 2.5% and inflation does not care.</div>'}
    <div class="hsub dim mt">The market has just had ${mood}.</div></div>
  <div class="card"><div class="ct">What you can buy</div>${rows}</div>
  <div class="card"><div class="ct">Crypto</div>
    <div class="kv"><span>Holding</span><b>${money(cryptoValue())} <small class="dim">@ ${money(S.crypto.price)}</small></b></div>
    <div class="grid3 mt">
      <button class="mini" onclick="fin('buyc')">Buy $2k</button>
      <button class="mini" onclick="fin('sellc')">Sell all</button>
    </div></div>`;
}
