// ── Audio Context ──────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playNote(freq, duration = 0.8) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  gain.gain.setValueAtTime(0.3, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

// ── Note Data ──────────────────────────────────────────────────
// Treble clef: lines are E4,G4,B4,D5,F5; spaces are F4,A4,C5,E5
// We'll use C4 (middle C) up to G5 for beginners
const NOTES = [
  { name: 'C4', label: 'C',  octave: 4, freq: 261.63, staffPos: 0,  type: 'space', ledger: true  },
  { name: 'D4', label: 'D',  octave: 4, freq: 293.66, staffPos: 1,  type: 'space', ledger: false },
  { name: 'E4', label: 'E',  octave: 4, freq: 329.63, staffPos: 2,  type: 'line',  ledger: false },
  { name: 'F4', label: 'F',  octave: 4, freq: 349.23, staffPos: 3,  type: 'space', ledger: false },
  { name: 'G4', label: 'G',  octave: 4, freq: 392.00, staffPos: 4,  type: 'line',  ledger: false },
  { name: 'A4', label: 'A',  octave: 4, freq: 440.00, staffPos: 5,  type: 'space', ledger: false },
  { name: 'B4', label: 'B',  octave: 4, freq: 493.88, staffPos: 6,  type: 'line',  ledger: false },
  { name: 'C5', label: 'C',  octave: 5, freq: 523.25, staffPos: 7,  type: 'space', ledger: false },
  { name: 'D5', label: 'D',  octave: 5, freq: 587.33, staffPos: 8,  type: 'line',  ledger: false },
  { name: 'E5', label: 'E',  octave: 5, freq: 659.25, staffPos: 9,  type: 'space', ledger: false },
  { name: 'F5', label: 'F',  octave: 5, freq: 698.46, staffPos: 10, type: 'line',  ledger: false },
  { name: 'G5', label: 'G',  octave: 5, freq: 784.00, staffPos: 11, type: 'space', ledger: false },
];

// Full keyboard layout: C3 to B5
const KEYS = [
  { note:'C3',  type:'white', freq:130.81 },
  { note:'C#3', type:'black', freq:138.59 },
  { note:'D3',  type:'white', freq:146.83 },
  { note:'D#3', type:'black', freq:155.56 },
  { note:'E3',  type:'white', freq:164.81 },
  { note:'F3',  type:'white', freq:174.61 },
  { note:'F#3', type:'black', freq:185.00 },
  { note:'G3',  type:'white', freq:196.00 },
  { note:'G#3', type:'black', freq:207.65 },
  { note:'A3',  type:'white', freq:220.00 },
  { note:'A#3', type:'black', freq:233.08 },
  { note:'B3',  type:'white', freq:246.94 },
  { note:'C4',  type:'white', freq:261.63 },
  { note:'C#4', type:'black', freq:277.18 },
  { note:'D4',  type:'white', freq:293.66 },
  { note:'D#4', type:'black', freq:311.13 },
  { note:'E4',  type:'white', freq:329.63 },
  { note:'F4',  type:'white', freq:349.23 },
  { note:'F#4', type:'black', freq:369.99 },
  { note:'G4',  type:'white', freq:392.00 },
  { note:'G#4', type:'black', freq:415.30 },
  { note:'A4',  type:'white', freq:440.00 },
  { note:'A#4', type:'black', freq:466.16 },
  { note:'B4',  type:'white', freq:493.88 },
  { note:'C5',  type:'white', freq:523.25 },
  { note:'C#5', type:'black', freq:554.37 },
  { note:'D5',  type:'white', freq:587.33 },
  { note:'D#5', type:'black', freq:622.25 },
  { note:'E5',  type:'white', freq:659.25 },
  { note:'F5',  type:'white', freq:698.46 },
  { note:'F#5', type:'black', freq:739.99 },
  { note:'G5',  type:'white', freq:784.00 },
  { note:'G#5', type:'black', freq:830.61 },
  { note:'A5',  type:'white', freq:880.00 },
  { note:'A#5', type:'black', freq:932.33 },
  { note:'B5',  type:'white', freq:987.77 },
];

// ── State ──────────────────────────────────────────────────────
let currentNote = null;
let score = 0;
let correct = 0;
let wrong = 0;
let streak = 0;
let bestStreak = 0;
let answered = false;

// ── Build Keyboard ─────────────────────────────────────────────
function buildKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';

  const whites = KEYS.filter(k => k.type === 'white');
  const totalWhites = whites.length;

  whites.forEach((k, wi) => {
    const el = document.createElement('div');
    el.className = 'key-white';
    el.dataset.note = k.note;
    el.dataset.freq = k.freq;
    // label C keys
    if (k.note.startsWith('C')) {
      const lbl = document.createElement('span');
      lbl.className = 'key-label';
      lbl.textContent = k.note;
      el.appendChild(lbl);
    }
    el.addEventListener('click', () => onKeyPress(k.note, k.freq, el));
    kb.appendChild(el);
  });

  // Position black keys
  const whiteEls = kb.querySelectorAll('.key-white');
  const whiteW = 100 / totalWhites; // percent

  KEYS.forEach((k, i) => {
    if (k.type !== 'black') return;
    const prevWhiteIdx = KEYS.slice(0, i).filter(x => x.type === 'white').length - 1;
    const el = document.createElement('div');
    el.className = 'key-black';
    el.dataset.note = k.note;
    el.dataset.freq = k.freq;
    const leftPct = (prevWhiteIdx + 1) * whiteW - (whiteW * 0.3);
    el.style.left = leftPct + '%';
    el.addEventListener('click', () => onKeyPress(k.note, k.freq, el));
    kb.appendChild(el);
  });
}

