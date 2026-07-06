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
    WebApp.setHeaderColor(theme === 'dark' ? '#000000' : '#F2F2F7');
    WebApp.setBackgroundColor(theme === 'dark' ? '#000000' : '#F2F2F7');
  }, [theme]);

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
      <div className="app-content">
        {user && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right', marginBottom: '8px' }}>
            {user.first_name} {user.last_name || ''}
          </div>
        )}
        {renderPage()}
      </div>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
