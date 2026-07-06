import React from 'react';
import './Navigation.css';

function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'home', icon: 'home' },
    { id: 'todos', icon: 'checkmark' },
    { id: 'workouts', icon: 'dumbbell' },
    { id: 'water', icon: 'droplet' },
    { id: 'food', icon: 'fork' },
    { id: 'profile', icon: 'person' },
  ];

  const renderIcon = (icon) => {
    const iconMap = {
      home: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      checkmark: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
      dumbbell: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Гриф */}
          <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
          {/* Левый блин */}
          <rect x="3" y="8" width="3" height="8" rx="1" />
          {/* Правый блин */}
          <rect x="18" y="8" width="3" height="8" rx="1" />
          {/* Левый держатель */}
          <line x1="6" y1="10.5" x2="7" y2="10.5" strokeWidth="2" />
          <line x1="6" y1="13.5" x2="7" y2="13.5" strokeWidth="2" />
          {/* Правый держатель */}
          <line x1="17" y1="10.5" x2="18" y2="10.5" strokeWidth="2" />
          <line x1="17" y1="13.5" x2="18" y2="13.5" strokeWidth="2" />
        </svg>
      ),
      droplet: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      ),
    fork: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Овальная чаша ложки */}
    <ellipse cx="12" cy="6" rx="5" ry="6" />
    {/* Ручка */}
    <line x1="12" y1="12" x2="12" y2="21" strokeWidth="3.1" />
  </svg>
),
      person: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
        </svg>
      ),
    };
    return iconMap[icon] || null;
  };

  return (
    <div className="navigation">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => setCurrentPage(item.id)}
          title={item.id}
        >
          <div className="nav-icon-wrapper">
            {renderIcon(item.icon)}
          </div>
        </button>
      ))}
    </div>
  );
}

export default Navigation;
