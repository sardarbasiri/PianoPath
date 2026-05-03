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