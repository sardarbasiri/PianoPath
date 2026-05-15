// ── CHORDS.JS ──────────────────────────────────────────────────────
// Chord learn mode: 12 keys × 9 chord types × inversions.
// Reuses isBlackKey / displayName / midiToFreq / playPiano from scales.js / core.js.

const CHORD_TYPES = [
  { id:'major', label:'Major',      fullLabel:'Major',          symbol:'',     intervals:[0,4,7],    degrees:[0,2,4],   seventh:false },
  { id:'minor', label:'Minor',      fullLabel:'Minor',          symbol:'m',    intervals:[0,3,7],    degrees:[0,2,4],   seventh:false },
  { id:'dim',   label:'Dim',        fullLabel:'Diminished',     symbol:'°',    intervals:[0,3,6],    degrees:[0,2,4],   seventh:false },
  { id:'aug',   label:'Aug',        fullLabel:'Augmented',      symbol:'+',    intervals:[0,4,8],    degrees:[0,2,4],   seventh:false },
  { id:'maj7',  label:'Maj7',       fullLabel:'Major 7th',      symbol:'maj7', intervals:[0,4,7,11], degrees:[0,2,4,6], seventh:true  },
  { id:'dom7',  label:'Dom7',       fullLabel:'Dominant 7th',   symbol:'7',    intervals:[0,4,7,10], degrees:[0,2,4,6], seventh:true  },
  { id:'min7',  label:'Min7',       fullLabel:'Minor 7th',      symbol:'m7',   intervals:[0,3,7,10], degrees:[0,2,4,6], seventh:true  },
  { id:'hdim',  label:'Half-Dim',   fullLabel:'Half-Dim 7th',   symbol:'ø7',   intervals:[0,3,6,10], degrees:[0,2,4,6], seventh:true  },
  { id:'dim7',  label:'Dim7',       fullLabel:'Diminished 7th', symbol:'°7',   intervals:[0,3,6,9],  degrees:[0,2,4,6], seventh:true  },
];

const CHORD_ROOTS = [
  { root:0,  name:'C',  useFlat:false },
  { root:1,  name:'D♭', useFlat:true  },
  { root:2,  name:'D',  useFlat:false },
  { root:3,  name:'E♭', useFlat:true  },
  { root:4,  name:'E',  useFlat:false },
  { root:5,  name:'F',  useFlat:true  },
  { root:6,  name:'F♯', useFlat:false },
  { root:7,  name:'G',  useFlat:false },
  { root:8,  name:'A♭', useFlat:true  },
  { root:9,  name:'A',  useFlat:false },
  { root:10, name:'B♭', useFlat:true  },
  { root:11, name:'B',  useFlat:false },
];

// ── Theoretical note spelling ────────────────────────────────────────
// Maps letter → (index into diatonic sequence, natural semitone)
const CHORD_LETTERS      = ['C','D','E','F','G','A','B'];
const CHORD_NATURAL_SEMI = [ 0,  2,  4,  5,  7,  9, 11];

// Returns the correctly-spelled note name for a chord tone, given:
//   rootSemi    – root semitone (0-11, C=0)
//   rootUseFlat – whether the root uses flat nomenclature
//   noteSemi    – the note's semitone (any octave; normalised internally)
//   degreeOffset – 0=unison 1=2nd 2=3rd 3=4th 4=5th 5=6th 6=7th
// Returns null when the result would need a double sharp/flat (caller falls back).
function spellChordNote(rootSemi, rootUseFlat, noteSemi, degreeOffset) {
  const rs   = ((rootSemi % 12) + 12) % 12;
  const rn   = rootUseFlat ? NOTE_FLAT[rs] : NOTE_SHARP[rs];
  const rIdx = CHORD_LETTERS.indexOf(rn[0]);

  const tIdx   = (rIdx + degreeOffset) % 7;
  const tLtr   = CHORD_LETTERS[tIdx];
  const tNatSm = CHORD_NATURAL_SEMI[tIdx];
  const actual = ((noteSemi % 12) + 12) % 12;

  let diff = actual - tNatSm;
  if (diff >  6) diff -= 12;
  if (diff < -6) diff += 12;

  if      (diff ===  0) return tLtr;
  else if (diff ===  1) return tLtr + '#';
  else if (diff === -1) return tLtr + '♭';
  return null; // double sharp/flat — skip and use fallback
}

