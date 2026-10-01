/* BEQUEST — sound and haptics.

   Every cue is synthesised at play time with the Web Audio API. There are no
   audio files, deliberately: the game ships as one self-contained offline
   document, and a library of samples would have cost more bytes than the
   whole rest of the game put together. A cue is a short list of notes over a
   shaped envelope, which is also why any of them can be retuned by editing
   two numbers rather than opening an audio editor.

   The cues share a key — A minor pentatonic — so that a promotion, an
   achievement and a year turning sound like they belong to the same game
   rather than to three different asset packs.

   Nothing in here throws when there is no Web Audio, no audio device, or no
   window at all. The test suite runs in exactly that environment.          */

const NOTE = { A2:110.00, C3:130.81, D3:146.83, E3:164.81, G3:196.00,
               A3:220.00, C4:261.63, D4:293.66, E4:329.63, G4:392.00,
               A4:440.00, C5:523.25, D5:587.33, E5:659.25, G5:784.00,
               A5:880.00, C6:1046.50, E6:1318.51, G6:1567.98 };

/* n: [note, startOffset, length, gain, glideToNote?]  — times in seconds. */
const SFX = {
  /* the quiet furniture of the interface */
  tap:     { w:'triangle', g:0.055, n:[[NOTE.E5, 0,    0.035, 1]] },
  open:    { w:'sine',     g:0.075, n:[[NOTE.A4, 0,    0.07,  1], [NOTE.E5, 0.035, 0.09, 0.7]] },
  back:    { w:'sine',     g:0.065, n:[[NOTE.E5, 0,    0.07,  1], [NOTE.A4, 0.035, 0.09, 0.7]] },
  denied:  { w:'square',   g:0.070, n:[[NOTE.D3, 0,    0.10,  1], [NOTE.C3, 0.055, 0.13, 0.9]], noise:[0, 0.05, 0.25, 260] },

  /* the year, which is the game's heartbeat */
  year:    { w:'sine',     g:0.130, n:[[NOTE.A2, 0,    0.70,  1], [NOTE.E3, 0.02, 0.55, 0.55], [NOTE.A3, 0.06, 0.40, 0.30]] },
  event:   { w:'sine',     g:0.100, n:[[NOTE.C5, 0,    0.13,  1], [NOTE.G5, 0.075, 0.20, 0.6]] },

  /* outcomes */
  good:    { w:'triangle', g:0.105, n:[[NOTE.A4, 0,    0.10,  1], [NOTE.C5, 0.065, 0.10, 1], [NOTE.E5, 0.13, 0.22, 0.9]] },
  bad:     { w:'triangle', g:0.105, n:[[NOTE.E4, 0,    0.14,  1], [NOTE.C4, 0.08,  0.28, 0.9, NOTE.A3]] },
  moneyIn: { w:'triangle', g:0.085, n:[[NOTE.G5, 0,    0.06,  1], [NOTE.C6, 0.05,  0.14, 0.8]] },
  moneyOut:{ w:'triangle', g:0.080, n:[[NOTE.E4, 0,    0.07,  1], [NOTE.A3, 0.05,  0.16, 0.8]] },

  /* the moments worth looking up for */
  promote: { w:'triangle', g:0.115, n:[[NOTE.A4, 0,    0.09,  1], [NOTE.C5, 0.07, 0.09, 1],
                                       [NOTE.E5, 0.14, 0.09,  1], [NOTE.A5, 0.21, 0.34, 0.95]] },
  ach:     { w:'triangle', g:0.125, n:[[NOTE.C5, 0,    0.10,  1], [NOTE.E5, 0.08, 0.10, 1],
                                       [NOTE.G5, 0.16, 0.10,  1], [NOTE.C6, 0.24, 0.46, 0.95]] },
  egg:     { w:'sine',     g:0.090, n:[[NOTE.E6, 0,    0.05,  1], [NOTE.G6, 0.045, 0.05, 0.9],
                                       [NOTE.C6, 0.09, 0.05,  0.8], [NOTE.G6, 0.135, 0.28, 0.7]] },

  /* the end of it */
  death:   { w:'sine',     g:0.150, n:[[NOTE.A2, 0,    1.70,  1], [NOTE.E3, 0.35, 1.30, 0.42],
                                       [NOTE.C3, 0.80, 1.00,  0.30]] },
  born:    { w:'sine',     g:0.110, n:[[NOTE.A3, 0,    0.30,  1], [NOTE.E4, 0.16, 0.30, 0.7],
                                       [NOTE.A4, 0.32, 0.55,  0.6]] }
};

/* ---- settings ---- */
function soundCfg(){
  META.sfx = META.sfx || {};
  if(META.sfx.on == null) META.sfx.on = true;
  if(META.sfx.haptics == null) META.sfx.haptics = true;
  if(META.sfx.vol == null) META.sfx.vol = 0.7;
  return META.sfx;
}
function soundOn(){ return !!soundCfg().on; }
function hapticsOn(){ return !!soundCfg().haptics; }
function setSound(on){ soundCfg().on = !!on; saveMeta(); if(on){ audioResume(); sfx('open'); } renderAll(); }
function setHaptics(on){ soundCfg().haptics = !!on; saveMeta(); if(on) haptic('light'); renderAll(); }
function setVolume(v){
  soundCfg().vol = Math.max(0, Math.min(1, v)); saveMeta();
  if(MASTER && AC) MASTER.gain.setTargetAtTime(soundCfg().vol, AC.currentTime, 0.01);
  sfx('tap'); renderAll();
}

