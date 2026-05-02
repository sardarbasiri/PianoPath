let selectedTopic = '';
let selectedClef = '';
let selectedInput = '';
let selectedDifficulty = 'beginner';
let selectedNaming = 'american';
let currentNoteIndex = 0;
let windowStart = 0;
let noteQueue = [];
let timer = null;
let timeLeft = 0;

const VISIBLE_NOTES = 6;

const DIFFICULTY = {
  beginner:     4,
  intermediate: 2,
  advanced:     1,
  expert:       0.5
};

// ── Audio ──────────────────────────────────────────────────────
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playPiano(freq) {
  const ac = getCtx();
  const now = ac.currentTime;

  const osc1 = ac.createOscillator();
  const gain1 = ac.createGain();
  osc1.type = 'triangle';
  osc1.frequency.value = freq;
  gain1.gain.setValueAtTime(0.5, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
  osc1.connect(gain1);
  gain1.connect(ac.destination);
  osc1.start(now);
  osc1.stop(now + 2.0);

  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2;
  gain2.gain.setValueAtTime(0.2, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  osc2.connect(gain2);
  gain2.connect(ac.destination);
  osc2.start(now);
  osc2.stop(now + 1.2);

  const osc3 = ac.createOscillator();
  const gain3 = ac.createGain();
  osc3.type = 'sine';
  osc3.frequency.value = freq * 3;
  gain3.gain.setValueAtTime(0.08, now);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc3.connect(gain3);
  gain3.connect(ac.destination);
  osc3.start(now);
  osc3.stop(now + 0.8);

  const bufferSize = ac.sampleRate * 0.04;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ac.createBufferSource();
  const noiseGain = ac.createGain();
  const noiseFilter = ac.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = freq * 1.5;
  noiseFilter.Q.value = 0.8;
  noise.buffer = buffer;
  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ac.destination);
  noise.start(now);
}

// ── Note Naming ────────────────────────────────────────────────
function toggleNaming() {
  selectedNaming = selectedNaming === 'american' ? 'italian' : 'american';
  const btn = document.getElementById('naming-btn');
  btn.textContent = selectedNaming === 'american'
    ? '🇺🇸 American (C, D, E...)'
    : '🇮🇹 Italian (Do, Re, Mi...)';
}

function getNoteName(note) {
  if (selectedNaming === 'american') return note.label;
  const italian = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
  return italian[note.label];
}

// ── Note Data ──────────────────────────────────────────────────
const TREBLE_NOTES = [
  { name:'C4', label:'C', octave:4, freq:261.63,  pos:0,  clef:'treble' },
  { name:'D4', label:'D', octave:4, freq:293.66,  pos:1,  clef:'treble' },
  { name:'E4', label:'E', octave:4, freq:329.63,  pos:2,  clef:'treble' },
  { name:'F4', label:'F', octave:4, freq:349.23,  pos:3,  clef:'treble' },
  { name:'G4', label:'G', octave:4, freq:392.00,  pos:4,  clef:'treble' },
  { name:'A4', label:'A', octave:4, freq:440.00,  pos:5,  clef:'treble' },
  { name:'B4', label:'B', octave:4, freq:493.88,  pos:6,  clef:'treble' },
  { name:'C5', label:'C', octave:5, freq:523.25,  pos:7,  clef:'treble' },
  { name:'D5', label:'D', octave:5, freq:587.33,  pos:8,  clef:'treble' },
  { name:'E5', label:'E', octave:5, freq:659.25,  pos:9,  clef:'treble' },
  { name:'F5', label:'F', octave:5, freq:698.46,  pos:10, clef:'treble' },
  { name:'G5', label:'G', octave:5, freq:784.00,  pos:11, clef:'treble' },
  { name:'A5', label:'A', octave:5, freq:880.00,  pos:12, clef:'treble' },
  { name:'B5', label:'B', octave:5, freq:987.77,  pos:13, clef:'treble' },
  { name:'C6', label:'C', octave:6, freq:1046.50, pos:14, clef:'treble' },
  { name:'D6', label:'D', octave:6, freq:1174.66, pos:15, clef:'treble' },
  { name:'E6', label:'E', octave:6, freq:1318.51, pos:16, clef:'treble' },
];

const BASS_NOTES = [
  { name:'E2', label:'E', octave:2, freq:82.41,  pos:-2, clef:'bass' },
  { name:'F2', label:'F', octave:2, freq:87.31,  pos:-1, clef:'bass' },
  { name:'G2', label:'G', octave:2, freq:98.00,  pos:0,  clef:'bass' },
  { name:'A2', label:'A', octave:2, freq:110.00, pos:1,  clef:'bass' },
  { name:'B2', label:'B', octave:2, freq:123.47, pos:2,  clef:'bass' },
  { name:'C3', label:'C', octave:3, freq:130.81, pos:3,  clef:'bass' },
  { name:'D3', label:'D', octave:3, freq:146.83, pos:4,  clef:'bass' },
  { name:'E3', label:'E', octave:3, freq:164.81, pos:5,  clef:'bass' },
  { name:'F3', label:'F', octave:3, freq:174.61, pos:6,  clef:'bass' },
  { name:'G3', label:'G', octave:3, freq:196.00, pos:7,  clef:'bass' },
  { name:'A3', label:'A', octave:3, freq:220.00, pos:8,  clef:'bass' },
  { name:'B3', label:'B', octave:3, freq:246.94, pos:9,  clef:'bass' },
  { name:'C4', label:'C', octave:4, freq:261.63, pos:10, clef:'bass' },
  { name:'D4', label:'D', octave:4, freq:293.66, pos:11, clef:'bass' },
  { name:'E4', label:'E', octave:4, freq:329.63, pos:12, clef:'bass' },
];

// ── Page Navigation ────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('div[id^="page-"]').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
}

