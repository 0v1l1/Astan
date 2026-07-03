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
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    fetchStats();
    fetchNotes();
  }, []);

  const fetchStats = async () => {
    try {
      const [todosRes, waterRes, workoutsRes] = await Promise.all([
        fetch('http://localhost:8000/api/todos/completed-percentage'),
        fetch('http://localhost:8000/api/water/today'),
        fetch('http://localhost:8000/api/workouts/logs/today')
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
      const res = await fetch('http://localhost:8000/api/notes/');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch('http://localhost:8000/api/notes/', {
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

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const editNote = (id, newText) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content: newText } : n));
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  return (
    <div className="home">
      <div className="header">
        <div>
          <div className="header-title">● LIFEGOAL</div>
          <div className="header-subtitle">Чт, 2 Июля</div>
        </div>
        <div className="icon-group">
          <button className="icon-btn">📅</button>
          <button className="icon-btn">💡</button>
          <button className="icon-btn">⚙️</button>
        </div>
      </div>

      <div className="summary-title">ГЛАВНАЯ СВОДКА</div>

      <div className="grid">
        <div className="grid-item">
          <div className="grid-item-label">ДЕЛА</div>
          <div className="grid-item-value">{Math.round(stats.todos)}%</div>
          <div className="grid-item-progress">
            <div
              className="progress-fill"
              style={{ width: `${stats.todos}%` }}
            ></div>
          </div>
        </div>

        <div className="grid-item">
          <div className="grid-item-label">ЕДА</div>
          <div className="grid-item-value">{Math.round(stats.food)}%</div>
          <div className="grid-item-progress">
            <div
              className="progress-fill"
              style={{ width: `${stats.food}%` }}
            ></div>
          </div>
        </div>

        <div className="grid-item">
          <div className="grid-item-label">ТРЕНИРОВКИ</div>
          <div className="grid-item-value">{stats.workouts ? '✓' : '0%'}</div>
          <div className="grid-item-progress">
            <div
              className="progress-fill"
              style={{ width: stats.workouts ? '100%' : '0%' }}
            ></div>
          </div>
        </div>

        <div className="grid-item">
          <div className="grid-item-label">ВОДА</div>
          <div className="grid-item-value">{Math.round(stats.water.percentage)}%</div>
          <div className="grid-item-progress">
            <div
              className="progress-fill"
              style={{ width: `${stats.water.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="notes-section">
        <div
          className="notes-header"
          onClick={() => setShowNotesModal(true)}
        >
          <span className="notes-icon">📝</span>
          <div className="notes-info">
            <div className="notes-title">ЗАМЕТКИ</div>
            <div className="notes-count">{notes.length}</div>
          </div>
          <span className="notes-arrow">→</span>
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
                        <textarea
                          className="note-edit-textarea"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                        />
                        <div className="note-edit-buttons">
                          <button
                            className="note-btn save"
                            onClick={() => editNote(note.id, editingNoteText)}
                          >
                            ✓
                          </button>
                          <button
                            className="note-btn cancel"
                            onClick={() => setEditingNoteId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="history-note-content">{note.content}</div>
                        <div className="history-note-footer">
                          <div className="history-note-date">
                            {new Date(note.date).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="note-actions">
                            <button
                              className="note-action-btn edit"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteText(note.content);
                              }}
                            >
                              ✎
                            </button>
                            <button
                              className="note-action-btn delete"
                              onClick={() => deleteNote(note.id)}
                            >
                              ✕
                            </button>
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
      </div>
    </div>
  );
}

export default Home;
