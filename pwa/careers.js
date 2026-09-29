/* BEQUEST — special career tracks.
   These are not jobs. Each is a parallel life path with its own ranks, its own
   resource, its own actions and its own way of ending badly.
   Inspired by the "special careers" of the genre, written from scratch.      */

const TRACKS = [
  /* ============ ORGANISED CRIME ============ */
  { id:'mob', n:'Organised Crime', short:'Crime family', res:'heat', resN:'Heat',
    joinAge:17, colour:'#e0565b',
    blurb:'Someone notices you, and asks if you want to earn.',
    ranks:[
      { n:'Associate',  pay:14000,  need:0 },
      { n:'Soldier',    pay:40000,  need:6 },
      { n:'Capo',       pay:110000, need:16 },
      { n:'Underboss',  pay:280000, need:32 },
      { n:'Boss',       pay:700000, need:55 }
    ],
    canJoin:()=> S.age>=17 && (S.skills.combat>=25 || S.crimesCommitted>=2 || S.flags.bad_crowd),
    joinText:'A man who knows your name buys you a drink and explains how earning works.',
    yearly(notes){
      const t=S.track, r=TRACK_RANK(t);
      const cut=Math.round(r.pay*(0.6+R()*0.8)*M('earn'));
      S.money+=cut; notes.push(`Your cut as ${r.n} came to ${money(cut)}.`);
      t.heat=Math.max(0,t.heat-ri(1,4));
      if(t.heat>=70&&R()<0.35){
        notes.push('The organisation is under investigation.');
        if(R()<0.55){ const yrs=ri(2,9); S.jailLeft=yrs;
          S.record.push({crime:'Racketeering',age:S.age,sev:3,spent:false});
          notes.push(`You were indicted and sentenced to ${yrs} years.`);
          t.heat=20; }
        else notes.push('The case collapsed. This time.');
      }
      if(t.rank>=3&&R()<0.04){
        notes.push('Someone moved against you.');
        if(R()<0.5+S.skills.combat/300){ notes.push('It did not go their way.'); t.progress+=6; }
        else { S.stats.health=clamp(S.stats.health-ri(20,45)); notes.push('You were badly hurt.'); }
      }
    },
    actions:[
      { id:'racket', n:'Run a racket', d:'Steady earning, slow heat',
        run(){ const take=ri(2000,18000)*(1+S.track.rank*0.6);
          S.money+=Math.round(take); S.track.progress+=2; S.track.heat=clamp(S.track.heat+ri(3,8));
          popupOK('Earning',`You cleared ${money(Math.round(take))}. Heat ${Math.round(S.track.heat)}.`); } },
      { id:'collect', n:'Collect a debt', d:'Violent, respected',
        run(){ if(R()<0.55+S.skills.combat/250){ const v=ri(3000,30000); S.money+=v; S.track.progress+=3;
            S.track.heat=clamp(S.track.heat+ri(4,10)); applyEff({skill:{combat:4}});
            popupOK('Collected',`They paid. ${money(v)}.`); }
          else { applyEff({health:-ri(8,25)}); S.track.heat=clamp(S.track.heat+12);
            popupOK('It went badly','They had people with them.'); } } },
      { id:'launder', n:'Wash the money', d:'Cuts your heat',
        run(){ const c=Math.round(S.money*0.12); S.money-=c; S.track.heat=clamp(S.track.heat-ri(12,25));
          applyEff({skill:{business:5}});
          popupOK('Laundered',`${money(c)} disappeared into a legitimate business. Heat ${Math.round(S.track.heat)}.`); } },
      { id:'rival', n:'Move on a rival', d:'Dangerous, fast promotion',
        run(){ if(R()<0.42+S.skills.combat/250+LUCK()){ S.track.progress+=9; S.track.heat=clamp(S.track.heat+22);
            applyEff({reputation:-6}); S.crimesCommitted++;
            popupOK('Done','Nobody says anything, but everybody knows.'); }
          else { S.stats.health=clamp(S.stats.health-ri(25,55)); S.track.heat=clamp(S.track.heat+30);
            popupOK('It went wrong','You barely got out.'); } } },
      { id:'lielow', n:'Lie low', d:'Nothing happens, which is the point',
        run(){ S.track.heat=clamp(S.track.heat-ri(18,34)); applyEff({happiness:-3,discipline:3});
          popupOK('Quiet year',`Heat down to ${Math.round(S.track.heat)}.`); } },
      { id:'recruit', n:'Bring someone in', d:'Builds your crew',
        run(){ const f=addNPC('friend',null,S.age+ri(-10,6),ri(50,75)); S.track.progress+=3;
          popupOK('Recruited',`${f.name} works for you now.`); } }
    ],
    leave(){ if(R()<0.4){ S.stats.health=clamp(S.stats.health-ri(20,50));
        return 'They let you go, eventually, and not gently.'; }
      return 'You walked away. Nobody stopped you, which worries you.'; }
  },

  /* ============ A MOVEMENT OF YOUR OWN ============ */
  { id:'cult', n:'The Movement', short:'Movement', res:'followers', resN:'Followers',
    joinAge:22, colour:'#c896ff',
    blurb:'People listen when you talk. Some of them really listen.',
    ranks:[
      { n:'Speaker',        pay:0,      need:0 },
      { n:'Teacher',        pay:20000,  need:8 },
      { n:'Founder',        pay:90000,  need:20 },
      { n:'Spiritual Leader',pay:300000,need:38 },
      { n:'Living Prophet', pay:900000, need:62 }
    ],
    canJoin:()=> S.age>=22 && (S.skills.charisma>=55 || S.flags.devout),
    joinText:'You say something at a gathering and afterwards eleven people wait to speak to you.',
    yearly(notes){
      const t=S.track, r=TRACK_RANK(t);
      t.followers=Math.max(0,Math.round(t.followers*(1.08+R()*0.35)+ri(0,40)));
      const don=Math.round(t.followers*ri(30,140)*M('earn')/10);
      S.money+=don; notes.push(`Donations came to ${money(don)} from ${t.followers.toLocaleString()} followers.`);
      S.stats.reputation=clamp(S.stats.reputation+(t.followers>5000?2:1));
      if(t.followers>3000&&R()<0.10){
        notes.push('A journalist has begun asking questions about the movement.');
        if(R()<0.5){ t.followers=Math.round(t.followers*0.55); S.stats.reputation=clamp(S.stats.reputation-18);
          notes.push('The article ran. Many people left.'); }
        else notes.push('Nothing came of it.');
      }
      if(t.rank>=3&&R()<0.05){
        notes.push('The authorities raided the compound.');
        if(R()<0.45){ S.jailLeft=ri(3,12); S.record.push({crime:'Fraud and coercion',age:S.age,sev:3,spent:false});
          notes.push(`You were convicted. ${S.jailLeft} years.`); t.followers=0; }
        else notes.push('They found nothing they could use.');
      }
    },
    actions:[
      { id:'preach', n:'Speak to the faithful', d:'Grows the movement',
        run(){ const g=Math.round((20+S.track.followers*0.2)*(1+S.skills.charisma/80));
          S.track.followers+=g; S.track.progress+=2; applyEff({skill:{charisma:4},happiness:4});
          popupOK('They listened',`${g.toLocaleString()} new followers. ${S.track.followers.toLocaleString()} in all.`); } },
      { id:'tithe', n:'Ask for more', d:'Money now, people later',
        run(){ const v=Math.round(S.track.followers*ri(60,260)/10); S.money+=v;
          S.track.followers=Math.round(S.track.followers*0.88); S.track.progress+=1;
          popupOK('Collected',`${money(v)}. Some of them did not come back.`); } },
      { id:'compound', n:'Buy land for the community', d:'Costly, binds them to you',
        run(){ const c=Math.round(120000*country().col); if(!afford(c))return; charge(c);
          S.track.progress+=8; S.track.followers=Math.round(S.track.followers*1.25);
          popupOK('The compound','They live where you live now.'); } },
      { id:'prophecy', n:'Make a prophecy', d:'Enormous risk',
        run(){ if(R()<0.35+LUCK()){ S.track.followers=Math.round(S.track.followers*1.8); S.track.progress+=10;
            applyEff({reputation:10}); popupOK('It came true','Close enough that nobody argues.'); }
          else { S.track.followers=Math.round(S.track.followers*0.35); applyEff({reputation:-14});
            popupOK('The date passed','Nothing happened. Many of them went home.'); } } },
      { id:'charity', n:'Do genuine good', d:'Slower, safer, real',
        run(){ const c=Math.round(S.money*0.15); S.money-=c; S.track.progress+=4;
          applyEff({reputation:14,happiness:10}); S.donated+=c;
          popupOK('Good works',`${money(c)} spent on people who needed it.`); } }
    ],
    leave(){ return 'You stood down. Some of them still write to you.'; }
  },

  /* ============ THE FORCES ============ */
  { id:'mil', n:'The Forces', short:'Military', res:'commend', resN:'Commendations',
    joinAge:17, colour:'#5b9cf5',
    blurb:'Somewhere to be, something to be part of.',
    ranks:[
      { n:'Private',     pay:32000,  need:0 },
      { n:'Corporal',    pay:46000,  need:5 },
      { n:'Sergeant',    pay:64000,  need:13 },
      { n:'Lieutenant',  pay:88000,  need:24 },
      { n:'Major',       pay:130000, need:38 },
      { n:'Colonel',     pay:185000, need:56 },
      { n:'General',     pay:290000, need:80 }
    ],
    canJoin:()=> S.age>=17 && S.age<=34 && S.stats.health>=45 && !S.record.some(r=>!r.spent),
    joinText:'You sign the papers and somebody cuts your hair.',
    yearly(notes){
      const t=S.track, r=TRACK_RANK(t);
      const pay=Math.round(r.pay*country().sal*M('earn')); S.money+=pay;
      notes.push(`Service pay: ${money(pay)} as ${r.n}.`);
      S.skills.fitness=clamp(S.skills.fitness+2); S.stats.discipline=clamp(S.stats.discipline+2);
      t.progress+=1;
      if(R()<0.12){
        notes.push('Your unit was deployed.');
        if(R()<0.15){ S.stats.health=clamp(S.stats.health-ri(15,45));
          notes.push('You came back injured.');
          if(R()<0.3){ addCondition('injury',2); } }
        else { t.progress+=4; t.commend=(t.commend||0)+1; notes.push('You came back with a commendation.'); }
      }
    },
    actions:[
      { id:'drill', n:'Train hard', d:'',
        run(){ applyEff({skill:{fitness:8,combat:7},discipline:5,health:2}); S.track.progress+=2;
          popupOK('Training','Fitness +8, Combat +7.'); } },
      { id:'officer', n:'Apply to officer school', d:'Needs discipline and smarts',
        run(){ if(R()<0.3+S.stats.smarts/300+S.stats.discipline/300){ S.track.progress+=8;
            applyEff({smarts:6,reputation:6}); popupOK('Accepted','You are on the officer track.'); }
          else popupOK('Rejected','Not this intake.'); } },
      { id:'volunteer_tour', n:'Volunteer for a tour', d:'Dangerous, fast promotion',
        run(){ if(R()<0.72+LUCK()){ S.track.progress+=7; S.track.commend=(S.track.commend||0)+1;
            applyEff({skill:{combat:8},reputation:8}); popupOK('You came home','And you came home decorated.'); }
          else { S.stats.health=clamp(S.stats.health-ri(25,55));
            addCondition('injury',3);
            popupOK('You came home','Not as you left.'); } } },
      { id:'mentor', n:'Look after your people', d:'',
        run(){ const f=addNPC('friend',null,S.age+ri(-8,8),ri(60,85)); S.track.progress+=2;
          applyEff({reputation:5,skill:{charisma:5}});
          popupOK('Your unit',`${f.name} would follow you anywhere.`); } }
    ],
    leave(){ S.edu=Math.max(S.edu,2); return 'You served your time and came out with a trade.'; }
  },

  /* ============ BORN OR MARRIED INTO IT ============ */
  { id:'royal', n:'The Royal House', short:'Royalty', res:'standing', resN:'Standing',
    joinAge:0, colour:'#f5cf5d',
    blurb:'An accident of birth, or of marriage.',
    ranks:[
      { n:'Minor Royal',    pay:120000,  need:0 },
      { n:'Duke or Duchess',pay:400000,  need:10 },
      { n:'Heir',           pay:900000,  need:26 },
      { n:'Monarch',        pay:2500000, need:48 }
    ],
    canJoin:()=> false,               // you cannot apply; it happens to you
    joinText:'It turns out your family is that family.',
    yearly(notes){
      const t=S.track, r=TRACK_RANK(t);
      const purse=Math.round(r.pay*M('earn')*0.35); S.money+=purse;
      notes.push(`The household paid you ${money(purse)}.`);
      S.stats.reputation=clamp(S.stats.reputation+1);
      if(R()<0.10){ notes.push('The press has decided to take an interest in you.');
        S.stats.reputation=clamp(S.stats.reputation-ri(3,12)); S.stats.happiness=clamp(S.stats.happiness-6); }
      if(t.rank<3&&R()<0.05){ t.progress+=12; notes.push('Someone ahead of you in the line has died.'); }
    },
    actions:[
      { id:'duty', n:'Carry out public duties', d:'',
        run(){ S.track.progress+=3; applyEff({reputation:8,happiness:-3,skill:{charisma:5}});
          popupOK('Duties','Ribbons cut, hands shaken, nothing said.'); } },
      { id:'patron', n:'Take on a patronage', d:'',
        run(){ const c=Math.round(S.money*0.08); S.money-=c; S.donated+=c; S.track.progress+=4;
          applyEff({reputation:14,happiness:8}); popupOK('Patronage','Genuinely useful, for once.'); } },
      { id:'scandal', n:'Do exactly as you please', d:'',
        run(){ S.track.progress-=4; applyEff({happiness:18,reputation:-16});
          popupOK('Front pages','You enjoyed yourself enormously.'); } },
      { id:'abdicate', n:'Give it up', d:'Leaves the family for good',
        run(){ confirmDo('Renounce your title?','You would keep nothing but your name.',()=>{
          S.track=null; applyEff({happiness:12,reputation:-10,money:-0});
          logLine('You renounced your title.'); popupOK('Renounced','You are nobody in particular now.'); }); } }
    ],
    leave(){ return 'You stepped back from public life.'; }
  },

  /* ============ THE CIRCUIT ============ */
  { id:'circuit', n:'The Circuit', short:'Competitor', res:'rating', resN:'Rating',
    joinAge:8, colour:'#42c98a',
    blurb:'You are better at this than the people around you.',
    ranks:[
      { n:'Club Player',    pay:0,      need:0 },
      { n:'National Player',pay:24000,  need:8 },
      { n:'Master',         pay:70000,  need:20 },
      { n:'Grandmaster',    pay:180000, need:38 },
      { n:'World Champion', pay:600000, need:62 }
    ],
    canJoin:()=> S.age>=8 && (S.stats.smarts>=55 || S.skills.gaming>=40),
    joinText:'You win something small, and somebody suggests you take it seriously.',
    yearly(notes){
      const t=S.track, r=TRACK_RANK(t);
      if(r.pay>0){ const pz=Math.round(r.pay*(0.5+R())*M('earn')); S.money+=pz;
        notes.push(`Prize money and appearances: ${money(pz)}.`); }
      t.rating=(t.rating||1200)+ri(-20,35)+Math.round(S.stats.smarts/12);
      if(S.age>42&&R()<0.3){ t.rating-=ri(10,40); notes.push('Your results are slipping.'); }
    },
    actions:[
      { id:'tournament', n:'Enter a tournament', d:'',
        run(){ const skill=(S.stats.smarts+ (S.skills.gaming||0))/2;
          if(R()<0.35+skill/220+LUCK()){ const p=ri(500,26000); S.money+=p; S.track.progress+=4;
            S.track.rating=(S.track.rating||1200)+ri(20,70); applyEff({reputation:5,happiness:8});
            popupOK('You won',`${money(p)} and a rating of ${S.track.rating}.`); }
          else { S.track.rating=(S.track.rating||1200)-ri(5,30); applyEff({happiness:-5});
            popupOK('Knocked out',`Rating ${S.track.rating}.`); } } },
      { id:'study_game', n:'Study the game', d:'',
        run(){ applyEff({smarts:5,discipline:4,skill:{gaming:6}}); S.track.progress+=2;
          S.track.rating=(S.track.rating||1200)+ri(10,35);
          popupOK('Preparation',`Rating ${S.track.rating}.`); } },
      { id:'coach', n:'Take a coach', d:'Expensive, effective',
        run(){ const c=Math.round(8000*country().col); if(!afford(c))return; charge(c);
          S.track.progress+=5; S.track.rating=(S.track.rating||1200)+ri(40,90);
          applyEff({smarts:4}); popupOK('Coaching',`Rating ${S.track.rating}.`); } },
      { id:'sponsor_deal', n:'Chase a sponsor', d:'',
        run(){ if(S.track.rank<1)return popupOK('Nobody knows you','Win something first.');
          if(R()<0.4+S.stats.reputation/250){ const v=ri(8000,90000); S.money+=v; S.followers+=ri(2000,40000);
            popupOK('Signed',`${money(v)} and a great deal of attention.`); }
          else popupOK('No interest','Not yet.'); } }
    ],
    leave(){ return 'You stopped competing. It was taking more than it gave.'; }
  }
];

const TRACK = id => TRACKS.find(t => t.id === id);
function TRACK_RANK(t){
  const def = TRACK(t.id);
  let r = def.ranks[0];
  def.ranks.forEach((x,i) => { if (t.progress >= x.need) { r = x; t.rank = i; } });
  return r;
}
