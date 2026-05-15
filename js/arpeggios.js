// ── ARPEGGIOS.JS ──────────────────────────────────────────────────
// 2 arpeggio types per course — two octaves, 7-note sequence shown as
// 3 overlapping thumb-crossing groups side-by-side:
//   Major: root-M3-P5-root-M3-P5-root  (e.g. C-E-G-C-E-G-C)
//   Minor: root-m3-P5-root-m3-P5-root  (e.g. A-C-E-A-C-E-A)
//
// Groups for C major asc: [C E G C] | [E G C E] | [G C]
// Fingerings (RH, standard): 1 2 3 1 | 2 3 1 2 | 3 5
//
// Semitone offsets from C4 (MIDI 60) — same convention as scales.js.
// isBlackKey / displayName / midiToFreq / playPiano are all from scales.js / core.js.

// ── Note builders ──────────────────────────────────────────────────
function buildMajorArp(root) { return [0,4,7,12,16,19,24].map(i=>root+i); }
function buildMinorArp(root) { return [0,3,7,12,15,19,24].map(i=>root+i); }

// ── Fingering data ─────────────────────────────────────────────────
// All arrays are 7 elements (two-octave arpeggio: root-3rd-5th-root-3rd-5th-root).
// Desc arrays stored in play-order (high→low); getCurrentArpFingering()
// reverses them to spatial (low→high) order automatically.
// Note: spatial fingering for asc and desc are symmetric (same physical layout).

const ARP_FINGERINGS = {

  // ── standard ── white-key root (C D E F G A B)
  standard: {
    majorRhAsc:  [1,2,3,1,2,3,5],  majorRhDesc: [5,3,2,1,3,2,1],
    majorLhAsc:  [5,4,2,1,4,2,1],  majorLhDesc: [1,2,4,1,2,4,5],
    minorRhAsc:  [1,2,3,1,2,3,5],  minorRhDesc: [5,3,2,1,3,2,1],
    minorLhAsc:  [5,4,2,1,4,2,1],  minorLhDesc: [1,2,4,1,2,4,5],
  },

  // ── blackRoot ── black-key root (Db major, Bb minor, etc.)
  blackRoot: {
    majorRhAsc:  [2,1,4,2,1,4,5],  majorRhDesc: [5,4,1,2,4,1,2],
    majorLhAsc:  [3,2,1,3,2,1,3],  majorLhDesc: [3,1,2,3,1,2,3],
    minorRhAsc:  [2,1,4,2,1,4,5],  minorRhDesc: [5,4,1,2,4,1,2],
    minorLhAsc:  [3,2,1,3,2,1,3],  minorLhDesc: [3,1,2,3,1,2,3],
  },

  // ── Gb/F# ── all-black triad (Gb/F# major, Eb/D# minor)
  Gb: {
    majorRhAsc:  [2,3,4,1,2,3,5],  majorRhDesc: [5,3,2,1,4,3,2],
    majorLhAsc:  [4,3,2,1,4,2,1],  majorLhDesc: [1,2,4,1,2,3,4],
    minorRhAsc:  [2,3,4,1,2,3,5],  minorRhDesc: [5,3,2,1,4,3,2],
    minorLhAsc:  [4,3,2,1,4,2,1],  minorLhDesc: [1,2,4,1,2,3,4],
  },

  // ── blackRootMajWhiteMin ── Bb/Eb/Ab major (black root) + Gm/Cm/Fm (white root)
  blackRootMajWhiteMin: {
    majorRhAsc:  [2,1,4,2,1,4,5],  majorRhDesc: [5,4,1,2,4,1,2],
    majorLhAsc:  [3,2,1,3,2,1,3],  majorLhDesc: [3,1,2,3,1,2,3],
    minorRhAsc:  [1,2,3,1,2,3,5],  minorRhDesc: [5,3,2,1,3,2,1],
    minorLhAsc:  [5,4,2,1,4,2,1],  minorLhDesc: [1,2,4,1,2,4,5],
  },

  // ── whiteRootMajBlackMin ── A/E/B major (white root) + F#m/C#m/G#m (black root)
  whiteRootMajBlackMin: {
    majorRhAsc:  [1,2,3,1,2,3,5],  majorRhDesc: [5,3,2,1,3,2,1],
    majorLhAsc:  [5,4,2,1,4,2,1],  majorLhDesc: [1,2,4,1,2,4,5],
    minorRhAsc:  [2,1,4,2,1,4,5],  minorRhDesc: [5,4,1,2,4,1,2],
    minorLhAsc:  [3,2,1,3,2,1,3],  minorLhDesc: [3,1,2,3,1,2,3],
  },
};

