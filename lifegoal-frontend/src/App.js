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
    const tgTheme = WebApp.colorScheme === 'light' ? 'light' : 'dark';
    setTheme(tgTheme);
    if (WebApp.initDataUnsafe?.user) setUser(WebApp.initDataUnsafe.user);
    WebApp.onEvent('themeChanged', () => setTheme(WebApp.colorScheme === 'light' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    WebApp.setHeaderColor(theme === 'dark' ? '#08080A' : '#F2F2F7');
    WebApp.setBackgroundColor(theme === 'dark' ? '#08080A' : '#F2F2F7');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

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
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 500 }}>{user.first_name}</span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(145deg, var(--primary-green), #1a5c1a)',
              boxShadow: '0 0 16px rgba(52, 199, 89, 0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', border: '2px solid var(--border-hi)', flexShrink: 0
            }}>
              {user.photo_url ? (
                <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>{user.first_name?.charAt(0) || '?'}</span>
              )}
            </div>
          </div>
        )}
        {renderPage()}
      </div>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;