/* ---- engine ---- */
let AC = null, MASTER = null, AUDIO_DEAD = false;
function audioCtx(){
  if(AC || AUDIO_DEAD) return AC;
  const W = (typeof window !== 'undefined') ? window : null;
  const Ctor = W && (W.AudioContext || W.webkitAudioContext);
  if(!Ctor){ AUDIO_DEAD = true; return null; }
  try{
    AC = new Ctor();
    MASTER = AC.createGain();
    MASTER.gain.value = soundCfg().vol;
    MASTER.connect(AC.destination);
  }catch(e){ AUDIO_DEAD = true; AC = null; }
  return AC;
}
/* Browsers will not start audio until the player has touched something, so
   the context is created and unlocked on the first gesture and never again. */
function audioResume(){
  const ac = audioCtx();
  if(ac && ac.state === 'suspended'){ try{ ac.resume(); }catch(e){} }
  return ac;
}
function tone(t0, hz, len, gain, wave, glide){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = wave || 'sine';
  o.frequency.setValueAtTime(hz, t0);
  if(glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + len);
  const peak = Math.max(0.0001, gain);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + Math.min(0.012, len * 0.3));   // attack
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);                   // decay
  o.connect(g); g.connect(MASTER);
  o.start(t0); o.stop(t0 + len + 0.03);
}
function noiseBurst(t0, at, len, gain, hz){
  const n = Math.max(1, Math.floor(AC.sampleRate * len));
  const buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
  for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = AC.createBufferSource(); src.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = hz || 600; f.Q.value = 1.2;
  const g = AC.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(MASTER);
  src.start(t0 + at);
}
/* The one entry point. Safe to call anywhere, at any time, on any device. */
function sfx(id){
  if(!soundOn()) return false;
  const cue = SFX[id];
  if(!cue) return false;
  const ac = audioResume();
  if(!ac || ac.state !== 'running') return false;
  try{
    const t0 = ac.currentTime + 0.001;
    cue.n.forEach(([hz, at, len, vol, glide]) => tone(t0 + at, hz, len, cue.g * (vol == null ? 1 : vol), cue.w, glide));
    if(cue.noise) noiseBurst(t0, cue.noise[0], cue.noise[1], cue.g * cue.noise[2], cue.noise[3]);
  }catch(e){ return false; }
  return true;
}

/* ---- haptics ----
   Capacitor's plugin on a real device, the vibration API in a browser, and
   silence anywhere else. */
const HAPTIC = { light:12, medium:22, heavy:38, year:[0, 14, 40, 22], death:[0, 60, 90, 120], denied:[0, 18, 45, 18] };
function haptic(kind){
  if(!hapticsOn()) return false;
  const pattern = HAPTIC[kind];
  if(pattern == null) return false;
  const W = (typeof window !== 'undefined') ? window : null;
  const cap = W && W.Capacitor && W.Capacitor.Plugins && W.Capacitor.Plugins.Haptics;
  try{
    if(cap){
      if(Array.isArray(pattern)) cap.vibrate({ duration: pattern.reduce((a, b) => a + b, 0) });
      else cap.impact({ style: kind === 'heavy' ? 'HEAVY' : kind === 'medium' ? 'MEDIUM' : 'LIGHT' });
      return true;
    }
    const nav = (typeof navigator !== 'undefined') ? navigator : null;
    if(nav && nav.vibrate){ nav.vibrate(pattern); return true; }
  }catch(e){}
  return false;
}
/* Both at once, which is what almost every call site actually wants. */
function cue(id, h){ const a = sfx(id); const b = haptic(h || 'light'); return a || b; }

/* ---- the interface's own voice ----
   One quiet tick on any button that does not already make a noise of its
   own, bound once at the document level so nothing else has to think
   about it. */
const TAP_MOVE = 10;
function bindTapSounds(){
  const D = (typeof document !== 'undefined') ? document : null;
  if(!D || !D.addEventListener) return;
  let gesture = null;
  D.addEventListener('pointerdown', e => {
    audioResume();                                   // unlocks audio on gesture one
    const el = e.target && e.target.closest && e.target.closest('button,.row,.choice');
    gesture = el && !el.dataset.noSfx ? { el, x:e.clientX, y:e.clientY, moved:false } : null;
  }, { passive: true });
  D.addEventListener('pointermove', e => {
    if(gesture && (Math.abs(e.clientX-gesture.x)>TAP_MOVE || Math.abs(e.clientY-gesture.y)>TAP_MOVE))
      gesture.moved = true;
  }, { passive: true });
  D.addEventListener('pointercancel', () => { gesture=null; }, { passive:true });
  D.addEventListener('pointerup', e => {
    const g=gesture; gesture=null;
    if(!g || g.moved || !(g.el===e.target || (g.el.contains&&g.el.contains(e.target)))) return;
    sfx('tap'); haptic('light');
  }, { passive: true });
}
