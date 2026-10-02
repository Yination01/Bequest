/* BEQUEST — school subjects.

   Ages eleven to eighteen are a third of the events in the game and resolved
   to a single number, S.gpa, which drifted up or down from smarts and
   discipline and then decided one thing: whether a university would take you.

   Worse, the twelve degrees in social.js were unreachable. `S.degree` was
   read in six places and assigned in none, so enrolling bought you three
   smarts a year and nothing else: no subject, no skills from studying it, and
   never the 12% pay premium for working in your field. This module is what
   makes ages eleven to eighteen decide anything: subjects you are good at,
   options you choose at fourteen, degrees those options open or close, and
   skills the whole thing hands you on the way out.

   S.gpa is kept, and kept accurate, because the rest of the game reads it.
   It is now an average of what you are actually studying rather than a
   number of its own.                                                       */

const SUBJECTS = [
  { id:'maths',     n:'Mathematics',          skill:'smarts',    core:true,  degrees:['compsci','engineering','business_d'] },
  { id:'english_s', n:'English',              skill:'writing',   core:true,  degrees:['english','law','education_d'] },
  { id:'science',   n:'Science',              skill:'medicine',  core:true,  degrees:['medicine','sport_sci','psychology'] },
  { id:'history',   n:'History',              skill:'smarts',    core:false, degrees:['politics_d','law'] },
  { id:'languages', n:'Languages',            skill:'charisma',  core:false, degrees:['english','politics_d'] },
  { id:'art_s',     n:'Art',                  skill:'art',       core:false, degrees:['arts'] },
  { id:'music_s',   n:'Music',                skill:'music',     core:false, degrees:['music_d'] },
  { id:'dt',        n:'Design and Technology',skill:'handiness', core:false, degrees:['engineering'] },
  { id:'pe',        n:'Physical Education',   skill:'fitness',   core:false, degrees:['sport_sci'] },
  { id:'business_s',n:'Business Studies',     skill:'business',  core:false, degrees:['business_d'] },
  { id:'computing', n:'Computing',            skill:'tech',      core:false, degrees:['compsci'] },
  { id:'psych_s',   n:'Psychology',           skill:'smarts',    core:false, degrees:['psychology','medicine'] }
];
const SUBJECT = id => SUBJECTS.find(s => s.id === id) || SUBJECTS[0];

const SCHOOL_START = 11;   /* when subjects begin to mean anything */
const OPTIONS_AGE  = 14;   /* when you drop some and keep others   */
const SCHOOL_END   = 18;
const DEGREE_BAR   = 60;   /* the grade a subject needs to open its degrees */

/* Some people are simply better at some things, and it is not all effort. */
function schoolBirth(s){
  s.subjects = {};
  s.aptitude = {};
  SUBJECTS.forEach(sub => { s.aptitude[sub.id] = ri(-18, 22); });
  s.options = null;        /* chosen at fourteen */
  s.optionsHow = null;
}
function schoolMigrate(s){
  if(!s.subjects) s.subjects = {};
  if(!s.aptitude){ s.aptitude = {}; SUBJECTS.forEach(sub => { s.aptitude[sub.id] = ri(-18, 22); }); }
  if(s.options === undefined) s.options = null;
}

/* What you are actually sitting in a room for this year. */
function subjectsActive(s){
  if(s.age < SCHOOL_START || s.age > SCHOOL_END) return [];
  if(s.age < OPTIONS_AGE || !s.options || !s.options.length) return SUBJECTS.map(x => x.id);
  /* after options: the three core subjects plus whatever you chose */
  const core = SUBJECTS.filter(x => x.core).map(x => x.id);
  return core.concat(s.options.filter(id => core.indexOf(id) < 0));
}
/* The subjects you actually took to eighteen. subjectsActive() answers "what
   are you sitting in this year" and goes empty once school is over; this one
   has to keep answering after you have left, because it is what a university
   asks about. */
function subjectsTaken(s){
  const core = SUBJECTS.filter(x => x.core).map(x => x.id);
  const kept = (s.options || []).filter(id => core.indexOf(id) < 0);
  return core.concat(kept);
}
function subjectGrade(s, id){
  const g = (s.subjects || {})[id];
  return g == null ? 0 : Math.round(g);
}
function bestSubjects(s, n){
  return Object.keys(s.subjects || {})
    .sort((a, b) => s.subjects[b] - s.subjects[a])
    .slice(0, n || 3);
}

