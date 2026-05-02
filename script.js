function goTo(topic, title) {
  document.getElementById('page2-title').textContent = title;
  document.getElementById('page-1').style.display = 'none';
  document.getElementById('page-2').style.display = 'block';
}

function goBack() {
  document.getElementById('page-2').style.display = 'none';
  document.getElementById('page-1').style.display = 'block';
}