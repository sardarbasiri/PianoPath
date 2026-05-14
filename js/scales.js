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
  // D major / B minor — B minor LH needs thumb on E & A, not F# (black)
  D: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [4,3,2,1,3,2,1,4,3,2,1,3,2,1,4],
    minorLhDesc: [4,1,2,3,1,2,3,4,1,2,3,1,2,3,4],
  },
  // E major / C# minor — C# minor starts on black key, needs thumb on E & B
  E: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
    minorRhDesc: [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    minorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    minorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
  },
  // F major starts on F (white but different thumb position)
  F: {
    majorRhAsc:  [1,2,3,4,1,2,3,1,2,3,4,1,2,3,4],
    majorRhDesc: [4,3,2,1,4,3,2,1,3,2,1,4,3,2,1],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Bb major
  Bb: {
    majorRhAsc:  [4,1,2,3,1,2,3,4,1,2,3,1,2,3,4],
    majorRhDesc: [4,3,2,1,3,2,1,4,3,2,1,3,2,1,4],
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
    minorRhAsc:  [1,2,3,4,1,2,3,1,2,3,4,1,2,3,4],
    minorRhDesc: [4,3,2,1,4,3,2,1,3,2,1,4,3,2,1],
    minorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    minorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
  },
  // Db major
  Db: {
    majorRhAsc:  [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
    majorRhDesc: [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    majorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    majorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhAsc:  [4,1,2,3,1,2,3,4,1,2,3,1,2,3,4],
    minorRhDesc: [4,3,2,1,3,2,1,4,3,2,1,3,2,1,4],
    minorLhAsc:  [2,1,3,2,1,4,3,2,1,3,2,1,4,3,2],
    minorLhDesc: [2,3,4,1,2,3,1,2,3,4,1,2,3,1,2],
  },
  // Gb/F# major
  Gb: {
    majorRhAsc:  [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    majorRhDesc: [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    majorLhAsc:  [4,3,2,1,4,3,2,1,4,3,2,1,4,3,2],
    majorLhDesc: [2,3,4,1,2,3,4,1,2,3,4,1,2,3,4],
    minorRhAsc:  [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
    minorRhDesc: [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    minorLhAsc:  [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    minorLhDesc: [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
  },
  // B major / G# minor — B major LH thumb on B&E (white); G# minor starts on black, thumbs on B&E only
  B: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [4,3,2,1,4,3,2,1,3,2,1,4,3,2,1],
    majorLhDesc: [1,2,3,4,1,2,3,1,2,3,4,1,2,3,4],
    minorRhAsc:  [3,4,1,2,3,1,2,3,4,1,2,3,1,2,3],
    minorRhDesc: [3,2,1,3,2,1,4,3,2,1,3,2,1,4,3],
    minorLhAsc:  [3,2,1,3,2,1,4,3,2,1,3,2,1,4,3],
    minorLhDesc: [3,4,1,2,3,1,2,3,4,1,2,3,1,2,3],
  },
  // A major (standard) / F# minor (starts on black key F#)
  // RH: thumb-under on A (3rd note), then repeats; starts on finger 2
  // LH: starts on finger 4, thumb-over on B, repeats every 4 notes
  FshMin: {
    majorRhAsc:  [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    majorRhDesc: [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhAsc:  [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1],
    majorLhDesc: [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5],
    minorRhAsc:  [2,3,1,2,3,4,1,2,3,1,2,3,4,1,2],
    minorRhDesc: [2,1,4,3,2,1,3,2,1,4,3,2,1,3,2],
    minorLhAsc:  [3,2,1,4,3,2,1,3,2,1,4,3,2,1,3],
    minorLhDesc: [3,1,2,3,4,1,2,3,1,2,3,4,1,2,3],
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
    course('D Major / B Minor',    2,  -1, false, 'D'),
    course('A Major / F♯ Minor',   9,   6, false, 'FshMin'),
    course('E Major / C♯ Minor',   4,   1, false, 'E'),
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

function localizeScaleTitle(title) {
  if (selectedNaming === 'american') return title;
  const m = {'C':'Do','D':'Re','E':'Mi','F':'Fa','G':'Sol','A':'La','B':'Si'};
  return title.replace(/\b([A-G])([♭♯#]?)/g, (_, n, acc) => (m[n] || n) + acc);
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
let scalePracticeMode = false;
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
// Always returns fingering in spatial (low→high) order.
// For descending, the desc array (in high→low play order) is reversed to spatial order.
function getCurrentFingering() {
  const c = SCALE_COURSES[scaleCourse];
  const rh = scaleHand === 'rh';
  const isMajor = scaleTab === 'major';
  if (scaleDir === 'asc') {
    return isMajor
      ? (rh ? c.majorRhAsc : c.majorLhAsc)
      : (rh ? c.minorRhAsc : c.minorLhAsc);
  } else {
    const desc = isMajor
      ? (rh ? c.majorRhDesc : c.majorLhDesc)
      : (rh ? c.minorRhDesc : c.minorLhDesc);
    return [...desc].reverse(); // reverse from play-order to spatial low→high order
  }
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
    card.innerHTML = `<div class="course-icon">${scalePracticeMode ? '🎯' : '🎵'}</div><div class="course-title">${localizeScaleTitle(c.title)}</div>`;
    card.addEventListener('click', () => {
      if (scalePracticeMode) {
        scalePracticeMode = false;
        startScalePractice(i);
      } else {
        openScaleCourse(i);
      }
    });
    list.appendChild(card);
  });
}
 
// ── RENDER COURSE PAGE ─────────────────────────────────────────
function renderScaleCourse() {
  const c = SCALE_COURSES[scaleCourse];
  document.getElementById('scale-course-title').textContent = localizeScaleTitle(c.title);
 
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

  // Pre-build white-key index lookup for O(1) position calculation
  const whiteKeyIdx = {};
  whiteKeys.forEach((s, i) => { whiteKeyIdx[s] = i; });

  // Spatial (low→high) order of scale notes — needed for finger positioning
  const spatialNotes = scaleDir === 'asc' ? notes : [...notes].reverse();

  // ── Fingering row (above keyboard) ──
  // Each number is absolutely positioned above its actual key.
  // hlPos maps the current playback index to the spatial (low→high) index.
  const hlPos = scaleHlIdx < 0 ? -1
    : scaleDir === 'asc' ? scaleHlIdx
    : (notes.length - 1 - scaleHlIdx);

  const fRow = document.createElement('div');
  fRow.className = 'scale-finger-display';
  fRow.style.cssText = 'position:relative;display:block;min-height:1.2em;';

  for (let i = 0; i < spatialNotes.length; i++) {
    const s = spatialNotes[i];
    let centerPct;
    if (!isBlackKey(s)) {
      centerPct = (whiteKeyIdx[s] + 0.5) * wPct;
    } else {
      // Black key rendered at (wi+0.63)*wPct, width 0.74*wPct → center = (wi+1.0)*wPct
      centerPct = (whiteKeyIdx[s - 1] + 1.0) * wPct;
    }
    const sp = document.createElement('span');
    sp.className = 'scale-finger-num' + (i === hlPos ? ' highlighted' : '');
    sp.textContent = fingering[i];
    sp.style.cssText = `position:absolute;left:${centerPct}%;transform:translateX(-50%);`;
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
 
  // ── Buttons ──
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:0.5rem;justify-content:center;margin:0.3rem auto 0;flex-shrink:0;';

  const playBtn = document.createElement('button');
  playBtn.className = 'scale-play-btn';
  playBtn.style.margin = '0';
  playBtn.textContent = '▶ Play Scale';
  playBtn.addEventListener('click', playScaleAnim);

  const practBtn = document.createElement('button');
  practBtn.className = 'scale-play-btn';
  practBtn.style.margin = '0';
  practBtn.textContent = '🎯 Practice';
  practBtn.addEventListener('click', () => startScalePractice(scaleCourse));

  btnRow.appendChild(playBtn);
  btnRow.appendChild(practBtn);
  container.appendChild(btnRow);
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

// ── PRACTICE MODE ──────────────────────────────────────────────

let spCourse    = 0;
let spMode      = 'major';
let spDir       = 'asc';
let spHand      = 'rh';
let spNoteIdx   = 0;     // next note to play (play-order index 0–14)
let spErrors    = 0;
let spWrongKey  = null;  // semitone of last incorrect key pressed
let spWaiting   = false; // blocks rapid wrong-key spam
let spCompleted = false;

function getSpNotes() {
  const c = SCALE_COURSES[spCourse];
  if (spMode === 'major')    return spDir === 'asc' ? c.major         : [...c.major].reverse();
  if (spMode === 'natural')  return spDir === 'asc' ? c.naturalMinor  : [...c.naturalMinor].reverse();
  if (spMode === 'harmonic') return spDir === 'asc' ? c.harmonicMinor : [...c.harmonicMinor].reverse();
  return spDir === 'asc' ? c.melodicAsc : c.melodicDesc;
}

// Returns fingering in spatial (low→high) order, same as getCurrentFingering()
function getSpFingering() {
  const c    = SCALE_COURSES[spCourse];
  const rh   = spHand === 'rh';
  const isMaj = spMode === 'major';
  if (spDir === 'asc') {
    return isMaj ? (rh ? c.majorRhAsc : c.majorLhAsc) : (rh ? c.minorRhAsc : c.minorLhAsc);
  }
  const desc = isMaj ? (rh ? c.majorRhDesc : c.majorLhDesc) : (rh ? c.minorRhDesc : c.minorLhDesc);
  return [...desc].reverse();
}

function getSpRange() {
  const notes = getSpNotes();
  let start = Math.min(...notes);
  let end   = Math.max(...notes);
  while (isBlackKey(start)) start--;
  while (isBlackKey(end))   end++;
  return { start, end };
}

function startScalePractice(courseIdx) {
  spCourse    = courseIdx;
  spMode      = scaleTab;  // inherit current learn-mode settings
  spDir       = scaleDir;
  spHand      = scaleHand;
  spNoteIdx   = 0;
  spErrors    = 0;
  spWrongKey  = null;
  spWaiting   = false;
  spCompleted = false;
  clearInterval(scalePlayTimer);
  scaleHlIdx = -1;
  showPage('page-scales-practice');
  renderSpPage();
}

function renderSpPage() {
  const c = SCALE_COURSES[spCourse];
  document.getElementById('sp-title').textContent = localizeScaleTitle(c.title);

  document.querySelectorAll('[data-sp-mode]').forEach(b =>
    b.classList.toggle('active', b.dataset.spMode === spMode));
  document.querySelectorAll('[data-sp-dir]').forEach(b =>
    b.classList.toggle('active', b.dataset.spDir === spDir));
  document.querySelectorAll('[data-sp-hand]').forEach(b =>
    b.classList.toggle('active', b.dataset.spHand === spHand));

  buildSpContainer();
}

function buildSpContainer() {
  const container = document.getElementById('sp-container');
  container.innerHTML = '';

  const notes     = getSpNotes();
  const fingering = getSpFingering();
  const c         = SCALE_COURSES[spCourse];

  if (spCompleted) {
    renderSpCompletion(container, notes);
    return;
  }

  // Play-order index → spatial (low→high) index
  const spatialIdx   = spDir === 'asc' ? spNoteIdx : (notes.length - 1 - spNoteIdx);
  const currentNote  = notes[spNoteIdx];
  const currentFinger = fingering[spatialIdx];

  // Spatial (low→high) order for key/finger rendering
  const spatialNotes = spDir === 'asc' ? notes : [...notes].reverse();

  // Progress badge
  document.getElementById('sp-progress').textContent = `${spNoteIdx + 1} / ${notes.length}`;

  // ── Info row: finger circle + note name ──
  const infoRow = document.createElement('div');
  infoRow.className = 'sp-info-row';

  const circle = document.createElement('div');
  circle.className = 'sp-finger-circle';
  circle.textContent = currentFinger;

  const noteInfo = document.createElement('div');
  noteInfo.className = 'sp-note-info';
  noteInfo.innerHTML =
    `<span class="sp-note-label">${spHand === 'rh' ? 'Right Hand' : 'Left Hand'} — finger</span>` +
    `<span class="sp-note-name">${displayName(currentNote, c.useFlat)}</span>`;

  infoRow.appendChild(circle);
  infoRow.appendChild(noteInfo);
  container.appendChild(infoRow);

  // ── Keyboard layout helpers ──
  const { start, end } = getSpRange();
  const allKeys  = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
  const whiteKeys = allKeys.filter(s => !isBlackKey(s));
  const numW      = whiteKeys.length;
  const wPct      = 100 / numW;
  const wkIdx     = {};
  whiteKeys.forEach((s, i) => { wkIdx[s] = i; });

  // ── Finger number row ──
  const fRow = document.createElement('div');
  fRow.className = 'scale-finger-display';
  fRow.style.cssText = 'position:relative;display:block;min-height:1.4em;width:100%;max-width:700px;margin:0 auto;';

  for (let i = 0; i < spatialNotes.length; i++) {
    const s = spatialNotes[i];
    let ctrPct;
    if (!isBlackKey(s)) {
      ctrPct = (wkIdx[s] + 0.5) * wPct;
    } else {
      ctrPct = (wkIdx[s - 1] + 1.0) * wPct;
    }

    // Determine if this spatial note is done / current / upcoming
    const playIdx = spDir === 'asc' ? i : (notes.length - 1 - i);
    let cls = 'scale-finger-num';
    if (i === spatialIdx)      cls += ' sp-finger-current';
    else if (playIdx < spNoteIdx) cls += ' sp-finger-done';
    else                          cls += ' sp-finger-upcoming';

    const sp = document.createElement('span');
    sp.className = cls;
    sp.textContent = fingering[i];
    sp.style.cssText = `position:absolute;left:${ctrPct}%;transform:translateX(-50%);`;
    fRow.appendChild(sp);
  }
  container.appendChild(fRow);

  // ── Piano keyboard ──
  const scaleSet = new Set(notes);
  const kb = document.createElement('div');
  kb.className = 'scale-keyboard';
  kb.style.cssText = 'position:relative;width:100%;flex-shrink:0;';

  function makeKey(s, leftPct, widthPct, heightPct, isBlack) {
    const inScale  = scaleSet.has(s);
    const isCurrent = s === currentNote && spWrongKey === null;
    const isWrong   = s === spWrongKey;
    const isHint    = spWrongKey !== null && s === currentNote;

    const el = document.createElement('div');
    el.className = (isBlack ? 'scale-key-black' : 'scale-key-white') +
      (inScale   ? ' in-scale'        : '') +
      (isCurrent ? ' sp-key-current'  : '') +
      (isWrong   ? ' sp-key-wrong'    : '') +
      (isHint    ? ' sp-key-hint'     : '');

    const zIdx = isBlack ? 2 : (inScale ? 1 : 0);
    el.style.cssText =
      `left:${leftPct}%;width:${widthPct}%;position:absolute;` +
      `height:${heightPct}%;top:0;z-index:${zIdx};box-sizing:border-box;`;
    el.addEventListener('click', () => spHandleClick(s));

    if (inScale) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHint || isCurrent ? ' highlighted' : '');
      lbl.textContent = displayName(s, c.useFlat);
      el.appendChild(lbl);
    }
    return el;
  }

  whiteKeys.forEach((s, wi) => {
    kb.appendChild(makeKey(s, wi * wPct, wPct, 100, false));
  });

  whiteKeys.forEach((ws, wi) => {
    const s = ws + 1;
    if (!isBlackKey(s) || s < start || s > end || wi >= numW - 1) return;
    kb.appendChild(makeKey(s, (wi + 0.63) * wPct, wPct * 0.74, 62, true));
  });

  container.appendChild(kb);

  // ── Progress dots ──
  const dotsRow = document.createElement('div');
  dotsRow.className = 'sp-progress-dots';
  for (let i = 0; i < notes.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'sp-dot' +
      (i < spNoteIdx  ? ' done'    : '') +
      (i === spNoteIdx ? ' current' : '');
    dotsRow.appendChild(dot);
  }
  container.appendChild(dotsRow);

  // ── Feedback text ──
  const fb = document.createElement('div');
  fb.className = 'sp-feedback';
  if (spWrongKey !== null) {
    fb.innerHTML =
      `<span class="sp-feedback-wrong">✗ You pressed <strong>${displayName(spWrongKey, c.useFlat)}</strong>` +
      ` — the correct note is <strong>${displayName(currentNote, c.useFlat)}</strong> (finger ${currentFinger})</span>`;
  } else if (spNoteIdx === 0) {
    fb.innerHTML = `<span class="sp-feedback-hint">Tap the glowing key to start</span>`;
  } else {
    fb.textContent = '';
  }
  container.appendChild(fb);
}

function spHandleClick(semi) {
  if (spCompleted) return;

  const notes    = getSpNotes();
  const expected = notes[spNoteIdx];
  const baseMidi = 60;

  if (semi === expected) {
    // Correct — always process even if a wrong-key timeout is pending
    spWrongKey  = null;
    spWaiting   = false;
    playPiano(midiToFreq(baseMidi + semi));
    spNoteIdx++;
    if (spNoteIdx >= notes.length) spCompleted = true;

    // Bounce the finger circle briefly then rebuild
    buildSpContainer();
    const circle = document.querySelector('.sp-finger-circle');
    if (circle) {
      circle.classList.add('changed');
      setTimeout(() => circle.classList.remove('changed'), 200);
    }
  } else {
    // Wrong key
    if (spWaiting) return;
    spErrors++;
    spWrongKey = semi;
    spWaiting  = true;
    playPiano(midiToFreq(baseMidi + semi));
    buildSpContainer();
    setTimeout(() => {
      if (spWrongKey === semi) {
        spWrongKey = null;
        spWaiting  = false;
        buildSpContainer();
      }
    }, 1800);
  }
}

function renderSpCompletion(container, notes) {
  document.getElementById('sp-progress').textContent = '✓ Done';

  const errClass = spErrors === 0 ? 'sp-stat-good' : spErrors <= 4 ? 'sp-stat-warn' : 'sp-stat-err';
  const msg = spErrors === 0
    ? 'Perfect run — no mistakes!'
    : spErrors <= 3 ? 'Great job! Nearly flawless.'
    : spErrors <= 7 ? 'Good practice. Try again for a clean run!'
    : 'Keep at it — repetition builds muscle memory.';

  const panel = document.createElement('div');
  panel.className = 'sp-completion';
  panel.innerHTML =
    `<div class="sp-completion-icon">🎉</div>` +
    `<div class="sp-completion-title">Scale Complete!</div>` +
    `<div class="sp-completion-stats">` +
      `<span class="sp-stat-good">✓ ${notes.length} notes</span>` +
      `<span class="${errClass}">${spErrors === 0 ? '✓' : '✗'} ${spErrors} error${spErrors !== 1 ? 's' : ''}</span>` +
    `</div>` +
    `<div class="sp-completion-msg">${msg}</div>`;

  const btnRow = document.createElement('div');
  btnRow.className = 'sp-completion-btns';

  const againBtn = document.createElement('button');
  againBtn.textContent = '↺ Practice Again';
  againBtn.addEventListener('click', () => {
    spNoteIdx   = 0;
    spErrors    = 0;
    spWrongKey  = null;
    spWaiting   = false;
    spCompleted = false;
    buildSpContainer();
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Scale';
  backBtn.addEventListener('click', () => showPage('page-scales-course'));

  btnRow.appendChild(againBtn);
  btnRow.appendChild(backBtn);
  panel.appendChild(btnRow);
  container.appendChild(panel);
}

function spReset() {
  spNoteIdx   = 0;
  spErrors    = 0;
  spWrongKey  = null;
  spWaiting   = false;
  spCompleted = false;
}