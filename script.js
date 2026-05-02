let selectedTopic = '';
let selectedClef = '';
let selectedInput = '';
let currentNote = null;
let answered = false;

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

function selectClef(clef) {
  selectedClef = clef;
  showPage('page-5');
}

function startWithInput(inputMethod) {
  selectedInput = inputMethod;
  showPage('page-4');

  const kbArea = document.getElementById('keyboard-area');
  const nextBtn = document.getElementById('next-btn');

  if (inputMethod === 'keyboard') {
    kbArea.style.display = 'block';
    nextBtn.style.display = 'none';
    buildKeyboard();
  } else if (inputMethod === 'buttons') {
    kbArea.style.display = 'none';
    nextBtn.style.display = 'none';
    buildAnswerButtons();
  } else if (inputMethod === 'midi') {
    kbArea.style.display = 'none';
    nextBtn.style.display = 'none';
    setupMIDI();
  }

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

  if (selectedClef === 'both') {
    document.getElementById('staff-area').innerHTML =
      drawStaffSVG(currentNote, 'treble', clef === 'treble') +
      drawStaffSVG(currentNote, 'bass',   clef === 'bass');
  } else {
    document.getElementById('staff-area').innerHTML =
      drawStaffSVG(currentNote, selectedClef, true);
  }

  const fb = document.getElementById('feedback');
  fb.textContent = '';
  fb.style.color = '';

  playPiano(currentNote.freq);
  clearKeyHighlights();

  if (selectedInput === 'buttons') buildAnswerButtons();
}

// ── Draw Staff SVG ─────────────────────────────────────────────
function drawStaffSVG(note, clef, showNote) {
  const W = 400, H = 160;
  const lineSpacing = 16;
  const staffTop = 45;
  const noteX = 220;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const noteY = showNote ? bottomLineY - (note.pos - 2) * (lineSpacing / 2) : -999;

  let lines = '';
  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    lines += `<line x1="40" x2="${W - 20}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>`;
  }

  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY     = clef === 'treble' ? staffTop + lineSpacing * 4 + 12 : staffTop + lineSpacing * 2 + 8;
  const clefSize  = clef === 'treble' ? 72 : 46;
  const clefEl    = `<text x="44" y="${clefY}" font-size="${clefSize}" fill="rgba(255,255,255,0.55)" font-family="serif">${clefSymbol}</text>`;
  const clefLabel = `<text x="${W/2}" y="${H - 8}" font-size="12" fill="rgba(255,255,255,0.3)" text-anchor="middle" font-family="sans-serif">${clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</text>`;

  let noteEl = '';
  if (showNote) {
    if ((clef === 'treble' && note.pos === 0) || (clef === 'bass' && note.pos === 11)) {
      noteEl += `<line x1="${noteX - 16}" x2="${noteX + 16}" y1="${noteY}" y2="${noteY}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>`;
    }
    const stemUp = note.pos < 6;
    const stemX  = stemUp ? noteX + 10 : noteX - 10;
    const stemY2 = stemUp ? noteY - 48 : noteY + 48;
    noteEl += `<ellipse cx="${noteX}" cy="${noteY}" rx="10" ry="7" fill="#c9a84c" transform="rotate(-15,${noteX},${noteY})"/>`;
    noteEl += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}" stroke="#c9a84c" stroke-width="2"/>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0.5rem auto;background:#1f1f24;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
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
  {note:'G#5',type:'black', freq:830.61},{note:'A5', type:'white', freq:880.00},
  {note:'A#5',type:'black', freq:932.33},{note:'B5', type:'white', freq:987.77},
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

