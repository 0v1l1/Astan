import React from 'react';
import './Navigation.css';

function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Главная' },
    { id: 'todos', icon: 'tasks', label: 'Дела' },
    { id: 'workouts', icon: 'dumbbell', label: 'Спорт' },
    { id: 'water', icon: 'droplet', label: 'Вода' },
    { id: 'food', icon: 'food', label: 'Еда' },
    { id: 'sleep', icon: 'moon', label: 'Сон' },
    { id: 'profile', icon: 'person', label: 'Профиль' },
  ];

  const icons = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>,
    tasks: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="m3 6 1.2 1.2L6.5 5"/><path d="m3 12 1.2 1.2 2.3-2.2"/><path d="m3 18 1.2 1.2 2.3-2.2"/></svg>,
    dumbbell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8v8"/><path d="M2 10v4"/><path d="M20 8v8"/><path d="M22 10v4"/><path d="M7 12h10"/><path d="M6 8v8"/><path d="M18 8v8"/></svg>,
    droplet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg>,
    food: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3v7a2 2 0 0 0 2 2v9"/><path d="M17 3c-1.5 0-3 1.5-3 4v4h3v10"/></svg>,
    moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"/></svg>,
    person: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  };

  return (
    <div className="nav">
      {navItems.map(item => (
        <button key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => setCurrentPage(item.id)}>
          <span className="nav-dot"></span>
          <div className="nav-icon-wrapper">{icons[item.icon]}</div>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Navigation;