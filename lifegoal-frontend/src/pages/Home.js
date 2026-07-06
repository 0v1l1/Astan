import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [stats, setStats] = useState({
    todos: 0,
    food: 0,
    workouts: false,
    water: { percentage: 0, total: 0 }
  });
  const [notes, setNotes] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [reminders] = useState([
    'Выпить стакан воды',
    'Сделать разминку',
    'Проверить список дел',
    'Записать мысли в заметки'
  ]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  useEffect(() => {
    fetchStats();
    fetchNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const [todosRes, waterRes, workoutsRes] = await Promise.all([
        fetch('https://lftracker.onrender.com/api/todos/completed-percentage'),
        fetch('https://lftracker.onrender.com/api/water/today'),
        fetch('https://lftracker.onrender.com/api/workouts/logs/today')
      ]);

      const todosData = await todosRes.json();
      const waterData = await waterRes.json();
      const workoutsData = await workoutsRes.json();

      setStats({
        todos: todosData.percentage || 0,
        food: 0,
        workouts: workoutsData,
        water: waterData
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/notes/');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch('https://lftracker.onrender.com/api/notes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      });
      const noteData = await res.json();
      setNotes([noteData, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`https://lftracker.onrender.com/api/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const editNote = async (id, newText) => {
    try {
      await fetch(`https://lftracker.onrender.com/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newText })
      });
      setNotes(notes.map(n => n.id === id ? { ...n, content: newText } : n));
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (error) {
      console.error('Error editing note:', error);
    }
  };

  return (
    <div className="home">
      <div className="header">
        <div>
          <div className="header-title">● LIFEGOAL</div>
          <div className="header-subtitle">{dateStr}</div>
        </div>
        <div className="icon-group">
          <button className="icon-btn" onClick={() => setShowCalendarModal(true)} title="Сводка дня">📅</button>
          <button className="icon-btn" onClick={() => setShowReminderModal(true)} title="Напоминания">💡</button>
          <button className="icon-btn" onClick={() => setShowInfoModal(true)} title="О приложении">⚙️</button>
        </div>
      </div>

      <div className="summary-title">ГЛАВНАЯ СВОДКА</div>

      <div className="grid">
        <div className="grid-item">
          <div className="grid-item-label">ДЕЛА</div>
          <div className="grid-item-value">{Math.round(stats.todos)}%</div>
          <div className="grid-item-progress">
            <div className="progress-fill" style={{ width: `${stats.todos}%` }}></div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-item-label">ЕДА</div>
          <div className="grid-item-value">{Math.round(stats.food)}%</div>
          <div className="grid-item-progress">
            <div className="progress-fill" style={{ width: `${stats.food}%` }}></div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-item-label">ТРЕНИРОВКА</div>
          <div className="grid-item-value">{stats.workouts ? '✓' : '0%'}</div>
          <div className="grid-item-progress">
            <div className="progress-fill" style={{ width: stats.workouts ? '100%' : '0%' }}></div>
          </div>
        </div>
        <div className="grid-item">
          <div className="grid-item-label">ВОДА</div>
          <div className="grid-item-value">{Math.round(stats.water.percentage)}%</div>
          <div className="grid-item-progress">
            <div className="progress-fill" style={{ width: `${stats.water.percentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="notes-section">
        <div className="notes-header glass-card" onClick={() => setShowNotesModal(true)}>
          <span className="notes-icon">📝</span>
          <div className="notes-info">
            <div className="notes-title">ЗАМЕТКИ</div>
            <div className="notes-count">{notes.length}</div>
          </div>
          <span className="notes-arrow">→</span>
        </div>
      </div>

      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Новая заметка</h2>
              <button className="close-btn" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>
            <textarea
              className="note-textarea"
              placeholder="Напишите вашу заметку здесь..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowNotesModal(false)}>Отмена</button>
              <button className="btn-save" onClick={addNote}>Сохранить</button>
            </div>
            <div className="notes-history">
              <h3>История</h3>
              {notes.map((note) => (
                <div key={note.id} className="history-note">
                  {editingNoteId === note.id ? (
                    <div className="note-edit-form">
                      <textarea className="note-edit-textarea" value={editingNoteText} onChange={(e) => setEditingNoteText(e.target.value)} />
                      <div className="note-edit-buttons">
                        <button className="note-btn save" onClick={() => editNote(note.id, editingNoteText)}>✓</button>
                        <button className="note-btn cancel" onClick={() => setEditingNoteId(null)}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="history-note-content">{note.content}</div>
                      <div className="history-note-footer">
                        <div className="history-note-date">{new Date(note.date).toLocaleDateString('ru-RU')}</div>
                        <div className="note-actions">
                          <button className="note-action-btn edit" onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.content); }}>✎</button>
                          <button className="note-action-btn delete" onClick={() => deleteNote(note.id)}>✕</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>О приложении</h2>
              <button className="close-btn" onClick={() => setShowInfoModal(false)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>●</div>
              <h3>LifeGoal</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '10px 0' }}>Трекер дня и привычек</p>
              <p style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>Версия 1.0.0</p>
              <div style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <p>Следите за задачами, тренировками,</p>
                <p>питанием и водным балансом</p>
                <p style={{ marginTop: '10px' }}>© {new Date().getFullYear()} LifeGoal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 Напоминания на день</h2>
              <button className="close-btn" onClick={() => setShowReminderModal(false)}>✕</button>
            </div>
            <div style={{ padding: '10px' }}>
              {reminders.map((reminder, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '14px', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--primary-green)' }}>●</span>
                  <span>{reminder}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCalendarModal && (
        <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Сводка дня</h2>
              <button className="close-btn" onClick={() => setShowCalendarModal(false)}>✕</button>
            </div>
            <div style={{ padding: '10px' }}>
              <div className="glass-card" style={{ padding: '14px', margin: '8px 0', textAlign: 'center' }}>
                <h3>{dateStr}</h3>
              </div>
              <div className="glass-card" style={{ padding: '14px', margin: '8px 0' }}>
                <p>📋 Задачи: <strong>{Math.round(stats.todos)}%</strong></p>
              </div>
              <div className="glass-card" style={{ padding: '14px', margin: '8px 0' }}>
                <p>💧 Вода: <strong>{stats.water.total.toFixed(1)}л / {stats.water.goal}л</strong></p>
              </div>
              <div className="glass-card" style={{ padding: '14px', margin: '8px 0' }}>
                <p>🏋️ Тренировка: <strong>{stats.workouts ? 'Выполнена ✓' : 'Не выполнена'}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