function onKeyClick(k, el) {
  if (answered || !currentNote) return;
  answered = true;
  playPiano(k.freq);

  const fb = document.getElementById('feedback');
  if (k.note === currentNote.name) {
    el.style.background = '#4caf82';
    fb.textContent = '✓ Correct! That is ' + currentNote.name;
    fb.style.color = '#4caf82';
    setTimeout(() => {
      clearKeyHighlights();
      nextNote();
    }, 1000);
  } else {
    el.style.background = '#e05c5c';
    fb.textContent = '✗ Wrong. The note was ' + currentNote.name;
    fb.style.color = '#e05c5c';
    const correctEl = document.querySelector(`[data-note="${currentNote.name}"]`);
    if (correctEl) correctEl.style.background = '#4caf82';
    setTimeout(() => {
      clearKeyHighlights();
      nextNote();
    }, 1500);
  }
}

function clearKeyHighlights() {
  document.querySelectorAll('.key-white, .key-black').forEach(k => k.style.background = '');
}

function highlightKey(noteName, color) {
  clearKeyHighlights();
  if (!noteName) return;
  const el = document.querySelector(`[data-note="${noteName}"]`);
  if (el) el.style.background = color;
}

// ── Answer Buttons ─────────────────────────────────────────────
function buildAnswerButtons() {
  const kb = document.getElementById('keyboard-area');
  kb.innerHTML = '';

  const pool = selectedClef === 'treble' ? TREBLE_NOTES
             : selectedClef === 'bass'   ? BASS_NOTES
             : [...TREBLE_NOTES, ...BASS_NOTES];

  const others = pool.filter(n => n.name !== currentNote.name);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...shuffled, currentNote].sort(() => Math.random() - 0.5);

  const wrap = document.createElement('div');
  wrap.className = 'answer-buttons';

  choices.forEach(n => {
    const btn = document.createElement('button');
    btn.textContent = n.name;
    btn.addEventListener('click', () => onAnswerClick(n, btn, wrap));
    wrap.appendChild(btn);
  });

  kb.appendChild(wrap);
}

function onAnswerClick(n, btn, wrap) {
  if (answered || !currentNote) return;
  answered = true;
  playPiano(n.freq);

  const fb = document.getElementById('feedback');
  if (n.name === currentNote.name) {
    btn.style.background = '#4caf82';
    btn.style.borderColor = '#4caf82';
    fb.textContent = '✓ Correct! That is ' + currentNote.name;
    fb.style.color = '#4caf82';
  } else {
    btn.style.background = '#e05c5c';
    btn.style.borderColor = '#e05c5c';
    fb.textContent = '✗ Wrong. The note was ' + currentNote.name;
    fb.style.color = '#e05c5c';
    wrap.querySelectorAll('button').forEach(b => {
      if (b.textContent === currentNote.name) {
        b.style.background = '#4caf82';
        b.style.borderColor = '#4caf82';
      }
    });
  }
  setTimeout(() => nextNote(), 1500);
}

// ── MIDI ───────────────────────────────────────────────────────
function setupMIDI() {
  if (!navigator.requestMIDIAccess) {
    document.getElementById('feedback').textContent = '⚠ MIDI not supported in this browser. Try Chrome.';
    document.getElementById('feedback').style.color = '#e05c5c';
    return;
  }
  navigator.requestMIDIAccess().then(access => {
    document.getElementById('feedback').textContent = '✓ MIDI connected! Play a note on your piano.';
    document.getElementById('feedback').style.color = '#4caf82';
    access.inputs.forEach(input => {
      input.onmidimessage = (msg) => {
        const [status, note, velocity] = msg.data;
        if (status === 144 && velocity > 0) {
          const noteName = midiToName(note);
          const freq = 440 * Math.pow(2, (note - 69) / 12);
          playPiano(freq);
          checkMidiAnswer(noteName);
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

function checkMidiAnswer(noteName) {
  if (answered || !currentNote) return;
  answered = true;
  const fb = document.getElementById('feedback');
  if (noteName === currentNote.name) {
    fb.textContent = '✓ Correct! That is ' + currentNote.name;
    fb.style.color = '#4caf82';
  } else {
    fb.textContent = '✗ Wrong. You played ' + noteName + '. The note was ' + currentNote.name;
    fb.style.color = '#e05c5c';
  }
  setTimeout(() => nextNote(), 1500);
}