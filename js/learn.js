// ── Learn Mode State ───────────────────────────────────────────
let learnClef = 'treble';
let learnSpeed = 3000;
let learnInput = 'buttons';
let currentCourse = 0;
let lessonNoteIndex = 0;
let learnNoteQueue = [];
let learnNoteIndex = 0;
let learnWindowStart = 0;
let learnTimer = null;
let learnTimeLeft = 0;
let learnCorrect = 0;
let learnAnswered = 0;
let learnSetNum = 1;
let learnSetCorrect = 0;
let learnSetAnswered = 0;
let courseUnlocked = [true];
let courseCompleted = [];

const LEARN_VISIBLE = 8;

// ── Course Definitions ─────────────────────────────────────────
const COURSES = [
  { title: 'Course 1', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0, clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1, clef:'treble' },
  ]},
  { title: 'Course 2', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0, clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1, clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2, clef:'treble' },
  ]},
  { title: 'Course 3', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
  ]},
  { title: 'Course 4', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
  ]},
  { title: 'Course 5', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  clef:'treble' },
    { name:'G4', label:'G', octave:4, freq:392.00, pos:4,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
    { name:'A3', label:'A', octave:3, freq:220.00, pos:8,  clef:'bass'   },
  ]},
  { title: 'Course 6', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  clef:'treble' },
    { name:'G4', label:'G', octave:4, freq:392.00, pos:4,  clef:'treble' },
    { name:'A4', label:'A', octave:4, freq:440.00, pos:5,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
    { name:'A3', label:'A', octave:3, freq:220.00, pos:8,  clef:'bass'   },
    { name:'G3', label:'G', octave:3, freq:196.00, pos:7,  clef:'bass'   },
  ]},
  { title: 'Course 7', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  clef:'treble' },
    { name:'G4', label:'G', octave:4, freq:392.00, pos:4,  clef:'treble' },
    { name:'A4', label:'A', octave:4, freq:440.00, pos:5,  clef:'treble' },
    { name:'B4', label:'B', octave:4, freq:493.88, pos:6,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
    { name:'A3', label:'A', octave:3, freq:220.00, pos:8,  clef:'bass'   },
    { name:'G3', label:'G', octave:3, freq:196.00, pos:7,  clef:'bass'   },
    { name:'F3', label:'F', octave:3, freq:174.61, pos:6,  clef:'bass'   },
  ]},
  { title: 'Course 8', notes: [
    { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  clef:'treble' },
    { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  clef:'treble' },
    { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  clef:'treble' },
    { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  clef:'treble' },
    { name:'G4', label:'G', octave:4, freq:392.00, pos:4,  clef:'treble' },
    { name:'A4', label:'A', octave:4, freq:440.00, pos:5,  clef:'treble' },
    { name:'B4', label:'B', octave:4, freq:493.88, pos:6,  clef:'treble' },
    { name:'C5', label:'C', octave:5, freq:523.25, pos:7,  clef:'treble' },
    { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass'   },
    { name:'A3', label:'A', octave:3, freq:220.00, pos:8,  clef:'bass'   },
    { name:'G3', label:'G', octave:3, freq:196.00, pos:7,  clef:'bass'   },
    { name:'F3', label:'F', octave:3, freq:174.61, pos:6,  clef:'bass'   },
    { name:'E3', label:'E', octave:3, freq:164.81, pos:5,  clef:'bass'   },
  ]},
];

// ── Navigation ─────────────────────────────────────────────────
function selectLearnDifficulty(speed) {
  learnSpeed = speed === 'beginner' ? 4000
             : speed === 'intermediate' ? 2000
             : speed === 'advanced' ? 1000
             : 500;
  showPage('page-12');
}

function selectLearnInput(input) {
  learnInput = input;
  showPage('page-9');
  renderCourses();
}

// ── Courses List ───────────────────────────────────────────────
function renderCourses() {
  const list = document.getElementById('courses-list');
  list.innerHTML = '';

  COURSES.forEach((course, i) => {
    const unlocked = courseUnlocked[i] || false;
    const completed = courseCompleted[i] || false;

    const card = document.createElement('div');
    card.className = 'course-card' + (unlocked ? ' unlocked' : ' locked') + (completed ? ' completed' : '');

    const icon = completed ? '✅' : unlocked ? '🎵' : '🔒';
    const noteList = course.notes
      .map(n => getNoteName(n))
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ');

    card.innerHTML = `
      <div class="course-icon">${icon}</div>
      <div class="course-title">${course.title}</div>
      <div class="course-notes">${noteList}</div>
    `;

    if (unlocked) {
      card.addEventListener('click', () => openCourse(i));
    }

    list.appendChild(card);
  });
}

