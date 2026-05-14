// ── ARPEGGIOS.JS ──────────────────────────────────────────────────
// 4 arpeggio types per course (2 octaves each):
//   Major   – root-position major triad  (7 notes: root,M3,P5 × 2 + root)
//   Minor   – root-position minor triad  (7 notes: root,m3,P5 × 2 + root)
//   Dom 7th – dominant 7th chord V7      (9 notes: root,M3,P5,m7 × 2 + root)
//   Dim 7th – diminished 7th chord vii°7 (9 notes: root,m3,d5,d7 × 2 + root)
//
// Semitone offsets from C4 (MIDI 60) — same convention as scales.js.
// isBlackKey / displayName / midiToFreq / playPiano are all from scales.js / core.js.

// ── Note builders ──────────────────────────────────────────────────
function buildMajorArp(root) { return [0,4,7,12,16,19,24].map(i=>root+i); }
function buildMinorArp(root) { return [0,3,7,12,15,19,24].map(i=>root+i); }
function buildDom7Arp(root)  { return [0,4,7,10,12,16,19,22,24].map(i=>root+i); }
function buildDim7Arp(root)  { return [0,3,6,9,12,15,18,21,24].map(i=>root+i); }

// ── Fingering data ─────────────────────────────────────────────────
// Triad arrays = 7 elements; 7th-chord arrays = 9 elements.
// Desc arrays stored in play-order (high→low); getCurrentArpFingering()
// reverses them to spatial (low→high) order automatically.

const ARP_FINGERINGS = {

  // ── standard ── white-key root; 1-2-3 thumb-pass for triads,
  //                1-2-3-4 thumb-pass for 7th chords ──────────────
  //
  // RH: ascending ends on 5 (pinky at top), descending starts on 5.
  // LH: ascending starts on 5 (pinky at bottom), descending ends on 5.
  standard: {
    // 7-note triads
    majorRhAsc:  [1,2,3,1,2,3,5],  majorRhDesc: [5,3,2,1,3,2,1],
    majorLhAsc:  [5,4,2,1,4,2,1],  majorLhDesc: [1,2,4,1,2,4,5],
    minorRhAsc:  [1,2,3,1,2,3,5],  minorRhDesc: [5,3,2,1,3,2,1],
    minorLhAsc:  [5,4,2,1,4,2,1],  minorLhDesc: [1,2,4,1,2,4,5],
    // 9-note dominant 7th
    dom7RhAsc:   [1,2,3,4,1,2,3,4,5], dom7RhDesc:  [5,4,3,2,1,4,3,2,1],
    dom7LhAsc:   [5,4,3,2,1,4,3,2,1], dom7LhDesc:  [1,2,3,4,1,2,3,4,5],
    // 9-note diminished 7th (symmetrical — same shape works for all keys)
    dim7RhAsc:   [1,2,3,4,1,2,3,4,5], dim7RhDesc:  [5,4,3,2,1,4,3,2,1],
    dim7LhAsc:   [5,4,3,2,1,4,3,2,1], dim7LhDesc:  [1,2,3,4,1,2,3,4,5],
  },

  // ── blackRoot ── root on a black key; triad uses 2-1-4 thumb-pass,
  //                 7th chords use 2-1-4-… or 2-3-4-1-… depending on key.
  // Applies to: Bb, Eb, Ab, Db, Gb major + F#/C#/G#/Bb/Eb minor triads
  blackRoot: {
    majorRhAsc:  [2,1,4,2,1,4,5],  majorRhDesc: [5,4,1,2,4,1,2],
    majorLhAsc:  [3,2,1,3,2,1,3],  majorLhDesc: [3,1,2,3,1,2,3],
    minorRhAsc:  [2,1,4,2,1,4,5],  minorRhDesc: [5,4,1,2,4,1,2],
    minorLhAsc:  [3,2,1,3,2,1,3],  minorLhDesc: [3,1,2,3,1,2,3],
    dom7RhAsc:   [2,1,4,3,2,1,4,3,5], dom7RhDesc:  [5,3,4,1,2,3,4,1,2],
    dom7LhAsc:   [4,3,2,1,4,3,2,1,4], dom7LhDesc:  [4,1,2,3,4,1,2,3,4],
    dim7RhAsc:   [2,3,4,1,2,3,4,1,5], dim7RhDesc:  [5,1,4,3,2,1,4,3,2],
    dim7LhAsc:   [4,3,2,1,4,3,2,1,4], dim7LhDesc:  [4,1,2,3,4,1,2,3,4],
  },

  // ── Gb/F# ── all-black triad; special 2-3-4 opening ────────────
  Gb: {
    majorRhAsc:  [2,3,4,1,2,3,5],  majorRhDesc: [5,3,2,1,4,3,2],
    majorLhAsc:  [4,3,2,1,4,2,1],  majorLhDesc: [1,2,4,1,2,3,4],
    minorRhAsc:  [2,3,4,1,2,3,5],  minorRhDesc: [5,3,2,1,4,3,2],
    minorLhAsc:  [4,3,2,1,4,2,1],  minorLhDesc: [1,2,4,1,2,3,4],
    dom7RhAsc:   [2,3,4,1,2,3,4,1,5], dom7RhDesc:  [5,1,4,3,2,1,4,3,2],
    dom7LhAsc:   [4,3,2,1,4,3,2,1,4], dom7LhDesc:  [4,1,2,3,4,1,2,3,4],
    dim7RhAsc:   [2,3,4,1,2,3,4,1,5], dim7RhDesc:  [5,1,4,3,2,1,4,3,2],
    dim7LhAsc:   [4,3,2,1,4,3,2,1,4], dim7LhDesc:  [4,1,2,3,4,1,2,3,4],
  },
};

