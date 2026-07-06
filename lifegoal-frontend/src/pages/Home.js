import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [stats, setStats] = useState({ todos: 0, water: 0 });
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [reminders] = useState(['Выпить стакан воды', 'Сделать разминку', 'Проверить список дел', 'Записать мысли в заметки']);

  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const todoKey = 'todos_' + today.toLocaleDateString('ru-RU');
    const todos = JSON.parse(localStorage.getItem(todoKey) || '[]');
    const done = todos.filter(t => t.completed).length;
    setStats({ todos: todos.length ? Math.round((done / todos.length) * 100) : 0, water: 0 });

    const savedNotes = JSON.parse(localStorage.getItem('notes_all') || '[]');
    setNotes(savedNotes);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), content: newNote, date: new Date().toISOString() };
    const updated = [note, ...notes];
    localStorage.setItem('notes_all', JSON.stringify(updated));
    setNotes(updated);
    setNewNote('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    localStorage.setItem('notes_all', JSON.stringify(updated));
    setNotes(updated);
  };

  return (
    <div className="home">
      <div className="header">
        <div><div className="header-title">● LIFEGOAL</div><div className="header-subtitle">{dateStr}</div></div>
        <div className="icon-group">
          <button className="icon-btn" onClick={() => setShowCalendarModal(true)}>📅</button>
          <button className="icon-btn" onClick={() => setShowReminderModal(true)}>💡</button>
          <button className="icon-btn" onClick={() => setShowInfoModal(true)}>⚙️</button>
        </div>
      </div>

      <div className="summary-title">ГЛАВНАЯ СВОДКА</div>
      <div className="grid">
        <div className="grid-item"><div className="grid-item-label">ДЕЛА</div><div className="grid-item-value">{stats.todos}%</div><div className="grid-item-progress"><div className="progress-fill" style={{ width: `${stats.todos}%` }}></div></div></div>
        <div className="grid-item"><div className="grid-item-label">ЕДА</div><div className="grid-item-value">0%</div></div>
        <div className="grid-item"><div className="grid-item-label">ТРЕНИРОВКА</div><div className="grid-item-value">0%</div></div>
        <div className="grid-item"><div className="grid-item-label">ВОДА</div><div className="grid-item-value">0%</div></div>
      </div>

      <div className="notes-section">
        <div className="notes-header glass-card" onClick={() => setShowNotesModal(true)}>
          <span>📝</span><div><div className="notes-title">ЗАМЕТКИ</div><div>{notes.length}</div></div><span>→</span>
        </div>
      </div>

      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Заметки</h2>
            <textarea className="note-textarea" placeholder="Напишите заметку..." value={newNote} onChange={e => setNewNote(e.target.value)} />
            <button className="btn" onClick={addNote}>Сохранить</button>
            <div style={{ marginTop: '16px' }}>
              {notes.map(n => (
                <div key={n.id} className="glass-card" style={{ padding: '10px', margin: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{n.content}</span>
                  <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>О приложении</h2>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '40px' }}>●</div>
              <h3>LifeGoal</h3>
              <p>Трекер дня и привычек</p>
              <p style={{ color: 'var(--primary-green)' }}>Версия 1.0.0</p>
              <p>© {new Date().getFullYear()} LifeGoal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;