function goTo(topic, title) {
  selectedTopic = topic;
  document.getElementById('page2-title').textContent = title;
  showPage('page-2');
}

function practiceClick() {
  if (selectedTopic === 'sight-reading') {
    showPage('page-3');
  } else {
    alert('Coming soon!');
  }
}

function selectClef(clef) {
  selectedClef = clef;
  showPage('page-5');
}

function startWithInput(inputMethod) {
  selectedInput = inputMethod;
  showPage('page-6');
}

function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  showPage('page-4');

  const kbArea = document.getElementById('keyboard-area');

  if (selectedInput === 'keyboard') {
    kbArea.style.display = 'block';
    buildKeyboard();
  } else if (selectedInput === 'buttons') {
    kbArea.style.display = 'block';
  } else if (selectedInput === 'midi') {
    kbArea.style.display = 'none';
    setupMIDI();
  }

  generateNoteQueue();
  renderStaff();
  if (selectedInput === 'buttons') buildAnswerButtons();
  startTimer();
}

// ── Note Queue ─────────────────────────────────────────────────
function getPool() {
  if (selectedClef === 'treble') return TREBLE_NOTES;
  if (selectedClef === 'bass')   return BASS_NOTES;
  return [...TREBLE_NOTES, ...BASS_NOTES];
}

function generateNoteQueue() {
  const pool = getPool();
  noteQueue = [];
  for (let i = 0; i < 120; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)];
    noteQueue.push({ ...note, state: 'pending' });
  }
  currentNoteIndex = 0;
  windowStart = 0;
}

function topUpQueue() {
  const pool = getPool();
  for (let i = 0; i < 30; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)];
    noteQueue.push({ ...note, state: 'pending' });
  }
}

// ── Render Staff ───────────────────────────────────────────────
function renderStaff() {
  const area = document.getElementById('staff-area');
  const visibleNotes = noteQueue.slice(windowStart, windowStart + VISIBLE_NOTES);
  const activePos = currentNoteIndex - windowStart;

  let html = '';
  if (selectedClef === 'both') {
    html += drawStaff('treble', visibleNotes, activePos);
    html += drawStaff('bass',   visibleNotes, activePos);
  } else {
    html += drawStaff(selectedClef, visibleNotes, activePos);
  }

  area.innerHTML = html;
}

