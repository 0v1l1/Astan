import React from 'react';
import ReactDOM from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Инициализация Telegram Mini App
WebApp.ready();
WebApp.expand();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();