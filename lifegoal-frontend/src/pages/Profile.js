import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState({ height: null, weight: null, updated_at: null });
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalTodos: 0,
    totalWater: 0,
    workoutDays: []
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/profile/');
      const data = await res.json();
      setProfile(data);
      if (data.height) setHeight(data.height.toString());
      if (data.weight) setWeight(data.weight.toString());
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [workoutsRes, todosRes, waterRes] = await Promise.all([
        fetch('http://localhost:8000/api/workouts/logs'),
        fetch('http://localhost:8000/api/todos/history'),
        fetch('http://localhost:8000/api/water/history')
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
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/profile/', {
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

  return (
    <div className="profile">
      <div className="header">
        <div className="header-title">Профиль</div>
      </div>

      <div className="profile-info">
        <h3>Персональная информация</h3>
        <div className="info-card">
          <div className="info-field">
            <label>Рост (см)</label>
            <input
              type="number"
              className="input-field"
              placeholder="Ваш рост"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="info-field">
            <label>Вес (кг)</label>
            <input
              type="number"
              className="input-field"
              placeholder="Ваш вес"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
            />
          </div>

          <button className="btn" onClick={updateProfile}>Сохранить</button>

          {profile.updated_at && (
            <div className="last-updated">
              Обновлено: {new Date(profile.updated_at).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>

      <div className="stats-section">
        <h3>Статистика</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Тренировок</div>
            <div className="stat-value">{stats.totalWorkouts}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Выполнено дел</div>
            <div className="stat-value">{stats.totalTodos}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Воды (л)</div>
            <div className="stat-value">{stats.totalWater}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Дни активности</div>
            <div className="stat-value">{stats.workoutDays}</div>
          </div>
        </div>
      </div>

      <div className="graphs-section">
        <h3>Графики</h3>

        <div className="graph-card">
          <div className="graph-title">Неделя</div>
          <div className="week-chart">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
              <div key={idx} className="day-bar">
                <div className="bar" style={{ height: `${Math.random() * 100}%` }}></div>
                <div className="day-label">{day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="graph-card">
          <div className="graph-title">Месяц</div>
          <div className="month-chart">
            <p>Средняя активность: ~{Math.round(stats.totalWorkouts / 4)} тренировок в неделю</p>
            <div className="mini-bars">
              {[1, 2, 3, 4].map((week) => (
                <div key={week} className="mini-bar" style={{ height: `${Math.random() * 100 + 30}%` }}>
                  <span className="week-number">Нед {week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Настройки</h3>
        <div className="settings-card">
          <div className="setting-item">
            <span className="setting-label">Тема</span>
            <span className="setting-value">Тёмная</span>
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
