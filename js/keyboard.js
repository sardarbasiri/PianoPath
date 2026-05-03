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