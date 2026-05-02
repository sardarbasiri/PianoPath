function showPage(pageId) {
  document.querySelectorAll('div[id^="page-"]').forEach(p => p.style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
}

function goTo(topic, title) {
  document.getElementById('page2-title').textContent = title;
  showPage('page-2');
}

function goBack() {
  showPage('page-1');
}

let selectedTopic = '';

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