// Public helper used by rendering functions.
// Returns the theoretically-correct display name for a chord note.
// Falls back to displayName() for unusual enharmonics (double sharps/flats).
function chordNoteDisplayName(rootData, type, noteSemi) {
  const normNote = ((noteSemi % 12) + 12) % 12;
  const normRoot = ((rootData.root % 12) + 12) % 12;

  for (let i = 0; i < type.intervals.length; i++) {
    if ((normRoot + type.intervals[i]) % 12 === normNote) {
      const raw = spellChordNote(normRoot, rootData.useFlat, normNote, type.degrees[i]);
      if (raw !== null) {
        return selectedNaming === 'italian' ? toItalian(raw) : raw;
      }
      break;
    }
  }
  return displayName(noteSemi, rootData.useFlat);
}

// ── State ────────────────────────────────────────────────────────────
let chordRoot         = 0;
let chordTypeIdx      = 0;
let chordInversion    = 0;
let chordHand         = 'rh';
let chordPlayTimer    = null;
let chordPracticeMode = false;

// ── Build notes (semitone offsets from C4) ───────────────────────────
function buildChordNotes(root, intervals, inversionIndex) {
  const notes = intervals.map(i => root + i);
  for (let i = 0; i < inversionIndex; i++) {
    const bottom = notes.shift();
    notes.push(bottom + 12);
  }
  return notes;
}

// ── Standard fingering ───────────────────────────────────────────────
// Returns array of finger numbers (1=thumb…5=pinky) in low→high order,
// matching the notes array.
//
// Rules use black-key pattern of the actual notes for each inversion:
//   b[0] = bottom note black?  b[n-1] = top note black?
//
// RH triads:
//   Root pos  – white root: 1-3-5 | black root: 2-3-5 | all-black: 2-3-4
//   1st inv   – white top:  1-2-5 | black top:  1-2-4
//   2nd inv   – white btm:  1-3-5 | black btm:  2-3-5
//
// LH triads (mirror logic):
//   Root pos  – white root: 5-3-1 | black root: 4-2-1 | all-black: 3-2-1
//   1st inv   – white btm:  5-4-1 | black btm:  4-3-1
//   2nd inv   – white btm:  5-2-1 | black btm:  4-2-1
//
// 7th chords (alternating open/closed voicing pattern per inversion):
//   RH: root=1-2-3-5, 1st=1-2-4-5, 2nd=1-2-3-5, 3rd=1-2-4-5
//   LH: root=5-3-2-1, 1st=5-4-3-1, 2nd=5-4-2-1, 3rd=5-4-3-1
function getChordFingering(notes, hand, invIdx, isSeventh) {
  const b  = notes.map(n => isBlackKey(n));
  const rh = hand === 'rh';
  const n  = notes.length;

  if (!isSeventh) {
    if (rh) {
      if (invIdx === 0) {
        if (b[0] && b[1] && b[2]) return [2,3,4];
        if (b[0])                  return [2,3,5];
        return [1,3,5];
      }
      if (invIdx === 1) return b[n-1] ? [1,2,4] : [1,2,5];
      /* 2nd inv */ return b[0] ? [2,3,5] : [1,3,5];
    } else {
      if (invIdx === 0) {
        if (b[0] && b[1] && b[2]) return [3,2,1];
        if (b[0])                  return [4,2,1];
        return [5,3,1];
      }
      if (invIdx === 1) return b[0] ? [4,3,1] : [5,4,1];
      /* 2nd inv */ return b[0] ? [4,2,1] : [5,2,1];
    }
  } else {
    if (rh) {
      return [[1,2,3,5],[1,2,4,5],[1,2,3,5],[1,2,4,5]][invIdx] || [1,2,3,5];
    } else {
      return [[5,3,2,1],[5,4,3,1],[5,4,2,1],[5,4,3,1]][invIdx] || [5,3,2,1];
    }
  }
}

// ── Keyboard range ───────────────────────────────────────────────────
function getChordRange(notes) {
  let start = Math.min(...notes) - 2;
  let end   = Math.max(...notes) + 2;
  while (isBlackKey(start)) start--;
  while (isBlackKey(end))   end++;
  return { start, end };
}

// ── Root name localization ───────────────────────────────────────────
function localizeChordRootName(r) {
  if (selectedNaming !== 'italian') return r.name;
  const m = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
  return r.name.replace(/^([A-G])/, (_, n) => m[n] || n);
}

