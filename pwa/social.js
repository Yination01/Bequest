/* BEQUEST — people, leisure and education.
   What you can actually do with the people in your life, how you spend your
   free time, and what you study.                                            */

/* ---------------- WHAT YOU CAN DO WITH SOMEONE ----------------
   rel: which relationships it applies to ('*' = anyone)
   cost: money. min/max: their age. need: a state requirement.
   Each returns a line of text describing what happened.                     */
const PERSON_ACTIONS = [
  /* --- anyone --- */
  { id:'talk',      n:'Talk',              rel:'*', d:'Catch up properly',
    run(n){ const P=personality(n.pers), d=Math.round(ri(3,10)*P.talk);
      n.r=clamp(n.r+d); applyEff({happiness:2});
      return `You talked for a while. Relationship +${d}.`; } },
  { id:'compliment',n:'Say something kind',rel:'*',
    run(n){ const d=ri(4,11); n.r=clamp(n.r+d); applyEff({skill:{charisma:2}});
      return `${n.name.split(' ')[0]} needed to hear that. +${d}.`; } },
  { id:'gift',      n:'Give a present',    rel:'*', cost:300,
    run(n){ const d=ri(8,18); n.r=clamp(n.r+d); S.counters.gifts++;
      return `They were touched. +${d}.`; } },
  { id:'biggift',   n:'Give something extravagant', rel:'*', cost:4000,
    run(n){ const d=ri(18,32); n.r=clamp(n.r+d);
      return `They did not know what to say. +${d}.`; } },
  { id:'advice',    n:'Ask their advice',  rel:'*',
    run(n){ const d=ri(2,7); n.r=clamp(n.r+d); applyEff({smarts:2,discipline:1});
      return `They told you what they thought. +${d}, and you learned something.`; } },
  { id:'argue',     n:'Argue',             rel:'*',
    run(n){ const P=personality(n.pers), d=Math.round(ri(8,20)/P.forgive);
      n.r=clamp(n.r-d); applyEff({happiness:-3});
      return `It got heated. \u2212${d}.${P.forgive<1?' They do not forgive easily.':''}`; } },
  { id:'apologise', n:'Apologise',         rel:'*', need:s=>true,
    run(n){ const P=personality(n.pers), d=Math.round(ri(6,16)*P.forgive);
      n.r=clamp(n.r+d); applyEff({discipline:2});
      return `You said sorry and meant it. +${d}.`; } },
  { id:'cutoff',    n:'Cut them off',      rel:'*',
    run(n){ n.r=0; n.cut=true; applyEff({happiness:-6,discipline:3});
      return `You will not be speaking to ${n.name.split(' ')[0]} again.`; } },

  /* --- family --- */
  { id:'askmoney',  n:'Ask for money',     rel:'mother,father,sibling',
    run(n){ if(R()<n.r/130){ const amt=ri(200,3000); S.money+=amt; n.r=clamp(n.r-4);
        ledger('earn','A gift from '+n.name.split(' ')[0],amt);
        return `They gave you ${money(amt)}.`; }
      return 'They said no, and looked disappointed that you asked.'; } },
  { id:'family_hist',n:'Ask about the family', rel:'mother,father',
    run(n){ n.r=clamp(n.r+6); applyEff({smarts:3,happiness:4});
      return pick(['They told you about your grandparents, and where the name came from.',
        'They told you a story you had never heard, about before you were born.',
        'They showed you photographs of people you will never meet.']); } },
  { id:'carefor',   n:'Look after them',   rel:'mother,father', min:65,
    run(n){ n.r=clamp(n.r+16); applyEff({happiness:-4,reputation:5});
      return 'You spent the year keeping an eye on them. They noticed.'; } },
  { id:'teach',     n:'Teach them something', rel:'child,sibling',
    run(n){ const k=pick(Object.keys(DATA.skills));
      n.r=clamp(n.r+10); applyEff({happiness:5,skill:{[k]:3}});
      return `You taught them a little ${DATA.skills[k].name.toLowerCase()}. +10.`; } },
  { id:'fund',      n:'Pay for their education', rel:'child', cost:18000, min:16,
    run(n){ n.r=clamp(n.r+22); if(n.own)n.own.edu=3;
      return 'You paid for their studies. They will not forget it.'; } },
  { id:'discipline',n:'Set them straight', rel:'child',
    run(n){ if(R()<0.5){ n.r=clamp(n.r-8); applyEff({discipline:3});
        return 'They resented it, but they listened.'; }
      n.r=clamp(n.r-16); return 'It went badly. They slammed a door.'; } },
  { id:'readto',    n:'Read to them',      rel:'child', max:11,
    run(n){ n.r=clamp(n.r+13); applyEff({happiness:7});
      return 'The same book again. They are asleep before the end.'; } },

  /* --- partner --- */
  { id:'datenight', n:'Take them out',     rel:'partner,spouse', cost:180,
    run(n){ const d=ri(9,18); n.r=clamp(n.r+d); applyEff({happiness:8});
      return `A good evening. +${d}.`; } },
  { id:'propose',   n:'Propose marriage',  rel:'partner', min:18,
    run(n){ if(n.r>=65){ n.rel='spouse'; applyEff({happiness:25});
        return `You asked ${n.name.split(' ')[0]} to marry you. They said yes!`; }
      n.r=clamp(n.r-12); applyEff({happiness:-8});
      return `${n.name.split(' ')[0]} was not ready for marriage yet.`; } },
  { id:'havebaby',  n:'Try for a baby',    rel:'partner,spouse', min:18,
    run(n){ if(n.r>50){ applyEff({happiness:12});
        if(typeof addNPC==='function'&&typeof nameFor==='function'&&typeof country==='function'){
          const g=R()<0.5?'m':'f', reg=country().reg;
          const baby=addNPC('child', nameFor(reg,g)+' '+(S.name?S.name.split(' ')[1]:'Bequest'), 0, 95);
          if(baby) baby.gender=g;
        }
        return `You and ${n.name.split(' ')[0]} welcomed a new baby!`; }
      return 'You tried for a baby, but nothing happened this year.'; } },
  { id:'allowance', n:'Give allowance',    rel:'child', cost:250, min:6, max:17,
    run(n){ n.r=clamp(n.r+12); applyEff({happiness:4});
      return `You gave ${n.name.split(' ')[0]} pocket money. They were delighted.`; } },
  { id:'holiday',   n:'Go away together',  rel:'partner,spouse', cost:4200,
    run(n){ n.r=clamp(n.r+24); applyEff({happiness:20,health:3});
      return 'A week somewhere else. You both needed it.'; } },
  { id:'counsel',   n:'Suggest counselling', rel:'partner,spouse', cost:3000,
    run(n){ n.r=clamp(n.r+ri(12,26)); applyEff({happiness:4});
      return 'Difficult, useful, and better afterwards.'; } },
  { id:'deep',      n:'Have the difficult conversation', rel:'partner,spouse',
    run(n){ if(R()<0.55+S.skills.charisma/300){ n.r=clamp(n.r+18); applyEff({happiness:6});
        return 'You both said things you had been holding. It helped.'; }
      n.r=clamp(n.r-12); applyEff({happiness:-8});
      return 'It did not go the way you hoped.'; } },
  { id:'cheat',     n:'Be unfaithful',     rel:'partner,spouse',
    run(n){ S.flags.cheated=true;
      if(R()<0.45){ n.r=clamp(n.r-38); applyEff({happiness:-10,reputation:-8});
        return 'They found out. Of course they did.'; }
      applyEff({happiness:6}); return 'Nobody found out. You know, though.'; } },

  /* --- friends and colleagues --- */
  { id:'nightout',  n:'Go out with them',  rel:'friend,colleague', cost:120,
    run(n){ n.r=clamp(n.r+ri(8,16)); applyEff({happiness:9,habit:{drinking:5},skill:{charisma:3}});
      return 'A late one.'; } },
  { id:'favour',    n:'Ask a favour',      rel:'friend,colleague',
    run(n){ if(n.r>60){ n.r=clamp(n.r-8); applyEff({money:ri(100,2000)});
        return 'They came through for you.'; }
      n.r=clamp(n.r-4); return 'They made an excuse.'; } },
  { id:'helpthem',  n:'Help them out',     rel:'friend,colleague,sibling', cost:800,
    run(n){ n.r=clamp(n.r+ri(14,24)); applyEff({reputation:4,happiness:4});
      return 'You dropped everything and helped. They will remember.'; } },
  { id:'network',   n:'Talk shop',         rel:'colleague',
    run(n){ n.r=clamp(n.r+6); applyEff({skill:{business:4,charisma:3}});
      if(S.perf!=null)S.perf=clamp(S.perf+3);
      return 'Useful. People notice who you are seen with.'; } },
  { id:'undermine', n:'Undermine them',    rel:'colleague',
    run(n){ n.r=clamp(n.r-22);
      if(R()<0.45){ if(S.perf!=null)S.perf=clamp(S.perf+8); applyEff({reputation:-4});
        return 'It worked. You look better by comparison.'; }
      if(S.perf!=null)S.perf=clamp(S.perf-10); applyEff({reputation:-8});
      return 'It got back to them, and to everyone else.'; } },
  { id:'introduce', n:'Ask for an introduction', rel:'friend,colleague',
    run(n){ if(n.r>55&&R()<0.5){ const f=addNPC('colleague',null,S.age+ri(-10,10),ri(45,65));
        n.r=clamp(n.r-4); return `They introduced you to ${f.name}.`; }
      return 'Nothing came of it.'; } },

  /* --- teacher --- */
  { id:'extrahelp', n:'Ask for extra help', rel:'teacher',
    run(n){ n.r=clamp(n.r+8); applyEff({smarts:4});
      S.gpa=clamp((S.gpa==null?50:S.gpa)+ri(3,8));
      return `They stayed behind with you. Your grade is now ${Math.round(S.gpa)}.`; } },
  { id:'reference', n:'Ask for a reference', rel:'teacher', min:16,
    run(n){ if(n.r>55){ S.flags.reference=true; applyEff({reputation:6});
        return 'They wrote you a glowing reference.'; }
      return 'They said they did not know you well enough.'; } }
];

