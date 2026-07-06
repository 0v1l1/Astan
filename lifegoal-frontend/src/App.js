import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Todos from './pages/Todos';
import Workouts from './pages/Workouts';
import Water from './pages/Water';
import Food from './pages/Food';
import Profile from './pages/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tgTheme = WebApp.colorScheme || 'dark';
    setTheme(tgTheme);

    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user);
    }

    WebApp.onEvent('themeChanged', () => {
      setTheme(WebApp.colorScheme);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    WebApp.setHeaderColor(theme === 'dark' ? '#08080A' : '#F2F2F7');
    WebApp.setBackgroundColor(theme === 'dark' ? '#08080A' : '#F2F2F7');
  }, [theme]);

  // Spotlight follow for liquid glass cards
  useEffect(() => {
    const addSpotlight = () => {
      document.querySelectorAll(
        '.glass-card, .grid-item, .card, .stat-card, .graph-card, .template-card, .water-card, .meal-section, .todo-item, .food-item, .history-day, .info-card, .settings-card'
      ).forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });
    };
    addSpotlight();
    const interval = setInterval(addSpotlight, 2000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home user={user} />;
      case 'todos': return <Todos />;
      case 'workouts': return <Workouts />;
      case 'water': return <Water />;
      case 'food': return <Food />;
      case 'profile': return <Profile theme={theme} toggleTheme={toggleTheme} user={user} />;
      default: return <Home user={user} />;
    }
  };

  return (
    <div className="app">
      <div className="ambient"></div>
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>
      <div className="glow glow-3"></div>
      <div className="app-content">
        {user && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{user.first_name}</span>
            {user.photo_url ? (
              <img src={user.photo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '14px', fontWeight: 700 }}>
                {user.first_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
        {renderPage()}
      </div>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;