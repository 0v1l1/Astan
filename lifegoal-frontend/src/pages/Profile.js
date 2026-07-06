import React, { useState, useEffect, useCallback } from 'react';
import './Profile.css';
const cloudGetItem = (key) => JSON.parse(localStorage.getItem(key) || 'null');
const cloudSetItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function Profile({ theme, toggleTheme, user }) {
  const [profile, setProfile] = useState({ height: null, weight: null, updated_at: null });
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [stats, setStats] = useState({ totalWorkouts: 0, totalTodos: 0, totalWater: 0, workoutDays: 0 });
  const [weekData, setWeekData] = useState([]);
  const [monthData, setMonthData] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/profile/');
      const data = await res.json();
      setProfile(data);
      if (data.height) setHeight(data.height.toString());
      if (data.weight) setWeight(data.weight.toString());
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [workoutsRes, todosRes, waterRes] = await Promise.all([
        fetch('https://lftracker.onrender.com/api/workouts/logs'),
        fetch('https://lftracker.onrender.com/api/todos/history'),
        fetch('https://lftracker.onrender.com/api/water/history')
      ]);
      const workouts = await workoutsRes.json();
      const todos = await todosRes.json();
      const water = await waterRes.json();
      const totalWater = water.reduce((sum, log) => sum + log.amount, 0);

      setStats({
        totalWorkouts: workouts.length,
        totalTodos: todos.length,
        totalWater: totalWater.toFixed(1),
        workoutDays: workouts.length
      });

      const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const today = new Date();
      const weekStats = days.map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString('ru-RU');
        const dayWorkouts = workouts.filter(w => new Date(w.date).toLocaleDateString('ru-RU') === dateStr).length;
        return { day: days[i], value: dayWorkouts };
      });
      setWeekData(weekStats);

      const monthStats = [];
      for (let w = 0; w < 4; w++) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        const count = workouts.filter(w => {
          const d = new Date(w.date);
          return d >= weekStart && d <= weekEnd;
        }).length;
        monthStats.unshift({ week: `Нед ${4 - w}`, value: count });
      }
      setMonthData(monthStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const saved = await cloudGetItem('lifegoal_profile');
      if (saved) {
        setProfile(saved);
        if (saved.height) setHeight(saved.height.toString());
        if (saved.weight) setWeight(saved.weight.toString());
      } else {
        fetchProfile();
      }
    };
    init();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  const updateProfile = async () => {
    const newProfile = {
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      updated_at: new Date().toISOString()
    };

    await cloudSetItem('lifegoal_profile', newProfile);

    try {
      const res = await fetch('https://lftracker.onrender.com/api/profile/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null
        })
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const maxWeekValue = Math.max(...weekData.map(d => d.value), 1);
  const maxMonthValue = Math.max(...monthData.map(d => d.value), 1);

  return (
    <div className="profile">
      <div className="header">
        <div className="header-title"><span className="dot"></span> Профиль</div>
      </div>

      {user && (
        <div className="info-card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>👤</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-light)' }}>
            {user.first_name} {user.last_name || ''}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{user.username || 'telegram'}</div>
        </div>
      )}

      <div className="profile-info">
        <h3>Персональная информация</h3>
        <div className="info-card">
          <div className="info-field">
            <label>Рост (см)</label>
            <input type="number" className="input-field" placeholder="Ваш рост" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="info-field">
            <label>Вес (кг)</label>
            <input type="number" className="input-field" placeholder="Ваш вес" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1" />
          </div>
          <button className="btn" onClick={updateProfile}>Сохранить</button>
          {profile.updated_at && (
            <div className="last-updated">Обновлено: {new Date(profile.updated_at).toLocaleDateString('ru-RU')}</div>
          )}
        </div>
      </div>

      <div className="stats-section">
        <h3>Статистика</h3>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Тренировок</div><div className="stat-value">{stats.totalWorkouts}</div></div>
          <div className="stat-card"><div className="stat-label">Выполнено дел</div><div className="stat-value">{stats.totalTodos}</div></div>
          <div className="stat-card"><div className="stat-label">Воды (л)</div><div className="stat-value">{stats.totalWater}</div></div>
          <div className="stat-card"><div className="stat-label">Дни активности</div><div className="stat-value">{stats.workoutDays}</div></div>
        </div>
      </div>

      <div className="graphs-section">
        <h3>Графики</h3>
        <div className="graph-card">
          <div className="graph-title">Неделя (тренировки)</div>
          <div className="week-chart">
            {weekData.map((d, idx) => (
              <div key={idx} className="day-bar">
                <div className="bar" style={{ height: `${(d.value / maxWeekValue) * 100}%` }}></div>
                <div className="day-label">{d.day}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="graph-card">
          <div className="graph-title">Месяц (по неделям)</div>
          <div className="month-chart">
            <p>Средняя активность: ~{Math.round(stats.totalWorkouts / Math.max(stats.workoutDays, 1)) || 0} тренировок в неделю</p>
            <div className="mini-bars">
              {monthData.map((d, idx) => (
                <div key={idx} className="mini-bar" style={{ height: `${(d.value / maxMonthValue) * 100}%` }}>
                  <span className="week-number">{d.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Настройки</h3>
        <div className="settings-card">
          <div className="setting-item" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
            <span className="setting-label">Тема</span>
            <span className="setting-value">{theme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Язык</span>
            <span className="setting-value">Русский</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Версия</span>
            <span className="setting-value">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
