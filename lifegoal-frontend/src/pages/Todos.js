import React, { useState, useEffect } from 'react';
import './Todos.css';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [history, setHistory] = useState({});

  useEffect(() => {
    loadTodos();
  }, []);

  const getKey = () => 'todos_' + new Date().toLocaleDateString('ru-RU');

  const loadTodos = () => {
    const saved = localStorage.getItem(getKey());
    setTodos(saved ? JSON.parse(saved) : []);
    loadHistory();
  };

  const loadHistory = () => {
    const all = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('todos_')) {
        const date = key.replace('todos_', '');
        all[date] = JSON.parse(localStorage.getItem(key));
      }
    }
    setHistory(all);
  };

  const saveTodos = (newTodos) => {
    localStorage.setItem(getKey(), JSON.stringify(newTodos));
    setTodos(newTodos);
    loadHistory();
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = { id: Date.now(), title: newTodo, priority, completed: false };
    saveTodos([todo, ...todos]);
    setNewTodo('');
    setPriority('medium');
  };

  const toggleTodo = (id) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const getPriorityColor = (p) => {
    switch (p) {
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
        <input type="text" className="input-field" placeholder="Новое дело..." value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()} />
        <div className="priority-select">
          <label>Приоритет:</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        <button className="btn" onClick={addTodo}>Добавить</button>
      </div>

      <div className="todos-list">
        <h3>На сегодня:</h3>
        {todos.length === 0 ? <p className="empty-message">Нет дел на сегодня</p> :
          todos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="todo-checkbox" />
              <span className="todo-title" style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.title}</span>
              <span className="todo-priority" style={{ backgroundColor: getPriorityColor(todo.priority) }}>{todo.priority}</span>
              <button className="todo-btn delete" onClick={() => deleteTodo(todo.id)}>✕</button>
            </div>
          ))
        }
      </div>

      <div className="history-section">
        <h3>История дел</h3>
        {Object.entries(history).reverse().map(([date, dayTodos]) => (
          <div key={date} className="history-day">
            <div className="history-date"><span>{date}</span><span>({dayTodos.length})</span></div>
            <div className="history-todos">
              {dayTodos.map(todo => (
                <div key={todo.id} className="history-todo-item">
                  <span>{todo.completed ? '✅' : '⬜'}</span>
                  <span>{todo.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todos;