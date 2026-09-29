/* BEQUEST — the cost of living.
   Housing class, utilities, food, subscriptions, insurance and credit.
   Everything here is a recurring commitment: it arrives every year whether
   you thought about it or not.                                              */

/* ---------------- HOUSING ----------------
   cost is annual, before the country's cost-of-living multiplier.
   need = the annual income a landlord or lender wants to see.             */
const HOUSING = [
  { id:'parents',   n:'With your parents',   cost:0,     dep:0,     need:0,      happy:-2, health:0,  rep:-3, space:0 },
  { id:'room',      n:'A room in a shared flat', cost:6200, dep:900, need:9000,   happy:0,  health:-1, rep:0,  space:1 },
  { id:'studio',    n:'A studio',            cost:9400,  dep:1800,  need:16000,  happy:3,  health:0,  rep:2,  space:1 },
  { id:'onebed',    n:'A one-bedroom flat',  cost:13800, dep:2800,  need:24000,  happy:6,  health:1,  rep:4,  space:2 },
  { id:'terrace',   n:'A small house',       cost:19500, dep:4200,  need:36000,  happy:9,  health:2,  rep:7,  space:3 },
  { id:'family',    n:'A family home',       cost:28000, dep:6500,  need:55000,  happy:13, health:3,  rep:11, space:4 },
  { id:'large',     n:'A large house',       cost:46000, dep:11000, need:95000,  happy:17, health:4,  rep:18, space:6 },
  { id:'luxury',    n:'Somewhere remarkable',cost:96000, dep:26000, need:220000, happy:23, health:5,  rep:30, space:8 }
];
const HOME = id => HOUSING.find(h => h.id === id) || HOUSING[0];

/* ---------------- FOOD ---------------- */
const FOOD = [
  { id:'skip',     n:'Barely eat',        cost:1100, health:-6, happy:-5 },
  { id:'basic',    n:'Cheap and filling', cost:2600, health:-2, happy:0  },
  { id:'normal',   n:'Ordinary shopping', cost:4400, health:1,  happy:2  },
  { id:'good',     n:'Eat properly',      cost:7200, health:4,  happy:4  },
  { id:'excellent',n:'Eat very well',     cost:12500,health:6,  happy:7  }
];
const FOODTIER = id => FOOD.find(f => f.id === id) || FOOD[1];

/* ---------------- RECURRING COMMITMENTS ----------------
   These replace one-off shop items for anything that is really a standing cost. */
const SUBS = [
  { id:'utilities', n:'Utilities',          cost:2400, cat:'Essential', auto:true,
    d:'Heat, power and water. Scales with the size of your home.' },
  { id:'phone',     n:'Phone plan',         cost:520,  cat:'Essential', d:'+2 Charisma a year' , eff:{charisma:2} },
  { id:'internet',  n:'Internet',           cost:640,  cat:'Essential', d:'+1 Smarts a year', eff:{smarts:1} },
  { id:'transport', n:'Transport pass',     cost:1300, cat:'Essential', d:'Saves time; +2 Happiness', eff:{happiness:2} },
  { id:'gym',       n:'Gym membership',     cost:780,  cat:'Health',    d:'+2 Health, +1 Fitness a year', eff:{health:2}, skill:{fitness:1} },
  { id:'healthins', n:'Health insurance',   cost:3400, cat:'Health',    d:'Halves every medical bill', tag:'insurance' },
  { id:'lifeins',   n:'Life insurance',     cost:1900, cat:'Health',    d:'Pays your heirs when you die', tag:'lifeins' },
  { id:'dental',    n:'Dental plan',        cost:700,  cat:'Health',    d:'+1 Looks a year', eff:{looks:1} },
  { id:'therapy_s', n:'Regular therapy',    cost:4200, cat:'Health',    d:'+5 Happiness a year', eff:{happiness:5} },
  { id:'streaming', n:'Streaming',          cost:260,  cat:'Leisure',   d:'+2 Happiness a year', eff:{happiness:2} },
  { id:'news',      n:'A newspaper',        cost:340,  cat:'Leisure',   d:'+1 Smarts a year', eff:{smarts:1} },
  { id:'club_s',    n:'A members\u2019 club', cost:5200, cat:'Leisure', d:'+4 Reputation, better contacts', eff:{reputation:4} },
  { id:'cleaner_s', n:'A cleaner',          cost:2900, cat:'Comfort',   d:'+3 Happiness, +1 Health', eff:{happiness:3,health:1} },
  { id:'mealkit',   n:'Meal deliveries',    cost:2200, cat:'Comfort',   d:'+2 Health', eff:{health:2} },
  { id:'carins',    n:'Vehicle insurance',  cost:1100, cat:'Essential', d:'Covers repairs and claims', tag:'carins' },
  { id:'homemaint', n:'Home maintenance',   cost:1800, cat:'Essential', d:'Stops your home falling apart', tag:'maint' }
];
const SUB = id => SUBS.find(s => s.id === id);

/* ---------------- CREDIT CARDS ---------------- */
const CARDS = [
  { id:'basic',    n:'Starter card',    minScore:520, limit:1200,  apr:0.34, fee:0,   perk:'None' },
  { id:'standard', n:'Standard card',   minScore:620, limit:4500,  apr:0.24, fee:0,   perk:'None' },
  { id:'rewards',  n:'Rewards card',    minScore:700, limit:12000, apr:0.19, fee:90,  perk:'1% back on everything you spend' },
  { id:'platinum', n:'Platinum card',   minScore:770, limit:40000, apr:0.16, fee:340, perk:'2% back, and doors open' },
  { id:'black',    n:'The black card',  minScore:820, limit:150000,apr:0.13, fee:1200,perk:'3% back, +6 Reputation a year' }
];
const CARD = id => CARDS.find(c => c.id === id);

/* Housing a household actually needs: you, a partner, children, dependents. */
function householdSize(S) {
  let n = 1;
  if (S.npcs.some(x => x.alive && (x.rel === 'partner' || x.rel === 'spouse'))) n++;
  n += S.npcs.filter(x => x.alive && x.rel === 'child' && x.age < 19).length;
  n += (S.dependents || 0);
  return n;
}
