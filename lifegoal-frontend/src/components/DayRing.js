import React from 'react';
import './DayRing.css';

// Five concentric arcs (sleep / todos / food / workouts / water), each in
// its own category color, wrapped around a streak counter. Reads as one
// object instead of five separate percentages competing for attention.
const RINGS = [
  { key: 'sleep', color: 'var(--c-sleep)', r: 92 },
  { key: 'todos', color: 'var(--c-todos)', r: 78 },
  { key: 'food', color: 'var(--c-food)', r: 64 },
  { key: 'workouts', color: 'var(--c-workouts)', r: 50 },
  { key: 'water', color: 'var(--c-water)', r: 36 },
];

function Arc({ r, pct, color, delay }) {
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <circle
      cx="100" cy="100" r={r}
      fill="none"
      stroke={color}
      strokeWidth="9"
      strokeLinecap="round"
      strokeDasharray={c}
      strokeDashoffset={offset}
      transform="rotate(-90 100 100)"
      style={{ transition: `stroke-dashoffset 0.9s cubic-bezier(.4,.8,.4,1) ${delay}ms` }}
    />
  );
}

function DayRing({ todos = 0, food = 0, workouts = 0, water = 0, sleep = 0, streak = 0 }) {
  const values = { todos, food, workouts, water, sleep };
  return (
    <div className="day-ring glass-card">
      <div className="day-ring-svg-wrap">
        <svg viewBox="0 0 200 200" width="150" height="150">
          {RINGS.map((ring, i) => (
            <circle key={ring.key + '-track'} cx="100" cy="100" r={ring.r} fill="none"
              stroke="var(--ring-track)" strokeWidth="9" />
          ))}
          {RINGS.map((ring, i) => (
            <Arc key={ring.key} r={ring.r} pct={values[ring.key]} color={ring.color} delay={i * 90} />
          ))}
        </svg>
        <div className="day-ring-center">
          <div className="day-ring-center-disc"></div>
          <div className="day-ring-flame">🔥</div>
          <div className="day-ring-streak">{streak}</div>
          <div className="day-ring-streak-label">{streak === 1 ? 'день подряд' : 'дней подряд'}</div>
        </div>
      </div>
      <div className="day-ring-legend">
        <LegendItem label="Сон" value={sleep} color="var(--c-sleep)" />
        <LegendItem label="Дела" value={todos} color="var(--c-todos)" />
        <LegendItem label="Еда" value={food} color="var(--c-food)" />
        <LegendItem label="Спорт" value={workouts} color="var(--c-workouts)" />
        <LegendItem label="Вода" value={water} color="var(--c-water)" />
      </div>
    </div>
  );
}

function LegendItem({ label, value, color }) {
  return (
    <div className="day-ring-legend-item">
      <span className="day-ring-legend-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="day-ring-legend-label">{label}</span>
      <span className="day-ring-legend-value">{Math.round(value)}%</span>
    </div>
  );
}

export default DayRing;
