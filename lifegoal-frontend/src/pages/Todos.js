import React, { useState, useEffect } from 'react';
import './Todos.css';

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
      const res = await fetch('http://localhost:8000/api/todos/');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/todos/history');
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

    try {
      const res = await fetch('http://localhost:8000/api/todos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodo,
          priority,
          is_recurring: isRecurring,
          recurring_days: recurringDays.length > 0 ? recurringDays.join(',') : ''
        })
      });

      const data = await res.json();
      setTodos([data, ...todos]);
      setNewTodo('');
      setPriority('medium');
      setIsRecurring(false);
      setRecurringDays([]);
      setShowDaysDialog(false);
    } catch (error) {
      console.error('Error adding todo:', error);
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
      const res = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });

      const data = await res.json();
      setTodos(todos.map(t => t.id === id ? data : t));
      fetchHistory();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const editTodo = async (id, newTitle) => {
    try {
      const res = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });

      const data = await res.json();
      setTodos(todos.map(t => t.id === id ? data : t));
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    setTodos(todos.filter(t => t.id !== id));
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