// ── Course definitions ─────────────────────────────────────────────
// Parameters per course:
//   majorRoot – semitone of major triad root (C4 = 0)
//   minorRoot – semitone of relative minor root  (= majorRoot − 3)
//   useFlat   – show flat accidentals in note names
//   fingerKey – which ARP_FINGERINGS entry to use

const ARPEGGIO_COURSES = (function () {
  function course(title, majorRoot, minorRoot, useFlat, fingerKey) {
    const fk = ARP_FINGERINGS[fingerKey] || ARP_FINGERINGS.standard;
    return {
      title, useFlat,
      major: buildMajorArp(majorRoot),
      minor: buildMinorArp(minorRoot),
      majorRhAsc: fk.majorRhAsc,  majorRhDesc: fk.majorRhDesc,
      majorLhAsc: fk.majorLhAsc,  majorLhDesc: fk.majorLhDesc,
      minorRhAsc: fk.minorRhAsc,  minorRhDesc: fk.minorRhDesc,
      minorLhAsc: fk.minorLhAsc,  minorLhDesc: fk.minorLhDesc,
    };
  }

  //            title                          majR  minR   flat   fKey
  return [
    // ── Flats ──────────────────────────────────────────────────────
    course('C Major / A Minor',                  0,   -3, false, 'standard'),
    course('F Major / D Minor',                  5,    2, true,  'standard'),
    course('B♭ Major / G Minor',                10,    7, true,  'blackRootMajWhiteMin'),
    course('E♭ Major / C Minor',                 3,    0, true,  'blackRootMajWhiteMin'),
    course('A♭ Major / F Minor',                 8,    5, true,  'blackRootMajWhiteMin'),
    course('D♭ Major / B♭ Minor',                1,   -2, true,  'blackRoot'),
    course('G♭ Major / E♭ Minor',                6,    3, true,  'Gb'),
    // ── Sharps ─────────────────────────────────────────────────────
    course('G Major / E Minor',                  7,    4, false, 'standard'),
    course('D Major / B Minor',                  2,   -1, false, 'standard'),
    course('A Major / F♯ Minor',                 9,    6, false, 'whiteRootMajBlackMin'),
    course('E Major / C♯ Minor',                 4,    1, false, 'whiteRootMajBlackMin'),
    course('B Major / G♯ Minor',                11,    8, false, 'whiteRootMajBlackMin'),
    course('F♯ Major / D♯ Minor',                6,    3, false, 'Gb'),
  ];
})();