// ── Navigation ───────────────────────────────────────────────────────
function goToChords() {
  showPage('page-chords-list');
  renderChordsList();
}

function openChordCourse(idx) {
  chordRoot      = idx;
  chordTypeIdx   = 0;
  chordInversion = 0;
  chordHand      = 'rh';
  clearInterval(chordPlayTimer);
  showPage('page-chords-course');
  renderChordCourse();
}

// ── Render list ──────────────────────────────────────────────────────
function renderChordsList() {
  const list = document.getElementById('chords-courses-list');
  list.innerHTML = '';
  CHORD_ROOTS.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'course-card unlocked';
    card.innerHTML =
      `<div class="course-icon">${chordPracticeMode ? '🎯' : '🎹'}</div>` +
      `<div class="course-title">${localizeChordRootName(r)}</div>`;
    card.addEventListener('click', () => {
      if (chordPracticeMode) {
        chordPracticeMode = false;
        chordRoot = i;
        startChordPractice(i, 0, 'rh');
      } else {
        openChordCourse(i);
      }
    });
    list.appendChild(card);
  });
}

// ── Render course (tabs + keyboard) ─────────────────────────────────
function renderChordCourse() {
  const type      = CHORD_TYPES[chordTypeIdx];
  const isSeventh = type.seventh;
  const rootData  = CHORD_ROOTS[chordRoot];

  document.getElementById('chord-course-title').textContent =
    `${localizeChordRootName(rootData)} Chords`;

  // Type tabs
  document.querySelectorAll('.chord-type-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.chordType === type.id));

  // Hand tabs
  document.querySelectorAll('.chord-hand-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.chordHand === chordHand));

  // Clamp inversion index when switching between triad/7th chord
  if (!isSeventh && chordInversion > 2) chordInversion = 0;

  // Rebuild inversion tabs dynamically (count differs: 3 vs 4)
  const invLabels = isSeventh
    ? ['Root Pos','1st Inv','2nd Inv','3rd Inv']
    : ['Root Pos','1st Inv','2nd Inv'];

  const invContainer = document.getElementById('chord-inv-tabs');
  invContainer.innerHTML = '';
  invLabels.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'scale-dir-btn' + (i === chordInversion ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      chordInversion = i;
      invContainer.querySelectorAll('button').forEach((b, j) =>
        b.classList.toggle('active', j === i));
      buildChordKeyboard();
    });
    invContainer.appendChild(btn);
  });

  buildChordKeyboard();
}