/* One year of school. Called from tickAging while inSchool. */
function tickSubjects(s, notes){
  if(s.age < SCHOOL_START || s.age > SCHOOL_END) return;
  const active = subjectsActive(s);
  active.forEach(id => {
    if(s.subjects[id] == null) s.subjects[id] = 36 + ri(0, 10);
    /* A subject has a ceiling you converge on, rather than a number that
       accumulates: seven years of small positive drift made everybody a
       straight-A student in everything, and then no degree was ever closed
       to anyone. You move a third of the way towards what you are capable
       of each year, so ability and effort separate people instead of time. */
    const apt  = (s.aptitude && s.aptitude[id]) || 0;
    const kept = s.options && s.options.indexOf(id) >= 0;
    const diffMod = s.diff === 'brutal' ? -6 : s.diff === 'hard' ? -3 : s.diff === 'easy' ? 4 : 0;
    const ceiling = clamp(40
          + diffMod
          + (s.stats.smarts - 50) * 0.42
          + apt * 0.85
          + s.stats.discipline * 0.14
          + (kept ? 11 : -4)                       /* you chose it, so you turn up */
          + (s.traits && s.traits.includes('gifted') ? 6 : 0)
          - (s.habits.doomscroll > 45 ? 7 : 0)
          - (s.stats.happiness < 30 ? 6 : 0));
    const d = (ceiling - s.subjects[id]) * 0.34 + (Math.random() * 3 - 1.5);
    s.subjects[id] = clamp(s.subjects[id] + d);
  });
  /* dropped subjects do not improve, and fade a little */
  if(s.options && s.options.length){
    Object.keys(s.subjects).forEach(id => {
      if(active.indexOf(id) < 0) s.subjects[id] = clamp(s.subjects[id] - 1.2);
    });
  }
  s.gpa = gpaFrom(s);
  /* one line a year, about the subject that is going somewhere */
  if(notes && s.age >= OPTIONS_AGE && Math.random() < 0.45){
    const best = bestSubjects(s, 1)[0];
    if(best && subjectGrade(s, best) >= 72)
      notes.push(`${SUBJECT(best).n} is going well. You are at ${subjectGrade(s, best)} in it.`);
  }
}

/* S.gpa is still the number the rest of the game reads, so it has to stay
   true: it is the average of what you are studying now. */
function gpaFrom(s){
  const active = subjectsActive(s);
  const have = active.filter(id => s.subjects[id] != null);
  if(!have.length) return s.gpa == null ? 50 : s.gpa;
  return clamp(have.reduce((n, id) => n + s.subjects[id], 0) / have.length);
}

/* ---- choosing options at fourteen ---- */
function optionPool(){ return SUBJECTS.filter(x => !x.core).map(x => x.id); }
function chooseOptions(how){
  const s = S;
  const pool = optionPool();
  let picked;
  if(how === 'best'){
    picked = pool.slice().sort((a, b) =>
      ((s.subjects[b] || 0) + (s.aptitude[b] || 0)) - ((s.subjects[a] || 0) + (s.aptitude[a] || 0))).slice(0, 3);
  } else if(how === 'enjoy'){
    const fun = ['art_s','music_s','pe','computing','psych_s'];
    picked = fun.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  } else {
    picked = pool.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  }
  s.options = picked;
  s.optionsHow = how;
  picked.forEach(id => { if(s.subjects[id] == null) s.subjects[id] = 36 + ri(0, 10); });
  return picked.map(id => SUBJECT(id).n);
}

/* ---- what your subjects open ---- */
function degreeOpen(s, degId){
  const feeders = SUBJECTS.filter(x => x.degrees.indexOf(degId) >= 0);
  if(!feeders.length) return true;                 /* nothing gates it */
  const took = subjectsTaken(s);
  /* dropping a subject at fourteen has to close something, or the choice at
     fourteen was not a choice */
  return feeders.some(f => took.indexOf(f.id) >= 0 && subjectGrade(s, f.id) >= DEGREE_BAR);
}
function degreesOpenTo(s){
  const open = DEGREES.filter(d => degreeOpen(s, d.id));
  const list = open.length ? open
    : DEGREES.filter(d => ['business_d','english','education_d'].indexOf(d.id) >= 0);
  /* best subject first, so a dismissed chooser still reads something that
     follows from the life rather than whatever is top of the table */
  const rank = d => Math.max.apply(null, SUBJECTS.filter(x => x.degrees.indexOf(d.id) >= 0)
                                                 .map(x => subjectGrade(s, x.id)).concat([0]));
  return list.slice().sort((a, b) => rank(b) - rank(a));
}
function degreeBlockedBy(degId){
  const feeders = SUBJECTS.filter(x => x.degrees.indexOf(degId) >= 0);
  return feeders.map(f => f.n).join(' or ');
}

