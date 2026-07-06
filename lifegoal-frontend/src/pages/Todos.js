import React, { useState, useEffect } from 'react';
import './Todos.css';

const API_URL = 'https://lftracker.onrender.com/api/todos';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recurringDays, setRecurringDays] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDaysDialog, setShowDaysDialog] = useState(false);
  const [history, setHistory] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState(null);

  const daysOfWeek = [
    { id: 0, name: 'ПН' },
    { id: 1, name: 'ВТ' },
    { id: 2, name: 'СР' },
    { id: 3, name: 'ЧТ' },
    { id: 4, name: 'ПТ' },
    { id: 5, name: 'СБ' },
    { id: 6, name: 'ВС' }
  ];

  useEffect(() => {
    fetchTodos();
    fetchHistory();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Не удалось загрузить задачи');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const grouped = {};
      data.forEach(todo => {
        const date = new Date(todo.created_at).toLocaleDateString('ru-RU');
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(todo);
      });
      setHistory(grouped);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    setError(null);

    try {
      const res = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodo,
          priority,
          is_recurring: isRecurring,
          recurring_days: recurringDays.length > 0 ? recurringDays.join(',') : ''
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setTodos(prev => [data, ...prev]);
      setNewTodo('');
      setPriority('medium');
      setIsRecurring(false);
      setRecurringDays([]);
      setShowDaysDialog(false);
      fetchHistory(); // Обновляем историю
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Не удалось добавить задачу');
    }
  };

  const toggleDay = (dayId) => {
    setRecurringDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort((a, b) => a - b)
    );
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setTodos(prev => prev.map(t => t.id === id ? data : t));
      fetchHistory(); // Обновляем историю после изменения статуса
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Не удалось обновить задачу');
    }
  };

  const editTodo = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setTodos(prev => prev.map(t => t.id === id ? data : t));
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Не удалось отредактировать задачу');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setTodos(prev => prev.filter(t => t.id !== id));
      fetchHistory(); // Обновляем историю
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Не удалось удалить задачу');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'rgba(255, 107, 107, 0.5)';
      case 'medium': return 'rgba(255, 217, 61, 0.5)';
      case 'low': return 'rgba(107, 203, 119, 0.5)';
      default: return 'rgba(128, 128, 128, 0.5)';
    }
  };

  return (
    <div className="todos">
      <div className="header">
        <div className="header-title">Дела на день</div>
      </div>

      {error && (
        <div className="error-message" style={{
          color: '#ff6b6b',
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ff6b6b',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="add-todo">
        <input
          type="text"
          className="input-field"
          placeholder="Новое дело..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />

        <div className="priority-recurring-row">
          <div className="priority-select">
            <label>Приоритет:</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <div className="recurring-checkbox-inline">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) {
                    setShowDaysDialog(true);
                  }
                }}
                id="recurring"
              />
              <label htmlFor="recurring">Повторяющееся</label>
            </div>
          </div>
        </div>

        {showDaysDialog && isRecurring && (
          <div className="days-dialog">
            <div className="days-grid">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  className={`day-button ${recurringDays.includes(day.id) ? 'active' : ''}`}
                  onClick={() => toggleDay(day.id)}
                >
                  <div className="day-circle">
                    {recurringDays.includes(day.id) && <span className="day-checkmark">✓</span>}
                  </div>
                  <div className="day-label">{day.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn" onClick={addTodo}>Добавить</button>
      </div>

      <div className="todos-list">
        <h3>На сегодня:</h3>
        {todos.length === 0 ? (
          <p className="empty-message">Нет дел на сегодня</p>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
              </div>
              <div className="todo-content">
                {editingId === todo.id ? (
                  <input
                    type="text"
                    className="todo-edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => editTodo(todo.id, editingText)}
                    onKeyPress={(e) => e.key === 'Enter' && editTodo(todo.id, editingText)}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="todo-title">{todo.title}</div>
                    <div className="todo-priority" style={{ backgroundColor: getPriorityColor(todo.priority) }}>
                      {todo.priority}
                    </div>
                  </>
                )}
              </div>
              <div className="todo-actions">
                <button
                  className="todo-btn edit"
                  onClick={() => {
                    setEditingId(todo.id);
                    setEditingText(todo.title);
                  }}
                  title="Редактировать"
                >
                  ✎
                </button>
                <button
                  className="todo-btn delete"
                  onClick={() => deleteTodo(todo.id)}
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="history-section">
        <h3>История дел</h3>
        {Object.entries(history).map(([date, dayTodos]) => (
          <div key={date} className="history-day">
            <div
              className="history-date"
              onClick={() => setExpandedDate(expandedDate === date ? null : date)}
            >
              <span>{date}</span>
              <span className="expand-icon">{expandedDate === date ? '▼' : '▶'}</span>
            </div>
            {expandedDate === date && (
              <div className="history-todos">
                {dayTodos.map(todo => (
                  <div key={todo.id} className="history-todo-item">
                    <span className={`todo-check ${todo.completed ? 'checked' : ''}`}>●</span>
                    <span>{todo.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todos;
