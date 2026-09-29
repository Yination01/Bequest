/* BEQUEST — Achievements, Challenges, Records.
   Achievements = permanent, one-off, earned across all lives.
   Challenges   = repeatable goal sets with progress, refresh per "season".
   Records      = lifetime bests across every life you have played.            */

const ACH_CATS = ['Career','Wealth','Education','Love','Family','Body','Vice','Crime','Fame','Legacy','Odd','Trial'];

/* t = tier: 1 bronze, 2 silver, 3 gold, 4 platinum.  p = Legacy Points.
   f(S, C) -> bool.  C is the per-life counters object (S.counters).
   hidden: not shown until unlocked.                                          */
const ACHIEVEMENTS = [
  /* ---- Career ---- */
  {id:'first_job',   c:'Career', t:1, p:10,  n:'Clocking In',        d:'Hold your first job.',                       f:s=>s.jobsHeld>=1},
  {id:'promoted',    c:'Career', t:1, p:15,  n:'Moving Up',          d:'Earn a promotion.',                          f:(s,C)=>C.promotions>=1},
  {id:'promo5',      c:'Career', t:2, p:40,  n:'Career Climber',     d:'Earn 5 promotions in one life.',             f:(s,C)=>C.promotions>=5},
  {id:'sixfigure',   c:'Career', t:2, p:45,  n:'Six Figures',        d:'Earn $100,000 in a single year.',            f:s=>s.peakIncome>=100000},
  {id:'quartermil',  c:'Career', t:3, p:90,  n:'Top of the Tree',    d:'Earn $250,000 in a single year.',            f:s=>s.peakIncome>=250000},
  {id:'ceo',         c:'Career', t:4, p:150, n:'Chief Executive',    d:'Become CEO.',                                f:s=>s.job&&s.job.id==='ceo'},
  {id:'doctor_job',  c:'Career', t:3, p:80,  n:'First, Do No Harm',  d:'Work as a doctor.',                          f:s=>s.job&&s.job.id==='doctor'},
  {id:'jobhop',      c:'Career', t:2, p:35,  n:'Job Hopper',         d:'Hold 8 different jobs in one life.',         f:s=>s.jobsHeld>=8},
  {id:'fired3',      c:'Career', t:1, p:20,  n:'Not a Team Player',  d:'Get fired 3 times in one life.',             f:s=>s.firedCount>=3},
  {id:'founder',     c:'Career', t:2, p:50,  n:'Founder',            d:'Start your own business.',                   f:(s,C)=>C.businesses>=1},
  {id:'retire_well', c:'Career', t:2, p:45,  n:'Gold Watch',         d:'Retire with over $250,000 net worth.',       f:s=>s.flags.retired&&netWorth()>=250000},

  /* ---- Wealth ---- */
  {id:'first10k',    c:'Wealth', t:1, p:10,  n:'Five Figures',       d:'Reach $10,000 net worth.',                   f:s=>s.peakNet>=10000},
  {id:'hundredk',    c:'Wealth', t:2, p:35,  n:'Comfortable',        d:'Reach $100,000 net worth.',                  f:s=>s.peakNet>=100000},
  {id:'millionaire', c:'Wealth', t:3, p:100, n:'Millionaire',        d:'Reach $1,000,000 net worth.',                f:s=>s.peakNet>=1000000},
  {id:'decamil', hard:true,     c:'Wealth', t:4, p:250, n:'Eight Figures',     d:'Reach $10,000,000 net worth.',               f:s=>s.peakNet>=10000000},
  {id:'selfmade',    c:'Wealth', t:4, p:180, n:'Self-Made',          d:'Reach $1,000,000 having been born poor.',    f:s=>s.peakNet>=1000000&&s.birthTier<=1},
  {id:'landlord',    c:'Wealth', t:2, p:40,  n:'Landlord',           d:'Rent out a property.',                       f:s=>s.property&&s.property.rented},
  {id:'cryptowin',   c:'Wealth', t:2, p:45,  n:'Held Your Nerve',      d:'Make $100,000 profit on crypto.',            f:(s,C)=>C.cryptoProfit>=100000},
  {id:'cryptoloss',  c:'Wealth', t:1, p:20,  n:'Bag Holder',         d:'Lose $50,000 on crypto.',                    f:(s,C)=>C.cryptoProfit<=-50000},
  {id:'debtfree',    c:'Wealth', t:2, p:30,  n:'Debt Free',          d:'Clear $50,000+ of debt.',                    f:(s,C)=>C.debtCleared>=50000},
  {id:'broke',       c:'Wealth', t:1, p:15,  n:'Rock Bottom',        d:'Hit $100,000 of debt.',                      f:(s,C)=>C.maxDebt>=100000},

  /* ---- Education ---- */
  {id:'graduate',    c:'Education', t:1, p:15, n:'Graduate',         d:'Finish high school.',                        f:s=>s.edu>=1},
  {id:'degree',      c:'Education', t:2, p:40, n:'Degree in Hand',   d:'Earn a bachelor\u2019s degree.',             f:s=>s.edu>=3},
  {id:'postgrad',    c:'Education', t:3, p:75, n:'Doctorate',        d:'Earn a postgraduate degree.',                f:s=>s.edu>=4},
  {id:'genius',      c:'Education', t:3, p:70, n:'Genius',           d:'Reach 100 Smarts.',                          f:s=>s.stats.smarts>=100},
  {id:'polymath', hard:true,    c:'Education', t:4, p:160,n:'Polymath',         d:'Get three skills to 75 or above.',           f:s=>Object.values(s.skills).filter(v=>v>=75).length>=3},
  {id:'maxskill',    c:'Education', t:3, p:90, n:'Mastery',          d:'Max out any skill at 100.',                  f:s=>Object.values(s.skills).some(v=>v>=100)},
  {id:'dropout',     c:'Education', t:1, p:15, n:'Dropout',          d:'Leave school with no qualifications.',       f:s=>s.age>=19&&s.edu===0},

  /* ---- Love ---- */
  {id:'firstlove',   c:'Love', t:1, p:10,  n:'First Love',           d:'Get your first partner.',                    f:s=>s.flags.had_partner||!!partner()},
  {id:'married',     c:'Love', t:2, p:35,  n:'I Do',                 d:'Get married.',                               f:s=>s.npcs.some(n=>n.rel==='spouse')},
  {id:'married_young',c:'Love',t:2, p:40,  n:'Young and Certain',    d:'Marry at 21 or younger.',                    f:s=>s.flags.married_young},
  {id:'goldenann', hard:true,   c:'Love', t:4, p:180, n:'Golden Anniversary',   d:'Stay married for 50 years.',                 f:s=>s.marriedYears>=50},
  {id:'divorced',    c:'Love', t:1, p:15,  n:'Irreconcilable',       d:'Get divorced.',                              f:(s,C)=>C.divorces>=1},
  {id:'divorced3',   c:'Love', t:2, p:45,  n:'Serial Divorcee',      d:'Get divorced 3 times.',                      f:(s,C)=>C.divorces>=3},
  {id:'cheater',     c:'Love', t:1, p:20,  n:'Unfaithful',           d:'Cheat on a partner.',                        f:s=>!!s.flags.cheated, hidden:true},
  {id:'perfectmatch',c:'Love', t:3, p:80,  n:'Perfect Match',        d:'Reach 100 relationship with a spouse.',      f:s=>s.npcs.some(n=>n.rel==='spouse'&&n.alive&&n.r>=100)},

  /* ---- Family ---- */
  {id:'parent',      c:'Family', t:1, p:20, n:'Parent',              d:'Have a child.',                              f:s=>s.childrenCount>=1},
  {id:'bigfamily',   c:'Family', t:3, p:80, n:'Full House',          d:'Have 4 children.',                           f:s=>s.childrenCount>=4},
  {id:'goodparent',  c:'Family', t:3, p:75, n:'Good Parent',         d:'Keep every child above 80 relationship.',    f:s=>{const k=s.npcs.filter(n=>n.rel==='child'&&n.alive);return k.length>=2&&k.every(n=>n.r>=80);}},
  {id:'dynasty', hard:true,     c:'Family', t:4, p:200,n:'Dynasty',             d:'Play a 3rd generation heir.',                f:s=>s.gen>=3},
  {id:'carer',       c:'Family', t:2, p:50, n:'Duty of Care',        d:'Take an ailing parent into your home.',      f:s=>!!s.flags.took_in_parent},
  {id:'popular',     c:'Family', t:2, p:40, n:'Well Connected',      d:'Have 8 living relationships at once.',       f:s=>s.npcs.filter(n=>n.alive).length>=8},

  /* ---- Body ---- */
  {id:'ripped',      c:'Body', t:2, p:45, n:'Peak Condition',        d:'Reach 90 Fitness.',                          f:s=>s.skills.fitness>=90},
  {id:'stunner',     c:'Body', t:2, p:40, n:'Head Turner',           d:'Reach 95 Looks.',                            f:s=>s.stats.looks>=95},
  {id:'centenarian', atDeath:true, hard:true, c:'Body', t:4, p:220,n:'Centenarian',           d:'Live to 100.',                               f:s=>s.age>=100},
  {id:'old90',       c:'Body', t:3, p:100,n:'Nine Decades',          d:'Live to 90.',                                f:s=>s.age>=90},
  {id:'ironhealth',  c:'Body', t:3, p:85, n:'Built to Last',         d:'Be 75+ with Health above 70.',               f:s=>s.age>=75&&s.stats.health>=70},
  {id:'survivor_ill',c:'Body', t:2, p:55, n:'Beat It',               d:'Recover from a serious illness.',            f:(s,C)=>C.illnessesBeaten>=1},

  /* ---- Vice ---- */
  {id:'smoker',      c:'Vice', t:1, p:10, n:'Pack a Day',            d:'Reach 60 smoking addiction.',                f:s=>s.habits.smoking>=60},
  {id:'quitsmoke',   c:'Vice', t:3, p:95, n:'Kicked It',             d:'Quit smoking after a heavy habit.',          f:s=>!!s.flags.quit_smoking_long},
  {id:'teetotal', atDeath:true,    c:'Vice', t:3, p:80, n:'Clean Living',          d:'Die with every bad habit under 15.',         f:s=>['smoking','drinking','junkfood','gambling'].every(k=>s.habits[k]<15)},
  {id:'gymrat',      c:'Vice', t:2, p:40, n:'Gym Rat',               d:'Reach 80 gym habit.',                        f:s=>s.habits.gym>=80},
  {id:'degenerate',  c:'Vice', t:1, p:20, n:'Degenerate',            d:'Reach 70 gambling habit.',                   f:s=>s.habits.gambling>=70, hidden:true},
  {id:'relapse',     c:'Vice', t:1, p:15, n:'Just One More',         d:'Relapse 3 times trying to quit.',            f:(s,C)=>C.relapses>=3},

  /* ---- Crime ---- */
  {id:'firstcrime',  c:'Crime', t:1, p:10, n:'First Offence',        d:'Commit a crime.',                            f:s=>s.crimesCommitted>=1},
  {id:'careercrim',  c:'Crime', t:3, p:90, n:'Career Criminal',      d:'Commit 15 crimes.',                          f:s=>s.crimesCommitted>=15},
  {id:'cleanrecord', c:'Crime', t:2, p:50, n:'Never Caught',         d:'Commit 8 crimes without being jailed.',      f:s=>s.crimesCommitted>=8&&s.yearsJailed===0},
  {id:'heist', hard:true,       c:'Crime', t:4, p:170,n:'The Big One',          d:'Pull off a bank heist successfully.',        f:(s,C)=>C.heistWins>=1},
  {id:'lifer',       c:'Crime', t:2, p:45, n:'Hard Time',            d:'Serve 10 years in prison.',                  f:s=>s.yearsJailed>=10},
  {id:'reformed',    c:'Crime', t:3, p:85, n:'Reformed',             d:'Leave prison and reach 70 Reputation.',      f:s=>s.yearsJailed>=1&&s.stats.reputation>=70},

  /* ---- Fame ---- */
  {id:'viral',       c:'Fame', t:1, p:20, n:'Gone Viral',            d:'Gain 50,000 followers.',                     f:s=>s.followers>=50000},
  {id:'influencer',  c:'Fame', t:2, p:55, n:'Influencer',            d:'Reach 250,000 followers.',                   f:s=>s.followers>=250000},
  {id:'megastar', hard:true,    c:'Fame', t:4, p:190,n:'Megastar',              d:'Reach 1,000,000 followers.',                 f:s=>s.followers>=1000000},
  {id:'respected',   c:'Fame', t:2, p:45, n:'Pillar of Society',     d:'Reach 95 Reputation.',                       f:s=>s.stats.reputation>=95},
  {id:'infamous',    c:'Fame', t:2, p:40, n:'Infamous',              d:'Drop to 5 Reputation.',                      f:s=>s.stats.reputation<=5},

  /* ---- Legacy ---- */
  {id:'philanthropist',c:'Legacy', t:3, p:90, n:'Philanthropist',    d:'Donate $100,000 in one life.',               f:s=>s.donated>=100000},
  {id:'inheritance', atDeath:true, c:'Legacy', t:2, p:50, n:'Passing It On',       d:'Die leaving $500,000 to an heir.',           f:s=>!s.alive&&netWorth()>=500000&&s.childrenCount>=1},
  {id:'fullhouse', atDeath:true, hard:true,   c:'Legacy', t:4, p:200,n:'It Was a Good Life',  d:'Die at 80+, married, 2+ children, $1M+.',    f:s=>!s.alive&&s.age>=80&&s.marriedYears>=10&&s.childrenCount>=2&&netWorth()>=1000000},

  /* ---- Odd ---- */
  {id:'unremarkable', atDeath:true,c:'Odd', t:1, p:15, n:'A Quiet Life',           d:'Die having done almost nothing of note.',    f:s=>!s.alive&&s.peakNet<40000&&s.followers<1000&&s.crimesCommitted===0&&s.jobsHeld<=1},
  {id:'youngdeath', atDeath:true, c:'Odd', t:1, p:20, n:'Cut Short',               d:'Die before 30.',                             f:s=>!s.alive&&s.age<30},
  {id:'globetrotter',c:'Odd', t:2, p:45,n:'Fresh Start',             d:'Play lives in 5 different countries.',       f:()=>Object.keys(META.countriesPlayed||{}).length>=5, meta:true},
  {id:'collector',  c:'Odd', t:2, p:40, n:'Collector',               d:'Own 15 items at once.',                      f:s=>s.items.length>=15},
  {id:'traitpair',  c:'Odd', t:2, p:35, n:'Unlucky Draw',            d:'Be born Frail and Anxious.',                 f:s=>s.traits.includes('frail')&&s.traits.includes('anxious')},
  {id:'hundredlives',c:'Odd',t:4, p:250,n:'Again and Again',         d:'Play 100 lives.',                            f:()=>META.lives>=100, meta:true},

  /* ---- Hard+ only ---- */
  {id:'brutal_old',  c:'Trial', t:4, p:260, hard:true, n:'Against the Odds',   d:'Reach 80 on Brutal.',                     f:s=>s.age>=80&&s.diff==='brutal'},
  {id:'brutal_rich', c:'Trial', t:4, p:300, hard:true, n:'Blood From a Stone', d:'Reach $1,000,000 on Brutal.',             f:s=>s.peakNet>=1000000&&s.diff==='brutal'},
  {id:'hard_clean', atDeath:true,  c:'Trial', t:3, p:160, hard:true, n:'Hard and Clean',     d:'Die on Hard+ with no crimes and no bad habits above 20.',
     f:s=>!s.alive&&s.crimesCommitted===0&&['smoking','drinking','junkfood','gambling','drugs'].every(k=>s.habits[k]<20)},
  {id:'hard_family', atDeath:true, c:'Trial', t:3, p:180, hard:true, n:'Held It Together',   d:'On Hard+, die married with 2+ children and 60+ Happiness.',
     f:s=>!s.alive&&s.marriedYears>=5&&s.childrenCount>=2&&s.stats.happiness>=60},
  {id:'noassist', atDeath:true,    c:'Trial', t:4, p:220, hard:true, n:'No Safety Net',      d:'Complete a full life on Hard+ without ever lowering the difficulty.',
     f:s=>!s.alive&&s.age>=70&&!s.assisted}
];