// ── Build keyboard display ───────────────────────────────────────────
function buildChordKeyboard() {
  const rootData  = CHORD_ROOTS[chordRoot];
  const type      = CHORD_TYPES[chordTypeIdx];
  const isSeventh = type.seventh;
  const notes     = buildChordNotes(rootData.root, type.intervals, chordInversion);
  const fingering = getChordFingering(notes, chordHand, chordInversion, isSeventh);
  const { start, end } = getChordRange(notes);
  const useFlat   = rootData.useFlat;
  const baseMidi  = 60;

  const container = document.getElementById('chord-keyboard-container');
  container.innerHTML = '';

  // ── Info panel ──────────────────────────────────────────────────
  const invFullNames = isSeventh
    ? ['Root Position','1st Inversion','2nd Inversion','3rd Inversion']
    : ['Root Position','1st Inversion','2nd Inversion'];

  const rootDispName = displayName(rootData.root, useFlat);
  const symbol       = rootDispName + type.symbol;
  const noteStr      = notes.map(n => chordNoteDisplayName(rootData, type, n)).join(' — ');
  const handLabel    = chordHand === 'rh' ? 'Right Hand' : 'Left Hand';

  const info = document.createElement('div');
  info.className = 'chord-info-panel';
  info.innerHTML =
    `<div class="chord-symbol">${symbol}</div>` +
    `<div class="chord-desc">${localizeChordRootName(rootData)} ${type.fullLabel} &middot; ${invFullNames[chordInversion]}</div>` +
    `<div class="chord-notes">${noteStr}</div>`;
  container.appendChild(info);

  // ── Layout helpers ──────────────────────────────────────────────
  const noteSet   = new Set(notes);
  const allKeys   = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
  const whiteKeys = allKeys.filter(s => !isBlackKey(s));
  const numW      = whiteKeys.length;
  const wPct      = 100 / numW;
  const wkIdx     = {};
  whiteKeys.forEach((s, i) => { wkIdx[s] = i; });

  function keyCenter(s) {
    if (!isBlackKey(s)) return (wkIdx[s] + 0.5) * wPct;
    return (wkIdx[s - 1] + 1.0) * wPct;
  }

  // ── Finger badge row ────────────────────────────────────────────
  const fRow = document.createElement('div');
  fRow.className = 'chord-finger-row';

  notes.forEach((s, i) => {
    const badge = document.createElement('span');
    badge.className = 'chord-finger-badge';
    badge.textContent = fingering[i];
    badge.style.left = `${keyCenter(s)}%`;
    fRow.appendChild(badge);
  });
  container.appendChild(fRow);

  // ── Piano keyboard ──────────────────────────────────────────────
  const kb = document.createElement('div');
  kb.className = 'scale-keyboard chord-keyboard';

  // White keys
  whiteKeys.forEach((s, wi) => {
    const inChord = noteSet.has(s);
    const el      = document.createElement('div');
    el.className  = 'scale-key-white' + (inChord ? ' chord-key-active' : '');
    el.style.cssText =
      `left:${wi*wPct}%;width:${wPct}%;position:absolute;height:100%;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(midiToFreq(baseMidi + s)));
    if (inChord) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label chord-note-label';
      lbl.textContent = chordNoteDisplayName(rootData, type, s);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });

  // Black keys
  whiteKeys.forEach((ws, wi) => {
    const s = ws + 1;
    if (!isBlackKey(s) || s < start || s > end || wi >= numW - 1) return;
    const inChord = noteSet.has(s);
    const el      = document.createElement('div');
    el.className  = 'scale-key-black' + (inChord ? ' chord-key-active' : '');
    el.style.cssText =
      `left:${(wi+0.63)*wPct}%;width:${wPct*0.74}%;` +
      `position:absolute;height:62%;top:0;z-index:2;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(midiToFreq(baseMidi + s)));
    if (inChord) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label chord-note-label';
      lbl.textContent = chordNoteDisplayName(rootData, type, s);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });

  container.appendChild(kb);

  // ── Buttons ─────────────────────────────────────────────────────
  const btnRow = document.createElement('div');
  btnRow.style.cssText =
    'display:flex;gap:0.5rem;justify-content:center;margin:0.35rem auto 0;flex-shrink:0;';

  const playBtn = document.createElement('button');
  playBtn.className = 'scale-play-btn';
  playBtn.style.margin = '0';
  playBtn.textContent = '▶ Play Chord';
  playBtn.addEventListener('click', () => {
    clearInterval(chordPlayTimer);
    notes.forEach(s => playPiano(midiToFreq(baseMidi + s)));
  });

  const arpBtn = document.createElement('button');
  arpBtn.className = 'scale-play-btn';
  arpBtn.style.margin = '0';
  arpBtn.textContent = '🎵 Play Notes';
  arpBtn.addEventListener('click', () => {
    clearInterval(chordPlayTimer);
    let idx = 0;
    chordPlayTimer = setInterval(() => {
      if (idx >= notes.length) { clearInterval(chordPlayTimer); return; }
      playPiano(midiToFreq(baseMidi + notes[idx]));
      idx++;
    }, 380);
  });

  const practBtn = document.createElement('button');
  practBtn.className = 'scale-play-btn';
  practBtn.style.margin = '0';
  practBtn.textContent = '🎯 Practice';
  practBtn.addEventListener('click', () =>
    startChordPractice(chordRoot, chordTypeIdx, chordHand));

  btnRow.appendChild(playBtn);
  btnRow.appendChild(arpBtn);
  btnRow.appendChild(practBtn);
  container.appendChild(btnRow);

  // ── Legend ──────────────────────────────────────────────────────
  const legend = document.createElement('div');
  legend.className = 'chord-legend';
  legend.textContent = `${handLabel} · finger 1 = thumb · finger 5 = pinky`;
  container.appendChild(legend);
}

// ══════════════════════════════════════════════════════════════════
// CHORD PRACTICE MODE
// Cycles through every inversion of the selected chord type.
// User taps each note of the chord (any order) to complete each step.
// Correct taps → green; wrong taps → red flash + error count.
// ══════════════════════════════════════════════════════════════════