/* ---------------- LEISURE ---------------- */
const LEISURE = [
  { id:'cinema',   n:'Go to the cinema',      cost:60,    eff:{happiness:5} },
  { id:'concert',  n:'See a band',            cost:180,   eff:{happiness:10}, skill:{music:3} },
  { id:'match',    n:'Go to a match',         cost:140,   eff:{happiness:9}, skill:{fitness:1} },
  { id:'museum',   n:'Spend a day in a gallery', cost:40, eff:{happiness:5,smarts:4}, skill:{art:3} },
  { id:'hike',     n:'Get out of the city',   cost:30,    eff:{happiness:8,health:5}, skill:{fitness:4} },
  { id:'restaurant',n:'Eat somewhere good',   cost:210,   eff:{happiness:8}, skill:{cooking:2} },
  { id:'spa',      n:'A day doing nothing',   cost:320,   eff:{happiness:11,health:4} },
  { id:'games',    n:'Lose a weekend to a game', cost:0,  eff:{happiness:7,smarts:-1}, skill:{gaming:5} },
  { id:'bookshop', n:'Browse a bookshop',     cost:45,    eff:{happiness:4,smarts:3}, skill:{writing:2} },
  { id:'festival', n:'Go to a festival',      cost:520,   eff:{happiness:16,health:-3}, habit:{drinking:6} },
  { id:'weekend',  n:'A weekend away',        cost:900,   eff:{happiness:14,health:2} },
  { id:'holiday_l',n:'Two weeks abroad',      cost:4200,  eff:{happiness:24,health:4,smarts:3} },
  { id:'cruise',   n:'A long cruise',         cost:11000, eff:{happiness:32,health:5,reputation:4} },
  { id:'casino',   n:'A night at the casino', cost:0,     gamble:true },
  { id:'volunteer_l',n:'Give your time',      cost:0,     eff:{happiness:7,reputation:7} }
];

