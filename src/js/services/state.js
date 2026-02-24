/**
 * Observable state management system
 * Replaces React's Context API with a simple pub/sub pattern
 */

class StateManager {
  constructor() {
    this.state = {
      user: null,
      profile: null,
      loading: true,
      currentLanguage: 'bg'
    };

    // Map of state keys to listener functions
    this.listeners = new Map();
  }

  /**
   * Get a state value
   * @param {string} key - State key
   * @returns {any} - State value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a state value and notify listeners
   * @param {string} key - State key
   * @param {any} value - New value
   */
  set(key, value) {
    const oldValue = this.state[key];

    // Only update and notify if value actually changed
    if (oldValue !== value) {
      this.state[key] = value;
      this.notify(key, value, oldValue);
    }
  }

  /**
   * Update multiple state values at once
   * @param {Object} updates - Object with key-value pairs to update
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} - Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Subscribe to multiple state keys
   * @param {Array<string>} keys - Array of state keys
   * @param {Function} callback - Function to call when any key changes
   * @returns {Function} - Unsubscribe function
   */
  subscribeMultiple(keys, callback) {
    const unsubscribers = keys.map(key => this.subscribe(key, callback));

    // Return function that unsubscribes from all
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Notify all listeners for a specific key
   * @param {string} key - State key
   * @param {any} newValue - New value
   * @param {any} oldValue - Previous value
   */
  notify(key, newValue, oldValue) {
    const listeners = this.listeners.get(key);

    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in state listener for key "${key}":`, error);
        }
      });
    }
  }

  /**
   * Get all state
   * @returns {Object} - Full state object
   */
  getAll() {
    return { ...this.state };
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.state = {
      user: null,
      profile: null,
      loading: true,
      currentLanguage: 'bg'
    };

    // Notify all listeners
    Object.keys(this.state).forEach(key => {
      this.notify(key, this.state[key], undefined);
    });
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear();
  }

  /**
   * Debug helper - log current state
   */
  debug() {
    console.log('Current State:', this.state);
    console.log('Listeners:', Array.from(this.listeners.keys()));
  }
}

// Export singleton instance
export const state = new StateManager();