// ── Course definitions ─────────────────────────────────────────────
// Parameters per course:
//   majorRoot – semitone of major triad root (C4 = 0)
//   minorRoot – semitone of relative minor root  (= majorRoot − 3)
//   dom7Root  – same as majorRoot: dominant 7th quality chord on the tonic
//               e.g. C course → C7 (C-E-G-Bb), not G7
//   dim7Root  – majorRoot − 1: leading-tone diminished 7th (vii°7)
//               e.g. C course → B°7 (B-D-F-Ab)
//   useFlat   – show flat accidentals in note names
//   fingerKey – which ARP_FINGERINGS entry to use

const ARPEGGIO_COURSES = (function () {
  function course(title, majorRoot, minorRoot, dom7Root, dim7Root, useFlat, fingerKey) {
    const fk = ARP_FINGERINGS[fingerKey] || ARP_FINGERINGS.standard;
    return {
      title, useFlat,
      major: buildMajorArp(majorRoot),
      minor: buildMinorArp(minorRoot),
      dom7:  buildDom7Arp(dom7Root),
      dim7:  buildDim7Arp(dim7Root),
      majorRhAsc: fk.majorRhAsc,  majorRhDesc: fk.majorRhDesc,
      majorLhAsc: fk.majorLhAsc,  majorLhDesc: fk.majorLhDesc,
      minorRhAsc: fk.minorRhAsc,  minorRhDesc: fk.minorRhDesc,
      minorLhAsc: fk.minorLhAsc,  minorLhDesc: fk.minorLhDesc,
      dom7RhAsc:  fk.dom7RhAsc,   dom7RhDesc:  fk.dom7RhDesc,
      dom7LhAsc:  fk.dom7LhAsc,   dom7LhDesc:  fk.dom7LhDesc,
      dim7RhAsc:  fk.dim7RhAsc,   dim7RhDesc:  fk.dim7RhDesc,
      dim7LhAsc:  fk.dim7LhAsc,   dim7LhDesc:  fk.dim7LhDesc,
    };
  }

  //            title                   majR minR d7R  dim7R  flat  fKey
  return [
    course('C Major / A Minor',          0,  -3,   0,   -1, false, 'standard'),
    // Remaining courses are added once this one is verified
  ];
})();

// ── State ──────────────────────────────────────────────────────────
let arpCourse       = 0;
let arpPracticeMode = false;
let arpTab          = 'major';  // 'major' | 'minor' | 'dom7' | 'dim7'
let arpDir          = 'asc';    // 'asc' | 'desc'
let arpHand         = 'rh';     // 'rh' | 'lh'
let arpHlIdx        = -1;
let arpPlayTimer    = null;

// ── Helpers ────────────────────────────────────────────────────────
function getCurrentArpNotes() {
  const c = ARPEGGIO_COURSES[arpCourse];
  const arr = c[arpTab];
  return arpDir === 'asc' ? arr : [...arr].reverse();
}