function drawStaff(clef, notes, activePos) {
  const W = 900;
  const H = 260;
  const lineSpacing = 16;
  const staffTop = 90;
  const noteSpacing = 120;
  const startX = 110;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const topLineY = staffTop;

  // Treble: bottom line = E4 = pos 2, offset = 2
  // Bass:   bottom line = G2 = pos 0, offset = 0
  const offset = clef === 'treble' ? 2 : 0;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block;background:#1a1a20;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);margin:0.4rem 0;">`;

  // Staff lines
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-10}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  // Clef symbol
  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY    = clef === 'treble' ? staffTop + lineSpacing * 3.5 : staffTop + lineSpacing * 2.8;
  const clefSize = clef === 'treble' ? 90 : 70;
  svg += `<text x="32" y="${clefY}" font-size="${clefSize}"
    fill="rgba(255,255,255,0.5)" font-family="serif">${clefSymbol}</text>`;

  // Clef label
  svg += `<text x="15" y="${H - 6}" font-size="10"
    fill="rgba(255,255,255,0.25)" font-family="sans-serif">
    ${clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</text>`;

  notes.forEach((note, i) => {
    if (selectedClef === 'both' && note.clef !== clef) {
      const x = startX + i * noteSpacing;
      svg += `<line x1="${x-8}" x2="${x+8}"
        y1="${bottomLineY - 2 * lineSpacing}"
        y2="${bottomLineY - 2 * lineSpacing}"
        stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
      return;
    }

    const x = startX + i * noteSpacing;
    const noteY = bottomLineY - (note.pos - offset) * (lineSpacing / 2);

    let fill = 'rgba(255,255,255,0.35)';
    if (i === activePos)          fill = '#c9a84c';
    if (note.state === 'correct') fill = '#4caf82';
    if (note.state === 'wrong')   fill = '#e05c5c';

    // Active highlight box
    if (i === activePos) {
      svg += `<rect x="${x-20}" y="${noteY - 50}" width="40" height="100"
        rx="4" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.3)" stroke-width="1"/>`;
    }

    // Ledger lines below staff
    if (noteY > bottomLineY + lineSpacing / 2) {
      let ly = bottomLineY + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    // Ledger lines above staff
    if (noteY < topLineY - lineSpacing / 2) {
      let ly = topLineY - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    // Note head
    svg += `<ellipse cx="${x}" cy="${noteY}" rx="9" ry="6.5"
      fill="${fill}" transform="rotate(-15,${x},${noteY})"/>`;

    // Stem
    const stemUp = note.pos < (clef === 'treble' ? 6 : 5);
    const stemX  = stemUp ? x + 9 : x - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
      stroke="${fill}" stroke-width="1.5"/>`;

    // Note name label after answered
    if (note.state === 'correct' || note.state === 'wrong') {
      const labelColor = note.state === 'correct' ? '#4caf82' : '#e05c5c';
      svg += `<text x="${x}" y="${H - 8}" font-size="11" fill="${labelColor}"
        text-anchor="middle" font-family="sans-serif" font-weight="500">${getNoteName(note)}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

// ── Timer ──────────────────────────────────────────────────────
function startTimer() {
  clearInterval(timer);
  timeLeft = DIFFICULTY[selectedDifficulty];

  timer = setInterval(() => {
    timeLeft = parseFloat((timeLeft - 0.1).toFixed(1));
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeExpired();
    }
  }, 100);
}

function timeExpired() {
  if (currentNoteIndex < noteQueue.length) {
    noteQueue[currentNoteIndex].state = 'wrong';
    renderStaff();
  }
  setTimeout(() => advanceNote(), 80);
}

// ── Answer Handling ────────────────────────────────────────────
function onKeyClick(k, el) {
  if (!noteQueue.length) return;
  if (noteQueue[currentNoteIndex].state !== 'pending') return;

  const currentNote = noteQueue[currentNoteIndex];
  clearInterval(timer);
  playPiano(k.freq);

  if (k.note === currentNote.name) {
    noteQueue[currentNoteIndex].state = 'correct';
    el.style.background = '#4caf82';
    renderStaff();
    setTimeout(() => {
      el.style.background = '';
      advanceNote();
    }, 80);
  } else {
    noteQueue[currentNoteIndex].state = 'wrong';
    el.style.background = '#e05c5c';
    renderStaff();
    setTimeout(() => {
      el.style.background = '';
      advanceNote();
    }, 80);
  }
}

// ── Answer Buttons ─────────────────────────────────────────────
function buildAnswerButtons() {
  const kb = document.getElementById('keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'answer-buttons';

  const noteNames = selectedNaming === 'american'
    ? ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    : ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

  const labels = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  labels.forEach((label, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = noteNames[i];
    btn.dataset.label = label;
    btn.addEventListener('click', () => onAnswerClick(label, btn));
    wrap.appendChild(btn);
  });

  kb.appendChild(wrap);
}

function onAnswerClick(label, btn) {
  if (!noteQueue.length) return;
  if (noteQueue[currentNoteIndex].state !== 'pending') return;

  const currentNote = noteQueue[currentNoteIndex];
  clearInterval(timer);
  playPiano(currentNote.freq);

  // Reset all button styles first
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.style.background = '';
    b.style.borderColor = '';
  });

  if (label === currentNote.label) {
    noteQueue[currentNoteIndex].state = 'correct';
    btn.style.background = '#4caf82';
    btn.style.borderColor = '#4caf82';
    renderStaff();
    setTimeout(() => {
      btn.style.background = '';
      btn.style.borderColor = '';
      advanceNote();
    }, 80);
  } else {
    noteQueue[currentNoteIndex].state = 'wrong';
    btn.style.background = '#e05c5c';
    btn.style.borderColor = '#e05c5c';
    // highlight correct button
    document.querySelectorAll('.answer-btn').forEach(b => {
      if (b.dataset.label === currentNote.label) {
        b.style.background = '#4caf82';
        b.style.borderColor = '#4caf82';
      }
    });
    renderStaff();
    setTimeout(() => {
      document.querySelectorAll('.answer-btn').forEach(b => {
        b.style.background = '';
        b.style.borderColor = '';
      });
      advanceNote();
    }, 80);
  }
}

function advanceNote() {
  clearInterval(timer);
  currentNoteIndex++;

  const windowEnd = windowStart + VISIBLE_NOTES;
  const windowNotes = noteQueue.slice(windowStart, windowEnd);
  const allDone = windowNotes.length === VISIBLE_NOTES &&
    windowNotes.every(n => n.state === 'correct' || n.state === 'wrong');

  if (allDone) {
    windowStart += VISIBLE_NOTES;
    currentNoteIndex = windowStart;
  }

  if (windowStart + VISIBLE_NOTES * 2 >= noteQueue.length) {
    topUpQueue();
  }

  renderStaff();
  startTimer();
}

// ── Keyboard ───────────────────────────────────────────────────
const ALL_KEYS = [
  {note:'C1', type:'white', freq:32.70  }, {note:'C#1',type:'black',freq:34.65  },
  {note:'D1', type:'white', freq:36.71  }, {note:'D#1',type:'black',freq:38.89  },
  {note:'E1', type:'white', freq:41.20  }, {note:'F1', type:'white', freq:43.65  },
  {note:'F#1',type:'black', freq:46.25  }, {note:'G1', type:'white', freq:49.00  },
  {note:'G#1',type:'black', freq:51.91  }, {note:'A1', type:'white', freq:55.00  },
  {note:'A#1',type:'black', freq:58.27  }, {note:'B1', type:'white', freq:61.74  },
  {note:'C2', type:'white', freq:65.41  }, {note:'C#2',type:'black', freq:69.30  },
  {note:'D2', type:'white', freq:73.42  }, {note:'D#2',type:'black', freq:77.78  },
  {note:'E2', type:'white', freq:82.41  }, {note:'F2', type:'white', freq:87.31  },
  {note:'F#2',type:'black', freq:92.50  }, {note:'G2', type:'white', freq:98.00  },
  {note:'G#2',type:'black', freq:103.83 }, {note:'A2', type:'white', freq:110.00 },
  {note:'A#2',type:'black', freq:116.54 }, {note:'B2', type:'white', freq:123.47 },
  {note:'C3', type:'white', freq:130.81 }, {note:'C#3',type:'black', freq:138.59 },
  {note:'D3', type:'white', freq:146.83 }, {note:'D#3',type:'black', freq:155.56 },
  {note:'E3', type:'white', freq:164.81 }, {note:'F3', type:'white', freq:174.61 },
  {note:'F#3',type:'black', freq:185.00 }, {note:'G3', type:'white', freq:196.00 },
  {note:'G#3',type:'black', freq:207.65 }, {note:'A3', type:'white', freq:220.00 },
  {note:'A#3',type:'black', freq:233.08 }, {note:'B3', type:'white', freq:246.94 },
  {note:'C4', type:'white', freq:261.63 }, {note:'C#4',type:'black', freq:277.18 },
  {note:'D4', type:'white', freq:293.66 }, {note:'D#4',type:'black', freq:311.13 },
  {note:'E4', type:'white', freq:329.63 }, {note:'F4', type:'white', freq:349.23 },
  {note:'F#4',type:'black', freq:369.99 }, {note:'G4', type:'white', freq:392.00 },
  {note:'G#4',type:'black', freq:415.30 }, {note:'A4', type:'white', freq:440.00 },
  {note:'A#4',type:'black', freq:466.16 }, {note:'B4', type:'white', freq:493.88 },
  {note:'C5', type:'white', freq:523.25 }, {note:'C#5',type:'black', freq:554.37 },
  {note:'D5', type:'white', freq:587.33 }, {note:'D#5',type:'black', freq:622.25 },
  {note:'E5', type:'white', freq:659.25 }, {note:'F5', type:'white', freq:698.46 },
  {note:'F#5',type:'black', freq:739.99 }, {note:'G5', type:'white', freq:784.00 },
  {note:'G#5',type:'black', freq:830.61 }, {note:'A5', type:'white', freq:880.00 },
  {note:'A#5',type:'black', freq:932.33 }, {note:'B5', type:'white', freq:987.77 },
  {note:'C6', type:'white', freq:1046.50}, {note:'C#6',type:'black', freq:1108.73},
  {note:'D6', type:'white', freq:1174.66}, {note:'D#6',type:'black', freq:1244.51},
  {note:'E6', type:'white', freq:1318.51}, {note:'F6', type:'white', freq:1396.91},
  {note:'F#6',type:'black', freq:1479.98}, {note:'G6', type:'white', freq:1567.98},
  {note:'G#6',type:'black', freq:1661.22}, {note:'A6', type:'white', freq:1760.00},
  {note:'A#6',type:'black', freq:1864.66}, {note:'B6', type:'white', freq:1975.53},
  {note:'C7', type:'white', freq:2093.00},
];

function buildKeyboard() {
  const kb = document.getElementById('keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'keyboard';

  const whites = ALL_KEYS.filter(k => k.type === 'white');
  const totalWhites = whites.length;
  const whiteWidthPct = 100 / totalWhites;

  whites.forEach(k => {
    const el = document.createElement('div');
    el.className = 'key-white';
    el.dataset.note = k.note;
    if (k.note.startsWith('C') && !k.note.includes('#')) {
      const lbl = document.createElement('span');
      lbl.className = 'key-label';
      lbl.textContent = k.note;
      el.appendChild(lbl);
    }
    el.addEventListener('click', () => onKeyClick(k, el));
    wrap.appendChild(el);
  });

  ALL_KEYS.forEach((k, i) => {
    if (k.type !== 'black') return;
    const whitesBefore = ALL_KEYS.slice(0, i).filter(x => x.type === 'white').length;
    const leftPct = whitesBefore * whiteWidthPct - (whiteWidthPct * 0.3);
    const el = document.createElement('div');
    el.className = 'key-black';
    el.dataset.note = k.note;
    el.style.left = leftPct + '%';
    el.addEventListener('click', () => onKeyClick(k, el));
    wrap.appendChild(el);
  });

  kb.appendChild(wrap);
}

// ── MIDI ───────────────────────────────────────────────────────
function setupMIDI() {
  if (!navigator.requestMIDIAccess) {
    document.getElementById('feedback').textContent = '⚠ MIDI not supported. Try Chrome.';
    document.getElementById('feedback').style.color = '#e05c5c';
    return;
  }
  navigator.requestMIDIAccess().then(access => {
    document.getElementById('feedback').textContent = '✓ MIDI connected! Play a note.';
    document.getElementById('feedback').style.color = '#4caf82';
    access.inputs.forEach(input => {
      input.onmidimessage = (msg) => {
        const [status, note, velocity] = msg.data;
        if (status === 144 && velocity > 0) {
          const noteName = midiToName(note);
          const freq = 440 * Math.pow(2, (note - 69) / 12);
          const fakeKey = { note: noteName, freq };
          const fakeEl = document.querySelector(`[data-note="${noteName}"]`) || document.createElement('div');
          onKeyClick(fakeKey, fakeEl);
        }
      };
    });
  }).catch(() => {
    document.getElementById('feedback').textContent = '⚠ Could not connect to MIDI device.';
    document.getElementById('feedback').style.color = '#e05c5c';
  });
}

function midiToName(midiNote) {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const octave = Math.floor(midiNote / 12) - 1;
  return notes[midiNote % 12] + octave;
}