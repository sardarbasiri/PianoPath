const OCTAVE_KEYS = [
  { note:'C',  type:'white', semitone:0  },
  { note:'C#', type:'black', semitone:1  },
  { note:'D',  type:'white', semitone:2  },
  { note:'D#', type:'black', semitone:3  },
  { note:'E',  type:'white', semitone:4  },
  { note:'F',  type:'white', semitone:5  },
  { note:'F#', type:'black', semitone:6  },
  { note:'G',  type:'white', semitone:7  },
  { note:'G#', type:'black', semitone:8  },
  { note:'A',  type:'white', semitone:9  },
  { note:'A#', type:'black', semitone:10 },
  { note:'B',  type:'white', semitone:11 },
];

function buildKeyboard() {
  const kb = document.getElementById('keyboard-area');
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
    el.addEventListener('click', () => onKeyClick(k, el));
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
    el.addEventListener('click', () => onKeyClick(k, el));
    wrap.appendChild(el);
  });

  kb.appendChild(wrap);
}

function onKeyClick(k, el) {
  if (!noteQueue.length) return;
  if (noteQueue[currentNoteIndex].state !== 'pending') return;

  const currentNote = noteQueue[currentNoteIndex];
  clearInterval(timer);
  playPiano(currentNote.freq);

  if (k.note === currentNote.label) {
    noteQueue[currentNoteIndex].state = 'correct';
    el.style.background = '#4caf82';
    renderStaff();
    requestAnimationFrame(() => {
      el.style.background = '';
      advanceNote();
    });
  } else {
    noteQueue[currentNoteIndex].state = 'wrong';
    el.style.background = '#e05c5c';
    document.querySelectorAll('.key-white, .key-black').forEach(key => {
      if (key.dataset.note === currentNote.label) key.style.background = '#4caf82';
    });
    renderStaff();
    requestAnimationFrame(() => {
      document.querySelectorAll('.key-white, .key-black').forEach(key => {
        key.style.background = '';
      });
      advanceNote();
    });
  }
}