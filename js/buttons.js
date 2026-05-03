function buildAnswerButtons() {
  const kb = document.getElementById('keyboard-area');
  kb.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'answer-buttons';
  wrap.id = 'answer-buttons-wrap';

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

function resetAnswerButtons() {
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.style.background = '';
    b.style.borderColor = '';
    b.disabled = false;
  });
}

function onAnswerClick(label, btn) {
  if (!noteQueue.length) return;
  if (noteQueue[currentNoteIndex].state !== 'pending') return;

  const currentNote = noteQueue[currentNoteIndex];
  clearInterval(timer);
  playPiano(currentNote.freq);

  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

  if (label === currentNote.label) {
    noteQueue[currentNoteIndex].state = 'correct';
    btn.style.background = '#4caf82';
    btn.style.borderColor = '#4caf82';
    renderStaff();
    requestAnimationFrame(() => {
      resetAnswerButtons();
      advanceNote();
    });
  } else {
     noteQueue[currentNoteIndex].state = 'wrong';
    btn.style.background = '#e05c5c';
    btn.style.borderColor = '#e05c5c';
    document.querySelectorAll('.answer-btn').forEach(b => {
      if (b.dataset.label === currentNote.label) {
        b.style.background = '#4caf82';
        b.style.borderColor = '#4caf82';
      }
    });
    renderStaff();
    requestAnimationFrame(() => {
      resetAnswerButtons();
      advanceNote();
    });
  }
}