// Returns fingering in spatial (low→high) order.
function getCurrentArpFingering() {
  const c  = ARPEGGIO_COURSES[arpCourse];
  const rh = arpHand === 'rh';
  if (arpDir === 'asc') {
    return rh ? c[arpTab + 'RhAsc'] : c[arpTab + 'LhAsc'];
  }
  const desc = rh ? c[arpTab + 'RhDesc'] : c[arpTab + 'LhDesc'];
  return [...desc].reverse();
}

function getArpKeyboardRange() {
  const notes = getCurrentArpNotes();
  let start = Math.min(...notes);
  let end   = Math.max(...notes);
  while (isBlackKey(start)) start--;
  while (isBlackKey(end))   end++;
  return { start, end };
}

// ── Navigation ─────────────────────────────────────────────────────
function goToArpeggios() {
  showPage('page-arpeggios-list');
  renderArpList();
}

function openArpCourse(idx) {
  arpCourse = idx;
  arpTab    = 'major';
  arpDir    = 'asc';
  arpHand   = 'rh';
  arpHlIdx  = -1;
  clearInterval(arpPlayTimer);
  showPage('page-arpeggios-course');
  renderArpCourse();
}

// ── Render list ────────────────────────────────────────────────────
function renderArpList() {
  const list = document.getElementById('arps-courses-list');
  list.innerHTML = '';
  ARPEGGIO_COURSES.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'course-card unlocked';
    card.innerHTML =
      `<div class="course-icon">${arpPracticeMode ? '🎯' : '🎵'}</div>` +
      `<div class="course-title">${localizeScaleTitle(c.title)}</div>`;
    card.addEventListener('click', () => {
      if (arpPracticeMode) {
        arpPracticeMode = false;
        startArpPractice(i);
      } else {
        openArpCourse(i);
      }
    });
    list.appendChild(card);
  });
}

