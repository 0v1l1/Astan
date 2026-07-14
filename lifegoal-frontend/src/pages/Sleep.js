import React, { useState, useEffect, useCallback } from 'react';
import './Sleep.css';
import { apiFetch } from '../utils/api';

const ruDate = (d) => d.toLocaleDateString('ru-RU');

const GENERAL_TIPS = [
  'Старайтесь ложиться и просыпаться в одно и то же время — даже по выходным.',
  'Экран телефона за час до сна снижает выработку мелатонина. Попробуйте книгу вместо ленты.',
  'Кофеин держится в организме 6–8 часов — последняя чашка лучше до обеда.',
  'Прохладная спальня (18–20°C) помогает заснуть быстрее.',
  'Дневной сон дольше 20–30 минут может сбить ночной режим.',
];

function calcHours(bedtime, wake) {
  if (!bedtime || !wake) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  if ([bh, bm, wh, wm].some(Number.isNaN)) return 0;
  let minutes = (wh * 60 + wm) - (bh * 60 + bm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

function buildRecommendations(logs, goalHours) {
  const tips = [];
  if (logs.length === 0) {
    tips.push('Запишите первую ночь, чтобы получить персональные советы — пока это общие рекомендации.');
    return tips;
  }

  const latest = logs[0];
  if (latest.hours < Math.min(7, goalHours - 0.5)) {
    tips.push(`Вы поспали ${latest.hours} ч — меньше рекомендованных 7–9 часов. Попробуйте лечь сегодня немного раньше.`);
  } else if (latest.hours >= 7 && latest.hours <= 9) {
    tips.push(`${latest.hours} ч — хороший результат, в пределах нормы для взрослого человека.`);
  } else if (latest.hours > 9.5) {
    tips.push(`${latest.hours} ч — многовато. Пересыпание тоже может сбивать режим и вызывать вялость днём.`);
  }

  const last5 = logs.slice(0, 5);
  if (last5.length >= 3) {
    const bedtimes = last5.map(l => {
      const [h, m] = l.bedtime.split(':').map(Number);
      return h * 60 + m;
    });
    const spread = Math.max(...bedtimes) - Math.min(...bedtimes);
    if (spread > 90) {
      tips.push('Время отхода ко сну сильно скачет последние ночи — более стабильный режим помогает засыпать быстрее.');
    }
  }

  return tips;
}

function Sleep() {
  const [goal, setGoal] = useState({ bedtime: '23:00', wake: '07:00' });
  const [logs, setLogs] = useState([]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wake, setWake] = useState('07:00');
  const [quality, setQuality] = useState(3);
  const [goalBedtime, setGoalBedtime] = useState('23:00');
  const [goalWake, setGoalWake] = useState('07:00');
  const [tipIndex, setTipIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [goalRes, historyRes] = await Promise.all([
        apiFetch('/api/sleep/goal'),
        apiFetch('/api/sleep/history'),
      ]);

      if (goalRes.ok) {
        const goalData = await goalRes.json();
        if (goalData?.bedtime && goalData?.wake) {
          setGoal(goalData);
          setGoalBedtime(goalData.bedtime);
          setGoalWake(goalData.wake);
          setBedtime(goalData.bedtime);
          setWake(goalData.wake);
        }
      } else {
        console.error('Sleep goal request failed:', goalRes.status, await goalRes.text());
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setLogs(Array.isArray(historyData) ? historyData : []);
      } else {
        console.error('Sleep history request failed:', historyRes.status, await historyRes.text());
      }
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    setTipIndex(Math.floor(Math.random() * GENERAL_TIPS.length));
  }, [loadAll]);

  const goalHours = calcHours(goal.bedtime, goal.wake);
  const latest = logs[0];
  const progressPct = latest ? Math.min(100, Math.round((latest.hours / goalHours) * 100)) : 0;
  const recommendations = buildRecommendations(logs, goalHours);

  const [error, setError] = useState('');

  const saveLog = async () => {
    const hours = calcHours(bedtime, wake);
    try {
      const res = await apiFetch('/api/sleep/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedtime, wake, hours, quality }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error('Save sleep log failed:', res.status, detail);
        setError(res.status === 401
          ? 'Не удалось подтвердить пользователя Telegram — откройте приложение через бота, не в обычном браузере.'
          : 'Не получилось сохранить запись. Попробуйте ещё раз.');
        return;
      }
      const entry = await res.json();
      setLogs([entry, ...logs]);
      setError('');
    } catch (err) {
      console.error('Error saving sleep log:', err);
      setError('Не получилось связаться с сервером.');
    }
  };

  const saveGoal = async () => {
    try {
      const res = await apiFetch('/api/sleep/goal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedtime: goalBedtime, wake: goalWake }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error('Save sleep goal failed:', res.status, detail);
        setError(res.status === 401
          ? 'Не удалось подтвердить пользователя Telegram — откройте приложение через бота, не в обычном браузере.'
          : 'Не получилось сохранить режим. Попробуйте ещё раз.');
        return;
      }
      const updated = await res.json();
      setGoal(updated);
      setError('');
    } catch (err) {
      console.error('Error saving sleep goal:', err);
      setError('Не получилось связаться с сервером.');
    }
  };

  const deleteLog = async (id) => {
    try {
      await apiFetch(`/api/sleep/${id}`, { method: 'DELETE' });
      setLogs(logs.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting sleep log:', error);
    }
  };

  const qualityEmoji = ['😴', '😩', '😐', '🙂', '😃'];

  if (loading) {
    return <div className="sleep"><div className="sleep-header"><div className="header-title">Сон</div></div></div>;
  }

  return (
    <div className="sleep">
      <div className="sleep-header">
        <div className="header-title"><span className="dot" style={{ background: 'var(--c-sleep)', boxShadow: '0 0 8px var(--c-sleep)' }}></span>Сон</div>
        <div className="header-subtitle">Цель: {goalHours} ч ({goal.bedtime} → {goal.wake})</div>
      </div>

      {error && <div className="sleep-error-banner">{error}</div>}

      <div className="glass-card sleep-summary">
        <div className="sleep-summary-value">{latest ? `${latest.hours} ч` : '—'}</div>
        <div className="sleep-summary-label">{latest ? `Прошлой ночью · ${qualityEmoji[latest.quality - 1]}` : 'Ещё нет записей'}</div>
        <div className="grid-item-progress" style={{ marginTop: '12px' }}>
          <div className="progress-fill cat-sleep-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      <div className="glass-card sleep-form">
        <h3 className="sleep-section-title">Записать ночь</h3>
        <div className="sleep-time-row">
          <label>
            <span>Отбой</span>
            <input type="time" className="input-field" value={bedtime} onChange={e => setBedtime(e.target.value)} />
          </label>
          <label>
            <span>Подъём</span>
            <input type="time" className="input-field" value={wake} onChange={e => setWake(e.target.value)} />
          </label>
        </div>
        <div className="sleep-quality-row">
          <span>Качество сна</span>
          <div className="sleep-quality-buttons">
            {[1, 2, 3, 4, 5].map(q => (
              <button
                key={q}
                className={`sleep-quality-btn ${quality === q ? 'active' : ''}`}
                onClick={() => setQuality(q)}
              >
                {qualityEmoji[q - 1]}
              </button>
            ))}
          </div>
        </div>
        <button className="btn" style={{ width: '100%', marginTop: '12px' }} onClick={saveLog}>
          Сохранить ({calcHours(bedtime, wake)} ч)
        </button>
      </div>

      <div className="glass-card sleep-form">
        <h3 className="sleep-section-title">Режим сна</h3>
        <div className="sleep-time-row">
          <label>
            <span>Цель: отбой</span>
            <input type="time" className="input-field" value={goalBedtime} onChange={e => setGoalBedtime(e.target.value)} />
          </label>
          <label>
            <span>Цель: подъём</span>
            <input type="time" className="input-field" value={goalWake} onChange={e => setGoalWake(e.target.value)} />
          </label>
        </div>
        <button className="btn" style={{ width: '100%', marginTop: '12px' }} onClick={saveGoal}>Сохранить режим</button>
      </div>

      <div className="glass-card sleep-recs">
        <h3 className="sleep-section-title">Рекомендации</h3>
        {recommendations.map((tip, i) => (
          <div key={i} className="sleep-rec-item">💤 {tip}</div>
        ))}
        <div className="sleep-rec-item sleep-rec-general">💡 {GENERAL_TIPS[tipIndex]}</div>
        <button
          className="note-cancel-btn"
          style={{ marginTop: '8px' }}
          onClick={() => setTipIndex((tipIndex + 1) % GENERAL_TIPS.length)}
        >
          Другой совет
        </button>
      </div>

      {logs.length > 0 && (
        <div className="sleep-history">
          <h3 className="sleep-section-title">История</h3>
          {logs.slice(0, 14).map(log => (
            <div key={log.id} className="glass-card sleep-history-item">
              <div className="sleep-history-info">
                <div className="sleep-history-date">{ruDate(new Date(log.date))}</div>
                <div className="sleep-history-times">{log.bedtime} → {log.wake}</div>
              </div>
              <div className="sleep-history-hours">
                {log.hours} ч {qualityEmoji[log.quality - 1]}
              </div>
              <button className="note-delete-btn" onClick={() => deleteLog(log.id)} title="Удалить">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sleep;

