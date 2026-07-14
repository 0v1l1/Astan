import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Todos from './pages/Todos';
import Workouts from './pages/Workouts';
import Water from './pages/Water';
import Food from './pages/Food';
import Sleep from './pages/Sleep';
import Profile from './pages/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    const tgTheme = WebApp.colorScheme === 'light' ? 'light' : 'dark';
    setTheme(tgTheme);
    if (WebApp.initDataUnsafe?.user) setUser(WebApp.initDataUnsafe.user);
    WebApp.onEvent('themeChanged', () => setTheme(WebApp.colorScheme === 'light' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    WebApp.setHeaderColor(theme === 'dark' ? '#0A0B0D' : '#EFEFF4');
    WebApp.setBackgroundColor(theme === 'dark' ? '#0A0B0D' : '#EFEFF4');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home user={user} onNavigate={(page) => setCurrentPage(page)} />;
      case 'todos': return <Todos />;
      case 'workouts': return <Workouts />;
      case 'water': return <Water />;
      case 'food': return <Food />;
      case 'sleep': return <Sleep />;
      case 'profile': return <Profile theme={theme} toggleTheme={toggleTheme} user={user} />;
      default: return <Home user={user} onNavigate={(page) => setCurrentPage(page)} />;
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
          <button
            className="profile-chip"
            onClick={() => setCurrentPage('profile')}
            title="Профиль"
          >
            <span className="profile-chip-name">{user.first_name}</span>
            <div className="profile-chip-avatar">
              {user.photo_url && !avatarFailed ? (
                <img src={user.photo_url} alt="" onError={() => setAvatarFailed(true)} />
              ) : (
                <span>{user.first_name?.charAt(0) || '?'}</span>
              )}
            </div>
          </button>
        )}
        {renderPage()}
      </div>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;