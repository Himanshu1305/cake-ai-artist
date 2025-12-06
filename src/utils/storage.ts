export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const safeGetItem = (key: string, storage: 'local' | 'session' = 'local'): string | null => {
  try {
    return storage === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export const safeSetItem = (key: string, value: string, storage: 'local' | 'session' = 'local'): boolean => {
  try {
    if (storage === 'local') {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
    return true;
  } catch (e) {
    return false;
  }
};