// ── Open Course → Intro Lesson ─────────────────────────────────
function openCourse(idx) {
  currentCourse = idx;
  lessonNoteIndex = 0;
  showPage('page-10');
  document.getElementById('lesson-title').textContent = COURSES[idx].title;
  document.getElementById('lesson-badge').textContent = 'Intro';
  renderLesson();
}

function renderLesson() {
  const course = COURSES[currentCourse];
  const note = course.notes[lessonNoteIndex];
  const total = course.notes.length;

  document.getElementById('lesson-prev-btn').style.display = lessonNoteIndex === 0 ? 'none' : 'inline-block';
  const isLast = lessonNoteIndex === total - 1;
  document.getElementById('lesson-next-btn').style.display = isLast ? 'none' : 'inline-block';
  document.getElementById('lesson-start-btn').style.display = isLast ? 'inline-block' : 'none';
  document.getElementById('lesson-badge').textContent = `${lessonNoteIndex + 1} / ${total}`;

  document.getElementById('lesson-staff-area').innerHTML = drawLearnStaff(note.clef, note);

  const noteName = getNoteName(note);
  document.getElementById('lesson-info').innerHTML = `
    <div class="lesson-note-name">${noteName}</div>
    <div class="lesson-note-detail">${note.name} — ${note.clef === 'treble' ? 'Treble' : 'Bass'} Clef</div>
    <button class="lesson-play-btn" onclick="playPiano(${note.freq})">▶ Play Sound</button>
  `;

  playPiano(note.freq);
}

function lessonNext() {
  lessonNoteIndex++;
  renderLesson();
}

function lessonPrev() {
  lessonNoteIndex--;
  renderLesson();
}

// ── Draw Learn Staff (single note, large) ─────────────────────
function drawLearnStaff(clef, note) {
  const W = 500;
  const H = 220;
  const lineSpacing = 18;
  const staffTop = 60;
  const noteX = 250;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const topLineY = staffTop;
  const offset = clef === 'treble' ? 2 : 0;
  const noteY = bottomLineY - (note.pos - offset) * (lineSpacing / 2);

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:500px;display:block;margin:0 auto;
    background:#1a1a20;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">`;

  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-20}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>`;
  }

  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY    = clef === 'treble' ? staffTop + lineSpacing * 3.5 : staffTop + lineSpacing * 2.8;
  const clefSize = clef === 'treble' ? 90 : 70;
  svg += `<text x="32" y="${clefY}" font-size="${clefSize}"
    fill="rgba(255,255,255,0.5)" font-family="serif">${clefSymbol}</text>`;

  if (noteY > bottomLineY + lineSpacing / 2) {
    let ly = bottomLineY + lineSpacing;
    while (ly <= noteY + 2) {
      svg += `<line x1="${noteX-16}" x2="${noteX+16}" y1="${ly}" y2="${ly}"
        stroke="rgba(255,255,255,0.5)" stroke-width="1.4"/>`;
      ly += lineSpacing;
    }
  }

  if (noteY < topLineY - lineSpacing / 2) {
    let ly = topLineY - lineSpacing;
    while (ly >= noteY - 2) {
      svg += `<line x1="${noteX-16}" x2="${noteX+16}" y1="${ly}" y2="${ly}"
        stroke="rgba(255,255,255,0.5)" stroke-width="1.4"/>`;
      ly -= lineSpacing;
    }
  }

  svg += `<ellipse cx="${noteX}" cy="${noteY}" rx="11" ry="8"
    fill="#c9a84c" transform="rotate(-15,${noteX},${noteY})"/>`;

  const stemUp = note.pos < (clef === 'treble' ? 6 : 5);
  const stemX  = stemUp ? noteX + 11 : noteX - 11;
  const stemY2 = stemUp ? noteY - 50 : noteY + 50;
  svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
    stroke="#c9a84c" stroke-width="2"/>`;

  svg += `</svg>`;
  return svg;
}