/* ---------------- DEGREES ----------------
   Studying something shapes what you are good at and what will hire you.  */
const DEGREES = [
  { id:'medicine', n:'Medicine',            skills:{medicine:35,smarts:10}, fields:['medical'],           years:5 },
  { id:'law',      n:'Law',                 skills:{charisma:18,smarts:12}, fields:['public'],            years:4 },
  { id:'business_d',n:'Business',           skills:{business:32,charisma:10},fields:['corp','service'],   years:3 },
  { id:'compsci',  n:'Computer Science',    skills:{tech:35,smarts:8},      fields:['tech'],              years:3 },
  { id:'engineering',n:'Engineering',       skills:{handiness:28,tech:14},  fields:['trade','tech'],      years:4 },
  { id:'education_d',n:'Education',         skills:{charisma:16,smarts:10}, fields:['public'],            years:3 },
  { id:'arts',     n:'Fine Art',            skills:{art:34},                fields:['art'],               years:3 },
  { id:'music_d',  n:'Music',               skills:{music:34},              fields:['music'],             years:3 },
  { id:'english',  n:'English Literature',  skills:{writing:32,smarts:8},   fields:['writing'],           years:3 },
  { id:'sport_sci',n:'Sports Science',      skills:{fitness:28,medicine:8}, fields:['sport'],             years:3 },
  { id:'politics_d',n:'Politics',           skills:{charisma:24,smarts:10}, fields:['politics','public'], years:3 },
  { id:'psychology',n:'Psychology',         skills:{smarts:16,charisma:12}, fields:['public','medical'],  years:3 }
];
const DEGREE = id => DEGREES.find(d => d.id === id);
