/* BEQUEST — Easter eggs.
   Three tiers:
     wink    ~1 in 8 lives   small acknowledgements
     rare    ~1 in 60 lives  memorable, screenshot-worthy
     myth    ~1 in 500 lives almost nobody sees these
   Every egg found is recorded permanently in META.eggs.                     */

/* tuned so a first life sees roughly one, not three */
const EGG_TIERS = { wink:0.030, rare:0.0055, myth:0.0008 };

const EGGS = [
  /* ---------- WINKS ---------- */
  { id:'leapday',  tier:'wink', n:'Leap Day',
    d:'Born on 29 February.' },
  { id:'midnight', tier:'wink', n:'The Stroke of Midnight',
    d:'Born in the first minute of a new year.' },
  { id:'sharedbday', tier:'wink', n:'Same Day',
    d:'A child born on your own birthday.' },
  { id:'palindrome', tier:'wink', n:'Palindrome',
    d:'Reached an age that reads the same backwards — 11, 22, 33, 44, 55, 66, 77, 88, 99.' },
  { id:'bookmark', tier:'wink', n:'Somebody Else\u2019s Bookmark',
    d:'Found a stranger\u2019s note left inside a secondhand book.' },

  /* ---------- RARE ---------- */
  { id:'sonder',   tier:'rare', n:'Sonder',
    d:'Saw a stranger\u2019s entire life pass in a single moment.' },
  { id:'capsule',  tier:'rare', n:'The Time Capsule',
    d:'Wrote a letter at eighteen and read it back at fifty.' },
  { id:'echo',     tier:'rare', n:'Echo',
    d:'Died at the exact age one of your parents died.' },
  { id:'yination', tier:'rare', n:'Yination',
    d:'Received a letter from an organisation nobody has heard of.' },
  { id:'v8',       tier:'rare', n:'The V8',
    d:'Found the old car in the garage, and it started.' },
  { id:'samename', tier:'rare', n:'Namesake',
    d:'A child given your exact name.' },

  /* ---------- MYTH ---------- */
  { id:'curse',    tier:'myth', n:'The Family Age',
    d:'Three generations in a row died at the same age.' },
  { id:'glitch',   tier:'myth', n:'A Fault in the Year',
    d:'Lived a year that did not seem to happen.' },
  { id:'thirteen', tier:'myth', n:'The Thirteenth',
    d:'Something counted you.' },
  { id:'centurion',tier:'myth', n:'One Hundred and Ten',
    d:'Reached the outer edge of a human life.' }
];

const EGG = id => EGGS.find(e => e.id === id);

/* Hidden epitaphs that only appear on the death screen if the egg was found. */
const EGG_EPITAPHS = {
  echo:'Echo', curse:'The Family Age', centurion:'Outlived the Record',
  sonder:'Saw Someone', yination:'Correspondent', v8:'Kept It Running',
  glitch:'Unaccounted For', thirteen:'Counted'
};

/* Things eggs can permanently unlock. */
const EGG_UNLOCKS = {
  yination: { kind:'trait', id:'marked',   name:'Marked',
              desc:'Unlocked by Yination. Rare events find you more often.' },
  v8:       { kind:'item',  id:'v8car',    name:'The V8',
              desc:'Unlocked by finding the old car. Appears in your shop.' },
  curse:    { kind:'trait', id:'inherited',name:'Inherited',
              desc:'Unlocked by the family age. You begin knowing how it ends.' },
  thirteen: { kind:'start', id:'thirteenth', name:'The Thirteenth Start',
              desc:'Unlocked by being counted. A hidden starting condition.' }
};

/* Sonder: a complete stranger's life, generated and then gone forever. */
function sonderLife(rnd, pickFn, nameFn, surFn, cityFn, reg) {
  const g = pickFn(['m','f']);
  const name = nameFn(reg, g) + ' ' + surFn(reg);
  const born = 1890 + Math.floor(rnd() * 110);
  const died = born + 18 + Math.floor(rnd() * 72);
  const jobs = ['a bus conductor','a seamstress','a dock worker','a schoolteacher','a clerk',
    'a nurse','a fisherman','a printer','a shopkeeper','a bricklayer','a switchboard operator',
    'a tailor','a baker','a night watchman','a translator'];
  const ends = ['quietly, in a chair by a window','in a hospital corridor at four in the morning',
    'on a road they had driven a thousand times','surrounded by people','with nobody there',
    'a long way from where they started'];
  const things = ['loved one person their whole life','never forgave their brother',
    'grew tomatoes nobody wanted','wrote letters that were never sent',
    'was funny, and nobody remembers the jokes','kept a secret that died with them',
    'was kind for no particular reason'];
  return `${name}. Born ${born}, died ${died}. They were ${pickFn(jobs)}. They ${pickFn(things)}. ` +
         `They died ${pickFn(ends)}. You will never think about them again.`;
}
