const noteInput = document.getElementById('noteInput');
const addBtn = document.getElementById('addNote');
const noteList = document.getElementById('noteList');
const offlineStatus = document.getElementById('offlineStatus');

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  noteList.innerHTML = '';
  notes.forEach((note, index) => {
    const li = document.createElement('li');
    li.textContent = note;
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.onclick = () => {
      notes.splice(index, 1);
      localStorage.setItem('notes', JSON.stringify(notes));
      loadNotes();
    };
    li.appendChild(delBtn);
    noteList.appendChild(li);
  });
}

addBtn.addEventListener('click', () => {
  const text = noteInput.value.trim();
  if (text) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push(text);
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    loadNotes();
  }
});

window.addEventListener('load', () => {
  loadNotes();
  offlineStatus.style.display = navigator.onLine ? 'none' : 'block';
});

window.addEventListener('online', () => offlineStatus.style.display = 'none');
window.addEventListener('offline', () => offlineStatus.style.display = 'block');
