/**
 * Storage Service — persists calculator inputs to localStorage
 * so users don't lose their entries on page refresh.
 */

const PREFIX = 'solarPro_'

export const storageService = {
  save(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Silently ignore (private mode, storage full, etc.)
    }
  },

  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
  }
}
