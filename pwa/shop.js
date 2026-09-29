/* BEQUEST — the Legacy Point store and per-life goals.
 *
 * Four layers of progression, deliberately distinct:
 *   Achievements  permanent, one-off, across every life you ever play
 *   Challenges    permanent, larger, cross-life targets
 *   Goals         PER LIFE: three drawn at birth, replaced every new life
 *   Records       lifetime bests, never reset
 *
 * Goals are the only per-life layer, so every new character has something
 * immediate to chase without diluting the permanent collections.          */

/* ---------------- LEGACY POINT PERKS ---------------- */
const PERKS = [
  /* --- spent once, apply to the life you are playing --- */
  { id:'windfall',   n:'A stroke of luck',    cost:120,  kind:'life',
    d:'An unexpected $25,000 arrives right now.' },
  { id:'secondwind', n:'Second wind',         cost:150,  kind:'life',
    d:'Restore your health to 85 and clear one condition.' },
  { id:'headstart',  n:'Head start',          cost:180,  kind:'life',
    d:'Pick a skill and begin at 50.' },
  { id:'cleanslate', n:'Clean slate',         cost:260,  kind:'life',
    d:'Every conviction on your record becomes spent.' },
  { id:'goodyear',   n:'A charmed year',      cost:100,  kind:'life',
    d:'Luck is strongly in your favour for the next five years.' },
  { id:'reputation', n:'A word in the right ear', cost:140, kind:'life',
    d:'Reputation up to at least 75.' },
  { id:'debtwipe',   n:'Settle up',           cost:220,  kind:'life',
    d:'Clear all arrears and card balances.' },

  /* --- bought once, apply to every life from now on --- */
  { id:'extraaction',n:'One more hour a day', cost:900,  kind:'forever',
    d:'Every character gets one extra action every year, for ever.' },
  { id:'bornlucky',  n:'Born lucky',          cost:750,  kind:'forever',
    d:'All future characters start with better family money.' },
  { id:'quicklearn', n:'Quick study',         cost:820,  kind:'forever',
    d:'Skills rise 25% faster in every future life.' },
  { id:'goodstock',  n:'Good stock',          cost:680,  kind:'forever',
    d:'Future characters are born healthier and live a little longer.' },
  { id:'inheritance',n:'Something to leave',  cost:1100, kind:'forever',
    d:'Heirs inherit an extra 20% of what you leave behind.' },
  { id:'wellmet',    n:'Easy to like',        cost:600,  kind:'forever',
    d:'Relationships decay more slowly in every future life.' },
  { id:'openbook',   n:'Open book',           cost:1400, kind:'forever',
    d:'Reveals what every hidden achievement requires.' }
];
const PERK = id => PERKS.find(p => p.id === id);

/* ---------------- PER-LIFE GOALS ----------------
   Three are drawn at birth. They are meant to be achievable in one life
   and to pull you in a direction you might not have chosen.              */
const GOAL_POOL = [
  { id:'g_earn',     n:'Earn $250,000 in a single year', lp:60,  test:s=>s.peakIncome>=250000 },
  { id:'g_save',     n:'Hold $100,000 in savings',       lp:45,  test:s=>s.savings>=100000 },
  { id:'g_home',     n:'Own your own home',              lp:35,  test:s=>(s.properties||[]).some(p=>p.home) },
  { id:'g_landlord', n:'Let out a property',             lp:50,  test:s=>(s.properties||[]).some(p=>p.rented) },
  { id:'g_biz',      n:'Run a business with 5 staff',    lp:55,  test:s=>(s.businesses||[]).some(b=>b.staff>=5) },
  { id:'g_degree',   n:'Graduate with a degree',         lp:40,  test:s=>s.edu>=3 },
  { id:'g_master',   n:'Take any skill to 80',           lp:50,  test:s=>Object.values(s.skills).some(v=>v>=80) },
  { id:'g_three',    n:'Take three skills past 40',      lp:45,  test:s=>Object.values(s.skills).filter(v=>v>=40).length>=3 },
  { id:'g_married',  n:'Get married',                    lp:35,  test:s=>s.npcs.some(n=>n.rel==='spouse') },
  { id:'g_parent',   n:'Become a parent',                lp:35,  test:s=>s.childrenCount>=1 },
  { id:'g_friends',  n:'Keep four friends at once',      lp:40,  test:s=>s.npcs.filter(n=>n.alive&&n.rel==='friend').length>=4 },
  { id:'g_fit',      n:'Reach 80 Fitness',               lp:40,  test:s=>s.skills.fitness>=80 },
  { id:'g_healthy',  n:'Reach 60 with health above 70',  lp:55,  test:s=>s.age>=60&&s.stats.health>=70 },
  { id:'g_clean',    n:'Reach 40 with no convictions',   lp:35,  test:s=>s.age>=40&&!s.record.length },
  { id:'g_crime',    n:'Get away with five crimes',      lp:55,  test:s=>s.crimesCommitted>=5&&s.yearsJailed===0 },
  { id:'g_fame',     n:'Reach 100,000 followers',        lp:50,  test:s=>s.followers>=100000 },
  { id:'g_travel',   n:'Live in another country',        lp:45,  test:s=>(s.countriesLived||[]).length>=2 },
  { id:'g_track',    n:'Reach the third rank of a special path', lp:70,
    test:s=>s.track&&s.track.rank>=2 },
  { id:'g_car',      n:'Own a vehicle worth $50,000',    lp:40,  test:s=>(s.vehicles||[]).some(v=>v.value>=50000) },
  { id:'g_promo',    n:'Be promoted three times',        lp:45,  test:s=>s.counters&&s.counters.promotions>=3 },
  { id:'g_credit',   n:'Reach a credit score of 780',    lp:45,  test:s=>(s.credit||600)>=780 },
  { id:'g_pet',      n:'Keep a pet for ten years',       lp:35,  test:s=>(s.pets||[]).some(p=>p.alive&&p.age>=10) },
  { id:'g_give',     n:'Give $50,000 to charity',        lp:50,  test:s=>s.donated>=50000 },
  { id:'g_debtfree', n:'Reach 50 with no debt at all',   lp:40,
    test:s=>s.age>=50&&s.debt===0&&!(s.cards||[]).some(c=>c.bal>0)&&!s.arrears }
];