let cpCourse      = 0;
let cpTypeIdx     = 0;
let cpHand        = 'rh';
let cpInvIdx      = 0;     // which inversion the user is currently on
let cpMaxInv      = 2;     // highest inversion index for this chord type
let cpHit         = new Set(); // semitones correctly tapped this inversion
let cpInvErrors   = 0;    // errors for the current inversion
let cpTotalErrors = 0;    // total errors across the whole session
let cpInvErrorLog = [];   // array of per-inversion error counts
let cpWrongKey    = null;
let cpWaiting     = false;
let cpAdvancing   = false; // true during the 800 ms auto-advance pause
let cpCompleted   = false;
let cpHintMode    = false; // true for ~2 s after a wrong press — reveals chord keys

function startChordPractice(rootIdx, typeIdx, handStr) {
  cpCourse      = rootIdx;
  cpTypeIdx     = typeIdx;
  cpHand        = handStr;
  cpInvIdx      = 0;
  cpMaxInv      = CHORD_TYPES[typeIdx].seventh ? 3 : 2;
  cpHit         = new Set();
  cpInvErrors   = 0;
  cpTotalErrors = 0;
  cpInvErrorLog = [];
  cpWrongKey    = null;
  cpWaiting     = false;
  cpAdvancing   = false;
  cpCompleted   = false;
  cpHintMode    = false;
  clearInterval(chordPlayTimer);
  showPage('page-chords-practice');
  buildCpContainer();
}