/* Leaving school hands you what you were good at, as skills. This is the
   line that makes ages eleven to eighteen matter to a career. */
function schoolLeavingSkills(s, notes){
  if(s.flags.schoolSkillsGiven) return;
  s.flags.schoolSkillsGiven = true;
  const gained = [];
  SUBJECTS.forEach(sub => {
    const g = subjectGrade(s, sub.id);
    if(g < 60) return;
    const amount = Math.round((g - 55) / 3.2);     /* 60 -> +2, 100 -> +14 */
    if(amount <= 0) return;
    if(s.skills[sub.skill] != null) s.skills[sub.skill] = clamp(s.skills[sub.skill] + amount);
    else if(s.stats[sub.skill] != null) s.stats[sub.skill] = clamp(s.stats[sub.skill] + amount);
    gained.push(`${sub.n} ${g}`);
  });
  if(gained.length && notes)
    notes.push(`You left school with ${gained.slice(0, 4).join(', ')}.`);
  else if(notes) notes.push('You left school with nothing much to show for it.');
}

/* ---- the study action, now aimed at something ---- */
function studySubject(id){
  const s = S, sub = SUBJECT(id);
  if(s.subjects[id] == null) s.subjects[id] = 36 + ri(0, 10);
  const before = subjectGrade(s, id);
  /* effort beats the ceiling, but with diminishing returns near the top */
  const room = Math.max(0, 100 - s.subjects[id]);
  const diffEff = s.diff === 'brutal' ? 0.75 : s.diff === 'hard' ? 0.88 : s.diff === 'easy' ? 1.15 : 1.0;
  const gain = Math.max(1, Math.round((ri(5, 12) + ((s.aptitude && s.aptitude[id]) || 0) / 10) * (room / 100 + 0.25) * diffEff));
  s.subjects[id] = clamp(s.subjects[id] + gain);
  s.gpa = gpaFrom(s);
  applyEff({ smarts: 3, happiness: -3, discipline: 3 });
  popupOK(`${sub.n}`,
    `You put the evening into it.\n${sub.n} moved from ${before} to ${subjectGrade(s, id)}.`
    + (subjectGrade(s, id) >= DEGREE_BAR && before < DEGREE_BAR
       ? `\n\nThat is now good enough to read ${DEGREES.filter(d => sub.degrees.indexOf(d.id) >= 0).map(d => d.n).join(' or ')} at university.`
       : ''));
  save(); renderAll();
}
function studyPick(){
  const s = S, active = subjectsActive(s);
  if(!active.length) return popupOK('Not at school', 'You are not studying anything.');
  chooseFrom('Which subject?', active.map(id =>
    [`${SUBJECT(id).n} \u2014 ${subjectGrade(s, id)}/100`, 0, id]), (label, id) => studySubject(id));
}

/* ---- the card on the Life tab ---- */
function subjectsCard(){
  const s = S;
  const active = subjectsActive(s);
  if(!active.length) return '';
  const rows = active.slice().sort((a, b) => subjectGrade(s, b) - subjectGrade(s, a)).map(id => {
    const g = subjectGrade(s, id), sub = SUBJECT(id);
    const kept = s.options && s.options.indexOf(id) >= 0;
    const opens = sub.degrees.filter(d => DEGREE(d)).map(d => DEGREE(d).n);
    return `<div class="subj">
      <div class="subjline"><div class="rn">${esc(sub.n)}${kept ? ' <span class="award t1">chosen</span>' : ''}</div>
        <b class="${g >= 70 ? 'g' : g >= DEGREE_BAR ? '' : 'dim'}">${g}</b></div>
      <div class="bt"><i class="${g >= 70 ? 'g' : g >= DEGREE_BAR ? 'a' : 'r'}" style="width:${g}%"></i></div>
      ${opens.length ? `<div class="hsub dim">${g >= DEGREE_BAR ? 'Opens' : 'Would open'} ${esc(opens.join(', '))}</div>` : ''}
    </div>`;
  }).join('');
  const note = s.age < OPTIONS_AGE
    ? `<div class="hsub dim">At ${OPTIONS_AGE} you will drop some of these and keep the rest.</div>`
    : s.options ? `<div class="hsub dim">You kept ${esc(s.options.map(id => SUBJECT(id).n).join(', '))}.</div>` : '';
  return `<div class="card"><div class="ctrow"><div class="ct">Subjects</div>
      <div class="hsub dim">average ${Math.round(gpaFrom(s))}</div></div>
    ${note}${rows}</div>`;
}