/* ---- Challenges: repeatable, progress-tracked, Legacy Point rewards ---- */
const CHALLENGES = [
  {id:'ch_mil', atDeath:true,   n:'Die a millionaire',      d:'End a life with $1,000,000+ net worth.', p:120, goal:1000000, prog:s=>Math.max(0,netWorth())},
  {id:'ch_90',    n:'Reach 90 years old',     d:'Survive to 90.',                          p:100, goal:90,      prog:s=>s.age},
  {id:'ch_ceo',   n:'Reach the top',          d:'Become a CEO.',                           p:150, goal:1,       prog:s=>(s.job&&s.job.id==='ceo')?1:0},
  {id:'ch_clean', atDeath:true, n:'Clean living',           d:'Die with all bad habits under 20.',       p:80,  goal:1,       prog:s=>['smoking','drinking','junkfood','gambling'].every(k=>s.habits[k]<20)?1:0},
  {id:'ch_quit',  n:'Kick the habit',         d:'Quit a heavy smoking habit.',             p:90,  goal:1,       prog:s=>s.flags.quit_smoking_long?1:0},
  {id:'ch_young', n:'Married young',          d:'Marry at 21 or younger.',                 p:50,  goal:1,       prog:s=>s.flags.married_young?1:0},
  {id:'ch_crime', n:'Career criminal',        d:'Commit 10 crimes in one life.',           p:110, goal:10,      prog:s=>s.crimesCommitted},
  {id:'ch_fame',  n:'A million followers',    d:'Reach 1,000,000 followers.',              p:130, goal:1000000, prog:s=>s.followers},
  {id:'ch_phd',   n:'Doctorate',              d:'Earn a postgraduate degree.',             p:70,  goal:4,       prog:s=>s.edu},
  {id:'ch_legacy', atDeath:true,n:'Legacy',                 d:'Die with 3+ children and $500k.',         p:140, goal:1,       prog:s=>(s.childrenCount>=3&&netWorth()>=500000)?1:0},
  {id:'ch_skills',n:'Renaissance soul',       d:'Get 3 skills to 75+.',                    p:120, goal:3,       prog:s=>Object.values(s.skills).filter(v=>v>=75).length},
  {id:'ch_gen',   n:'Keep the name alive',    d:'Reach a 3rd generation heir.',            p:160, goal:3,       prog:s=>s.gen},
  {id:'ch_prop',  n:'Property magnate',       d:'Own property worth $500,000.',            p:100, goal:500000,  prog:s=>s.property?s.property.value:0},
  {id:'ch_friends',n:'People person',         d:'Have 8 living relationships at once.',    p:70,  goal:8,       prog:s=>s.npcs.filter(n=>n.alive).length},
  {id:'ch_nojail',n:'Above the law',          d:'Commit 8 crimes, never be jailed.',       p:130, goal:8,       prog:s=>s.yearsJailed>0?0:s.crimesCommitted}
];

