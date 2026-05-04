function renderStaff() {
  const area = document.getElementById('staff-area');
  const visibleNotes = noteQueue.slice(windowStart, windowStart + VISIBLE_NOTES);
  const activePos = currentNoteIndex - windowStart;

  if (selectedClef === 'both') {
    area.innerHTML = drawBothStaves(visibleNotes, activePos);
  } else {
    area.innerHTML = drawStaff(selectedClef, visibleNotes, activePos);
  }
}

function drawStaff(clef, notes, activePos) {
  const W = 900;
  const H = 260;
  const lineSpacing = 16;
  const staffTop = 90;
  const noteSpacing = 100;
  const startX = 110;
  const bottomLineY = staffTop + 4 * lineSpacing;
  const topLineY = staffTop;
  const offset = clef === 'treble' ? 2 : 0;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block;background:#1a1a20;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);">`;

  for (let i = 0; i < 5; i++) {
    const y = staffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-10}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  const clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
  const clefY    = clef === 'treble' ? staffTop + lineSpacing * 3.5 : staffTop + lineSpacing * 2.8;
  const clefSize = clef === 'treble' ? 90 : 70;
  svg += `<text x="32" y="${clefY}" font-size="${clefSize}" fill="rgba(255,255,255,0.5)" font-family="serif">${clefSymbol}</text>`;

  svg += `<text x="15" y="${H-6}" font-size="10" fill="rgba(255,255,255,0.25)" font-family="sans-serif">${clef === 'treble' ? 'Treble Clef' : 'Bass Clef'}</text>`;

  notes.forEach((note, i) => {
    const x = startX + i * noteSpacing;
    const noteY = bottomLineY - (note.pos - offset) * (lineSpacing / 2);

    let fill = 'rgba(255,255,255,0.35)';
    if (i === activePos)          fill = '#c9a84c';
    if (note.state === 'correct') fill = '#4caf82';
    if (note.state === 'wrong')   fill = '#e05c5c';

    if (i === activePos) {
      svg += `<rect x="${x-20}" y="${noteY-50}" width="40" height="100"
        rx="4" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.3)" stroke-width="1"/>`;
    }

    if (noteY > bottomLineY + lineSpacing / 2) {
      let ly = bottomLineY + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    if (noteY < topLineY - lineSpacing / 2) {
      let ly = topLineY - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    svg += `<ellipse cx="${x}" cy="${noteY}" rx="9" ry="6.5"
      fill="${fill}" transform="rotate(-15,${x},${noteY})"/>`;

    const stemUp = note.pos < (clef === 'treble' ? 6 : 5);
    const stemX  = stemUp ? x + 9 : x - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
      stroke="${fill}" stroke-width="1.5"/>`;

    if (note.state === 'correct' || note.state === 'wrong') {
      const labelColor = note.state === 'correct' ? '#4caf82' : '#e05c5c';
      const labelY = Math.min(H - 6, noteY + 26);
      svg += `<text x="${x}" y="${labelY}" font-size="11" fill="${labelColor}"
        text-anchor="middle" font-family="sans-serif" font-weight="500">${getNoteName(note)}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

function drawBothStaves(notes, activePos) {
  const W = 900;
  const lineSpacing = 16;
  const noteSpacing = 100;
  const startX = 110;
  const trebleStaffBottom = 130;
  const trebleStaffTop    = trebleStaffBottom - 4 * lineSpacing;
  const bassStaffTop      = trebleStaffBottom + 2 * lineSpacing;
  const bassStaffBottom   = bassStaffTop + 4 * lineSpacing;
  const middleCY          = trebleStaffBottom + lineSpacing;
  const H = bassStaffBottom + 80;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;display:block;background:#1a1a20;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);">`;

  for (let i = 0; i < 5; i++) {
    const y = trebleStaffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-10}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  for (let i = 0; i < 5; i++) {
    const y = bassStaffTop + i * lineSpacing;
    svg += `<line x1="30" x2="${W-10}" y1="${y}" y2="${y}"
      stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`;
  }

  svg += `<text x="32" y="${trebleStaffTop + lineSpacing * 3.5}"
    font-size="90" fill="rgba(255,255,255,0.5)" font-family="serif">𝄞</text>`;
  svg += `<text x="32" y="${bassStaffTop + lineSpacing * 2.8}"
    font-size="70" fill="rgba(255,255,255,0.5)" font-family="serif">𝄢</text>`;
  svg += `<line x1="30" x2="30" y1="${trebleStaffTop}" y2="${bassStaffBottom}"
    stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>`;

  notes.forEach((note, i) => {
    const x = startX + i * noteSpacing;
    const isTreble = note.clef === 'treble';
    const staffBottom = isTreble ? trebleStaffBottom : bassStaffBottom;
    const staffTop2   = isTreble ? trebleStaffTop    : bassStaffTop;

    let noteY;
    if (isTreble) {
      noteY = trebleStaffBottom - (note.pos - 2) * (lineSpacing / 2);
    } else {
      noteY = bassStaffBottom - note.pos * (lineSpacing / 2);
    }

    let fill = 'rgba(255,255,255,0.35)';
    if (i === activePos)          fill = '#c9a84c';
    if (note.state === 'correct') fill = '#4caf82';
    if (note.state === 'wrong')   fill = '#e05c5c';

    if (i === activePos) {
      svg += `<rect x="${x-20}" y="${trebleStaffTop - 10}" width="40"
        height="${bassStaffBottom - trebleStaffTop + 20}"
        rx="4" fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.25)" stroke-width="1"/>`;
    }

    const isMiddleC = (isTreble && note.pos === 0) || (!isTreble && note.pos === 10);
    if (isMiddleC) {
      svg += `<line x1="${x-14}" x2="${x+14}" y1="${middleCY}" y2="${middleCY}"
        stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
    }

    if (isTreble && noteY > trebleStaffBottom + lineSpacing / 2 && !isMiddleC) {
      let ly = trebleStaffBottom + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    if (isTreble && noteY < trebleStaffTop - lineSpacing / 2) {
      let ly = trebleStaffTop - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    if (!isTreble && noteY < bassStaffTop - lineSpacing / 2 && !isMiddleC) {
      let ly = bassStaffTop - lineSpacing;
      while (ly >= noteY - 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly -= lineSpacing;
      }
    }

    if (!isTreble && noteY > bassStaffBottom + lineSpacing / 2) {
      let ly = bassStaffBottom + lineSpacing;
      while (ly <= noteY + 2) {
        svg += `<line x1="${x-14}" x2="${x+14}" y1="${ly}" y2="${ly}"
          stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`;
        ly += lineSpacing;
      }
    }

    svg += `<ellipse cx="${x}" cy="${noteY}" rx="9" ry="6.5"
      fill="${fill}" transform="rotate(-15,${x},${noteY})"/>`;

    const stemUp = isTreble ? note.pos < 6 : note.pos < 5;
    const stemX  = stemUp ? x + 9 : x - 9;
    const stemY2 = stemUp ? noteY - 42 : noteY + 42;
    svg += `<line x1="${stemX}" x2="${stemX}" y1="${noteY}" y2="${stemY2}"
      stroke="${fill}" stroke-width="1.5"/>`;

    if (note.state === 'correct' || note.state === 'wrong') {
      const labelColor = note.state === 'correct' ? '#4caf82' : '#e05c5c';
      const displayName = getNoteName(note);
      let labelY;
      if (isTreble) {
        labelY = Math.max(12, noteY - 20);
      } else {
        labelY = Math.min(H - 6, noteY + 26);
      }
      svg += `<text x="${x}" y="${labelY}" font-size="11" fill="${labelColor}"
        text-anchor="middle" font-family="sans-serif" font-weight="500">${displayName}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}