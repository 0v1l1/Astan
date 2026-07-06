import WebApp from '@twa-dev/sdk';

const STORAGE_AVAILABLE = !!WebApp.CloudStorage;

export const storage = {
  get: async (key) => {
    if (STORAGE_AVAILABLE) {
      return new Promise((resolve) => {
        WebApp.CloudStorage.getItem(key, (err, value) => {
          resolve(value || null);
        });
      });
    }
    return localStorage.getItem(key);
  },

  set: async (key, value) => {
    if (STORAGE_AVAILABLE) {
      return new Promise((resolve) => {
        WebApp.CloudStorage.setItem(key, value, (err, success) => {
          resolve(success);
        });
      });
    }
    localStorage.setItem(key, value);
    return true;
  },

  remove: async (key) => {
    if (STORAGE_AVAILABLE) {
      return new Promise((resolve) => {
        WebApp.CloudStorage.removeItem(key, (err, success) => {
          resolve(success);
        });
      });
    }
    localStorage.removeItem(key);
    return true;
  }
};