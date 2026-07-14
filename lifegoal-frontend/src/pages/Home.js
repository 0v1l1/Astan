import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import DayRing from '../components/DayRing';
import { apiFetch } from '../utils/api';

const ruDate = (d) => d.toLocaleDateString('ru-RU');

function computeStreak() {
  // Walks backwards from today counting consecutive days that have
  // any completed todo, so the streak reflects real, unbroken momentum.
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const key = 'todos_' + ruDate(cursor);
    const todos = JSON.parse(localStorage.getItem(key) || '[]');
    const hasProgress = todos.some(t => t.completed);
    if (hasProgress) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      // today not started yet shouldn't zero out an existing streak
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function Home({ onNavigate }) {
  const [stats, setStats] = useState({ todos: 0, food: 0, workouts: false, water: { percentage: 0, total: 0 } });
  const [notes, setNotes] = useState([]);
  const [streak, setStreak] = useState(0);
  const [sleepSummary, setSleepSummary] = useState({ hours: null, quality: null, percent: 0 });
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');

  const tips = [
    'Стакан воды с утра включает метаболизм быстрее, чем кофе.',
    'Маленькие дела в начале дня создают инерцию для больших.',
    'Пропущенная тренировка — не провал, если завтра вы вернулись.',
    '5 минут планирования вечером экономят час метаний утром.',
    'Стрик держит не сила воли, а привычка начинать с самого лёгкого дела.',
  ];
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tips.length));

  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

  const loadData = useCallback(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes_all') || '[]');
    setNotes(savedNotes);

    const todoKey = 'todos_' + ruDate(today);
    const todos = JSON.parse(localStorage.getItem(todoKey) || '[]');
    const done = todos.filter(t => t.completed).length;
    const todoPercent = todos.length ? Math.round((done / todos.length) * 100) : 0;

    setStats(s => ({ ...s, todos: todoPercent }));
    setStreak(computeStreak());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Water, food, and workouts live on the backend (same API the individual
  // pages use), so the home summary has to ask for them too instead of
  // assuming zero.
  const loadRemoteStats = useCallback(async () => {
    const todayStr = ruDate(new Date());

    const waterPromise = apiFetch('/api/water/today')
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    const foodPromise = apiFetch('/api/food/')
      .then(r => r.ok ? r.json() : [])
      .then(list => Array.isArray(list)
        ? list.filter(f => new Date(f.date).toLocaleDateString('ru-RU') === todayStr)
        : [])
      .catch(() => []);

    const workoutsPromise = apiFetch('/api/workouts/logs')
      .then(r => r.ok ? r.json() : [])
      .then(list => Array.isArray(list)
        ? list.some(log => new Date(log.date).toLocaleDateString('ru-RU') === todayStr)
        : false)
      .catch(() => false);

    const sleepPromise = Promise.all([
      apiFetch('/api/sleep/goal')
        .then(r => r.ok ? r.json() : { bedtime: '23:00', wake: '07:00' })
        .catch(() => ({ bedtime: '23:00', wake: '07:00' })),
      apiFetch('/api/sleep/history')
        .then(r => r.ok ? r.json() : [])
        .catch(() => []),
    ]);

    const [water, todayFoods, hasWorkoutToday, [sleepGoal, sleepLogs]] = await Promise.all([
      waterPromise, foodPromise, workoutsPromise, sleepPromise,
    ]);

    if (Array.isArray(sleepLogs) && sleepLogs.length > 0 && sleepGoal?.bedtime && sleepGoal?.wake) {
      const [gh, gm] = sleepGoal.bedtime.split(':').map(Number);
      const [wh, wm] = sleepGoal.wake.split(':').map(Number);
      let goalMinutes = (wh * 60 + wm) - (gh * 60 + gm);
      if (goalMinutes <= 0) goalMinutes += 24 * 60;
      const goalHours = goalMinutes / 60 || 8;
      const latestHours = sleepLogs[0].hours || 0;
      setSleepSummary({
        hours: latestHours,
        quality: sleepLogs[0].quality,
        percent: Math.min(100, Math.round((latestHours / goalHours) * 100)),
      });
    }

    setStats(s => ({
      ...s,
      water: water && typeof water.percentage === 'number' ? water : s.water,
      // 4 meal slots (breakfast/lunch/dinner/snack) is the app's own model,
      // so "food progress" is coverage of those slots rather than a made-up goal.
      food: Math.min(100, Math.round((new Set(todayFoods.map(f => f.meal_type)).size / 4) * 100)),
      workouts: hasWorkoutToday,
    }));
  }, []);

  useEffect(() => { loadData(); loadRemoteStats(); }, [loadData, loadRemoteStats]);

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

  const startEdit = (note) => {
    setEditingNote(note.id);
    setEditText(note.content);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    const updated = notes.map(n => n.id === editingNote ? { ...n, content: editText } : n);
    localStorage.setItem('notes_all', JSON.stringify(updated));
    setNotes(updated);
    setEditingNote(null);
    setEditText('');
  };

  return (
    <div className="home">
      <div className="header">
        <div>
          <div className="header-title"><span className="dot"></span>LIFEGOAL</div>
          <div className="header-subtitle">{dateStr}</div>
        </div>
        <div className="icon-group">
          <button className="icon-btn" onClick={() => onNavigate('todos')} title="Календарь дел">📅</button>
          <button className="icon-btn" onClick={() => { setTipIndex(Math.floor(Math.random() * tips.length)); setShowTipsModal(true); }} title="Совет дня">💡</button>
          <button className="icon-btn" onClick={() => onNavigate('profile')} title="Настройки">⚙️</button>
        </div>
      </div>

      <DayRing
        todos={stats.todos}
        food={stats.food}
        workouts={stats.workouts ? 100 : 0}
        water={stats.water.percentage || 0}
        sleep={sleepSummary.percent || 0}
        streak={streak}
      />

      <div className="grid">
        <div className="grid-item cat-todos" onClick={() => onNavigate('todos')}>
          <div className="grid-item-label">ДЕЛА</div>
          <div className="grid-item-value">{Math.round(stats.todos)}%</div>
          <div className="grid-item-progress"><div className="progress-fill" style={{ width: `${stats.todos}%` }}></div></div>
        </div>
        <div className="grid-item cat-food" onClick={() => onNavigate('food')}>
          <div className="grid-item-label">ЕДА</div>
          <div className="grid-item-value">{Math.round(stats.food)}%</div>
          <div className="grid-item-progress"><div className="progress-fill" style={{ width: `${stats.food}%` }}></div></div>
        </div>
        <div className="grid-item cat-workouts" onClick={() => onNavigate('workouts')}>
          <div className="grid-item-label">ТРЕНИРОВКА</div>
          <div className="grid-item-value">{stats.workouts ? '✓' : '0%'}</div>
          <div className="grid-item-progress"><div className="progress-fill" style={{ width: stats.workouts ? '100%' : '0%' }}></div></div>
        </div>
        <div className="grid-item cat-water water-tile" onClick={() => onNavigate('water')}>
          <div className="grid-item-label">ВОДА</div>
          <div className="water-widget">
            <div className="water-glass">
              <div className="water-fill" style={{ height: `${Math.round(stats.water.percentage || 0)}%` }}></div>
            </div>
            <div className="water-pct">{Math.round(stats.water.percentage || 0)}%</div>
          </div>
        </div>
      </div>

      <div className="notes-header glass-card" onClick={() => onNavigate('sleep')} style={{ marginBottom: '12px' }}>
        <div className="notes-icon-wrapper" style={{ background: 'linear-gradient(145deg, var(--c-sleep), #4A55B0)', boxShadow: '0 0 16px rgba(140,155,255,0.45)' }}>
          <svg viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"/></svg>
        </div>
        <div className="notes-header-body">
          <div className="notes-header-label" style={{ color: 'var(--c-sleep)' }}>СОН</div>
          <div className="notes-header-count">{sleepSummary.hours ? `${sleepSummary.hours} ч` : '—'}</div>
        </div>
        <span className="notes-header-arrow">→</span>
      </div>

      <div className="notes-header glass-card" onClick={() => setShowNotesModal(true)}>
        <div className="notes-icon-wrapper">
          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div className="notes-header-body">
          <div className="notes-header-label">ЗАМЕТКИ</div>
          <div className="notes-header-count">{notes.length}</div>
        </div>
        <span className="notes-header-arrow">→</span>
      </div>

      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px', color: 'var(--text)' }}>Заметки</h2>
            <textarea className="input-field" placeholder="Напишите заметку..." value={newNote} onChange={e => setNewNote(e.target.value)} style={{ minHeight: '80px' }} />
            <button className="btn" onClick={addNote} style={{ width: '100%', marginTop: '8px' }}>Сохранить</button>
            <div style={{ marginTop: '20px' }}>
              {notes.map(n => (
                <div key={n.id} className="glass-card" style={{ padding: '12px', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  {editingNote === n.id ? (
                    <div style={{ flex: 1 }}>
                      <textarea className="input-field" value={editText} onChange={e => setEditText(e.target.value)} style={{ minHeight: '60px', marginBottom: '8px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" onClick={saveEdit} style={{ flex: 1 }}>✓ Сохранить</button>
                        <button onClick={() => setEditingNote(null)} className="note-cancel-btn">✕ Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: 'var(--text)' }}>{n.content}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>{new Date(n.date).toLocaleString('ru-RU')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => startEdit(n)} className="note-edit-btn" title="Редактировать">✎</button>
                        <button onClick={() => deleteNote(n.id)} className="note-delete-btn" title="Удалить">✕</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {notes.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '13px', padding: '20px 0' }}>
                  Пока пусто. Запишите первую мысль дня.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showTipsModal && (
        <div className="modal-overlay" onClick={() => setShowTipsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💡</div>
            <h2 style={{ marginBottom: '12px', color: 'var(--text)' }}>Совет дня</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>{tips[tipIndex]}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="note-cancel-btn"
                style={{ flex: 1 }}
                onClick={() => setTipIndex((tipIndex + 1) % tips.length)}
              >
                Другой совет
              </button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowTipsModal(false)}>Понятно</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
