import React, { useState, useEffect } from 'react';
import './Workouts.css';

function Workouts() {
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', exercises: [{ name: '', sets: 0, reps: 0, weight: 0 }] });
  const [expandedDate, setExpandedDate] = useState(null);
  const [history, setHistory] = useState({});
  const [workoutNote, setWorkoutNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/workouts/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/workouts/logs');
      const data = await res.json();
      const grouped = {};
      data.forEach(log => {
        const date = new Date(log.date).toLocaleDateString('ru-RU');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(log);
      });
      setHistory(grouped);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name.trim()) return;

    try {
      const res = await fetch('https://lftracker.onrender.com/api/workouts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });

      const data = await res.json();
      setTemplates([...templates, data]);
      setNewTemplate({ name: '', exercises: [{ name: '', sets: 0, reps: 0, weight: 0 }] });
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const logWorkout = async (templateId, exercises) => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/workouts/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          exercises,
          note: workoutNote
        })
      });

      const data = await res.json();
      setLogs([data, ...logs]);
      setWorkoutNote('');
      fetchLogs();
    } catch (error) {
      console.error('Error logging workout:', error);
    }
  };

  const addExercise = () => {
    setNewTemplate({
      ...newTemplate,
      exercises: [...newTemplate.exercises, { name: '', sets: 0, reps: 0, weight: 0 }]
    });
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...newTemplate.exercises];
    if (field === 'name') {
      updatedExercises[index][field] = value;
    } else {
      updatedExercises[index][field] = value === '' ? 0 : parseFloat(value) || 0;
    }
    setNewTemplate({ ...newTemplate, exercises: updatedExercises });
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="workouts">
     <div className="header">
  <div className="header-title"><span className="dot"></span> ТРЕНИРОВКИ</div>
</div>

      <div className="templates-section">
        <h3>Сохранённые программы</h3>
        {templates.length === 0 ? (
          <p className="empty-message">Нет сохранённых программ</p>
        ) : (
          templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div className="template-name">{template.name}</div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTemplate(template.id)}
                >
                  ✕
                </button>
              </div>
              <div className="template-exercises">
                {template.exercises && template.exercises.map(ex => (
                  <div key={ex.id} className="exercise-info">
                    {ex.name}: {ex.weight}кг x {ex.reps} ({ex.sets}сетов)
                  </div>
                ))}
              </div>
              <button
                className="btn btn-small"
                onClick={() => logWorkout(template.id, template.exercises)}
              >
                Повторить
              </button>
            </div>
          ))
        )}
      </div>

      <div className="new-template-section">
        <h3>Создать новую программу</h3>
        <div className="template-form">
          <input
            type="text"
            className="input-field"
            placeholder="Название программы"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
          />

          <div className="exercises-list">
            {newTemplate.exercises.map((exercise, index) => (
              <div key={index} className="exercise-form">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Упражнение"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                />
                <div className="exercise-inputs">
                  <div className="input-group">
                    <input
                      type="number"
                      className="input-field input-small"
                      placeholder="0"
                      value={exercise.weight || ''}
                      onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                      onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                    />
                    <label className="input-label">Вес (кг)</label>
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      className="input-field input-small"
                      placeholder="0"
                      value={exercise.sets || ''}
                      onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                      onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                    />
                    <label className="input-label">Подходы</label>
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      className="input-field input-small"
                      placeholder="0"
                      value={exercise.reps || ''}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                    />
                    <label className="input-label">Повторения</label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-buttons">
            <button className="btn btn-small" onClick={addExercise}>+ Упражнение</button>
            <button className="btn btn-small" onClick={saveTemplate}>Сохранить</button>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h3>История тренировок</h3>
        {Object.entries(history).length === 0 ? (
          <p className="empty-message">История пуста</p>
        ) : (
          Object.entries(history).map(([date, dayLogs]) => (
            <div key={date} className="history-day">
              <div
                className="history-date"
                onClick={() => setExpandedDate(expandedDate === date ? null : date)}
              >
                <span>{date}</span>
                <span className="expand-icon">{expandedDate === date ? '▼' : '▶'}</span>
              </div>
              {expandedDate === date && (
                <div className="history-workouts">
                  {dayLogs.map(log => (
                    <div key={log.id} className="workout-log-item">
                      <div className="log-time">
                        {new Date(log.date).toLocaleTimeString('ru-RU')}
                      </div>
                      {log.exercises && log.exercises.map(ex => (
                        <div key={ex.id} className="log-exercise">
                          {ex.exercise_name}: {ex.weight}кг x {ex.reps}
                        </div>
                      ))}
                      {log.note && (
                        <div className="log-note">
                          <strong>Заметка:</strong>
                          {editingNoteId === log.id ? (
                            <div className="note-edit">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                className="note-textarea"
                              />
                              <div className="note-buttons">
                                <button
                                  className="note-btn save"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteText('');
                                  }}
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
                            <div className="note-view">
                              <p>{log.note}</p>
                              <div className="note-actions">
                                <button
                                  className="note-btn edit"
                                  onClick={() => {
                                    setEditingNoteId(log.id);
                                    setEditingNoteText(log.note);
                                  }}
                                >
                                  ✎
                                </button>
                                <button
                                  className="note-btn delete"
                                  onClick={() => {}}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Workouts;
