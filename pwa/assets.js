/* BEQUEST — things you own.
   Property, vehicles and businesses: bought, maintained, let, run and sold.
   Everything here decays, costs money to keep, and can be lost.            */

/* ---------------- PROPERTY ----------------
   base is before the country's cost-of-living multiplier.
   yield = annual rent as a fraction of value. maint = annual upkeep.      */
const PROPERTY_TYPES = [
  { id:'bedsit',   n:'A bedsit',            base:52000,   yield:0.072, maint:0.014, space:1, prestige:0 },
  { id:'flat',     n:'A flat',              base:118000,  yield:0.062, maint:0.012, space:2, prestige:2 },
  { id:'terrace',  n:'A terraced house',    base:190000,  yield:0.056, maint:0.015, space:3, prestige:5 },
  { id:'semi',     n:'A semi-detached house',base:265000, yield:0.052, maint:0.016, space:4, prestige:8 },
  { id:'detached', n:'A detached house',    base:420000,  yield:0.046, maint:0.018, space:6, prestige:14 },
  { id:'estate',   n:'A country house',     base:1250000, yield:0.032, maint:0.026, space:9, prestige:30 },
  { id:'shopunit', n:'A retail unit',       base:210000,  yield:0.085, maint:0.020, space:0, prestige:4, commercial:true },
  { id:'офис',     n:'A small office',      base:340000,  yield:0.079, maint:0.019, space:0, prestige:6, commercial:true },
  { id:'block',    n:'A block of flats',    base:980000,  yield:0.091, maint:0.028, space:0, prestige:18, commercial:true },
  { id:'land',     n:'A plot of land',      base:70000,   yield:0.010, maint:0.003, space:0, prestige:1 },
  { id:'farm',     n:'A smallholding',      base:390000,  yield:0.038, maint:0.024, space:5, prestige:9 }
];
const PROP = id => PROPERTY_TYPES.find(p => p.id === id) || PROPERTY_TYPES[0];

/* ---------------- VEHICLES ----------------
   dep = annual depreciation. fail = annual chance of something going wrong. */
const VEHICLES = [
  { id:'bicycle',  n:'A bicycle',        base:420,     run:60,    dep:0.10, fail:0.05, licence:false, happy:2, rep:0,  health:3 },
  { id:'scooter',  n:'A scooter',        base:2100,    run:520,   dep:0.15, fail:0.10, licence:false, happy:3, rep:1,  health:0 },
  { id:'banger',   n:'An old car',       base:2600,    run:1400,  dep:0.20, fail:0.28, licence:true,  happy:3, rep:0,  health:0 },
  { id:'used',     n:'A used hatchback', base:8500,    run:1700,  dep:0.15, fail:0.14, licence:true,  happy:5, rep:2,  health:0 },
  { id:'saloon',   n:'A new saloon',     base:31000,   run:2400,  dep:0.16, fail:0.06, licence:true,  happy:8, rep:5,  health:0 },
  { id:'estate_v', n:'A family estate',  base:38000,   run:2600,  dep:0.15, fail:0.06, licence:true,  happy:9, rep:6,  health:0 },
  { id:'suv',      n:'A large SUV',      base:62000,   run:3800,  dep:0.16, fail:0.07, licence:true,  happy:11,rep:9,  health:0 },
  { id:'sports',   n:'A sports car',     base:135000,  run:6200,  dep:0.13, fail:0.11, licence:true,  happy:16,rep:16, health:0 },
  { id:'super',    n:'A supercar',       base:480000,  run:18000, dep:0.11, fail:0.14, licence:true,  happy:22,rep:28, health:0 },
  { id:'classic',  n:'A classic car',    base:74000,   run:4100,  dep:-0.03,fail:0.22, licence:true,  happy:14,rep:14, health:0 },
  { id:'van',      n:'A work van',       base:19000,   run:2200,  dep:0.17, fail:0.12, licence:true,  happy:2, rep:0,  health:0, work:true },
  { id:'boat_v',   n:'A small boat',     base:96000,   run:9000,  dep:0.12, fail:0.16, licence:false, happy:15,rep:13, health:1 }
];
const VEH = id => VEHICLES.find(v => v.id === id) || VEHICLES[0];

/* ---------------- BUSINESSES ----------------
   rev = annual revenue per staff member at full effectiveness.
   Each business has its own risk profile and its own ceiling.             */
const BUSINESSES = [
  { id:'stall',    n:'A market stall',      cost:4000,    rev:14000,  maxStaff:2,  risk:0.10, skill:'business', n_staff:'trader' },
  { id:'cafe',     n:'A cafe',              cost:38000,   rev:31000,  maxStaff:8,  risk:0.14, skill:'cooking',  n_staff:'barista' },
  { id:'barber',   n:'A barbershop',        cost:24000,   rev:27000,  maxStaff:5,  risk:0.11, skill:'charisma', n_staff:'barber' },
  { id:'shop',     n:'A corner shop',       cost:62000,   rev:29000,  maxStaff:6,  risk:0.12, skill:'business', n_staff:'assistant' },
  { id:'garage',   n:'A garage',            cost:85000,   rev:44000,  maxStaff:7,  risk:0.13, skill:'handiness',n_staff:'mechanic' },
  { id:'gym_b',    n:'A gym',               cost:140000,  rev:38000,  maxStaff:10, risk:0.15, skill:'fitness',  n_staff:'trainer' },
  { id:'restaurant',n:'A restaurant',       cost:220000,  rev:52000,  maxStaff:16, risk:0.22, skill:'cooking',  n_staff:'chef' },
  { id:'agency',   n:'A creative agency',   cost:95000,   rev:68000,  maxStaff:14, risk:0.18, skill:'charisma', n_staff:'designer' },
  { id:'software', n:'A software company',  cost:180000,  rev:120000, maxStaff:30, risk:0.26, skill:'tech',     n_staff:'engineer' },
  { id:'builder',  n:'A building firm',     cost:260000,  rev:88000,  maxStaff:24, risk:0.20, skill:'handiness',n_staff:'builder' },
  { id:'haulage',  n:'A haulage company',   cost:340000,  rev:96000,  maxStaff:28, risk:0.17, skill:'business', n_staff:'driver' },
  { id:'club_b',   n:'A nightclub',         cost:420000,  rev:150000, maxStaff:22, risk:0.30, skill:'charisma', n_staff:'staffer' },
  { id:'farm_b',   n:'A farm',              cost:500000,  rev:82000,  maxStaff:18, risk:0.19, skill:'handiness',n_staff:'hand' }
];
const BIZ = id => BUSINESSES.find(b => b.id === id) || BUSINESSES[0];

/* Upgrades apply to any business. */
const BIZ_UPGRADES = [
  { id:'refit',    n:'Refit the premises', cost:0.35, rev:0.18, d:'Customers notice' },
  { id:'marketing',n:'Marketing push',     cost:0.18, rev:0.14, d:'More people through the door' },
  { id:'systems',  n:'Better systems',     cost:0.22, rev:0.11, d:'Less waste, fewer mistakes' },
  { id:'premium',  n:'Move upmarket',      cost:0.45, rev:0.28, d:'Higher prices, fussier customers' }
];

const CONDITION_WORDS = [
  { min:85, n:'Immaculate' }, { min:65, n:'Good' }, { min:45, n:'Tired' },
  { min:25, n:'Poor' },       { min:0,  n:'Falling apart' }
];
const condWord = v => (CONDITION_WORDS.find(c => v >= c.min) || CONDITION_WORDS[4]).n;