// ── State ──────────────────────────────────────────────────────────
let arpCourse       = 0;
let arpPracticeMode = false;
let arpTab          = 'major';  // 'major' | 'minor'
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
// One keyboard spanning the full 2-octave range.
// Three rows of finger numbers sit above it — one row per crossing group:
//   Row 1: spatial[0..3]   fingers aligned to their keys
//   Row 2: spatial[1..4]   fingers aligned to their keys
//   Row 3: spatial[5..6]   fingers aligned to their keys
function buildArpKeyboard() {
  const c         = ARPEGGIO_COURSES[arpCourse];
  const notes     = getCurrentArpNotes();
  const fingering = getCurrentArpFingering();
  const useFlat   = c.useFlat;
  const baseMidi  = 60;

  const container = document.getElementById('arp-keyboard-container');
  container.innerHTML = '';

  const spatialNotes = arpDir === 'asc' ? notes : [...notes].reverse();

  // Spatial index of the currently playing note
  const spatialHlIdx = arpHlIdx < 0 ? -1
    : arpDir === 'asc' ? arpHlIdx
    : (notes.length - 1 - arpHlIdx);

  // Full keyboard range covering all 7 notes
  let kbStart = Math.min(...spatialNotes);
  let kbEnd   = Math.max(...spatialNotes);
  while (isBlackKey(kbStart)) kbStart--;
  while (isBlackKey(kbEnd))   kbEnd++;

  const allKeys   = [];
  for (let s = kbStart; s <= kbEnd; s++) allKeys.push(s);
  const whiteKeys   = allKeys.filter(s => !isBlackKey(s));
  const numW        = whiteKeys.length;
  const wPct        = 100 / numW;
  const whiteKeyIdx = {};
  whiteKeys.forEach((s, i) => { whiteKeyIdx[s] = i; });

  // Shared inner wrapper — finger rows and keyboard must resolve percentages
  // against the same pixel width, so they live inside one constrained div.
  const inner = document.createElement('div');
  inner.className = 'arp-keyboard-inner';

  // ── Single finger row (all 7 fingers, one per arpeggio note) ──
  const fRow = document.createElement('div');
  fRow.className = 'arp-group-fingers';

  spatialNotes.forEach((s, spIdx) => {
    let cPct;
    if (!isBlackKey(s)) {
      cPct = (whiteKeyIdx[s] + 0.5) * wPct;
    } else {
      cPct = (whiteKeyIdx[s - 1] + 1.0) * wPct;
    }
    const sp = document.createElement('span');
    sp.className = 'scale-finger-num' + (spIdx === spatialHlIdx ? ' highlighted' : '');
    sp.textContent = fingering[spIdx];
    sp.style.cssText = `position:absolute;left:${cPct}%;transform:translateX(-50%);`;
    fRow.appendChild(sp);
  });
  inner.appendChild(fRow);

  // ── Single keyboard ──
  const hlNote  = arpHlIdx >= 0 ? notes[arpHlIdx] : null;
  const noteSet = new Set(spatialNotes);

  const kb = document.createElement('div');
  kb.className = 'scale-keyboard';
  kb.style.cssText = 'position:relative;width:100%;flex-shrink:0;';

  whiteKeys.forEach((s, wi) => {
    const inArp = noteSet.has(s);
    const isHl  = s === hlNote;
    const freq  = midiToFreq(baseMidi + s);

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

  whiteKeys.forEach((ws, wi) => {
    const s = ws + 1;
    if (!isBlackKey(s) || s < kbStart || s > kbEnd || wi >= numW - 1) return;
    const inArp = noteSet.has(s);
    const isHl  = s === hlNote;
    const freq  = midiToFreq(baseMidi + s);

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

  inner.appendChild(kb);
  container.appendChild(inner);

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

// ── Practice Mode ─────────────────────────────────────────────────

let apCourse    = 0;
let apTab       = 'major';
let apDir       = 'asc';
let apHand      = 'rh';
let apNoteIdx   = 0;
let apErrors    = 0;
let apWrongKey  = null;
let apHintMode  = false;
let apWaiting   = false;
let apCompleted = false;

function getApNotes() {
  const c = ARPEGGIO_COURSES[apCourse];
  const arr = c[apTab];
  return apDir === 'asc' ? arr : [...arr].reverse();
}

function getApFingering() {
  const c  = ARPEGGIO_COURSES[apCourse];
  const rh = apHand === 'rh';
  if (apDir === 'asc') {
    return rh ? c[apTab + 'RhAsc'] : c[apTab + 'LhAsc'];
  }
  const desc = rh ? c[apTab + 'RhDesc'] : c[apTab + 'LhDesc'];
  return [...desc].reverse();
}

function getApRange() {
  const notes = getApNotes();
  let start = Math.min(...notes);
  let end   = Math.max(...notes);
  while (isBlackKey(start)) start--;
  while (isBlackKey(end))   end++;
  return { start, end };
}

function startArpPractice(courseIdx) {
  apCourse    = courseIdx;
  arpCourse   = courseIdx;
  apTab       = arpTab;
  apDir       = arpDir;
  apHand      = arpHand;
  apNoteIdx   = 0;
  apErrors    = 0;
  apWrongKey  = null;
  apHintMode  = false;
  apWaiting   = false;
  apCompleted = false;
  clearInterval(arpPlayTimer);
  arpHlIdx = -1;
  showPage('page-arpeggios-practice');
  renderApPage();
}

function renderApPage() {
  const c = ARPEGGIO_COURSES[apCourse];
  document.getElementById('ap-title').textContent = localizeScaleTitle(c.title);

  document.querySelectorAll('[data-ap-mode]').forEach(b =>
    b.classList.toggle('active', b.dataset.apMode === apTab));
  document.querySelectorAll('[data-ap-dir]').forEach(b =>
    b.classList.toggle('active', b.dataset.apDir === apDir));
  document.querySelectorAll('[data-ap-hand]').forEach(b =>
    b.classList.toggle('active', b.dataset.apHand === apHand));

  buildApContainer();
}

function buildApContainer() {
  const container = document.getElementById('ap-container');
  container.innerHTML = '';

  const notes     = getApNotes();
  const fingering = getApFingering();
  const c         = ARPEGGIO_COURSES[apCourse];

  if (apCompleted) {
    renderApCompletion(container, notes);
    return;
  }

  const spatialIdx    = apDir === 'asc' ? apNoteIdx : (notes.length - 1 - apNoteIdx);
  const currentNote   = notes[apNoteIdx];
  const currentFinger = fingering[spatialIdx];

  document.getElementById('ap-progress').textContent = `${apNoteIdx + 1} / ${notes.length}`;

  // ── Info row ──
  const infoRow = document.createElement('div');
  infoRow.className = 'sp-info-row';

  const circle = document.createElement('div');
  circle.className = 'sp-finger-circle';
  circle.textContent = currentFinger;

  const noteInfo = document.createElement('div');
  noteInfo.className = 'sp-note-info';
  noteInfo.innerHTML =
    `<span class="sp-note-label">${apHand === 'rh' ? 'Right Hand' : 'Left Hand'}</span>` +
    `<span class="sp-note-label">Finger ${currentFinger} — what's the note?</span>`;

  infoRow.appendChild(circle);
  infoRow.appendChild(noteInfo);
  container.appendChild(infoRow);

  // ── Keyboard ──
  const { start, end } = getApRange();
  const allKeys = [];
  for (let s = start; s <= end; s++) allKeys.push(s);
  const whiteKeys = allKeys.filter(s => !isBlackKey(s));
  const numW      = whiteKeys.length;
  const wPct      = 100 / numW;

  const kb = document.createElement('div');
  kb.className = 'scale-keyboard';
  kb.style.cssText = 'position:relative;width:100%;flex-shrink:0;';

  function makeKey(s, leftPct, widthPct, heightPct, isBlack) {
    const isWrong = s === apWrongKey;
    const isHint  = apHintMode && s === currentNote;

    const el = document.createElement('div');
    el.className = (isBlack ? 'scale-key-black' : 'scale-key-white') +
      (isWrong ? ' sp-key-wrong' : '') +
      (isHint  ? ' sp-key-hint'  : '');

    el.style.cssText =
      `left:${leftPct}%;width:${widthPct}%;position:absolute;` +
      `height:${heightPct}%;top:0;z-index:${isBlack ? 2 : 0};box-sizing:border-box;`;
    el.addEventListener('click', () => apHandleClick(s));

    if (!isBlack) {
      const lbl = document.createElement('span');
      lbl.className = 'scale-key-label' + (isHint ? ' highlighted' : ' sp-label-neutral');
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
      (i < apNoteIdx  ? ' done'    : '') +
      (i === apNoteIdx ? ' current' : '');
    dotsRow.appendChild(dot);
  }
  container.appendChild(dotsRow);

  // ── Feedback ──
  const fb = document.createElement('div');
  fb.className = 'sp-feedback';
  if (apWrongKey !== null) {
    fb.innerHTML =
      `<span class="sp-feedback-wrong">✗ Wrong — correct note is <strong>${displayName(currentNote, c.useFlat)}</strong></span>`;
  }
  container.appendChild(fb);
}

function apHandleClick(semi) {
  if (apCompleted) return;

  const notes    = getApNotes();
  const expected = notes[apNoteIdx];
  const baseMidi = 60;

  if (semi === expected) {
    apWrongKey = null;
    apHintMode = false;
    apWaiting  = false;
    playPiano(midiToFreq(baseMidi + semi));
    apNoteIdx++;
    if (apNoteIdx >= notes.length) apCompleted = true;

    buildApContainer();
    const circle = document.querySelector('.sp-finger-circle');
    if (circle) {
      circle.classList.add('changed');
      setTimeout(() => circle.classList.remove('changed'), 200);
    }
  } else {
    if (apWaiting) return;
    apErrors++;
    apWrongKey = semi;
    apHintMode = true;
    apWaiting  = true;
    playPiano(midiToFreq(baseMidi + semi));
    buildApContainer();
    setTimeout(() => {
      if (apWrongKey === semi) {
        apWrongKey = null;
        apHintMode = false;
        apWaiting  = false;
        buildApContainer();
      }
    }, 1800);
  }
}

function renderApCompletion(container, notes) {
  document.getElementById('ap-progress').textContent = '✓ Done';

  const errClass = apErrors === 0 ? 'sp-stat-good' : apErrors <= 4 ? 'sp-stat-warn' : 'sp-stat-err';
  const msg = apErrors === 0
    ? 'Perfect run — no mistakes!'
    : apErrors <= 3 ? 'Great job! Nearly flawless.'
    : apErrors <= 7 ? 'Good practice. Try again for a clean run!'
    : 'Keep at it — repetition builds muscle memory.';

  const panel = document.createElement('div');
  panel.className = 'sp-completion';
  panel.innerHTML =
    `<div class="sp-completion-icon">🎉</div>` +
    `<div class="sp-completion-title">Arpeggio Complete!</div>` +
    `<div class="sp-completion-stats">` +
      `<span class="sp-stat-good">✓ ${notes.length} notes</span>` +
      `<span class="${errClass}">${apErrors === 0 ? '✓' : '✗'} ${apErrors} error${apErrors !== 1 ? 's' : ''}</span>` +
    `</div>` +
    `<div class="sp-completion-msg">${msg}</div>`;

  const btnRow = document.createElement('div');
  btnRow.className = 'sp-completion-btns';

  const againBtn = document.createElement('button');
  againBtn.textContent = '↺ Practice Again';
  againBtn.addEventListener('click', () => {
    apNoteIdx   = 0;
    apErrors    = 0;
    apWrongKey  = null;
    apWaiting   = false;
    apCompleted = false;
    buildApContainer();
  });

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Arpeggio';
  backBtn.addEventListener('click', () => {
    showPage('page-arpeggios-course');
    renderArpCourse();
  });

  btnRow.appendChild(againBtn);
  btnRow.appendChild(backBtn);
  panel.appendChild(btnRow);
  container.appendChild(panel);
}

function apReset() {
  apNoteIdx   = 0;
  apErrors    = 0;
  apWrongKey  = null;
  apHintMode  = false;
  apWaiting   = false;
  apCompleted = false;
}
