let selectedTopic = '';
let selectedClef = '';
let currentNote = null;
let answered = false;

// ── Audio ──────────────────────────────────────────────────────
let audioCtx = null;
function playFreq(freq) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
}

// ── Note Data ──────────────────────────────────────────────────
const TREBLE_NOTES = [
  { name:'C4', label:'C', octave:4, freq:261.63, pos:0,  ledger:true  },
  { name:'D4', label:'D', octave:4, freq:293.66, pos:1,  ledger:false },
  { name:'E4', label:'E', octave:4, freq:329.63, pos:2,  ledger:false },
  { name:'F4', label:'F', octave:4, freq:349.23, pos:3,  ledger:false },
  { name:'G4', label:'G', octave:4, freq:392.00, pos:4,  ledger:false },
  { name:'A4', label:'A', octave:4, freq:440.00, pos:5,  ledger:false },
  { name:'B4', label:'B', octave:4, freq:493.88, pos:6,  ledger:false },
  { name:'C5', label:'C', octave:5, freq:523.25, pos:7,  ledger:false },
  { name:'D5', label:'D', octave:5, freq:587.33, pos:8,  ledger:false },
  { name:'E5', label:'E', octave:5, freq:659.25, pos:9,  ledger:false },
  { name:'F5', label:'F', octave:5, freq:698.46, pos:10, ledger:false },
  { name:'G5', label:'G', octave:5, freq:784.00, pos:11, ledger:false },
];