// ── Render course page ─────────────────────────────────────────────
function renderArpCourse() {
  const c = ARPEGGIO_COURSES[arpCourse];
  document.getElementById('arp-course-title').textContent = localizeScaleTitle(c.title);

  document.querySelectorAll('.arp-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.arpMode === arpTab));
  document.querySelectorAll('.arp-dir-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.arpDir === arpDir));
  document.querySelectorAll('.arp-hand-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.arpHand === arpHand));

  buildArpKeyboard();
}

// ── Build keyboard ─────────────────────────────────────────────────
function buildArpKeyboard() {
  const c         = ARPEGGIO_COURSES[arpCourse];
  const notes     = getCurrentArpNotes();
  const fingering = getCurrentArpFingering();
  const { start, end } = getArpKeyboardRange();
  const useFlat   = c.useFlat;
  const baseMidi  = 60;

  const container = document.getElementById('arp-keyboard-container');
  container.innerHTML = '';

  const noteSet = new Set(notes);

  const allKeys = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
  const whiteKeys   = allKeys.filter(s => !isBlackKey(s));
  const numW        = whiteKeys.length;
  const wPct        = 100 / numW;
  const whiteKeyIdx = {};
  whiteKeys.forEach((s, i) => { whiteKeyIdx[s] = i; });

  // Spatial order (low→high) for finger positioning
  const spatialNotes = arpDir === 'asc' ? notes : [...notes].reverse();

  // Convert playback index → spatial index for highlight
  const hlPos = arpHlIdx < 0 ? -1
    : arpDir === 'asc' ? arpHlIdx
    : (notes.length - 1 - arpHlIdx);

  // ── Finger number row ──
  const fRow = document.createElement('div');
  fRow.className = 'scale-finger-display';
  fRow.style.cssText = 'position:relative;display:block;min-height:1.2em;';

  for (let i = 0; i < spatialNotes.length; i++) {
    const s = spatialNotes[i];
    let cPct;
    if (!isBlackKey(s)) {
      cPct = (whiteKeyIdx[s] + 0.5) * wPct;
    } else {
      cPct = (whiteKeyIdx[s - 1] + 1.0) * wPct;
    }
    const sp = document.createElement('span');
    sp.className = 'scale-finger-num' + (i === hlPos ? ' highlighted' : '');
    sp.textContent = fingering[i];
    sp.style.cssText = `position:absolute;left:${cPct}%;transform:translateX(-50%);`;
    fRow.appendChild(sp);
  }
  container.appendChild(fRow);

  // ── Keyboard ──
  const kb = document.createElement('div');
  kb.className = 'scale-keyboard';
  kb.style.cssText = 'position:relative;width:100%;flex-shrink:0;';

  // White keys
  whiteKeys.forEach((s, wi) => {
    const inArp = noteSet.has(s);
    const hlNote = arpHlIdx >= 0 ? notes[arpHlIdx] : null;
    const isHl   = s === hlNote;
    const freq   = midiToFreq(baseMidi + s);

    const el = document.createElement('div');
    el.className = 'scale-key-white' +
      (inArp ? ' in-scale'    : '') +
      (isHl  ? ' highlighted' : '');
    el.style.cssText =
      `left:${wi * wPct}%;width:${wPct}%;` +
      `position:absolute;height:100%;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(freq));
    if (inArp) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHl ? ' highlighted' : '');
      lbl.textContent = displayName(s, useFlat);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });

  // Black keys
  whiteKeys.forEach((ws, wi) => {
    const s = ws + 1;
    if (!isBlackKey(s) || s < start || s > end || wi >= numW - 1) return;
    const inArp  = noteSet.has(s);
    const hlNote = arpHlIdx >= 0 ? notes[arpHlIdx] : null;
    const isHl   = s === hlNote;
    const freq   = midiToFreq(baseMidi + s);

    const el = document.createElement('div');
    el.className = 'scale-key-black' +
      (inArp ? ' in-scale'    : '') +
      (isHl  ? ' highlighted' : '');
    const leftPct  = (wi + 0.63) * wPct;
    const widthPct = wPct * 0.74;
    el.style.cssText =
      `left:${leftPct}%;width:${widthPct}%;` +
      `position:absolute;height:62%;top:0;z-index:2;box-sizing:border-box;`;
    el.addEventListener('click', () => playPiano(freq));
    if (inArp) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHl ? ' highlighted' : '');
      lbl.textContent = displayName(s, useFlat);
      el.appendChild(lbl);
    }
    kb.appendChild(el);
  });

  container.appendChild(kb);

  // ── Buttons ──
  const btnRow = document.createElement('div');
  btnRow.style.cssText =
    'display:flex;gap:0.5rem;justify-content:center;margin:0.3rem auto 0;flex-shrink:0;';

  const playBtn = document.createElement('button');
  playBtn.className = 'scale-play-btn';
  playBtn.style.margin = '0';
  playBtn.textContent = '▶ Play Arpeggio';
  playBtn.addEventListener('click', playArpAnim);

  const practBtn = document.createElement('button');
  practBtn.className = 'scale-play-btn';
  practBtn.style.margin = '0';
  practBtn.textContent = '🎯 Practice';
  practBtn.addEventListener('click', () => startArpPractice(arpCourse));

  btnRow.appendChild(playBtn);
  btnRow.appendChild(practBtn);
  container.appendChild(btnRow);
}

// ── Play animation ─────────────────────────────────────────────────
function playArpAnim() {
  clearInterval(arpPlayTimer);
  const notes    = getCurrentArpNotes();
  const baseMidi = 60;
  let idx = 0;

  arpPlayTimer = setInterval(() => {
    if (idx >= notes.length) {
      clearInterval(arpPlayTimer);
      arpHlIdx = -1;
      buildArpKeyboard();
      return;
    }
    arpHlIdx = idx;
    playPiano(midiToFreq(baseMidi + notes[idx]));
    buildArpKeyboard();
    idx++;
  }, 420);
}

// ── Tab setters ────────────────────────────────────────────────────
function setArpMode(mode) {
  arpTab = mode;
  arpHlIdx = -1;
  clearInterval(arpPlayTimer);
  renderArpCourse();
}

function setArpDirection(dir) {
  arpDir = dir;
  arpHlIdx = -1;
  clearInterval(arpPlayTimer);
  renderArpCourse();
}

function setArpHand(hand) {
  arpHand = hand;
  arpHlIdx = -1;
  clearInterval(arpPlayTimer);
  renderArpCourse();
}

// ── Practice (placeholder until learn mode is verified) ───────────
function startArpPractice(courseIdx) {
  alert('Arpeggio practice coming soon!');
}
