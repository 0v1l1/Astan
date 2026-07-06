import React from 'react';
import './Navigation.css';

function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Главная' },
    { id: 'todos', icon: 'checkmark', label: 'Дела' },
    { id: 'workouts', icon: 'dumbbell', label: 'Спорт' },
    { id: 'water', icon: 'droplet', label: 'Вода' },
    { id: 'food', icon: 'fork', label: 'Еда' },
    { id: 'profile', icon: 'person', label: 'Профиль' },
  ];

  const renderIcon = (icon) => {
    const iconMap = {
      home: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11.5 12 4l9 7.5"/>
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>
        </svg>
      ),
      checkmark: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6h11"/>
          <path d="M9 12h11"/>
          <path d="M9 18h11"/>
          <path d="m3 6 1.2 1.2L6.5 5"/>
          <path d="m3 12 1.2 1.2 2.3-2.2"/>
          <path d="m3 18 1.2 1.2 2.3-2.2"/>
        </svg>
      ),
      dumbbell: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
          <rect x="3" y="8" width="3" height="8" rx="1" />
          <rect x="18" y="8" width="3" height="8" rx="1" />
        </svg>
      ),
      droplet: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>
        </svg>
      ),
      fork: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="6" rx="5" ry="6" />
          <line x1="12" y1="12" x2="12" y2="21" strokeWidth="2.5" />
        </svg>
      ),
      person: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      ),
    };
    return iconMap[icon] || null;
  };

  return (
    <div className="nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => setCurrentPage(item.id)}
        >
          <span className="nav-dot"></span>
          <div className="nav-icon-wrapper">
            {renderIcon(item.icon)}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Navigation;