// ── Global State ───────────────────────────────────────────────
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
let totalCorrect = 0;
let totalAnswered = 0;

const VISIBLE_NOTES = 8;

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

  const master = ac.createGain();
  master.connect(ac.destination);
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.8, now + 0.005);
  master.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
  master.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

  const fundamental = ac.createOscillator();
  const fGain = ac.createGain();
  fundamental.type = 'sine';
  fundamental.frequency.value = freq;
  fGain.gain.value = 1.0;
  fundamental.connect(fGain);
  fGain.connect(master);
  fundamental.start(now);
  fundamental.stop(now + 3.0);

  const h2 = ac.createOscillator();
  const h2Gain = ac.createGain();
  h2.type = 'sine';
  h2.frequency.value = freq * 2;
  h2Gain.gain.setValueAtTime(0.5, now);
  h2Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  h2.connect(h2Gain);
  h2Gain.connect(master);
  h2.start(now);
  h2.stop(now + 1.5);

  const h3 = ac.createOscillator();
  const h3Gain = ac.createGain();
  h3.type = 'sine';
  h3.frequency.value = freq * 3;
  h3Gain.gain.setValueAtTime(0.25, now);
  h3Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  h3.connect(h3Gain);
  h3Gain.connect(master);
  h3.start(now);
  h3.stop(now + 0.8);

  const h4 = ac.createOscillator();
  const h4Gain = ac.createGain();
  h4.type = 'sine';
  h4.frequency.value = freq * 4;
  h4Gain.gain.setValueAtTime(0.1, now);
  h4Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  h4.connect(h4Gain);
  h4Gain.connect(master);
  h4.start(now);
  h4.stop(now + 0.4);

  const h5 = ac.createOscillator();
  const h5Gain = ac.createGain();
  h5.type = 'sine';
  h5.frequency.value = freq * 5;
  h5Gain.gain.setValueAtTime(0.05, now);
  h5Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  h5.connect(h5Gain);
  h5Gain.connect(master);
  h5.start(now);
  h5.stop(now + 0.2);

  const strikeSize = Math.floor(ac.sampleRate * 0.015);
  const strikeBuf = ac.createBuffer(1, strikeSize, ac.sampleRate);
  const strikeData = strikeBuf.getChannelData(0);
  for (let i = 0; i < strikeSize; i++) {
    strikeData[i] = (Math.random() * 2 - 1) * (1 - i / strikeSize);
  }
  const strike = ac.createBufferSource();
  const strikeFilter = ac.createBiquadFilter();
  const strikeGain = ac.createGain();
  strikeFilter.type = 'bandpass';
  strikeFilter.frequency.value = freq * 6;
  strikeFilter.Q.value = 0.5;
  strikeGain.gain.setValueAtTime(0.3, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
  strike.buffer = strikeBuf;
  strike.connect(strikeFilter);
  strikeFilter.connect(strikeGain);
  strikeGain.connect(master);
  strike.start(now);

  const detune = ac.createOscillator();
  const detuneGain = ac.createGain();
  detune.type = 'sine';
  detune.frequency.value = freq * 2.001;
  detuneGain.gain.setValueAtTime(0.08, now);
  detuneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  detune.connect(detuneGain);
  detuneGain.connect(master);
  detune.start(now);
  detune.stop(now + 1.0);
}

// ── Note Naming ────────────────────────────────────────────────
function toggleNaming() {
  selectedNaming = selectedNaming === 'american' ? 'italian' : 'american';
  const text = selectedNaming === 'american'
    ? '🇺🇸 American (C, D, E...)'
    : '🇮🇹 Italian (Do, Re, Mi...)';
  document.querySelectorAll('#naming-btn, #naming-btn-learn').forEach(btn => {
    if (btn) btn.textContent = text;
  });
}

function getNoteName(note) {
  if (selectedNaming === 'american') return note.label;
  const italian = { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' };
  return italian[note.label];
}

// ── Note Data ──────────────────────────────────────────────────
const TREBLE_NOTES = [
  { name:'C3', label:'C', octave:3, freq:130.81,  pos:-7, clef:'treble' },
  { name:'D3', label:'D', octave:3, freq:146.83,  pos:-6, clef:'treble' },
  { name:'E3', label:'E', octave:3, freq:164.81,  pos:-5, clef:'treble' },
  { name:'F3', label:'F', octave:3, freq:174.61,  pos:-4, clef:'treble' },
  { name:'G3', label:'G', octave:3, freq:196.00,  pos:-3, clef:'treble' },
  { name:'A3', label:'A', octave:3, freq:220.00,  pos:-2, clef:'treble' },
  { name:'B3', label:'B', octave:3, freq:246.94,  pos:-1, clef:'treble' },
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
  { name:'A1', label:'A', octave:1, freq:55.00,  pos:-6, clef:'bass' },
  { name:'B1', label:'B', octave:1, freq:61.74,  pos:-5, clef:'bass' },
  { name:'C2', label:'C', octave:2, freq:65.41,  pos:-4, clef:'bass' },
  { name:'D2', label:'D', octave:2, freq:73.42,  pos:-3, clef:'bass' },
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

const TREBLE_NOTES_BOTH = [
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

const BASS_NOTES_BOTH = [
  { name:'A1', label:'A', octave:1, freq:55.00,  pos:-6, clef:'bass' },
  { name:'B1', label:'B', octave:1, freq:61.74,  pos:-5, clef:'bass' },
  { name:'C2', label:'C', octave:2, freq:65.41,  pos:-4, clef:'bass' },
  { name:'D2', label:'D', octave:2, freq:73.42,  pos:-3, clef:'bass' },
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

function learnClick() {
  if (selectedTopic === 'sight-reading') {
    showPage('page-8');
  } else {
    alert('Coming soon!');
  }
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
  kbArea.innerHTML = '';
  kbArea.style.display = 'block';

  generateNoteQueue();
  renderStaff();

  if (selectedInput === 'keyboard') {
    buildKeyboard();
  } else if (selectedInput === 'buttons') {
    buildAnswerButtons();
  } else if (selectedInput === 'midi') {
    kbArea.style.display = 'none';
    setupMIDI();
  }

  startTimer();
}

// ── Note Queue ─────────────────────────────────────────────────
function getPool() {
  if (selectedClef === 'treble') return TREBLE_NOTES;
  if (selectedClef === 'bass')   return BASS_NOTES;
  return [...TREBLE_NOTES_BOTH, ...BASS_NOTES_BOTH];
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
  totalCorrect = 0;
  totalAnswered = 0;
  updateAccuracy();
}

function topUpQueue() {
  const pool = getPool();
  for (let i = 0; i < 30; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)];
    noteQueue.push({ ...note, state: 'pending' });
  }
}

// ── Accuracy ───────────────────────────────────────────────────
function updateAccuracy() {
  const el = document.getElementById('accuracy-pct');
  if (!el) return;
  if (totalAnswered === 0) { el.textContent = '100%'; return; }
  const bufferSize = 10;
  const pct = Math.round(((totalCorrect + bufferSize) / (totalAnswered + bufferSize)) * 100);
  el.textContent = pct + '%';
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
  advanceNote();
}

// ── Advance Note ───────────────────────────────────────────────
function advanceNote() {
  clearInterval(timer);

  const answeredNote = noteQueue[currentNoteIndex];
  if (answeredNote) {
    totalAnswered++;
    if (answeredNote.state === 'correct') totalCorrect++;
    updateAccuracy();
  }

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