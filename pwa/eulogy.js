/* BEQUEST — the obituary.

   The death screen used to be thirteen numbers in a grid, which is a strange
   way to end a game about a life. This turns the same save into prose: what
   the life was, who is left holding it, and what they were left.

   Everything here is derived at the moment of death and nothing is stored,
   so an obituary can be written for a save made before this file existed.
   Every section degrades: a character who died at four has no working life
   and no estate, and the text simply does not mention them.                */

const EULOGY_NUM = ['no','one','two','three','four','five','six','seven','eight',
                    'nine','ten','eleven','twelve'];
function eNum(n){ return (n >= 0 && n <= 12) ? EULOGY_NUM[n] : String(n); }
function eList(items){
  items = items.filter(Boolean);
  if(!items.length) return '';
  if(items.length === 1) return items[0];
  if(items.length === 2) return items[0] + ' and ' + items[1];
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}
function first(n){ return String(n && n.name ? n.name : '').split(' ')[0]; }
/* The name pool can hand a sibling the dead person's own first name, and
   "He and Miles had not spoken in years" then reads as one man not speaking
   to himself. Fall back to the relation wherever the name stands alone. */
function eName(s, n){
  const f = first(n);
  if(!f || f.toLowerCase() !== first(s).toLowerCase()) return f;
  const p = ePron(s);
  return `${p.their} ${eKin(n)}`;
}
function eKin(n){
  return n.rel === 'child'   ? (n.gender === 'f' ? 'daughter' : 'son')
       : n.rel === 'sibling' ? (n.gender === 'f' ? 'sister'   : 'brother')
       : n.rel === 'spouse'  ? (n.gender === 'f' ? 'wife'     : 'husband')
       : n.rel;
}
/* Stable variation: keyed off the seed so re-rendering the screen never
   rewrites what was said, and salted so two sentences in one obituary do not
   move together. */