// ── Build the practice UI ────────────────────────────────────────
function buildCpContainer() {
  const rootData  = CHORD_ROOTS[cpCourse];
  const type      = CHORD_TYPES[cpTypeIdx];
  const isSeventh = type.seventh;
  const notes     = buildChordNotes(rootData.root, type.intervals, cpInvIdx);
  const fingering = getChordFingering(notes, cpHand, cpInvIdx, isSeventh);
  const useFlat   = rootData.useFlat;
  const baseMidi  = 60;
  const allFound  = cpHit.size === notes.length;

  const container = document.getElementById('cp-container');
  container.innerHTML = '';

  if (cpCompleted) {
    renderCpCompletion(container);
    return;
  }

  const invNames = isSeventh
    ? ['Root Position','1st Inversion','2nd Inversion','3rd Inversion']
    : ['Root Position','1st Inversion','2nd Inversion'];

  document.getElementById('cp-progress').textContent =
    `${cpInvIdx + 1} / ${cpMaxInv + 1}`;

  // ── Prompt panel ──────────────────────────────────────────────
  const symbol = displayName(rootData.root, useFlat) + type.symbol;
  const prompt = document.createElement('div');
  prompt.className = 'cp-prompt';

  if (allFound) {
    prompt.innerHTML =
      `<div class="cp-symbol cp-symbol-done">&#10003; ${symbol}</div>` +
      `<div class="cp-inv-label">${invNames[cpInvIdx]} — complete!</div>`;
  } else {
    const handLabel = cpHand === 'rh' ? 'Right Hand' : 'Left Hand';
    prompt.innerHTML =
      `<div class="cp-cue">Play this chord:</div>` +
      `<div class="cp-symbol">${symbol}</div>` +
      `<div class="cp-type-label">${localizeChordRootName(rootData)} ${type.fullLabel}</div>` +
      `<div class="cp-inv-label">${invNames[cpInvIdx]} &middot; ${handLabel}</div>`;
  }
  container.appendChild(prompt);

  // ── Layout helpers ────────────────────────────────────────────
  const { start, end } = getChordRange(notes);
  const noteSet = new Set(notes);
  const allKeys = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
  const whiteKeys = allKeys.filter(s => !isBlackKey(s));
  const numW  = whiteKeys.length;
  const wPct  = 100 / numW;
  const wkIdx = {};
  whiteKeys.forEach((s, i) => { wkIdx[s] = i; });

  function keyCenter(s) {
    return !isBlackKey(s)
      ? (wkIdx[s] + 0.5) * wPct
      : (wkIdx[s - 1] + 1.0) * wPct;
  }

  // ── Finger badge row ──────────────────────────────────────────
  const fRow = document.createElement('div');
  fRow.className = 'chord-finger-row';
  notes.forEach((s, i) => {
    const isDone      = cpHit.has(s) || allFound;
    const isHintBadge = cpHintMode && !cpHit.has(s) && !allFound;
    if (!isDone && !isHintBadge) return;
    const badge = document.createElement('span');
    badge.className = 'chord-finger-badge' +
      (isDone ? ' cp-badge-done' : ' cp-badge-hint');
    badge.textContent = fingering[i];
    badge.style.left = `${keyCenter(s)}%`;
    fRow.appendChild(badge);
  });
  container.appendChild(fRow);

  // ── Piano keyboard ────────────────────────────────────────────
  const kb = document.createElement('div');
  kb.className = 'scale-keyboard chord-keyboard';

  function makeKey(s, leftPct, widthPct, heightPct, isBlack) {
    const inChord = noteSet.has(s);
    const hit     = cpHit.has(s);
    const isWrong = s === cpWrongKey;
    const isHint  = cpHintMode && inChord && !hit;

    let cls = isBlack ? 'scale-key-black' : 'scale-key-white';
    if      (hit || (allFound && inChord)) cls += ' cp-key-correct';
    else if (isWrong)                      cls += ' cp-key-wrong';
    else if (isHint)                       cls += ' cp-key-hint';

    const el = document.createElement('div');
    el.className = cls;
    el.style.cssText =
      `left:${leftPct}%;width:${widthPct}%;position:absolute;` +
      `height:${heightPct}%;top:0;` +
      `z-index:${isBlack ? 2 : (inChord ? 1 : 0)};box-sizing:border-box;`;
    el.addEventListener('click', () => cpHandleClick(s));

    const lbl = document.createElement('span');
    let lblCls;
    if      (hit || (allFound && inChord)) lblCls = 'cp-note-done';
    else if (isHint)                       lblCls = 'cp-note-hint';
    else                                   lblCls = 'cp-note-neutral';
    lbl.className = `scale-key-label ${lblCls}`;
    lbl.textContent = inChord
      ? chordNoteDisplayName(rootData, type, s)
      : displayName(s, useFlat);
    el.appendChild(lbl);

    return el;
  }

  whiteKeys.forEach((s, wi) =>
    kb.appendChild(makeKey(s, wi*wPct, wPct, 100, false)));

  whiteKeys.forEach((ws, wi) => {
    const s = ws + 1;
    if (!isBlackKey(s) || s < start || s > end || wi >= numW-1) return;
    kb.appendChild(makeKey(s, (wi+0.63)*wPct, wPct*0.74, 62, true));
  });

  container.appendChild(kb);

  // ── Note completion dots ──────────────────────────────────────
  const dotsRow = document.createElement('div');
  dotsRow.className = 'cp-dots-row';
  notes.forEach(s => {
    const dot = document.createElement('span');
    dot.className = 'cp-dot' + (cpHit.has(s) || allFound ? ' cp-dot-found' : '');
    dotsRow.appendChild(dot);
  });
  container.appendChild(dotsRow);

  // ── Feedback text ─────────────────────────────────────────────
  const fb = document.createElement('div');
  fb.className = 'cp-feedback';
  if (allFound) {
    fb.innerHTML = `<span class="cp-fb-ok">&#10003; All notes correct — moving on&#8230;</span>`;
  } else if (cpWrongKey !== null) {
    const wrongName = displayName(cpWrongKey, useFlat);
    const hintSuffix = cpHintMode ? ' — chord keys highlighted' : '';
    fb.innerHTML =
      `<span class="cp-fb-wrong">&#10007; <strong>${wrongName}</strong> is not in this chord${hintSuffix}</span>`;
  } else if (cpInvErrors > 0) {
    const left = notes.length - cpHit.size;
    fb.innerHTML =
      `<span class="cp-fb-hint">${left} note${left !== 1 ? 's' : ''} to go &nbsp;·&nbsp; ${cpInvErrors} error${cpInvErrors !== 1 ? 's' : ''} so far</span>`;
  } else if (cpHit.size > 0) {
    const left = notes.length - cpHit.size;
    fb.innerHTML =
      `<span class="cp-fb-hint">${left} more note${left !== 1 ? 's' : ''} to go</span>`;
  } else {
    fb.innerHTML = `<span class="cp-fb-hint">Recall the chord — tap its notes</span>`;
  }
  container.appendChild(fb);
}

