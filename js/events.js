document.addEventListener('DOMContentLoaded', () => {

  // ── Page 1 ─────────────────────────────────────────────────
  document.getElementById('btn-sight-reading').addEventListener('click', () => goTo('sight-reading', '🎵 Sight Reading'));
  document.getElementById('btn-scales').addEventListener('click',        () => goTo('scales',        '🎼 Scales'));
  document.getElementById('btn-arpeggios').addEventListener('click',     () => goTo('arpeggios',     '🎶 Arpeggios'));
  document.getElementById('btn-chords').addEventListener('click',        () => goTo('chords',        '🎹 Chords'));

  // ── Page 2 ─────────────────────────────────────────────────
  document.getElementById('back-to-1').addEventListener('click',   () => showPage('page-1'));
  document.getElementById('btn-learn').addEventListener('click',    () => learnClick());
  document.getElementById('btn-practice').addEventListener('click', () => practiceClick());

  // ── Page 3 ─────────────────────────────────────────────────
  document.getElementById('back-to-2').addEventListener('click',  () => showPage('page-2'));
  document.getElementById('naming-btn').addEventListener('click',  () => toggleNaming());
  document.getElementById('btn-treble').addEventListener('click',  () => selectClef('treble'));
  document.getElementById('btn-bass').addEventListener('click',    () => selectClef('bass'));
  document.getElementById('btn-both').addEventListener('click',    () => selectClef('both'));

  // ── Page 4 ─────────────────────────────────────────────────
  document.getElementById('back-to-6').addEventListener('click', () => { clearInterval(timer); showPage('page-6'); });

  // ── Page 5 ─────────────────────────────────────────────────
  document.getElementById('back-to-3').addEventListener('click',          () => showPage('page-3'));
  document.getElementById('btn-input-keyboard').addEventListener('click', () => startWithInput('keyboard'));
  document.getElementById('btn-input-buttons').addEventListener('click',  () => startWithInput('buttons'));

  // ── Page 6 ─────────────────────────────────────────────────
  document.getElementById('back-to-5').addEventListener('click',             () => showPage('page-5'));
  document.getElementById('btn-diff-beginner').addEventListener('click',     () => selectDifficulty('beginner'));
  document.getElementById('btn-diff-intermediate').addEventListener('click', () => selectDifficulty('intermediate'));
  document.getElementById('btn-diff-advanced').addEventListener('click',     () => selectDifficulty('advanced'));
  document.getElementById('btn-diff-expert').addEventListener('click',       () => selectDifficulty('expert'));

  // ── Page 8 ─────────────────────────────────────────────────
  document.getElementById('back-to-2-learn').addEventListener('click',       () => showPage('page-2'));
  document.getElementById('naming-btn-learn').addEventListener('click',      () => toggleNaming());
  document.getElementById('btn-learn-beginner').addEventListener('click',     () => selectLearnDifficulty('beginner'));
  document.getElementById('btn-learn-intermediate').addEventListener('click', () => selectLearnDifficulty('intermediate'));
  document.getElementById('btn-learn-advanced').addEventListener('click',     () => selectLearnDifficulty('advanced'));
  document.getElementById('btn-learn-expert').addEventListener('click',       () => selectLearnDifficulty('expert'));

  // ── Page 9 ─────────────────────────────────────────────────
  document.getElementById('back-to-12').addEventListener('click', () => showPage('page-12'));

  // ── Page 10 ────────────────────────────────────────────────
  document.getElementById('back-to-9').addEventListener('click',       () => showPage('page-9'));
  document.getElementById('lesson-prev-btn').addEventListener('click', () => lessonPrev());
  document.getElementById('lesson-next-btn').addEventListener('click', () => lessonNext());
  document.getElementById('lesson-start-btn').addEventListener('click',() => startLearnPractice());

  // ── Page 11 ────────────────────────────────────────────────
  document.getElementById('back-to-9-practice').addEventListener('click', () => { clearInterval(learnTimer); showPage('page-9'); });

  // ── Page 12 ────────────────────────────────────────────────
  document.getElementById('back-to-8').addEventListener('click',                () => showPage('page-8'));
  document.getElementById('btn-learn-input-keyboard').addEventListener('click', () => selectLearnInput('keyboard'));
  document.getElementById('btn-learn-input-buttons').addEventListener('click',  () => selectLearnInput('buttons'));

  // ── Scale Practice Page ────────────────────────────────────
  document.getElementById('back-to-scales-course-prac').addEventListener('click', () => {
    scalePracticeMode = true;
    document.querySelector('#page-scales-list .subtitle').textContent = 'Choose a scale to practice';
    showPage('page-scales-list');
    renderScalesList();
  });

  document.querySelectorAll('[data-sp-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      spMode = btn.dataset.spMode;
      spReset();
      renderSpPage();
    });
  });

  document.querySelectorAll('[data-sp-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      spDir = btn.dataset.spDir;
      spReset();
      renderSpPage();
    });
  });

  document.querySelectorAll('[data-sp-hand]').forEach(btn => {
    btn.addEventListener('click', () => {
      spHand = btn.dataset.spHand;
      spReset();
      renderSpPage();
    });
  });

  // Scales naming
  document.getElementById('naming-btn-scales').addEventListener('click', () => toggleNaming());
  document.getElementById('naming-btn-scales-course').addEventListener('click', () => {
    toggleNaming();
    renderScaleCourse();
  });

  // Scales
  document.getElementById('back-to-2-scales').addEventListener('click', () => {
    clearInterval(scalePlayTimer);
    scaleHlIdx = -1;
    showPage('page-2');
  });
  document.getElementById('back-to-scales-list').addEventListener('click', () => {
    clearInterval(scalePlayTimer);
    scaleHlIdx = -1;
    showPage('page-scales-list');
  });
  document.getElementById('btn-scale-major').addEventListener('click',     () => setScaleMode('major'));
  document.getElementById('btn-scale-natural').addEventListener('click',   () => setScaleMode('natural'));
  document.getElementById('btn-scale-harmonic').addEventListener('click',  () => setScaleMode('harmonic'));
  document.getElementById('btn-scale-melodic').addEventListener('click',   () => setScaleMode('melodic'));
  document.getElementById('btn-scale-asc').addEventListener('click',       () => setScaleDirection('asc'));
  document.getElementById('btn-scale-desc').addEventListener('click',      () => setScaleDirection('desc'));
  document.getElementById('btn-scale-rh').addEventListener('click',        () => setScaleHand('rh'));
  document.getElementById('btn-scale-lh').addEventListener('click',        () => setScaleHand('lh'));

  // ── Arpeggio list page ────────────────────────────────────────
  document.getElementById('back-to-2-arps').addEventListener('click', () => {
    clearInterval(arpPlayTimer);
    arpHlIdx = -1;
    showPage('page-2');
  });
  document.getElementById('naming-btn-arps').addEventListener('click', () => toggleNaming());

  // ── Arpeggio course page ──────────────────────────────────────
  document.getElementById('back-to-arps-list').addEventListener('click', () => {
    clearInterval(arpPlayTimer);
    arpHlIdx = -1;
    showPage('page-arpeggios-list');
  });
  document.getElementById('btn-arp-major').addEventListener('click',  () => setArpMode('major'));
  document.getElementById('btn-arp-minor').addEventListener('click',  () => setArpMode('minor'));
  document.getElementById('btn-arp-asc').addEventListener('click',    () => setArpDirection('asc'));
  document.getElementById('btn-arp-desc').addEventListener('click',   () => setArpDirection('desc'));
  document.getElementById('btn-arp-rh').addEventListener('click',     () => setArpHand('rh'));
  document.getElementById('btn-arp-lh').addEventListener('click',     () => setArpHand('lh'));
  document.getElementById('naming-btn-arps-course').addEventListener('click', () => {
    toggleNaming();
    renderArpCourse();
  });

  // ── Arpeggio practice page ───────────────────────────────────────
  document.getElementById('back-to-arps-course-prac').addEventListener('click', () => {
    arpPracticeMode = true;
    document.getElementById('arps-list-subtitle').textContent = 'Choose an arpeggio to practice';
    showPage('page-arpeggios-list');
    renderArpList();
  });

  document.querySelectorAll('[data-ap-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      apTab = btn.dataset.apMode;
      apReset();
      renderApPage();
    });
  });

  document.querySelectorAll('[data-ap-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      apDir = btn.dataset.apDir;
      apReset();
      renderApPage();
    });
  });

  document.querySelectorAll('[data-ap-hand]').forEach(btn => {
    btn.addEventListener('click', () => {
      apHand = btn.dataset.apHand;
      apReset();
      renderApPage();
    });
  });

  // ── Chords practice page ─────────────────────────────────────
  document.getElementById('back-to-chords-course-prac').addEventListener('click', () => {
    clearInterval(chordPlayTimer);
    chordPracticeMode = true;
    document.querySelector('#page-chords-list .subtitle').textContent = 'Choose a key to practice';
    showPage('page-chords-list');
    renderChordsList();
  });

  document.querySelectorAll('[data-cp-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = CHORD_TYPES.findIndex(t => t.id === btn.dataset.cpType);
      startChordPractice(cpCourse, idx, cpHand);
    });
  });

  document.querySelectorAll('[data-cp-inv]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inv = parseInt(btn.dataset.cpInv);
      if (inv > cpMaxInv) return;
      startChordPractice(cpCourse, cpTypeIdx, cpHand, inv);
    });
  });

  document.querySelectorAll('[data-cp-hand]').forEach(btn => {
    btn.addEventListener('click', () => {
      startChordPractice(cpCourse, cpTypeIdx, btn.dataset.cpHand);
    });
  });

  // ── Chords list page ──────────────────────────────────────────
  document.getElementById('back-to-2-chords').addEventListener('click', () => showPage('page-2'));
  document.getElementById('naming-btn-chords').addEventListener('click', () => toggleNaming());

  // ── Chords course page ────────────────────────────────────────
  document.getElementById('back-to-chords-list').addEventListener('click', () => {
    clearInterval(chordPlayTimer);
    showPage('page-chords-list');
  });

  document.getElementById('naming-btn-chords-course').addEventListener('click', () => {
    toggleNaming();
    renderChordCourse();
  });

  document.querySelectorAll('.chord-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chordTypeIdx   = CHORD_TYPES.findIndex(t => t.id === btn.dataset.chordType);
      chordInversion = 0;
      renderChordCourse();
    });
  });

  document.querySelectorAll('.chord-hand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chordHand = btn.dataset.chordHand;
      document.querySelectorAll('.chord-hand-btn').forEach(b =>
        b.classList.toggle('active', b === btn));
      buildChordKeyboard();
    });
  });

  // Hide browser bar on mobile
  window.addEventListener('load', () => {
    setTimeout(() => window.scrollTo(0, 1), 100);
  });

});