// ── Start Practice ─────────────────────────────────────────────
function startLearnPractice() {
  learnNoteIndex = 0;
  learnWindowStart = 0;
  learnCorrect = 0;
  learnAnswered = 0;
  learnSetNum = 1;
  learnSetCorrect = 0;
  learnSetAnswered = 0;

  // Reset accuracy display immediately
  const el = document.getElementById('learn-accuracy-pct');
  if (el) el.textContent = '100%';

  showPage('page-11');
  document.getElementById('learn-practice-title').textContent = COURSES[currentCourse].title;
  document.getElementById('learn-set-num').textContent = learnSetNum;

  generateLearnQueue();
  renderLearnStaff();

  const kbArea = document.getElementById('learn-keyboard-area');
  kbArea.innerHTML = '';
  kbArea.style.display = 'block';

  if (learnInput === 'keyboard') {
    buildLearnKeyboard();
  } else {
    buildLearnButtons();
  }

  startLearnTimer();
}

function generateLearnQueue() {
  const pool = COURSES[currentCourse].notes;
  learnNoteQueue = [];
  for (let i = 0; i < LEARN_VISIBLE * 3; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)];
    learnNoteQueue.push({ ...note, state: 'pending' });
  }
  learnNoteIndex = 0;
  learnWindowStart = 0;
}

// ── Learn Staff Render ─────────────────────────────────────────
function renderLearnStaff() {
  const area = document.getElementById('learn-staff-area');
  const visibleNotes = learnNoteQueue.slice(learnWindowStart, learnWindowStart + LEARN_VISIBLE);
  const activePos = learnNoteIndex - learnWindowStart;

  const hasBass   = visibleNotes.some(n => n.clef === 'bass');
  const hasTreble = visibleNotes.some(n => n.clef === 'treble');

  let html = '';
  if (hasTreble && hasBass) {
    html = drawLearnBothStaves(visibleNotes, activePos);
  } else {
    const clef = visibleNotes[0] ? visibleNotes[0].clef : 'treble';
    html = drawLearnSingleStaff(clef, visibleNotes, activePos);
  }

  area.innerHTML = html;
}

