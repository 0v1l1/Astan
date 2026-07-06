import React, { useState, useEffect } from 'react';
import './Water.css';

function Water() {
  const [waterData, setWaterData] = useState({ total: 0, goal: 3, percentage: 0 });
  const [history, setHistory] = useState([]);
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    fetchWaterData();
    fetchHistory();
  }, []);

  const fetchWaterData = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/water/today');
      const data = await res.json();
      setWaterData(data);
    } catch (error) {
      console.error('Error fetching water data:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/water/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const addWater = async () => {
    if (!newAmount.trim()) return;

    try {
      const amount = parseFloat(newAmount);
      const res = await fetch('https://lftracker.onrender.com/api/water/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        setNewAmount('');
        fetchWaterData();
        fetchHistory();
      }
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  return (
    <div className="water">
      <div className="header">
        <div className="header-title">Вода</div>
      </div>

      <div className="water-stats">
        <div className="water-card">
          <div className="water-progress">
            <div className="water-circle">
              <div className="water-percentage">{Math.round(waterData.percentage)}%</div>
              <svg className="progress-ring" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(0, 255, 65, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="var(--primary-green)"
                  strokeWidth="8"
                  strokeDasharray={`${(Math.PI * 180 * waterData.percentage) / 100} ${Math.PI * 180}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
            </div>
            <div className="water-info">
              <div className="water-consumed">{waterData.total.toFixed(1)}л выпито</div>
              <div className="water-goal">Норма: {waterData.goal}л</div>
            </div>
          </div>
        </div>
      </div>

      <div className="add-water">
        <input
          type="number"
          className="input-field"
          placeholder="Литры"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          step="0.1"
          min="0"
        />
        <button className="btn" onClick={addWater}>Добавить воду</button>
      </div>

      <div className="quick-buttons">
        {[0.25, 0.5, 1].map(amount => (
          <button
            key={amount}
            className="quick-btn"
            onClick={() => {
              setNewAmount(amount.toString());
            }}
          >
            +{amount}л
          </button>
        ))}
      </div>

      <div className="history-section">
        <h3>История воды</h3>
        {history.length === 0 ? (
          <p className="empty-message">История пуста</p>
        ) : (
          <div className="history-list">
            {history.map(log => (
              <div key={log.id} className="history-item">
                <span className="amount">{log.amount}л</span>
                <span className="time">
                  {new Date(log.date).toLocaleString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Water;