function ePickFrom(s, arr, salt){
  const k = ((s.seed >>> 0) + (salt || 0) * 2654435761) >>> 0;
  return arr[k % arr.length];
}
function ePron(s){
  return s.gender === 'f'
    ? { they:'she', them:'her', their:'her', cap:'She' }
    : { they:'he',  them:'him', their:'his', cap:'He'  };
}
function eSentence(parts){
  const t = parts.filter(Boolean).join(' ').replace(/\s+/g,' ').replace(/\s+([,.;])/g,'$1').trim();
  if(!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.');
}

/* ---- where a life started ---- */
const EULOGY_BORN = [
  ['into a family that had nothing', 'into poverty and no prospect of leaving it', 'into a family with nothing behind it at all'],
  ['into a family that worked for everything it had', 'into a household that got by on work', 'to parents who never stopped working'],
  ['into a family that had just enough', 'into the comfortable middle of things', 'to a family that was neither struggling nor secure'],
  ['into comfortable circumstances', 'into a family with something put by', 'into the kind of comfort that is easy to mistake for normal'],
  ['into money', 'into a family that had never had to think about it', 'into real money']
];

function eulogyOpening(s){
  const p = ePron(s);
  const where = s.city ? `in ${s.city}` : '';
  const born = ePickFrom(s, EULOGY_BORN[s.birthTier] || EULOGY_BORN[2], 1);
  const out = [];
  out.push(eSentence([`${s.name} was born`, where, born + '.']));

  /* A child's obituary is a different document, and should not go on to
     discuss their career. */
  if(s.age < 16){
    const sibs = (s.npcs || []).filter(n => n.rel === 'sibling').length;
    out.push(eSentence([
      p.cap, `died at ${eNum(s.age)}`,
      s.cause ? `of ${s.cause}` : '',
      sibs ? `, one of ${eNum(sibs + 1)} children` : ''
    ]));
    return out;
  }

  /* schooling */
  const deg = (typeof DEGREE === 'function' && s.degreeDone) ? DEGREE(s.degreeDone) : null;
  const uni = (typeof UNI_TIERS !== 'undefined' && s.uniTier)
    ? (UNI_TIERS.find(t => t.id === s.uniTier) || null) : null;
  const subject = deg ? deg.n.toLowerCase() : null;
  const SCHOOL = [
    [`${p.they} left school with nothing to show for it`,
     `${p.they} left school early and did not go back`,
     `School did not take, and ${p.they} left it behind`],
    [`${p.they} finished school and went no further`,
     `${p.they} took ${p.their} certificate and stopped there`,
     `${p.they} left at eighteen with a diploma and no plan`],
    [`${p.they} trained in a trade`,
     `${p.they} learned a trade instead`,
     `${p.they} took a trade certificate and made it pay`],
    [`${p.they} read ${subject || 'for a degree'}${uni ? ` at ${uni.n.toLowerCase()}` : ''}`,
     `${p.they} went to university${subject ? ` for ${subject}` : ''}`,
     `${subject ? `A degree in ${subject} followed` : 'A degree followed'}${uni ? `, taken at ${uni.n.toLowerCase()}` : ''}`],
    [`${p.they} studied ${subject || 'on'} to postgraduate level`,
     `${p.they} kept studying long after most people stop`,
     `${p.they} went all the way through to postgraduate work`]
  ];
  const school = ePickFrom(s, SCHOOL[Math.max(0, Math.min(4, s.edu || 0))], 2);
  /* only qualifications you had to pass can be passed well */
  const gpa = s.gpa == null ? 50 : s.gpa;
  const howWell = s.edu >= 2 ? (gpa >= 82 ? ', and was good at it' : gpa < 38 ? ', barely' : '') : '';
  out.push(eSentence([school + howWell]));
  return out;
}

/* ---- what they did with the middle of it ---- */
function eulogyWork(s){
  const p = ePron(s);
  const out = [];
  const career = s.career || [];
  if(s.age < 16) return out;

  if(!career.length && !s.jobsHeld){
    out.push(eSentence([p.cap, 'never held a job']));
  } else if(career.length){
    /* the job held longest is the one a life is remembered by */
    const spans = career.map((j, i) => ({
      t: j.t,
      years: (i + 1 < career.length ? career[i + 1].from : s.age) - j.from
    }));
    const longest = spans.slice().sort((a, b) => b.years - a.years)[0];
    const last = career[career.length - 1];
    const roles = new Set(career.map(j => j.t));
    let line;
    if(longest.years >= 10)
      line = `${p.they} spent ${eNum(longest.years)} years as ${eArticle(longest.t)}`;
    else if(roles.size >= 5)
      line = `${p.they} moved through ${eNum(roles.size)} jobs and settled at none of them`;
    else
      line = `${p.they} worked as ${eArticle(longest.t)}`;
    if(last.t !== longest.t && longest.years >= 10)
      line += `, and finished as ${eArticle(last.t)}`;
    out.push(eSentence([line]));
    if(s.peakIncome > 0 && s.counters && s.counters.promotions >= 3)
      out.push(eSentence([p.cap, `was promoted ${eNum(s.counters.promotions)} times`]));
  } else if(s.jobsHeld){
    out.push(eSentence([p.cap, `held ${eNum(s.jobsHeld)} job${s.jobsHeld > 1 ? 's' : ''}`]));
  }

  if((s.countriesLived || []).length > 1)
    out.push(eSentence([p.cap, `lived in ${eNum(s.countriesLived.length)} countries`]));

  if(s.track && typeof TRACK === 'function'){
    const d = TRACK(s.track.id), r = (typeof TRACK_RANK === 'function') ? TRACK_RANK(s.track) : null;
    if(d) out.push(eSentence([`Away from all that, ${p.they} rose to ${r ? r.n.toLowerCase() : 'some standing'} in ${d.n.toLowerCase()}`]));
  }
  if(s.yearsJailed > 0)
    out.push(eSentence([p.cap, `served ${eNum(s.yearsJailed)} year${s.yearsJailed > 1 ? 's' : ''} in prison`]));
  else if(s.crimesCommitted >= 5)
    out.push(eSentence([p.cap, 'broke the law more often than anyone knew, and was never caught']));

  if(s.donated >= 50000)
    out.push(eSentence([p.cap, `gave ${money(s.donated)} of it away`]));
  return out;
}

function eArticle(t){
  return (/^[aeiou]/i.test(t) ? 'an ' : 'a ') + t.toLowerCase();
}

/* ---- the people ----
   An obituary names family. It does not list six estranged acquaintances,
   and it does not repeat the same parenthetical after every name, so at most
   one relationship gets a clause of its own and it is the one worth saying. */
const EULOGY_REL = { spouse:0, partner:1, child:2, sibling:3, mother:4, father:5, friend:6 };
function eulogyLabel(s, n, withPossessive){
  const p = ePron(s);
  return (withPossessive === false ? '' : p.their + ' ') + eKin(n) + ' ' + n.name.split(' ')[0];
}
function eulogyPeople(s){
  const p = ePron(s);
  const npcs = s.npcs || [];
  const rank = n => (EULOGY_REL[n.rel] == null ? 9 : EULOGY_REL[n.rel]);
  const first = n => n.name.split(' ')[0];

  const family = npcs.filter(n => n.alive && EULOGY_REL[n.rel] != null && n.rel !== 'friend')
                     .sort((a, b) => rank(a) - rank(b) || b.r - a.r);
  /* friends only earn a mention if they were genuinely close, or if there
     is no family left at all to name */
  let friends = npcs.filter(n => n.alive && n.rel === 'friend' && n.r >= 72)
                    .sort((a, b) => b.r - a.r).slice(0, 2);
  if(!family.length && !friends.length)
    friends = npcs.filter(n => n.alive && n.rel === 'friend').sort((a, b) => b.r - a.r).slice(0, 1);

  const named = family.slice(0, 5).concat(friends);
  const out = {};

  if(named.length){
    /* do not print the same first name twice, which the name pool allows */
    const seen = {};
    const phrased = named.filter(n => { const k = first(n) + n.rel; if(seen[k]) return false; seen[k] = 1; return true; })
                         .map(n => eulogyLabel(s, n));
    out.survived = eSentence([`${first(s)} is survived by ${eList(phrased)}`]);
  } else {
    out.survived = eSentence([`${p.cap} left no one behind`]);
  }

  /* one relationship, said properly, instead of a clause after every name */
  const notes = [];
  const closest = named.filter(n => n.r >= 85).sort((a, b) => b.r - a.r)[0];
  const distant = named.filter(n => n.r < 28).sort((a, b) => a.r - b.r)[0];
  if(closest) notes.push(eSentence([`${eName(s, closest).replace(/^\\w/, c => c.toUpperCase())} was with ${p.them} at the end`]));
  else if(distant) notes.push(eSentence([`${p.cap} and ${eName(s, distant)} had not spoken in years`]));

  /* being outlived by your parents is ordinary; outliving a spouse or a
     child is the thing an obituary actually records */
  const lostSpouse = npcs.filter(n => !n.alive && (n.rel === 'spouse' || n.rel === 'partner'));
  const lostKids   = npcs.filter(n => !n.alive && n.rel === 'child');
  if(lostKids.length)
    notes.push(eSentence([`${p.cap} buried ${lostKids.length === 1 ? eulogyLabel(s, lostKids[0]) : eNum(lostKids.length) + ' of ' + p.their + ' children'}`]));
  if(lostSpouse.length)
    notes.push(eSentence([`${eulogyLabel(s, lostSpouse[0]).replace(/^\w/, c => c.toUpperCase())} died before ${p.them}`]));
  if(s.age < 40){
    const par = npcs.filter(n => n.alive && (n.rel === 'mother' || n.rel === 'father'));
    if(par.length) notes.push(eSentence([`${p.their.replace(/^\w/, c => c.toUpperCase())} ${par.length > 1 ? 'parents' : par[0].rel} buried ${p.them}`]));
  }

  if(s.marriedYears >= 40) notes.push(eSentence([`The marriage lasted ${eNum(s.marriedYears)} years`]));
  else if(s.counters && s.counters.divorces > 0)
    notes.push(eSentence([`${p.cap} divorced ${eNum(s.counters.divorces)} time${s.counters.divorces > 1 ? 's' : ''}`]));
  /* trust the people, not the counter: anything that adds a child without
     bumping childrenCount would otherwise print a flat lie */
  const kidCount = Math.max(s.childrenCount || 0, npcs.filter(n => n.rel === 'child').length);
  if(kidCount === 0 && s.age >= 45)
    notes.push(eSentence([`${p.cap} had no children`]));
  else if(kidCount >= 3)
    notes.push(eSentence([`${p.cap} raised ${eNum(kidCount)}`]));

  out.notes = notes.slice(0, 3);
  return out;
}

/* ---- what was left ---- */
/* When the estate has actually been settled we say what happened, not what
   probably happened. Falls back to the guess when there is no settlement. */
function eulogyEstateFrom(s, worth, st){
  const p = ePron(s);
  const out = [];
  if(s.age < 16) return out;
  const nm = a => String(a.name || '').split(' ')[0];

  if(worth <= -1000){
    out.push(eSentence([p.cap, `died owing ${money(-worth)}`]));
    if((st.allocations || []).length || (s.npcs || []).some(n => n.alive && n.rel === 'child'))
      out.push(eSentence(['A debt is the one thing that does not pass on']));
    return out;
  }
  if(worth < 1000){
    out.push(eSentence([p.cap, 'left nothing to speak of']));
    return out;
  }

  const props = (s.properties || []).length, biz = (s.businesses || []).length;
  const things = [];
  if(props) things.push(`${eNum(props)} propert${props > 1 ? 'ies' : 'y'}`);
  if(biz)   things.push(`${eNum(biz)} business${biz > 1 ? 'es' : ''}`);
  out.push(eSentence([`The estate came to ${money(worth)}`
    + (things.length ? `, including ${eList(things)}` : '')]));

  const got = (st.allocations || []).filter(a => a.cash > 0 || a.assets.length || a.heirloom);

  if(st.intestate){
    if(!got.length) out.push(eSentence(['There was no will, and no one to claim it']));
    else out.push(eSentence([`There was no will. It was sold off and split between ${eList(got.map(nm))}`]));
  } else {
    /* the specific things first: those are the sentences worth reading */
    const inKind = [];
    (st.allocations || []).forEach(a => {
      a.assets.forEach(x => inKind.push({ thing: x.name.toLowerCase(), who: nm(a) }));
    });
    if(inKind.length){
      /* the verb goes in once, on the first item: "the house went to Margot
         and the cafe to Tom" */
      const parts = inKind.slice(0, 3).map((x, i) =>
        i === 0 ? `${x.thing} went to ${x.who}` : `${x.thing} to ${x.who}`);
      out.push(eSentence([eList(parts).replace(/^\w/, c => c.toUpperCase())]));
    }
    const cashers = got.filter(a => a.cash > 0);
    if(cashers.length > 1)
      out.push(eSentence([`${inKind.length ? 'The rest was' : 'It was'} split between ${eList(cashers.map(nm))}`]));
    else if(cashers.length === 1)
      out.push(eSentence([`${inKind.length ? 'The rest went' : 'It went'} to ${nm(cashers[0])}`]));
    else if(!inKind.length)
      out.push(eSentence(['There was no one to leave it to']));
  }

  if((st.contested || []).length)
    out.push(eSentence([`${eList(st.contested.map(nm))} went to court over it`
      + (st.legal > 0 ? `, and the lawyers took ${money(st.legal)}` : '')]));

  if(s.heirloom){
    const g = (s.heirloom.gens || []).length;
    if(st.heirloomLost)
      out.push(eSentence([`${s.heirloom.name.replace(/^\w/, c => c.toUpperCase())} that had been kept for ${eNum(g)} generations was sold with the rest`]));
    else {
      const to = (st.allocations || []).find(a => a.heirloom);
      if(to) out.push(eSentence([`${s.heirloom.name.replace(/^\w/, c => c.toUpperCase())} went to ${nm(to)}, who is the ${eOrd(g + 1)} to have it`]));
    }
  }

  if(s.peakNet > worth * 3 && s.peakNet > 100000)
    out.push(eSentence([`${p.cap} had been worth ${money(s.peakNet)} once`]));
  return out;
}
function eOrd(n){
  const w = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  return w[n] || (n + 'th');
}

function eulogyEstate(s, worth){
  worth = Number(worth);
  if(!isFinite(worth)) worth = 0;   /* never print "$NaN" on this screen */
  const p = ePron(s);
  const props = (s.properties || []).length, biz = (s.businesses || []).length;
  const heirs = (s.npcs || []).filter(n => n.alive && n.rel === 'child');
  const wid   = (s.npcs || []).filter(n => n.alive && (n.rel === 'spouse' || n.rel === 'partner'))[0];
  const sibs  = (s.npcs || []).filter(n => n.alive && n.rel === 'sibling');
  const par   = (s.npcs || []).filter(n => n.alive && (n.rel === 'mother' || n.rel === 'father'));
  const out = [];
  if(s.age < 16) return out;

  if(worth <= -1000){
    out.push(eSentence([p.cap, `died owing ${money(-worth)}`]));
    if(heirs.length || wid) out.push(eSentence(['A debt is the one thing that does not pass on']));
    return out;
  }
  if(worth < 1000){
    out.push(eSentence([p.cap, 'left nothing to speak of']));
    return out;
  }
  const things = [];
  if(props) things.push(`${eNum(props)} propert${props > 1 ? 'ies' : 'y'}`);
  if(biz)   things.push(`${eNum(biz)} business${biz > 1 ? 'es' : ''}`);
  out.push(eSentence([`The estate came to ${money(worth)}`
    + (things.length ? `, including ${eList(things)}` : '')]));
  if(heirs.length)
    out.push(eSentence([`It passes to ${eList(heirs.slice(0, 4).map(n => eName(s, n)))}`
      + (wid ? ` and to ${eName(s, wid)}` : '')]));
  else if(wid)
    out.push(eSentence([`It passes to ${eName(s, wid)}`]));
  else if(sibs.length)
    out.push(eSentence([`With no children, it passes to ${eList(sibs.slice(0, 3).map(n => eName(s, n)))}`]));
  else if(par.length)
    out.push(eSentence([`It went back to ${eList(par.map(n => eulogyLabel(s, n)))}`]));
  else
    out.push(eSentence(['There was no one to leave it to']));
  if(s.peakNet > worth * 3 && s.peakNet > 100000)
    out.push(eSentence([`${p.cap} had been worth ${money(s.peakNet)} once`]));
  return out;
}

/* ---- the closing line ----
   Picked from everything that is true of this life rather than the first
   match, and keyed off the seed so that re-rendering the screen does not
   change what was said about someone. */
function eulogyClose(s){
  const p = ePron(s), h = s.stats || {};
  const drink = (s.habits && s.habits.drinking) || 0, drugs = (s.habits && s.habits.drugs) || 0;
  if(s.age < 16) return 'They did not get the chance to become anything, which is the whole of it.';
  const kin = (s.npcs || []).filter(n => n.alive && ['spouse','partner','child','sibling'].includes(n.rel));
  const loved = (s.npcs || []).filter(n => n.alive && n.r >= 70).length;
  const cands = [];
  const add = (test, line) => { if(test) cands.push(line); };

  /* Happiness has decayed in everyone by the time they die, so a low number
     on its own says nothing. It has to be bleak on more than one axis. */
  add(h.happiness <= 25 && !loved && (h.reputation || 50) < 45,
      `${p.cap} was not happy, and there was no one left who would have noticed.`);
  add(drugs > 55 || drink > 70, `${p.cap} fought something for most of ${p.their} life, and it was still there at the end.`);
  add(s.childrenCount >= 3, `What ${p.they} leaves behind is mostly people.`);
  add(s.age >= 92, `${p.cap} outlived almost everyone ${p.they} started with.`);
  add(s.age < 45, `It was not a long life, and it was not finished.`);
  add((s.countriesLived || []).length > 2, `${p.cap} never quite settled anywhere, and did not seem to mind.`);
  add(s.peakNet >= 1000000 && (s.birthTier || 0) <= 1, `${p.cap} started with nothing and did not end with nothing, which is rarer than it sounds.`);
  add(s.yearsJailed >= 5, `The record will say what ${p.they} did. It will not say much about why.`);
  add(s.crimesCommitted >= 10 && s.yearsJailed === 0, `${p.cap} got away with a great deal, and took most of it with ${p.them}.`);
  add(loved >= 3, `${p.cap} was loved by ${eNum(loved)} people, which is ${eNum(loved)} more than many manage.`);
  add((h.reputation || 0) >= 80, `${p.cap} was widely liked, which is harder than it sounds and counts for more than it is given credit for.`);
  add(h.happiness >= 72 && loved, `${p.cap} was, on the whole, happy. Not everyone manages it.`);
  add(s.marriedYears >= 40, `${p.cap} was not alone for most of it, which is what most people are actually asking for.`);
  add((s.echoes || []).some(e => e.id === 'scarred'), `Something happened to ${p.them} once, and ${p.they} carried it the rest of the way.`);
  add((s.echoes || []).some(e => e.id === 'driven'), `${p.cap} was always working towards something. ${p.cap} never said what.`);
  add(s.donated >= 100000, `${p.cap} gave away more than most people ever have.`);
  add(s.edu >= 4 && (h.smarts || 0) >= 80, `${p.cap} spent a life learning things, and took nearly all of it with ${p.them}.`);
  add(!kin.length && s.age >= 60, `${p.cap} outlasted everyone who would have come.`);
  add((s.jobsHeld || 0) >= 8, `${p.cap} was never quite finished deciding what to be.`);
  add((s.jobsHeld || 0) === 0 && s.age >= 40, `${p.cap} never worked a day of it, for reasons the record does not give.`);

  /* always available, so there is never nothing to say */
  cands.push(`It was an ordinary life, which is to say it was like almost every other one, and entirely unlike any of them.`);
  cands.push(`There is no summing it up. There was just all of it, one year after another.`);
  cands.push(`${p.cap} was here, for ${eNum(s.age)} years, and then ${p.they} was not.`);

  return cands[(s.seed >>> 0) % cands.length];
}

/* ---- the whole document ---- */
function eulogy(s, worth, st){
  const people = eulogyPeople(s);
  return {
    name: s.name,
    strap: `Died at ${s.age}${s.cause ? ` of ${s.cause}` : ''}`,
    life: eulogyOpening(s).concat(eulogyWork(s)).filter(Boolean),
    people: [people.survived].concat(people.predeceased ? [people.predeceased] : [])
              .concat(people.notes).filter(Boolean),
    estate: (st ? eulogyEstateFrom(s, Number(worth) || 0, st)
                : eulogyEstate(s, worth)).filter(Boolean),
    close: eulogyClose(s)
  };
}