const BASS_NOTES = [
  { name:'C2', label:'C', octave:2, freq:65.41,  pos:0,  ledger:false },
  { name:'D2', label:'D', octave:2, freq:73.42,  pos:1,  ledger:false },
  { name:'E2', label:'E', octave:2, freq:82.41,  pos:2,  ledger:false },
  { name:'F2', label:'F', octave:2, freq:87.31,  pos:3,  ledger:false },
  { name:'G2', label:'G', octave:2, freq:98.00,  pos:4,  ledger:false },
  { name:'A2', label:'A', octave:2, freq:110.00, pos:5,  ledger:false },
  { name:'B2', label:'B', octave:2, freq:123.47, pos:6,  ledger:false },
  { name:'C3', label:'C', octave:3, freq:130.81, pos:7,  ledger:false },
  { name:'D3', label:'D', octave:3, freq:146.83, pos:8,  ledger:false },
  { name:'E3', label:'E', octave:3, freq:164.81, pos:9,  ledger:false },
  { name:'F3', label:'F', octave:3, freq:174.61, pos:10, ledger:false },
  { name:'G3', label:'G', octave:3, freq:196.00, pos:11, ledger:true  },
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

function startPractice(clef) {
  selectedClef = clef;
  showPage('page-4');
  buildKeyboard();
  nextNote();
}

// ── Pick Random Note ───────────────────────────────────────────
function pickNote() {
  let pool = [];
  if (selectedClef === 'treble') pool = TREBLE_NOTES;
  else if (selectedClef === 'bass') pool = BASS_NOTES;
  else pool = [...TREBLE_NOTES, ...BASS_NOTES];
  return pool[Math.floor(Math.random() * pool.length)];
}

function nextNote() {
  answered = false;
  currentNote = pickNote();
  const clef = TREBLE_NOTES.includes(currentNote) ? 'treble' : 'bass';

  // if both selected, show two staves
  if (selectedClef === 'both') {
    document.getElementById('staff-area').innerHTML =
      drawStaffSVG(currentNote, 'treble', clef === 'treble') +
      drawStaffSVG(currentNote, 'bass',   clef === 'bass');
  } else {
    document.getElementById('staff-area').innerHTML =
      drawStaffSVG(currentNote, selectedClef, true);
  }

  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = '';
  playFreq(currentNote.freq);
  highlightKey(null);
}

// ── Draw Staff SVG ─────────────────────────────────────────────
function drawStaffSVG(note, clef, showNote) {
  const W = 340, H = 140;
  const lineSpacing = 14;
  const staffTop = 30;
  const noteX = 200;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const noteY = showNote ? bottomLineY - (note.pos - 2) * (lineSpacing / 2) : 0;

  let lines = '';
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    lines += `<line x1="30" x2="${W-20}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY = clef === 'treble' ? staffTop + lineSpacing * 3.5 + 10 : staffTop + lineSpacing * 2.5 + 6;
  const clefSize = clef === 'treble' ? 64 : 42;
  const clefEl = `<text x="36" y="${clefY}" font-size="${clefSize}" fill="rgba(255,255,255,0.5)" font-family="serif">${clefSymbol}</text>`;

  const clefLabel = `<text x="170" y="${H - 6}" font-size="11" fill="rgba(255,255,255,0.3)" text-anchor="middle" font-family="sans-serif">${clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</text>`;

  let noteEl = '';
  if (showNote) {
    // ledger line for C4 (treble) or G3 (bass)
    if (note.ledger || (clef === 'treble' && note.pos === 0) || (clef === 'bass' && note.pos === 11)) {
      noteEl += `<line x1="${noteX-14}" x2="${noteX+14}" y1="${noteY}" y2="${noteY}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>`;
    }
    const stemUp = note.pos < 6;
    const stemX = stemUp ? noteX + 9 : noteX - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    noteEl += `<ellipse cx="${noteX}" cy="${noteY}" rx="9" ry="6.5" fill="#c9a84c" transform="rotate(-15,${noteX},${noteY})"/>`;
    noteEl += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}" stroke="#c9a84c" stroke-width="1.5"/>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;display:block;margin:0.5rem auto;background:#1f1f24;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
    ${lines}${clefEl}${clefLabel}${noteEl}
  </svg>`;
}

// ── Keyboard ───────────────────────────────────────────────────
const ALL_KEYS = [
  {note:'C2', type:'white', freq:65.41 }, {note:'C#2',type:'black',freq:69.30 },
  {note:'D2', type:'white', freq:73.42 }, {note:'D#2',type:'black',freq:77.78 },
  {note:'E2', type:'white', freq:82.41 }, {note:'F2', type:'white', freq:87.31 },
  {note:'F#2',type:'black', freq:92.50 }, {note:'G2', type:'white', freq:98.00 },
  {note:'G#2',type:'black', freq:103.83},{note:'A2', type:'white', freq:110.00},
  {note:'A#2',type:'black', freq:116.54},{note:'B2', type:'white', freq:123.47},
  {note:'C3', type:'white', freq:130.81},{note:'C#3',type:'black', freq:138.59},
  {note:'D3', type:'white', freq:146.83},{note:'D#3',type:'black', freq:155.56},
  {note:'E3', type:'white', freq:164.81},{note:'F3', type:'white', freq:174.61},
  {note:'F#3',type:'black', freq:185.00},{note:'G3', type:'white', freq:196.00},
  {note:'G#3',type:'black', freq:207.65},{note:'A3', type:'white', freq:220.00},
  {note:'A#3',type:'black', freq:233.08},{note:'B3', type:'white', freq:246.94},
  {note:'C4', type:'white', freq:261.63},{note:'C#4',type:'black', freq:277.18},
  {note:'D4', type:'white', freq:293.66},{note:'D#4',type:'black', freq:311.13},
  {note:'E4', type:'white', freq:329.63},{note:'F4', type:'white', freq:349.23},
  {note:'F#4',type:'black', freq:369.99},{note:'G4', type:'white', freq:392.00},
  {note:'G#4',type:'black', freq:415.30},{note:'A4', type:'white', freq:440.00},
  {note:'A#4',type:'black', freq:466.16},{note:'B4', type:'white', freq:493.88},
  {note:'C5', type:'white', freq:523.25},{note:'C#5',type:'black', freq:554.37},
  {note:'D5', type:'white', freq:587.33},{note:'D#5',type:'black', freq:622.25},
  {note:'E5', type:'white', freq:659.25},{note:'F5', type:'white', freq:698.46},
  {note:'F#5',type:'black', freq:739.99},{note:'G5', type:'white', freq:784.00},
];

function buildKeyboard() {
  const kb = document.getElementById('keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'keyboard';

  const whites = ALL_KEYS.filter(k => k.type === 'white');
  const totalWhites = whites.length;

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
    const prevWhites = ALL_KEYS.slice(0, i).filter(x => x.type === 'white').length;
    const el = document.createElement('div');
    el.className = 'key-black';
    el.dataset.note = k.note;
    const pct = (prevWhites / totalWhites) * 100;
    const halfWhite = (1 / totalWhites) * 100;
    el.style.left = (pct + halfWhite * 0.42) + '%';
    el.addEventListener('click', () => onKeyClick(k, el));
    wrap.appendChild(el);
  });

  kb.appendChild(wrap);
}

function onKeyClick(k, el) {
  if (answered || !currentNote) return;
  answered = true;
  playFreq(k.freq);

  const fb = document.getElementById('feedback');
  if (k.note === currentNote.name) {
    el.style.background = '#4caf82';
    fb.textContent = '✓ Correct! That is ' + currentNote.name;
    fb.style.color = '#4caf82';
  } else {
    el.style.background = '#e05c5c';
    fb.textContent = '✗ Wrong. The note was ' + currentNote.name;
    fb.style.color = '#e05c5c';
    highlightKey(currentNote.name, '#4caf82');
  }

  setTimeout(() => {
    document.querySelectorAll('.key-white, .key-black').forEach(k => k.style.background = '');
  }, 1200);
}

function highlightKey(noteName, color) {
  document.querySelectorAll('.key-white, .key-black').forEach(k => k.style.background = '');
  if (!noteName) return;
  const el = document.querySelector(`[data-note="${noteName}"]`);
  if (el) el.style.background = color;
}