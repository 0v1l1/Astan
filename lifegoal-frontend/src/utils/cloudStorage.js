import WebApp from '@twa-dev/sdk';

// Сохранение в облако Telegram
export const cloudSetItem = async (key, value) => {
  return new Promise((resolve) => {
    if (!WebApp.CloudStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      resolve(false);
      return;
    }
    WebApp.CloudStorage.setItem(key, JSON.stringify(value), (err, success) => {
      if (err || !success) {
        localStorage.setItem(key, JSON.stringify(value));
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

// Чтение из облака Telegram
export const cloudGetItem = async (key) => {
  return new Promise((resolve) => {
    if (!WebApp.CloudStorage) {
      const local = localStorage.getItem(key);
      resolve(local ? JSON.parse(local) : null);
      return;
    }
    WebApp.CloudStorage.getItem(key, (err, value) => {
      if (err || !value) {
        const local = localStorage.getItem(key);
        resolve(local ? JSON.parse(local) : null);
      } else {
        resolve(JSON.parse(value));
      }
    });
  });
};

// Удаление из облака
export const cloudRemoveItem = async (key) => {
  return new Promise((resolve) => {
    if (!WebApp.CloudStorage) {
      localStorage.removeItem(key);
      resolve(false);
      return;
    }
    WebApp.CloudStorage.removeItem(key, (err, success) => {
      localStorage.removeItem(key);
      resolve(!err && success);
    });
  });
};

// Получение темы
export const cloudGetTheme = async () => {
  const saved = await cloudGetItem('lifegoal_theme');
  return saved || WebApp.colorScheme || 'dark';
};
