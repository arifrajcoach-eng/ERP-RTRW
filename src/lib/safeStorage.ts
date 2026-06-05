const inMemoryLocalStorage: Record<string, string> = {};
const inMemorySessionStorage: Record<string, string> = {};

function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    if (typeof window === 'undefined' || !(type in window)) return false;
    const storage = window[type];
    if (!storage) return false;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

const hasLocal = typeof window !== 'undefined' && isStorageAvailable('localStorage');
const hasSession = typeof window !== 'undefined' && isStorageAvailable('sessionStorage');

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (hasLocal) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`Storage failed to get "${key}", using in-memory:`, e);
      }
    }
    return inMemoryLocalStorage[key] !== undefined ? inMemoryLocalStorage[key] : null;
  },
  setItem(key: string, value: string): void {
    if (hasLocal) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn(`Storage failed to set "${key}", using in-memory:`, e);
      }
    }
    inMemoryLocalStorage[key] = String(value);
  },
  removeItem(key: string): void {
    if (hasLocal) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn(`Storage failed to remove "${key}", using in-memory:`, e);
      }
    }
    delete inMemoryLocalStorage[key];
  },
  clear(): void {
    const protectedKeys = ['firebase:auth', 'firebaseLocalStorageDb', 'currentTenant', 'parentTenant', 'impersonatedTenantId'];
    if (hasLocal) {
      try {
        const keys = Object.keys(window.localStorage);
        keys.forEach(key => {
          if (!protectedKeys.includes(key)) {
            window.localStorage.removeItem(key);
          }
        });
        return;
      } catch (e) {
        console.warn("Storage failed to clear, using in-memory:", e);
      }
    }
    Object.keys(inMemoryLocalStorage).forEach(key => {
      if (!protectedKeys.includes(key)) {
        delete inMemoryLocalStorage[key];
      }
    });
  },
  getKeys(): string[] {
    if (hasLocal) {
      try {
        return Object.keys(window.localStorage);
      } catch (e) {
        // Fallback
      }
    }
    return Object.keys(inMemoryLocalStorage);
  }
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (hasSession) {
      try {
        return window.sessionStorage.getItem(key);
      } catch (e) {
        console.warn(`SessionStorage failed to get "${key}", using in-memory:`, e);
      }
    }
    return inMemorySessionStorage[key] !== undefined ? inMemorySessionStorage[key] : null;
  },
  setItem(key: string, value: string): void {
    if (hasSession) {
      try {
        window.sessionStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn(`SessionStorage failed to set "${key}", using in-memory:`, e);
      }
    }
    inMemorySessionStorage[key] = String(value);
  },
  removeItem(key: string): void {
    if (hasSession) {
      try {
        window.sessionStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn(`SessionStorage failed to remove "${key}", using in-memory:`, e);
      }
    }
    delete inMemorySessionStorage[key];
  },
  clear(): void {
    if (hasSession) {
      try {
        window.sessionStorage.clear();
        return;
      } catch (e) {
        console.warn("SessionStorage failed to clear, using in-memory:", e);
      }
    }
    Object.keys(inMemorySessionStorage).forEach(key => delete inMemorySessionStorage[key]);
  },
  getKeys(): string[] {
    if (hasSession) {
      try {
        return Object.keys(window.sessionStorage);
      } catch (e) {
        // Fallback
      }
    }
    return Object.keys(inMemorySessionStorage);
  }
};
