import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [stats, setStats] = useState({ todos: 0, food: 0, workouts: false, water: { percentage: 0, total: 0 } });
  const [notes, setNotes] = useState([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const savedNotes = JSON.parse(localStorage.getItem('notes_all') || '[]');
    setNotes(savedNotes);
    try {
      fetch('https://lftracker.onrender.com/api/todos/completed-percentage').then(r => r.json()).then(d => setStats(s => ({ ...s, todos: d.percentage || 0 }))).catch(() => {});
      fetch('https://lftracker.onrender.com/api/water/today').then(r => r.json()).then(d => setStats(s => ({ ...s, water: d }))).catch(() => {});
    } catch(e) {}
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
      </div>

      <div className="grid">
        <div className="grid-item"><div className="grid-item-label">ДЕЛА</div><div className="grid-item-value">{Math.round(stats.todos)}%</div><div className="grid-item-progress"><div className="progress-fill" style={{ width: `${stats.todos}%` }}></div></div></div>
        <div className="grid-item"><div className="grid-item-label">ЕДА</div><div className="grid-item-value">0%</div></div>
        <div className="grid-item"><div className="grid-item-label">ТРЕНИРОВКА</div><div className="grid-item-value">{stats.workouts ? '✓' : '0%'}</div></div>
        <div className="grid-item"><div className="grid-item-label">ВОДА</div><div className="grid-item-value">{Math.round(stats.water.percentage || 0)}%</div></div>
      </div>

      <div className="notes-header glass-card" onClick={() => setShowNotesModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', cursor: 'pointer' }}>
        <div className="notes-icon-wrapper">
          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div style={{ flex: 1 }}><div style={{ fontSize: '12px', color: 'var(--primary-green)', textTransform: 'uppercase', fontWeight: 700 }}>ЗАМЕТКИ</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{notes.length}</div></div>
        <span style={{ fontSize: '18px', color: 'var(--text-faint)' }}>→</span>
      </div>

      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Заметки</h2>
            <textarea className="input-field" placeholder="Напишите заметку..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ minHeight: '100px' }} />
            <button className="btn" onClick={addNote} style={{ width: '100%', marginTop: '8px' }}>Сохранить</button>
            <div style={{ marginTop: '20px' }}>
              {notes.map(n => (
                <div key={n.id} className="glass-card" style={{ padding: '12px', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px' }}>{n.content}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>{new Date(n.date).toLocaleString('ru-RU')}</div>
                  </div>
                  <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;