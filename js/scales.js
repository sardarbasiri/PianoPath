// ── SCALES.JS ─────────────────────────────────────────────────
//
// MUSIC THEORY USED:
// Each course covers one key signature and teaches 3 things:
//   1. MAJOR scale (e.g. C Major: C D E F G A B C)
//   2. RELATIVE NATURAL MINOR (starts on 6th degree of major)
//      e.g. A Natural Minor: A B C D E F G A
//   3. HARMONIC MINOR (natural minor + raised 7th)
//      e.g. A Harmonic Minor: A B C D E F G# A
//   4. MELODIC MINOR
//      ascending: raise 6th and 7th  → A B C D E F# G# A
//      descending: same as natural minor → A G F E D C B A
//
// "Natural", "Harmonic", "Melodic" tabs refer to the MINOR scales.
// "Major" is always shown via the Natural tab? No —
// Better UX: show Major scale under "Major" tab, minor variants under their tabs.
// So tabs = Major | Natural Minor | Harmonic Minor | Melodic Minor
//
// KEYBOARD DISPLAY:
// - Always rendered left (low) to right (high)
// - Shows ALL keys in the 2-octave range
// - Scale notes highlighted blue, currently playing highlighted gold
// - Descending = same keyboard but fingering/labels shown right-to-left
//   and playback moves right-to-left
//
// SEMITONES are offsets from MIDI 60 (C4).
// Negative = below C4.
 
// ── All 13 key signatures ─────────────────────────────────────
// For each: major scale + relative minor (natural, harmonic, melodic)
// Relative minor root = major root - 3 semitones (or +9)
//
// MAJOR SCALE PATTERN (semitone intervals): W W H W W W H = 2 2 1 2 2 2 1
// NATURAL MINOR PATTERN: W H W W H W W = 2 1 2 2 1 2 2
// HARMONIC MINOR: same but raise 7th by 1
// MELODIC MINOR ASC: same but raise 6th and 7th by 1; DESC = natural minor reversed
 
function buildMajor(root) {
  // root = semitone offset from C4
  const intervals = [0,2,4,5,7,9,11,12,14,16,17,19,21,23,24];
  return intervals.map(i => root + i);
}
 
function buildNaturalMinor(root) {
  // root = semitone offset of minor root
  const intervals = [0,2,3,5,7,8,10,12,14,15,17,19,20,22,24];
  return intervals.map(i => root + i);
}
 
function buildHarmonicMinor(root) {
  // raise 7th (index 6 and 13 in 15-note sequence)
  const nat = buildNaturalMinor(root);
  const harm = [...nat];
  harm[6]  += 1; // 7th of first octave
  harm[13] += 1; // 7th of second octave
  return harm;
}
 
function buildMelodicMinorAsc(root) {
  // raise 6th and 7th
  const nat = buildNaturalMinor(root);
  const mel = [...nat];
  mel[5]  += 1; mel[6]  += 1; // 6th and 7th of first octave
  mel[12] += 1; mel[13] += 1; // 6th and 7th of second octave
  return mel;
}
 
function buildMelodicMinorDesc(root) {
  // descending melodic = natural minor played high to low
  const nat = buildNaturalMinor(root);
  return [...nat].reverse();
}
 
// ── FINGERING DATA ─────────────────────────────────────────────
// Standard classical fingerings for 2-octave scales
// RH = right hand, LH = left hand, Asc = ascending, Desc = descending
// Format: array of 15 finger numbers (1=thumb ... 5=pinky)
 