// ── Click handler ────────────────────────────────────────────────
function cpHandleClick(semi) {
  if (cpCompleted || cpAdvancing) return;

  const type    = CHORD_TYPES[cpTypeIdx];
  const rData   = CHORD_ROOTS[cpCourse];
  const notes   = buildChordNotes(rData.root, type.intervals, cpInvIdx);
  const noteSet = new Set(notes);
  const baseMidi = 60;

  playPiano(midiToFreq(baseMidi + semi));

  if (cpHit.has(semi)) return; // already correctly pressed — just replay sound

  if (noteSet.has(semi)) {
    // ── Correct note ───────────────────────────────────────────
    cpHit.add(semi);
    cpWrongKey = null;
    cpWaiting  = false;
    cpHintMode = false;

    if (cpHit.size === notes.length) {
      // All notes found — play full chord then advance
      cpAdvancing = true;
      notes.forEach(s => playPiano(midiToFreq(baseMidi + s)));
      buildCpContainer(); // shows all-correct state

      setTimeout(() => {
        cpInvErrorLog.push(cpInvErrors);
        cpInvIdx++;
        cpHit       = new Set();
        cpInvErrors = 0;
        cpWrongKey  = null;
        cpWaiting   = false;
        cpAdvancing = false;
        if (cpInvIdx > cpMaxInv) cpCompleted = true;
        buildCpContainer();
      }, 850);
    } else {
      buildCpContainer();
    }
  } else {
    // ── Wrong note ─────────────────────────────────────────────
    if (cpWaiting) return;
    cpInvErrors++;
    cpTotalErrors++;
    cpWrongKey = semi;
    cpWaiting  = true;
    cpHintMode = true;
    buildCpContainer();
    setTimeout(() => {
      if (cpWrongKey === semi) {
        cpWrongKey = null;
        cpWaiting  = false;
        cpHintMode = false;
        buildCpContainer();
      }
    }, 2000);
  }
}

// ── Completion panel ─────────────────────────────────────────────
function renderCpCompletion(container) {
  document.getElementById('cp-progress').textContent = '✓ Done';

  const rootData = CHORD_ROOTS[cpCourse];
  const type     = CHORD_TYPES[cpTypeIdx];
  const invShort = type.seventh
    ? ['Root','1st','2nd','3rd']
    : ['Root','1st','2nd'];

  const errClass = cpTotalErrors === 0 ? 'sp-stat-good'
    : cpTotalErrors <= 3 ? 'sp-stat-warn' : 'sp-stat-err';

  const msg = cpTotalErrors === 0
    ? 'Flawless — all inversions nailed!'
    : cpTotalErrors <= 3 ? 'Great job — nearly perfect!'
    : cpTotalErrors <= 8 ? 'Good practice. Try again for a clean run!'
    : 'Keep at it — repetition builds chord memory.';

  const panel = document.createElement('div');
  panel.className = 'sp-completion';

  // Title + overall stats
  panel.innerHTML =
    `<div class="sp-completion-icon">🎵</div>` +
    `<div class="sp-completion-title">${localizeChordRootName(rootData)} ${type.fullLabel}</div>` +
    `<div class="sp-completion-stats">` +
      `<span class="sp-stat-good">&#10003; ${cpMaxInv + 1} inversions</span>` +
      `<span class="${errClass}">${cpTotalErrors === 0 ? '&#10003;' : '&#10007;'} ${cpTotalErrors} error${cpTotalErrors !== 1 ? 's' : ''}</span>` +
    `</div>`;

  // Per-inversion breakdown
  if (cpInvErrorLog.length > 0) {
    const breakdown = document.createElement('div');
    breakdown.className = 'cp-breakdown';
    cpInvErrorLog.forEach((errs, i) => {
      const chip = document.createElement('span');
      chip.className = 'cp-breakdown-chip ' + (errs === 0 ? 'sp-stat-good' : 'sp-stat-warn');
      chip.textContent = `${invShort[i]}: ${errs === 0 ? '✓' : errs + ' err'}`;
      breakdown.appendChild(chip);
    });
    panel.appendChild(breakdown);
  }

  const msgEl = document.createElement('div');
  msgEl.className = 'sp-completion-msg';
  msgEl.textContent = msg;
  panel.appendChild(msgEl);

  const btnRow = document.createElement('div');
  btnRow.className = 'sp-completion-btns';

  const againBtn = document.createElement('button');
  againBtn.textContent = '↺ Try Again';
  againBtn.addEventListener('click', () =>
    startChordPractice(cpCourse, cpTypeIdx, cpHand));

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Chord';
  backBtn.addEventListener('click', () => {
    showPage('page-chords-course');
    renderChordCourse();
  });

  btnRow.appendChild(againBtn);
  btnRow.appendChild(backBtn);
  panel.appendChild(btnRow);
  container.appendChild(panel);
}
