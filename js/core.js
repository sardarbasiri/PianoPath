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

// ── Note Data ──────────────────────────────────────────────────
const TREBLE_NOTES = [
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

function timeExpired() {
  if (currentNoteIndex < noteQueue.length) {
    noteQueue[currentNoteIndex].state = 'wrong';
    totalAnswered++;
    updateAccuracy();
    renderStaff();
  }
  advanceNote();
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

function updateAccuracy() {
  const el = document.getElementById('accuracy-pct');
  if (!el) return;
  if (totalAnswered === 0) {
    el.textContent = '100%';
    return;
  }
  // Blend with a virtual buffer of 10 correct answers at start
  // so early mistakes don't crash the percentage
  const bufferSize = 10;
  const pct = Math.round(((totalCorrect + bufferSize) / (totalAnswered + bufferSize)) * 100);
  el.textContent = pct + '%';
}