function drawLearnSingleStaff(clef, notes, activePos) {
  const W = 900;
  const H = 260;
  const lineSpacing = 16;
  const staffTop = 90;
  const noteSpacing = 100;
  const startX = 110;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const topLineY = staffTop;
  const offset = clef === 'treble' ? 2 : 0;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block;background:#1a1a20;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);margin:0;">`;

  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-10}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY    = clef === 'treble' ? staffTop + lineSpacing * 3.5 : staffTop + lineSpacing * 2.8;
  const clefSize = clef === 'treble' ? 90 : 70;
  svg += `<text x="32" y="${clefY}" font-size="${clefSize}"
    fill="rgba(255,255,255,0.5)" font-family="serif">${clefSymbol}</text>`;

  svg += `<text x="15" y="${H - 6}" font-size="10"
    fill="rgba(255,255,255,0.25)" font-family="sans-serif">
    ${clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</text>`;

  notes.forEach((note, i) => {
    const x = startX + i * noteSpacing;
    const noteY = bottomLineY - (note.pos - offset) * (lineSpacing / 2);

    let fill = 'rgba(255,255,255,0.35)';
    if (i === activePos)          fill = '#c9a84c';
    if (note.state === 'correct') fill = '#4caf82';
    if (note.state === 'wrong')   fill = '#e05c5c';

    if (i === activePos) {
      svg += `<rect x="${x-20}" y="${noteY-50}" width="40" height="100"
        rx="4" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.3)" stroke-width="1"/>`;
    }

    if (noteY > bottomLineY + lineSpacing / 2) {
      let ly = bottomLineY + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    if (noteY < topLineY - lineSpacing / 2) {
      let ly = topLineY - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    svg += `<ellipse cx="${x}" cy="${noteY}" rx="9" ry="6.5"
      fill="${fill}" transform="rotate(-15,${x},${noteY})"/>`;

    const stemUp = note.pos < (clef === 'treble' ? 6 : 5);
    const stemX  = stemUp ? x + 9 : x - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
      stroke="${fill}" stroke-width="1.5"/>`;

    const labelColor = note.state === 'correct' ? '#4caf82'
                     : note.state === 'wrong'   ? '#e05c5c'
                     : i === activePos           ? '#c9a84c'
                     : 'rgba(255,255,255,0.3)';
    const labelY = Math.min(H - 8, noteY + 22);
    svg += `<text x="${x}" y="${labelY}" font-size="12" fill="${labelColor}"
      text-anchor="middle" font-family="sans-serif" font-weight="600">${getNoteName(note)}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

function drawLearnBothStaves(notes, activePos) {
  const W = 900;
  const lineSpacing = 16;
  const noteSpacing = 100;
  const startX = 110;
  const trebleStaffBottom = 130;
  const trebleStaffTop    = trebleStaffBottom - 4 * lineSpacing;
  const bassStaffTop      = trebleStaffBottom + 2 * lineSpacing;
  const bassStaffBottom   = bassStaffTop + 4 * lineSpacing;
  const middleCY          = trebleStaffBottom + lineSpacing;
  const H = bassStaffBottom + 80;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block;background:#1a1a20;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);margin:0;">`;

  for (let i = 0; i < 5; i++) {
    svg += `<line x1="30" x2="${W-10}" y1="${trebleStaffTop + i*lineSpacing}" y2="${trebleStaffTop + i*lineSpacing}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
    svg += `<line x1="30" x2="${W-10}" y1="${bassStaffTop + i*lineSpacing}" y2="${bassStaffTop + i*lineSpacing}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  svg += `<text x="32" y="${trebleStaffTop + lineSpacing * 3.5}" font-size="90" fill="rgba(255,255,255,0.5)" font-family="serif">𝄞</text>`;
  svg += `<text x="32" y="${bassStaffTop + lineSpacing * 2.8}" font-size="70" fill="rgba(255,255,255,0.5)" font-family="serif">𝄢</text>`;
  svg += `<line x1="30" x2="30" y1="${trebleStaffTop}" y2="${bassStaffBottom}" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>`;

  notes.forEach((note, i) => {
    const x = startX + i * noteSpacing;
    const isTreble = note.clef === 'treble';
    const staffBottom = isTreble ? trebleStaffBottom : bassStaffBottom;
    const staffTop2   = isTreble ? trebleStaffTop    : bassStaffTop;
    const noteY = isTreble
      ? trebleStaffBottom - (note.pos - 2) * (lineSpacing / 2)
      : bassStaffBottom   - (note.pos - 0) * (lineSpacing / 2);

    let fill = 'rgba(255,255,255,0.35)';
    if (i === activePos)          fill = '#c9a84c';
    if (note.state === 'correct') fill = '#4caf82';
    if (note.state === 'wrong')   fill = '#e05c5c';

    if (i === activePos) {
      svg += `<rect x="${x-20}" y="${trebleStaffTop-10}" width="40"
        height="${bassStaffBottom - trebleStaffTop + 20}"
        rx="4" fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>`;
    }

    const isMiddleC = (isTreble && note.pos === 0) || (!isTreble && note.pos === 10);
    if (isMiddleC) {
      svg += `<line x1="${x-14}" x2="${x+14}" y1="${middleCY}" y2="${middleCY}"
        stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
    }

    if (noteY > staffBottom + lineSpacing / 2 && !isMiddleC) {
      let ly = staffBottom + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    if (noteY < staffTop2 - lineSpacing / 2 && !isMiddleC) {
      let ly = staffTop2 - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    svg += `<ellipse cx="${x}" cy="${noteY}" rx="9" ry="6.5"
      fill="${fill}" transform="rotate(-15,${x},${noteY})"/>`;

    const stemUp = isTreble ? note.pos < 6 : note.pos < 5;
    const stemX  = stemUp ? x + 9 : x - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
      stroke="${fill}" stroke-width="1.5"/>`;

    const labelColor = note.state === 'correct' ? '#4caf82'
                     : note.state === 'wrong'   ? '#e05c5c'
                     : i === activePos           ? '#c9a84c'
                     : 'rgba(255,255,255,0.3)';
    const labelY = isTreble ? Math.max(12, noteY - 20) : Math.min(H - 6, noteY + 20);
    svg += `<text x="${x}" y="${labelY}" font-size="11" fill="${labelColor}"
      text-anchor="middle" font-family="sans-serif" font-weight="600">${getNoteName(note)}</text>`;
  });

  svg += `</svg>`;
  return svg;
}

// ── Learn Keyboard ─────────────────────────────────────────────
function buildLearnKeyboard() {
  const kb = document.getElementById('learn-keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'keyboard';

  const whites = OCTAVE_KEYS.filter(k => k.type === 'white');
  const totalWhites = whites.length;
  const whiteWidthPct = 100 / totalWhites;
  const italianMap = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };

  whites.forEach(k => {
    const el = document.createElement('div');
    el.className = 'key-white';
    el.dataset.note = k.note;
    const lbl = document.createElement('span');
    lbl.className = 'key-label';
    lbl.textContent = selectedNaming === 'italian' ? italianMap[k.note] : k.note;
    el.appendChild(lbl);
    el.addEventListener('click', () => onLearnKeyClick(k, el));
    wrap.appendChild(el);
  });

  const blackKeys = [
    { note:'C#', after:0 },
    { note:'D#', after:1 },
    { note:'F#', after:3 },
    { note:'G#', after:4 },
    { note:'A#', after:5 },
  ];

  blackKeys.forEach(k => {
    const el = document.createElement('div');
    el.className = 'key-black';
    el.dataset.note = k.note;
    const leftPct = (k.after + 1) * whiteWidthPct - 5;
    el.style.left = leftPct + '%';
    el.addEventListener('click', () => onLearnKeyClick(k, el));
    wrap.appendChild(el);
  });

  kb.appendChild(wrap);
}

function onLearnKeyClick(k, el) {
  if (!learnNoteQueue.length) return;
  if (learnNoteQueue[learnNoteIndex].state !== 'pending') return;

  const currentNote = learnNoteQueue[learnNoteIndex];
  clearInterval(learnTimer);
  playPiano(currentNote.freq);

  learnSetAnswered++;
  learnAnswered++;

  if (k.note === currentNote.label) {
    learnNoteQueue[learnNoteIndex].state = 'correct';
    el.style.background = '#4caf82';
    learnSetCorrect++;
    learnCorrect++;
    renderLearnStaff();
    requestAnimationFrame(() => {
      el.style.background = '';
      advanceLearnNote();
    });
  } else {
    learnNoteQueue[learnNoteIndex].state = 'wrong';
    el.style.background = '#e05c5c';
    document.querySelectorAll('#learn-keyboard-area .key-white, #learn-keyboard-area .key-black').forEach(key => {
      if (key.dataset.note === currentNote.label) key.style.background = '#4caf82';
    });
    renderLearnStaff();
    requestAnimationFrame(() => {
      document.querySelectorAll('#learn-keyboard-area .key-white, #learn-keyboard-area .key-black').forEach(key => {
        key.style.background = '';
      });
      advanceLearnNote();
    });
  }
}

// ── Learn Answer Buttons ───────────────────────────────────────
function buildLearnButtons() {
  const kb = document.getElementById('learn-keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'answer-buttons';
  wrap.id = 'learn-answer-wrap';

  const noteNames = selectedNaming === 'american'
    ? ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    : ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  const labels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  labels.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = noteNames[i];
    btn.dataset.label = label;
    btn.addEventListener('click', () => onLearnAnswer(label, btn));
    wrap.appendChild(btn);
  });

  kb.appendChild(wrap);
}

function resetLearnButtons() {
  document.querySelectorAll('#learn-answer-wrap .answer-btn').forEach(b => {
    b.style.background = '';
    b.style.borderColor = '';
    b.disabled = false;
  });
}

function onLearnAnswer(label, btn) {
  if (!learnNoteQueue.length) return;
  if (learnNoteQueue[learnNoteIndex].state !== 'pending') return;

  const currentNote = learnNoteQueue[learnNoteIndex];
  clearInterval(learnTimer);
  playPiano(currentNote.freq);

  document.querySelectorAll('#learn-answer-wrap .answer-btn').forEach(b => b.disabled = true);
  learnSetAnswered++;
  learnAnswered++;

  if (label === currentNote.label) {
    learnNoteQueue[learnNoteIndex].state = 'correct';
    btn.style.background = '#4caf82';
    btn.style.borderColor = '#4caf82';
    learnSetCorrect++;
    learnCorrect++;
    renderLearnStaff();
    requestAnimationFrame(() => {
      resetLearnButtons();
      advanceLearnNote();
    });
  } else {
    learnNoteQueue[learnNoteIndex].state = 'wrong';
    btn.style.background = '#e05c5c';
    btn.style.borderColor = '#e05c5c';
    document.querySelectorAll('#learn-answer-wrap .answer-btn').forEach(b => {
      if (b.dataset.label === currentNote.label) {
        b.style.background = '#4caf82';
        b.style.borderColor = '#4caf82';
      }
    });
    renderLearnStaff();
    requestAnimationFrame(() => {
      resetLearnButtons();
      advanceLearnNote();
    });
  }
}

// ── Learn Timer ────────────────────────────────────────────────
function startLearnTimer() {
  clearInterval(learnTimer);
  learnTimeLeft = learnSpeed / 1000;

  learnTimer = setInterval(() => {
    learnTimeLeft = parseFloat((learnTimeLeft - 0.1).toFixed(1));
    if (learnTimeLeft <= 0) {
      clearInterval(learnTimer);
      learnTimeExpired();
    }
  }, 100);
}

function learnTimeExpired() {
  if (learnNoteIndex < learnNoteQueue.length) {
    learnNoteQueue[learnNoteIndex].state = 'wrong';
    learnSetAnswered++;
    learnAnswered++;
    renderLearnStaff();
  }
  advanceLearnNote();
}

// ── Learn Advance ──────────────────────────────────────────────
function advanceLearnNote() {
  clearInterval(learnTimer);
  learnNoteIndex++;

  const windowEnd = learnWindowStart + LEARN_VISIBLE;
  const windowNotes = learnNoteQueue.slice(learnWindowStart, windowEnd);
  const allDone = windowNotes.length === LEARN_VISIBLE &&
    windowNotes.every(n => n.state === 'correct' || n.state === 'wrong');

  if (allDone) {
    const setAccuracy = learnSetAnswered > 0
      ? (learnSetCorrect / learnSetAnswered) * 100 : 0;

    if (learnSetNum < 3) {
      showLearnSetResult(setAccuracy);
    } else {
      const totalAccuracy = learnAnswered > 0
        ? (learnCorrect / learnAnswered) * 100 : 0;
      showLearnComplete(totalAccuracy);
    }
    return;
  }

  updateLearnAccuracy();
  renderLearnStaff();
  startLearnTimer();
}

function showLearnSetResult(accuracy) {
  const passed = accuracy >= 75;
  const fb = document.getElementById('learn-feedback');
  fb.style.color = passed ? '#4caf82' : '#e05c5c';
  fb.textContent = passed
    ? `✓ Set ${learnSetNum} passed! (${Math.round(accuracy)}%) — Next set starting...`
    : `✗ Set ${learnSetNum}: ${Math.round(accuracy)}% — Keep going!`;

  setTimeout(() => {
    fb.textContent = '';
    learnSetNum++;
    learnSetCorrect = 0;
    learnSetAnswered = 0;
    learnWindowStart += LEARN_VISIBLE;
    learnNoteIndex = learnWindowStart;
    document.getElementById('learn-set-num').textContent = learnSetNum;
    renderLearnStaff();
    startLearnTimer();
  }, 1500);
}

function showLearnComplete(accuracy) {
  clearInterval(learnTimer);
  const passed = accuracy >= 75;
  const fb = document.getElementById('learn-feedback');

  if (passed) {
    if (currentCourse + 1 < COURSES.length) {
      courseUnlocked[currentCourse + 1] = true;
    }
    courseCompleted[currentCourse] = true;
    fb.style.color = '#4caf82';
    fb.textContent = `🎉 Course complete! ${Math.round(accuracy)}% accuracy — Next course unlocked!`;
  } else {
    fb.style.color = '#e05c5c';
    fb.textContent = `${Math.round(accuracy)}% accuracy — You need 75% to unlock the next course. Try again!`;
  }

  setTimeout(() => {
    fb.textContent = '';
    showPage('page-9');
    renderCourses();
  }, 3000);
}

function updateLearnAccuracy() {
  const el = document.getElementById('learn-accuracy-pct');
  if (!el) return;
  if (learnAnswered === 0) { el.textContent = '100%'; return; }
  const bufferSize = 10;
  const pct = Math.round(((learnCorrect + bufferSize) / (learnAnswered + bufferSize)) * 100);
  el.textContent = pct + '%';
}