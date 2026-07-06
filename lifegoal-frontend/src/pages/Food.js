import React, { useState, useEffect } from 'react';
import './Food.css';

function Food() {
  const [foods, setFoods] = useState([]);
  const [foodHistory, setFoodHistory] = useState({});
  const [newFood, setNewFood] = useState('');
  const [newGrams, setNewGrams] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [expandedDate, setExpandedDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingGrams, setEditingGrams] = useState('');

  const mealTypes = {
    breakfast: { name: 'Завтрак', icon: '🌅' },
    lunch: { name: 'Обед', icon: '☀️' },
    dinner: { name: 'Ужин', icon: '🌙' },
    snack: { name: 'Перекус', icon: '🍪' }
  };

  useEffect(() => {
    fetchFoods();
    fetchHistory();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/food/');
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('https://lftracker.onrender.com/api/food/history');
      const data = await res.json();
      
      // Группируем по дате И типу приёма пищи
      const grouped = {};
      data.forEach(food => {
        const date = new Date(food.date).toLocaleDateString('ru-RU');
        if (!grouped[date]) grouped[date] = {};
        if (!grouped[date][food.meal_type]) grouped[date][food.meal_type] = [];
        grouped[date][food.meal_type].push(food);
      });
      setFoodHistory(grouped);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const addFood = async () => {
    if (!newFood.trim()) return;

    try {
      const res = await fetch('https://lftracker.onrender.com/api/food/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFood,
          meal_type: mealType,
          grams: newGrams ? parseInt(newGrams) : 0
        })
      });

      const data = await res.json();
      setFoods([data, ...foods]);
      setNewFood('');
      setNewGrams('');
      fetchHistory();
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const deleteFood = async (id) => {
    try {
      await fetch(`https://lftracker.onrender.com/api/food/${id}`, { method: 'DELETE' });
      setFoods(foods.filter(f => f.id !== id));
      fetchHistory();
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const editFood = async (id, newName, newGrams) => {
    try {
      await fetch(`https://lftracker.onrender.com/api/food/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          grams: newGrams ? parseInt(newGrams) : 0 
        })
      });
      setFoods(foods.map(f => f.id === id ? { ...f, name: newName, grams: parseInt(newGrams) || 0 } : f));
      setEditingId(null);
      setEditingText('');
      setEditingGrams('');
      fetchHistory();
    } catch (error) {
      console.error('Error editing food:', error);
    }
  };

  const todayFoods = foods.filter(food => {
    const foodDate = new Date(food.date).toLocaleDateString('ru-RU');
    const today = new Date().toLocaleDateString('ru-RU');
    return foodDate === today;
  });

  const groupedByMealType = {};
  todayFoods.forEach(food => {
    if (!groupedByMealType[food.meal_type]) {
      groupedByMealType[food.meal_type] = [];
    }
    groupedByMealType[food.meal_type].push(food);
  });

  return (
    <div className="food">
      <div className="header">
        <div className="header-title">Еда</div>
      </div>

      <div className="add-food">
        <input
          type="text"
          className="input-field"
          placeholder="Название блюда..."
          value={newFood}
          onChange={(e) => setNewFood(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addFood()}
        />
        
        <input
          type="number"
          className="input-field"
          placeholder="Граммы"
          value={newGrams}
          onChange={(e) => setNewGrams(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addFood()}
          min="0"
        />

        <div className="meal-type-select">
          <label>Приём пищи:</label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {Object.entries(mealTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value.icon} {value.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn" onClick={addFood}>Добавить</button>
      </div>

      <div className="today-food">
        <h3>На сегодня:</h3>
        {Object.entries(mealTypes).map(([type, info]) => (
          <div key={type} className="meal-section glass-card">
            <div className="meal-header">
              <span className="meal-icon">{info.icon}</span>
              <span className="meal-name">{info.name}</span>
              <span className="meal-count">({groupedByMealType[type]?.length || 0})</span>
            </div>
            {groupedByMealType[type] && groupedByMealType[type].length > 0 ? (
              <div className="food-items">
                {groupedByMealType[type].map(food => (
                  <div key={food.id} className="food-item">
                    {editingId === food.id ? (
                      <div className="food-edit">
                        <input
                          type="text"
                          className="food-edit-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          placeholder="Название"
                        />
                        <input
                          type="number"
                          className="food-edit-input"
                          value={editingGrams}
                          onChange={(e) => setEditingGrams(e.target.value)}
                          placeholder="Граммы"
                          min="0"
                        />
                        <button className="food-btn save" onClick={() => editFood(food.id, editingText, editingGrams)}>✓</button>
                        <button className="food-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    ) : (
                      <>
                        <span className="food-name">
                          {food.name}
                          {food.grams > 0 && <span className="food-grams"> ({food.grams}г)</span>}
                        </span>
                        <div className="food-actions">
                          <button
                            className="food-btn edit"
                            onClick={() => {
                              setEditingId(food.id);
                              setEditingText(food.name);
                              setEditingGrams(food.grams?.toString() || '');
                            }}
                          >
                            ✎
                          </button>
                          <button
                            className="food-btn delete"
                            onClick={() => deleteFood(food.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-meal">Ничего не добавлено</div>
            )}
          </div>
        ))}
      </div>

      <div className="history-section">
        <h3>История еды</h3>
        {Object.entries(foodHistory).length === 0 ? (
          <p className="empty-message">История пуста</p>
        ) : (
          Object.entries(foodHistory).map(([date, mealsByType]) => (
            <div key={date} className="history-day glass-card">
              <div
                className="history-date"
                onClick={() => setExpandedDate(expandedDate === date ? null : date)}
              >
                <span>{date}</span>
                <span className="expand-icon">{expandedDate === date ? '▼' : '▶'}</span>
              </div>
              {expandedDate === date && (
                <div className="history-foods">
                  {Object.entries(mealsByType).map(([type, foods]) => {
                    // Объединяем блюда одного типа в строку
                    const foodString = foods.map(f => 
                      f.grams > 0 ? `${f.name} (${f.grams}г)` : f.name
                    ).join(', ');
                    
                    return (
                      <div key={type} className="history-meal-group">
                        <span className="history-meal-type">
                          {mealTypes[type]?.icon} {mealTypes[type]?.name}:
                        </span>
                        <span className="history-food-names">{foodString}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Food;