/* ---- Lifetime records tracked across every life ---- */
const RECORDS = [
  {id:'oldest',    n:'Oldest age reached',    fmt:v=>v+' years',      get:s=>s.age},
  {id:'richest',   n:'Highest net worth',     fmt:v=>money(v),        get:s=>s.peakNet},
  {id:'income',    n:'Highest yearly income', fmt:v=>money(v),        get:s=>s.peakIncome},
  {id:'followers', n:'Most followers',        fmt:v=>Math.round(v).toLocaleString(), get:s=>s.followers},
  {id:'children',  n:'Most children',         fmt:v=>v,               get:s=>s.childrenCount},
  {id:'crimes',    n:'Most crimes',           fmt:v=>v,               get:s=>s.crimesCommitted},
  {id:'jailed',    n:'Most years jailed',     fmt:v=>v+' years',      get:s=>s.yearsJailed},
  {id:'jobs',      n:'Most jobs held',        fmt:v=>v,               get:s=>s.jobsHeld},
  {id:'married',   n:'Longest marriage',      fmt:v=>v+' years',      get:s=>s.marriedYears},
  {id:'donated',   n:'Most donated',          fmt:v=>money(v),        get:s=>s.donated}
];

const TIER_NAMES = {1:'Bronze',2:'Silver',3:'Gold',4:'Platinum'};
