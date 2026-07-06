const isTelegram = () => {
  try {
    return !!(window.Telegram?.WebApp?.CloudStorage);
  } catch {
    return false;
  }
};

export const cloudSetItem = async (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  return true;
};

export const cloudGetItem = async (key) => {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
};

export const cloudRemoveItem = async (key) => {
  localStorage.removeItem(key);
  return true;
};

export const cloudGetTheme = async () => {
  const saved = await cloudGetItem('lifegoal_theme');
  return saved || 'dark';
};