const FINGERINGS = {
  // C, G, D, A, E, B major — all white-start standard fingering
  standard: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // F major starts on F (white but different thumb position)
  F: {
    majorRhAsc:  [1,2,3,4,1,2,3,1,2,3,4,1,2,3,4],
    majorRhDesc: [4,3,2,1,3,2,1,4,3,2,1,3,2,1,4],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [1,2,3,4,1,2,3,1,2,3,4,1,2,3,4],
    minorRhDesc: [4,3,2,1,3,2,1,4,3,2,1,3,2,1,4],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Bb major
  Bb: {
    majorRhAsc:  [4,1,2,3,1,2,3,4,1,2,3,1,2,3,4],
    majorRhDesc: [4,3,2,1,4,3,2,1,3,2,1,4,3,2,1],
    majorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Eb major
  Eb: {
    majorRhAsc:  [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    majorRhDesc: [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Ab major
  Ab: {
    majorRhAsc:  [3,4,1,2,3,1,2,3,4,1,2,3,1,2,3],
    majorRhDesc: [3,2,1,3,2,1,4,3,2,1,3,2,1,4,3],
    majorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Db major
  Db: {
    majorRhAsc:  [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
    majorRhDesc: [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    majorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhAsc:  [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
    minorRhDesc: [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    minorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    minorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
  },
  // Gb/F# major
  Gb: {
    majorRhAsc:  [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    majorRhDesc: [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    majorLhAsc:  [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    majorLhDesc: [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    minorRhAsc:  [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    minorRhDesc: [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    minorLhAsc:  [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    minorLhDesc: [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
  },
  // B major
  B: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    majorLhDesc: [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    minorLhDesc: [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
  },
};
 
// ── COURSE DEFINITIONS ─────────────────────────────────────────
// majorRoot = semitone offset from C4 for major scale start
// minorRoot = majorRoot + 9 (relative minor is 9 semitones above, or 3 below)
// useFlat = whether to use flat note names
 
const SCALE_COURSES = (function() {
  function course(title, majorRoot, minorRoot, useFlat, fingerKey) {
    const fk = FINGERINGS[fingerKey] || FINGERINGS.standard;
    return {
      title, majorRoot, minorRoot, useFlat,
      major:        buildMajor(majorRoot),
      naturalMinor: buildNaturalMinor(minorRoot),
      harmonicMinor:buildHarmonicMinor(minorRoot),
      melodicAsc:   buildMelodicMinorAsc(minorRoot),
      melodicDesc:  buildMelodicMinorDesc(minorRoot),
      majorRhAsc:   fk.majorRhAsc,  majorRhDesc: fk.majorRhDesc,
      majorLhAsc:   fk.majorLhAsc,  majorLhDesc: fk.majorLhDesc,
      minorRhAsc:   fk.minorRhAsc,  minorRhDesc: fk.minorRhDesc,
      minorLhAsc:   fk.minorLhAsc,  minorLhDesc: fk.minorLhDesc,
    };
  }
 
  // minorRoot for C major = A3 = C4 - 3 = -3
  // minorRoot for G major = E4 = G4 - 3 = 4  (wait: relative minor of G is Em, E4=+4? 
  //   G=7, E=4, so minorRoot = majorRoot - 3
  return [
    // Flats (easiest to hardest)
    course('C Major / A Minor',    0,  -3, false, 'standard'),
    course('F Major / D Minor',    5,   2, true,  'F'),
    course('B♭ Major / G Minor',  10,   7, true,  'Bb'),
    course('E♭ Major / C Minor',   3,   0, true,  'Eb'),
    course('A♭ Major / F Minor',   8,   5, true,  'Ab'),
    course('D♭ Major / B♭ Minor',  1,  -2, true,  'Db'),
    course('G♭ Major / E♭ Minor',  6,   3, true,  'Gb'),
    // Sharps (easiest to hardest)
    course('G Major / E Minor',    7,   4, false, 'standard'),
    course('D Major / B Minor',    2,  -1, false, 'standard'),
    course('A Major / F♯ Minor',   9,   6, false, 'standard'),
    course('E Major / C♯ Minor',   4,   1, false, 'standard'),
    course('B Major / G♯ Minor',  11,   8, false, 'B'),
    course('F♯ Major / D♯ Minor',  6,   3, false, 'Gb'),
  ];
})();
 
// ── NOTE NAME LOOKUP ───────────────────────────────────────────
const NOTE_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_FLAT  = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const BLACK_REL  = new Set([1,3,6,8,10]);
 
function isBlackKey(semi) {
  return BLACK_REL.has(((semi % 12) + 12) % 12);
}
 
function noteName(semi, useFlat) {
  const arr = useFlat ? NOTE_FLAT : NOTE_SHARP;
  return arr[((semi % 12) + 12) % 12];
}
 
function toItalian(name) {
  const m = {'C':'Do','D':'Re','E':'Mi','F':'Fa','G':'Sol','A':'La','B':'Si'};
  const base = name.replace(/[♭#♯]/g,'');
  const acc  = name.match(/[♭#♯]/) ? name.match(/[♭#♯]/)[0] : '';
  return (m[base] || base) + acc;
}
 
function displayName(semi, useFlat) {
  let n = noteName(semi, useFlat);
  if (selectedNaming === 'italian') n = toItalian(n);
  return n;
}
 
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
 
// ── STATE ──────────────────────────────────────────────────────
let scaleCourse    = 0;
let scaleTab       = 'major';   // 'major' | 'natural' | 'harmonic' | 'melodic'
let scaleDir       = 'asc';     // 'asc' | 'desc'
let scaleHand      = 'rh';      // 'rh' | 'lh'
let scaleHlIdx     = -1;        // index into current note sequence being highlighted
let scalePlayTimer = null;
 
// ── GET CURRENT NOTES SEQUENCE ─────────────────────────────────
function getCurrentNotes() {
  const c = SCALE_COURSES[scaleCourse];
  if (scaleTab === 'major') {
    return scaleDir === 'asc' ? c.major : [...c.major].reverse();
  }
  if (scaleTab === 'natural') {
    return scaleDir === 'asc' ? c.naturalMinor : [...c.naturalMinor].reverse();
  }
  if (scaleTab === 'harmonic') {
    return scaleDir === 'asc' ? c.harmonicMinor : [...c.harmonicMinor].reverse();
  }
  // melodic
  if (scaleDir === 'asc') return c.melodicAsc;
  return c.melodicDesc; // already built as desc (high to low)
}
 
// ── GET CURRENT FINGERING ──────────────────────────────────────
// Always returns fingering in ascending (spatial, low→high) order.
// For descending playback the highlight index is mirrored in buildScaleKeyboard.
function getCurrentFingering() {
  const c = SCALE_COURSES[scaleCourse];
  const rh = scaleHand === 'rh';
  const isMajor = scaleTab === 'major';
  return isMajor
    ? (rh ? c.majorRhAsc : c.majorLhAsc)
    : (rh ? c.minorRhAsc : c.minorLhAsc);
}
 
// ── KEYBOARD RANGE ─────────────────────────────────────────────
// Extend to white-key boundaries so boundary black keys always have
// their anchor white key in range and get rendered correctly.
function getKeyboardRange() {
  const notes = getCurrentNotes();
  let start = Math.min(...notes);
  let end   = Math.max(...notes);
  while (isBlackKey(start)) start--;
  while (isBlackKey(end))   end++;
  return { start, end };
}
 
// ── NAVIGATION ─────────────────────────────────────────────────
function goToScales() {
  showPage('page-scales-list');
  renderScalesList();
}
 
function openScaleCourse(idx) {
  scaleCourse    = idx;
  scaleTab       = 'major';
  scaleDir       = 'asc';
  scaleHand      = 'rh';
  scaleHlIdx     = -1;
  clearInterval(scalePlayTimer);
  showPage('page-scales-course');
  renderScaleCourse();
}
 
// ── RENDER COURSES LIST ────────────────────────────────────────
function renderScalesList() {
  const list = document.getElementById('scales-courses-list');
  list.innerHTML = '';
  SCALE_COURSES.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'course-card unlocked';
    card.innerHTML = `<div class="course-icon">🎵</div><div class="course-title">${c.title}</div>`;
    card.addEventListener('click', () => openScaleCourse(i));
    list.appendChild(card);
  });
}
 
// ── RENDER COURSE PAGE ─────────────────────────────────────────
function renderScaleCourse() {
  const c = SCALE_COURSES[scaleCourse];
  document.getElementById('scale-course-title').textContent = c.title;
 
  // Update tab active states
  document.querySelectorAll('.scale-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === scaleTab));
  document.querySelectorAll('.scale-dir-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.dir === scaleDir));
  document.querySelectorAll('.scale-hand-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.hand === scaleHand));
 
  buildScaleKeyboard();
}
 
// ── BUILD KEYBOARD ─────────────────────────────────────────────
function buildScaleKeyboard() {
  const c          = SCALE_COURSES[scaleCourse];
  const notes      = getCurrentNotes();       // 15 notes in play order
  const fingering  = getCurrentFingering();   // 15 finger numbers
  const { start, end } = getKeyboardRange();  // keyboard always low→high
  const useFlat    = c.useFlat;
  const baseMidi   = 60; // C4
 
  const container = document.getElementById('scale-keyboard-container');
  container.innerHTML = '';
 
  // Which semitones are in the current scale (for blue highlighting)
  const scaleSet = new Set(notes);
 
  // All keys in range low→high
  const allKeys = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
 
  const whiteKeys = allKeys.filter(s => !isBlackKey(s));
  const numW      = whiteKeys.length;
  const wPct      = 100 / numW; // width % per white key
 
  // ── Fingering row (above keyboard) ──
  // Always displayed in spatial (low→high) order so numbers sit above their keys.
  // For descending, mirror the highlight: playing note i means the key at
  // ascending-position (14-i) is active, so highlight span at (14-i).
  const fRow = document.createElement('div');
  fRow.className = 'scale-finger-display';
  const hlPos = scaleHlIdx < 0 ? -1
    : scaleDir === 'asc' ? scaleHlIdx
    : (notes.length - 1 - scaleHlIdx);
  for (let i = 0; i < notes.length; i++) {
    const sp = document.createElement('span');
    sp.className = 'scale-finger-num' + (i === hlPos ? ' highlighted' : '');
    sp.textContent = fingering[i];
    fRow.appendChild(sp);
  }
  container.appendChild(fRow);
 
  // ── Keyboard ──
  const kb = document.createElement('div');
  kb.className = 'scale-keyboard';
  kb.style.cssText = 'position:relative;width:100%;flex-shrink:0;';
 
  // Draw white keys
  whiteKeys.forEach((s, wi) => {
    const inScale = scaleSet.has(s);
    // Find if this semitone is the currently highlighted note
    const hlNote  = scaleHlIdx >= 0 ? notes[scaleHlIdx] : null;
    const isHl    = (s === hlNote);
    const freq    = midiToFreq(baseMidi + s);
 
    const el = document.createElement('div');
    el.className = 'scale-key-white' +
      (inScale ? ' in-scale' : '') +
      (isHl    ? ' highlighted' : '');
    el.style.cssText =
      `left:${wi * wPct}%;width:${wPct}%;` +
      `position:absolute;height:100%;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(freq));
    if (inScale) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHl ? ' highlighted' : '');
      lbl.textContent = displayName(s, useFlat);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });
 
  // Draw black keys — place between correct white keys
  // Strategy: for each white key, check if white+1 is black and in range
  whiteKeys.forEach((ws, wi) => {
    const blackSemi = ws + 1;
    // Check it's actually a black key and in our range
    if (!isBlackKey(blackSemi)) return;
    if (blackSemi < start || blackSemi > end) return;
    // Don't render if it would go beyond last white key
    if (wi >= numW - 1) return;
 
    const inScale = scaleSet.has(blackSemi);
    const hlNote  = scaleHlIdx >= 0 ? notes[scaleHlIdx] : null;
    const isHl    = (blackSemi === hlNote);
    const freq    = midiToFreq(baseMidi + blackSemi);
 
    const el = document.createElement('div');
    el.className = 'scale-key-black' +
      (inScale ? ' in-scale' : '') +
      (isHl    ? ' highlighted' : '');
    // Position: centered between this white key and next
    const leftPct  = (wi + 0.63) * wPct;
    const widthPct = wPct * 0.74;
    el.style.cssText =
      `left:${leftPct}%;width:${widthPct}%;` +
      `position:absolute;height:62%;top:0;z-index:2;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(freq));
    if (inScale) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHl ? ' highlighted' : '');
      lbl.textContent = displayName(blackSemi, useFlat);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });
 
  container.appendChild(kb);
 
  // ── Play button ──
  const btn = document.createElement('button');
  btn.className = 'scale-play-btn';
  btn.textContent = '▶ Play Scale';
  btn.addEventListener('click', playScaleAnim);
  container.appendChild(btn);
}
 
// ── PLAY ANIMATION ─────────────────────────────────────────────
function playScaleAnim() {
  clearInterval(scalePlayTimer);
  const notes    = getCurrentNotes();
  const baseMidi = 60;
  let idx = 0;
 
  scalePlayTimer = setInterval(() => {
    if (idx >= notes.length) {
      clearInterval(scalePlayTimer);
      scaleHlIdx = -1;
      buildScaleKeyboard();
      return;
    }
    scaleHlIdx = idx;
    playPiano(midiToFreq(baseMidi + notes[idx]));
    buildScaleKeyboard();
    idx++;
  }, 420);
}
 
// ── TAB SETTERS ────────────────────────────────────────────────
function setScaleMode(mode) {
  scaleTab = mode;
  scaleHlIdx = -1;
  clearInterval(scalePlayTimer);
  renderScaleCourse();
}
 
function setScaleDirection(dir) {
  scaleDir = dir;
  scaleHlIdx = -1;
  clearInterval(scalePlayTimer);
  renderScaleCourse();
}
 
function setScaleHand(hand) {
  scaleHand = hand;
  scaleHlIdx = -1;
  clearInterval(scalePlayTimer);
  renderScaleCourse();
}