document.addEventListener('DOMContentLoaded', () => {

  // ── Page 1 ─────────────────────────────────────────────────
  document.getElementById('btn-sight-reading').addEventListener('click', () => goTo('sight-reading', '🎵 Sight Reading'));
  document.getElementById('btn-scales').addEventListener('click',        () => goTo('scales',        '🎼 Scales'));
  document.getElementById('btn-arpeggios').addEventListener('click',     () => goTo('arpeggios',     '🎶 Arpeggios'));
  document.getElementById('btn-chords').addEventListener('click',        () => goTo('chords',        '🎹 Chords'));

  // ── Page 2 ─────────────────────────────────────────────────
  document.getElementById('back-to-1').addEventListener('click',  () => showPage('page-1'));
  document.getElementById('btn-learn').addEventListener('click',   () => learnClick());
  document.getElementById('btn-practice').addEventListener('click',() => practiceClick());

  // ── Page 3 ─────────────────────────────────────────────────
  document.getElementById('back-to-2').addEventListener('click',  () => showPage('page-2'));
  document.getElementById('naming-btn').addEventListener('click',  () => toggleNaming());
  document.getElementById('btn-treble').addEventListener('click',  () => selectClef('treble'));
  document.getElementById('btn-bass').addEventListener('click',    () => selectClef('bass'));
  document.getElementById('btn-both').addEventListener('click',    () => selectClef('both'));

  // ── Page 4 ─────────────────────────────────────────────────
  document.getElementById('back-to-6').addEventListener('click',  () => showPage('page-6'));

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
  document.getElementById('back-to-9').addEventListener('click',      () => showPage('page-9'));
  document.getElementById('lesson-prev-btn').addEventListener('click', () => lessonPrev());
  document.getElementById('lesson-next-btn').addEventListener('click', () => lessonNext());
  document.getElementById('lesson-start-btn').addEventListener('click',() => startLearnPractice());

  // ── Page 11 ────────────────────────────────────────────────
  document.getElementById('back-to-9-practice').addEventListener('click', () => showPage('page-9'));

  // ── Page 12 ────────────────────────────────────────────────
  document.getElementById('back-to-8').addEventListener('click',               () => showPage('page-8'));
  document.getElementById('btn-learn-input-keyboard').addEventListener('click',() => selectLearnInput('keyboard'));
  document.getElementById('btn-learn-input-buttons').addEventListener('click', () => selectLearnInput('buttons'));

});