// ── Draw Staff ─────────────────────────────────────────────────
function drawStaff(note) {
  const svg = document.getElementById('staff-svg');
  svg.innerHTML = '';

  const W = 340, H = 160;
  const lineSpacing = 14; // px between staff lines
  const staffTop = 40;    // y of top staff line
  const noteX = 200;

  // Staff lines (5 lines, treble clef)
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 30); line.setAttribute('x2', W - 20);
    line.setAttribute('y1', y);  line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(255,255,255,0.25)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // Treble clef (simplified symbol)
  const clef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  clef.setAttribute('x', '38'); clef.setAttribute('y', staffTop + lineSpacing * 3.5 + 10);
  clef.setAttribute('font-size', '64'); clef.setAttribute('fill', 'rgba(255,255,255,0.5)');
  clef.setAttribute('font-family', 'serif');
  clef.textContent = '𝄞';
  svg.appendChild(clef);

  if (!note) return;

  // Note position
  // staffPos 0 = C4 (one ledger below), staffPos 2 = E4 (bottom staff line)
  // Each staff position = lineSpacing/2 pixels
  // Bottom staff line (E4) = staffTop + 4*lineSpacing
  const bottomLineY = staffTop + 4 * lineSpacing;
  // staffPos 2 = E4 = bottomLineY
  // Each step up = lineSpacing/2 up
  const noteY = bottomLineY - (note.staffPos - 2) * (lineSpacing / 2);

  // Ledger line for C4 (below staff)
  if (note.staffPos === 0) {
    const ledger = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ledger.setAttribute('x1', noteX - 14); ledger.setAttribute('x2', noteX + 14);
    ledger.setAttribute('y1', noteY); ledger.setAttribute('y2', noteY);
    ledger.setAttribute('stroke', 'rgba(255,255,255,0.5)');
    ledger.setAttribute('stroke-width', '1.5');
    svg.appendChild(ledger);
  }

  // Note head
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  circle.setAttribute('cx', noteX);
  circle.setAttribute('cy', noteY);
  circle.setAttribute('rx', '9'); circle.setAttribute('ry', '6.5');
  circle.setAttribute('fill', '#c9a84c');
  circle.setAttribute('transform', `rotate(-15, ${noteX}, ${noteY})`);
  svg.appendChild(circle);

  // Stem
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const stemUp = note.staffPos < 6; // stem up for lower notes
  stem.setAttribute('x1', stemUp ? noteX + 9 : noteX - 9);
  stem.setAttribute('x2', stemUp ? noteX + 9 : noteX - 9);
  stem.setAttribute('y1', noteY);
  stem.setAttribute('y2', stemUp ? noteY - 42 : noteY + 42);
  stem.setAttribute('stroke', '#c9a84c');
  stem.setAttribute('stroke-width', '1.5');
  svg.appendChild(stem);
}

// ── Game Logic ─────────────────────────────────────────────────
function nextNote() {
  answered = false;
  clearFeedback();
  const idx = Math.floor(Math.random() * NOTES.length);
  currentNote = NOTES[idx];
  drawStaff(currentNote);
  playNote(currentNote.freq, 0.6);

  // Remove any highlights
  document.querySelectorAll('.key-white, .key-black').forEach(k => {
    k.classList.remove('active', 'correct-flash', 'wrong-flash');
  });
}

function onKeyPress(noteName, freq, el) {
  if (answered) return;
  playNote(freq);

  if (!currentNote) return;
  answered = true;

  if (noteName === currentNote.name) {
    // Correct!
    el.classList.add('correct-flash');
    setFeedback('✓ Correct! That\'s ' + currentNote.name, 'correct');
    score += 10;
    correct++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    // Wrong
    el.classList.add('wrong-flash');
    // highlight correct key
    const correctEl = document.querySelector(`[data-note="${currentNote.name}"]`);
    if (correctEl) correctEl.classList.add('correct-flash');
    setFeedback('✗ That\'s ' + noteName + '. The note was ' + currentNote.name, 'wrong');
    wrong++;
    streak = 0;
  }

  updateStats();
  setTimeout(() => {
    document.querySelectorAll('.key-white, .key-black').forEach(k => {
      k.classList.remove('correct-flash', 'wrong-flash');
    });
  }, 1200);
}

function showHint() {
  if (!currentNote) return;
  setFeedback('Hint: The note is ' + currentNote.name, 'hint');
}

function setFeedback(msg, cls) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = 'feedback ' + cls;
}

function clearFeedback() {
  const el = document.getElementById('feedback');
  el.textContent = '';
  el.className = 'feedback';
}

function updateStats() {
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  document.getElementById('stat-correct').textContent = correct;
  document.getElementById('stat-wrong').textContent = wrong;
  document.getElementById('stat-best').textContent = bestStreak;
  const total = correct + wrong;
  document.getElementById('stat-pct').textContent = total > 0
    ? Math.round((correct / total) * 100) + '%'
    : '—';
}

// ── Init ───────────────────────────────────────────────────────
buildKeyboard();
drawStaff(null);
nextNote();
