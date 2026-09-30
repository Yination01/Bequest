/* BEQUEST — procedural SVG avatar.
   Draws a face that genuinely ages and reflects the character's state:
   region skin tone, gender, looks, health, happiness, wealth, job, conditions.
   Everything is inline SVG so it works offline and in a sandboxed iframe.      */

const SKIN = {
  west:['#f3d2bd','#e8bc9e','#d9a684'], euro:['#f2d3c0','#e7bda0','#dca98c'],
  nordic:['#f7ddcb','#f0cdb4'],          slav:['#f1d1bb','#e4b99b'],
  jp:['#f4d9c0','#ecc6a6'],              kr:['#f5dcc4','#edc9aa'],
  cn:['#f2d5b6','#e6c39c'],              in:['#d9a071','#c2814f','#a9683a'],
  ph:['#d8a476','#c08a58'],              id:['#d7a577','#bf8b59'],
  latin:['#dcae86','#c68e63','#a97246'], wafr:['#8d5524','#6f4220','#5a351a'],
  eafr:['#7d4a1f','#63391a'],            safr:['#8a5326','#6b4020','#4e2f18'],
  arab:['#e0b48c','#cf9a6d'],            tr:['#e5bb96','#d3a274']
};
const HAIR_DARK = ['#1c1410','#2a1d15','#3a2a1c'];
const HAIR_ANY  = ['#1c1410','#2a1d15','#3a2a1c','#6b4a2a','#8a6234','#b08a4a','#c9a227','#7a3b1f'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

/* Deterministic per-character features so the face never changes between renders. */
function avatarFeatures(S) {
  const seed = hashCode((S.name || 'x') + (S.seed || 0));
  const r = n => (seed >> (n * 3)) % 1000 / 1000;
  const reg = (DATA.countries.find(c => c.id === S.country) || {}).reg || 'west';
  const tones = SKIN[reg] || SKIN.west;
  const darkHairRegions = ['jp','kr','cn','in','ph','id','wafr','eafr','arab'];
  const hairPool = darkHairRegions.includes(reg) ? HAIR_DARK : HAIR_ANY;
  return {
    skin: tones[Math.floor(r(0) * tones.length)],
    hair: hairPool[Math.floor(r(1) * hairPool.length)],
    faceW: Math.round((30 + r(2) * 5) * 100) / 100,
    eyeGap: Math.round((9 + r(3) * 3) * 100) / 100,
    noseLen: Math.round((4 + r(4) * 3) * 100) / 100,
    ears: r(5) > 0.5,
    style: Math.floor(r(6) * 4),
    freckles: r(7) > 0.78
  };
}

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  let R = (n >> 16) + pct, G = ((n >> 8) & 255) + pct, B = (n & 255) + pct;
  R = Math.max(0, Math.min(255, R)); G = Math.max(0, Math.min(255, G)); B = Math.max(0, Math.min(255, B));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/* size = px. Returns an <svg> string. */
/* What the portrait can honestly know, without reaching for the globals.
   avatarMini() renders NPCs from a fabricated state, so everything here
   must cope with the fields being absent. */
function avatarWorth(s) {
  return (s.money || 0) + (s.savings || 0)
    + ((s.properties || []).reduce((n, p) => n + Math.max(0, (p.value || 0) - (p.mortgage || 0)), 0))
    + ((s.businesses || []).reduce((n, b) => n + (b.value || 0), 0))
    - (s.debt || 0);
}
function avatarWealthTier(s) {
  const w = avatarWorth(s);
  return w >= 750000 ? 3 : w >= 150000 ? 2 : w >= 15000 ? 1 : 0;
}
/* Untreated and serious shows in a face. Managed does not, which is rather
   the point of treating it. */
function avatarAiling(s) {
  return (s.conditions || []).filter(k => !k.treated && (k.sev || 1) >= 2).length;
}

function avatarSVG(S, size) {
  size = size || 96;
  const f = avatarFeatures(S);
  const a = S.age, st = S.stats;
  const child = a < 13, baby = a < 3, old = a >= 62, elder = a >= 78;

  /* proportions: babies have big heads and small features */
  const headR = baby ? 30 : child ? 27 : 25;
  const cy    = baby ? 52 : 50;

  /* health drains colour out of the face */
  const health = st.health;
  const pale = health < 45 ? Math.round((45 - health) / 2) : 0;
  const skin = shade(f.skin, pale);

  /* hair: greys then thins with age */
  let hair = f.hair;
  if (a >= 50) hair = '#8f8f93';
  if (a >= 62) hair = '#b9b9be';
  if (elder)   hair = '#d8d8dc';
  const balding = S.gender === 'm' && a >= 48;
  const bald    = S.gender === 'm' && a >= 66 && f.style < 2;

  /* mouth curve follows happiness */
  const h = st.happiness;
  const curve = Math.round(((h - 50) / 50) * 5 * 100) / 100;
  const r2 = n => Math.round(n * 100) / 100;
  const mouth = `M ${50 - 7} ${cy + 13} Q 50 ${r2(cy + 13 + curve)} ${50 + 7} ${cy + 13}`;

  /* eyes narrow when unhappy or very old */
  const eyeR = elder ? 1.7 : h < 30 ? 1.9 : 2.3;
  const ex0 = 0;
  const ex = f.eyeGap;

  /* clothing colour reflects standing */
  const field = S.job ? S.job.field : null;
  const collar = !S.job ? '#3b4a6b'
    : ['corp','tech','politics','public'].includes(field) ? '#24406e'
    : ['medical'].includes(field) ? '#2f7f78'
    : ['trade','service'].includes(field) ? '#7a5327'
    : ['security'].includes(field) ? '#33404f'
    : '#5b3f77';

  /* --- what the body says, not just the face --- */
  const tier  = avatarWealthTier(S);
  const ailing = avatarAiling(S);
  const habits = S.habits || {};
  const drinks = (habits.drinking || 0) >= 55;
  const fed    = (habits.junkfood || 0) >= 55;

  /* shoulders narrow and drop with age and with being unwell: the face is
     not the only thing that gets older */
  const droop = Math.min(9, Math.max(0, (a - 55) / 4) + ailing * 1.6);
  const shoulderX = 16 + droop * 0.9;          /* narrower */
  const shoulderY = cy + 26 + droop * 0.8;     /* lower */
  const neckW = Math.max(8, 12 - droop * 0.35);

  const glasses = st.smarts >= 72 && a >= 8;
  const beard   = S.gender === 'm' && a >= 20 && f.style % 2 === 0;
  const wrinkle = a >= 52;
  const looks   = st.looks;

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="av" aria-hidden="true">
  <defs>
    <clipPath id="cl${f.style}"><circle cx="50" cy="${cy}" r="${headR}"/></clipPath>
    <linearGradient id="bg${f.style}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d2842"/><stop offset="1" stop-color="#121a2c"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#bg${f.style})"/>

  <!-- shoulders and clothing: shape by age, quality by what you are worth -->
  <path d="M ${r2(shoulderX)} 100 Q ${r2(shoulderX + 4)} ${r2(shoulderY + 4)} 50 ${r2(shoulderY)}
           Q ${r2(100 - shoulderX - 4)} ${r2(shoulderY + 4)} ${r2(100 - shoulderX)} 100 Z"
        fill="${tier === 0 ? shade(collar, -16) : collar}"/>
  ${tier >= 2 ? `<path d="M 40 ${r2(shoulderY + 1)} L 50 ${r2(shoulderY + 15)} L 44 ${r2(shoulderY + 2)} Z" fill="${shade(collar, 20)}"/>
                 <path d="M 60 ${r2(shoulderY + 1)} L 50 ${r2(shoulderY + 15)} L 56 ${r2(shoulderY + 2)} Z" fill="${shade(collar, 20)}"/>` : ''}
  <path d="M 44 ${r2(shoulderY)} L 50 ${r2(shoulderY + 10)} L 56 ${r2(shoulderY)} Z" fill="${shade(collar, 26)}"/>
  ${tier >= 3 ? `<path d="M 48.4 ${r2(shoulderY + 8)} L 51.6 ${r2(shoulderY + 8)} L 53 100 L 47 100 Z" fill="#8d2733"/>
                 <path d="M 47.6 ${r2(shoulderY + 5)} L 52.4 ${r2(shoulderY + 5)} L 51.6 ${r2(shoulderY + 9)} L 48.4 ${r2(shoulderY + 9)} Z" fill="#a83240"/>` : ''}

  <!-- neck -->
  <rect x="${r2(50 - neckW / 2)}" y="${cy + 16}" width="${r2(neckW)}" height="12" rx="5" fill="${shade(skin, -18)}"/>

  ${f.ears ? `<ellipse cx="${50 - headR + 2}" cy="${cy + 2}" rx="3.2" ry="4.6" fill="${shade(skin,-12)}"/>
              <ellipse cx="${50 + headR - 2}" cy="${cy + 2}" rx="3.2" ry="4.6" fill="${shade(skin,-12)}"/>` : ''}

  <!-- head -->
  <circle cx="50" cy="${cy}" r="${headR}" fill="${skin}"/>

  <!-- hair -->
  ${bald ? `<path d="M ${50-headR} ${cy-4} Q 50 ${cy-headR-4} ${50+headR} ${cy-4} L ${50+headR} ${cy-9} Q 50 ${cy-headR+4} ${50-headR} ${cy-9} Z" fill="${hair}" opacity=".55"/>`
    : `<g clip-path="url(#cl${f.style})">
        <path d="M ${50-headR-2} ${cy - (balding ? 2 : 6)}
                 Q 50 ${cy - headR - (baby ? 4 : balding ? 8 : 16)} ${50+headR+2} ${cy - (balding ? 2 : 6)}
                 L ${50+headR+2} ${cy-headR-6} L ${50-headR-2} ${cy-headR-6} Z" fill="${hair}"/>
        ${f.style === 1 && !balding ? `<rect x="${50-headR-2}" y="${cy-8}" width="6" height="${headR+10}" fill="${hair}"/>
                                        <rect x="${50+headR-4}" y="${cy-8}" width="6" height="${headR+10}" fill="${hair}"/>` : ''}
        ${f.style === 3 && S.gender === 'f' ? `<ellipse cx="50" cy="${cy-headR+6}" rx="${headR+1}" ry="10" fill="${hair}"/>` : ''}
      </g>`}

  <!-- brows -->
  <rect x="${50-ex-3.5}" y="${cy-8}" width="7" height="1.6" rx="0.8" fill="${shade(hair,-10)}" opacity=".9"/>
  <rect x="${50+ex-3.5}" y="${cy-8}" width="7" height="1.6" rx="0.8" fill="${shade(hair,-10)}" opacity=".9"/>

  <!-- eyes -->
  <circle cx="${50-ex}" cy="${cy-2}" r="${eyeR}" fill="#1a1a22"/>
  <circle cx="${50+ex}" cy="${cy-2}" r="${eyeR}" fill="#1a1a22"/>
  ${eyeR > 2 ? `<circle cx="${50-ex+0.7}" cy="${cy-2.7}" r=".7" fill="#fff" opacity=".85"/>
                <circle cx="${50+ex+0.7}" cy="${cy-2.7}" r=".7" fill="#fff" opacity=".85"/>` : ''}

  ${glasses ? `<g stroke="#c9d3e8" stroke-width="1.1" fill="none" opacity=".85">
      <circle cx="${50-ex}" cy="${cy-2}" r="5"/><circle cx="${50+ex}" cy="${cy-2}" r="5"/>
      <line x1="${50-ex+5}" y1="${cy-2}" x2="${50+ex-5}" y2="${cy-2}"/></g>` : ''}

  <!-- nose -->
  <path d="M 50 ${cy-1} L ${49} ${cy + f.noseLen} L ${51.5} ${cy + f.noseLen}"
        fill="none" stroke="${shade(skin,-28)}" stroke-width="1.1" stroke-linejoin="round"/>

  <!-- mouth -->
  <path d="${mouth}" fill="none" stroke="${shade(skin,-45)}" stroke-width="1.7" stroke-linecap="round"/>

  ${beard ? `<path d="M ${50-11} ${cy+8} Q 50 ${cy+24} ${50+11} ${cy+8} Q 50 ${cy+17} ${50-11} ${cy+8} Z"
              fill="${hair}" opacity=".8"/>` : ''}

  ${f.freckles && a < 40 ? `<g fill="${shade(skin,-30)}" opacity=".55">
      <circle cx="${50-ex-2}" cy="${cy+4}" r=".8"/><circle cx="${50-ex+2}" cy="${cy+6}" r=".7"/>
      <circle cx="${50+ex+1}" cy="${cy+5}" r=".8"/><circle cx="${50+ex-3}" cy="${cy+7}" r=".6"/></g>` : ''}

  ${wrinkle ? `<g stroke="${shade(skin,-32)}" stroke-width=".8" fill="none" opacity=".7">
      <path d="M ${50-ex-6} ${cy-5} q 3 -2 6 0"/><path d="M ${50+ex} ${cy-5} q 3 -2 6 0"/>
      ${old ? `<path d="M ${50-9} ${cy+7} q 2 4 0 7"/><path d="M ${50+9} ${cy+7} q -2 4 0 7"/>` : ''}
      ${elder ? `<path d="M ${50-14} ${cy+2} q 3 3 0 6"/><path d="M ${50+14} ${cy+2} q -3 3 0 6"/>` : ''}
    </g>` : ''}

  ${looks >= 85 && a >= 14 ? `<g opacity=".5"><circle cx="${50-ex-5}" cy="${cy+4}" r="3" fill="#ff8fa3"/>
      <circle cx="${50+ex+5}" cy="${cy+4}" r="3" fill="#ff8fa3"/></g>` : ''}

  ${ailing ? `<g fill="${shade(skin, -26)}" opacity="${Math.min(0.5, 0.2 + ailing * 0.12)}">
      <path d="M ${50 - headR + 5} ${cy + 2} q 4 7 1 12 q -4 -5 -1 -12 Z"/>
      <path d="M ${50 + headR - 5} ${cy + 2} q -4 7 -1 12 q 4 -5 1 -12 Z"/></g>` : ''}

  ${drinks && a >= 18 ? `<g fill="#c2554f" opacity=".3">
      <ellipse cx="50" cy="${cy + f.noseLen - 1}" rx="2.6" ry="2"/>
      <ellipse cx="${50 - ex - 4}" cy="${cy + 5}" rx="3.4" ry="2.2"/>
      <ellipse cx="${50 + ex + 4}" cy="${cy + 5}" rx="3.4" ry="2.2"/></g>` : ''}

  ${fed && a >= 14 ? `<path d="M ${50 - headR + 3} ${cy + 9} q ${headR - 3} ${elder ? 12 : 10} ${(headR - 3) * 2} 0"
      fill="${shade(skin, -6)}" opacity=".45"/>` : ''}

  ${S.jailLeft > 0 ? `<g opacity=".9"><rect x="0" y="0" width="100" height="100" rx="22" fill="none"/>
      ${[18,34,50,66,82].map(x=>`<rect x="${x}" y="0" width="4" height="100" fill="#0b1020" opacity=".55"/>`).join('')}</g>` : ''}
</svg>`;
}

/* Tiny version for NPC rows. */
function avatarMini(n, size) {
  const fake = { name:n.name, seed:hashCode(n.id), age:n.age, gender:n.gender,
    country:(typeof S!=='undefined'&&S)?S.country:'us',
    stats:{health:n.alive?70:10, happiness:n.r, smarts:40, looks:50}, job:null, jailLeft:0 };
  return avatarSVG(fake, size || 38);
}
