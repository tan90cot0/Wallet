/**
 * Storage Utility Functions
 * Handles local storage, caching, and data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  CARDS_CACHE: 'cards_cache',
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync',
  PIN_ATTEMPTS: 'pin_attempts',
  APP_STATE: 'app_state',
};

/**
 * Generic storage functions
 */
export const storage = {
  // Store data
  async set(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },

  // Retrieve data
  async get(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  },

  // Remove data
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  },

  // Clear all storage
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Get all keys
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

/**
 * Cards cache management
 */
export const cardsCache = {
  // Save cards to cache
  async save(cards) {
    const cacheData = {
      cards,
      timestamp: Date.now(),
    };
    return await storage.set(STORAGE_KEYS.CARDS_CACHE, cacheData);
  },

  // Load cards from cache
  async load() {
    const cacheData = await storage.get(STORAGE_KEYS.CARDS_CACHE);
    if (cacheData && cacheData.cards) {
      return cacheData.cards;
    }
    return {};
  },

  // Check if cache is valid (within 5 minutes)
  async isValid() {
    const cacheData = await storage.get(STORAGE_KEYS.CARDS_CACHE);
    if (!cacheData || !cacheData.timestamp) {
      return false;
    }
    
    const fiveMinutes = 5 * 60 * 1000;
    return (Date.now() - cacheData.timestamp) < fiveMinutes;
  },

  // Clear cards cache
  async clear() {
    return await storage.remove(STORAGE_KEYS.CARDS_CACHE);
  },
};

/**
 * User preferences management
 */
export const userPreferences = {
  // Default preferences
  defaults: {
    biometricEnabled: false,
    notifications: true,
    autoSync: true,
    theme: 'light',
    hapticFeedback: true,
    cardFlipAnimation: true,
  },

  // Save preferences
  async save(preferences) {
    const current = await this.load();
    const updated = { ...current, ...preferences };
    return await storage.set(STORAGE_KEYS.USER_PREFERENCES, updated);
  },

  // Load preferences
  async load() {
    const preferences = await storage.get(STORAGE_KEYS.USER_PREFERENCES, this.defaults);
    return { ...this.defaults, ...preferences };
  },

  // Get specific preference
  async get(key) {
    const preferences = await this.load();
    return preferences[key];
  },

  // Set specific preference
  async set(key, value) {
    const preferences = await this.load();
    preferences[key] = value;
    return await this.save(preferences);
  },

  // Reset to defaults
  async reset() {
    return await storage.set(STORAGE_KEYS.USER_PREFERENCES, this.defaults);
  },
};

/**
 * PIN attempts tracking (security feature)
 */
export const pinAttempts = {
  // Record failed attempt
  async recordFailure() {
    const attempts = await storage.get(STORAGE_KEYS.PIN_ATTEMPTS, {
      count: 0,
      lastAttempt: null,
      locked: false,
      lockUntil: null,
    });

    attempts.count += 1;
    attempts.lastAttempt = Date.now();

    // Lock after 3 failed attempts for 30 seconds
    if (attempts.count >= 3) {
      attempts.locked = true;
      attempts.lockUntil = Date.now() + (30 * 1000); // 30 seconds
    }

    await storage.set(STORAGE_KEYS.PIN_ATTEMPTS, attempts);
    return attempts;
  },

  // Reset attempts after successful PIN
  async reset() {
    const resetData = {
      count: 0,
      lastAttempt: null,
      locked: false,
      lockUntil: null,
    };
    return await storage.set(STORAGE_KEYS.PIN_ATTEMPTS, resetData);
  },

  // Check if currently locked
  async isLocked() {
    const attempts = await storage.get(STORAGE_KEYS.PIN_ATTEMPTS, {
      locked: false,
      lockUntil: null,
    });

    if (!attempts.locked) {
      return false;
    }

    // Check if lock period has expired
    if (attempts.lockUntil && Date.now() > attempts.lockUntil) {
      await this.reset();
      return false;
    }

    return true;
  },

  // Get remaining lock time in seconds
  async getRemainingLockTime() {
    const attempts = await storage.get(STORAGE_KEYS.PIN_ATTEMPTS);
    if (!attempts || !attempts.locked || !attempts.lockUntil) {
      return 0;
    }

    const remaining = attempts.lockUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  },
};

/**
 * App state management
 */
export const appState = {
  // Save app state
  async save(state) {
    return await storage.set(STORAGE_KEYS.APP_STATE, {
      ...state,
      lastUpdated: Date.now(),
    });
  },

  // Load app state
  async load() {
    return await storage.get(STORAGE_KEYS.APP_STATE, {
      isFirstLaunch: true,
      hasCompletedOnboarding: false,
      lastSyncTime: null,
    });
  },

  // Mark onboarding as complete
  async completeOnboarding() {
    const state = await this.load();
    state.hasCompletedOnboarding = true;
    state.isFirstLaunch = false;
    return await this.save(state);
  },

  // Update last sync time
  async updateSyncTime() {
    const state = await this.load();
    state.lastSyncTime = Date.now();
    return await this.save(state);
  },
};

/**
 * Utility functions
 */
export const storageUtils = {
  // Get storage size in bytes
  async getStorageSize() {
    try {
      const keys = await storage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  },

  // Clean up old data
  async cleanup() {
    try {
      // Clear expired cache
      const isValidCache = await cardsCache.isValid();
      if (!isValidCache) {
        await cardsCache.clear();
      }

      // Reset expired PIN locks
      await pinAttempts.isLocked(); // This will auto-reset if expired

      return true;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return false;
    }
  },

  // Export all data (for backup)
  async exportData() {
    try {
      const keys = await storage.getAllKeys();
      const data = {};
      
      for (const key of keys) {
        data[key] = await storage.get(key);
      }
      
      return {
        data,
        timestamp: Date.now(),
        version: '1.0.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },
};

export default {
  storage,
  cardsCache,
  userPreferences,
  pinAttempts,
  appState,
  storageUtils,
  STORAGE_KEYS,
};
