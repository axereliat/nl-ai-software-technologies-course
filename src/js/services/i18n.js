/**
 * Internationalization service
 * Simple i18n implementation with support for 4 languages: BG, EN, RU, IT
 */

import i18next from 'i18next';
import { state } from './state.js';

class I18nService {
  constructor() {
    this.initialized = false;
    this.translations = {};
  }

  /**
   * Initialize i18n with translations
   */
  async init() {
    if (this.initialized) return;

    try {
      // Load all translation files
      const [bgTranslation, enTranslation, ruTranslation, itTranslation] = await Promise.all([
        fetch('/locales/bg/translation.json').then(r => r.json()),
        fetch('/locales/en/translation.json').then(r => r.json()),
        fetch('/locales/ru/translation.json').then(r => r.json()),
        fetch('/locales/it/translation.json').then(r => r.json())
      ]);

      const resources = {
        bg: { translation: bgTranslation },
        en: { translation: enTranslation },
        ru: { translation: ruTranslation },
        it: { translation: itTranslation }
      };

      // Initialize i18next
      await i18next.init({
        resources,
        lng: 'bg',
        fallbackLng: 'bg',
        interpolation: {
          escapeValue: false
        }
      });

      // Set initial language in state
      state.set('currentLanguage', i18next.language);

      // Subscribe to language changes in state
      state.subscribe('currentLanguage', (newLanguage) => {
        if (newLanguage !== i18next.language) {
          this.changeLanguage(newLanguage);
        }
      });

      this.initialized = true;
      console.log('i18n initialized with language:', i18next.language);
    } catch (error) {
      console.error('Error initializing i18n:', error);
    }
  }

  /**
   * Change current language
   * @param {string} language - Language code (bg, en, ru, it)
   */
  async changeLanguage(language) {
    await i18next.changeLanguage(language);
    state.set('currentLanguage', language);

    // Store preference in localStorage
    localStorage.setItem('language', language);

    // Update HTML lang attribute
    document.documentElement.lang = language;

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));

    console.log('Language changed to:', language);
  }

  /**
   * Get translation for a key
   * @param {string} key - Translation key (e.g., 'nav.home')
   * @param {Object} params - Optional interpolation parameters
   * @returns {string}
   */
  t(key, params = {}) {
    return i18next.t(key, params);
  }

  /**
   * Get current language
   * @returns {string}
   */
  getCurrentLanguage() {
    return state.get('currentLanguage');
  }

  /**
   * Check if a language is supported
   * @param {string} language - Language code
   * @returns {boolean}
   */
  isSupported(language) {
    return ['bg', 'en', 'ru', 'it'].includes(language);
  }

  /**
   * Get all supported languages
   * @returns {Array}
   */
  getSupportedLanguages() {
    return [
      { code: 'bg', name: 'Български' },
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'it', name: 'Italiano' }
    ];
  }
}

// Export singleton instance
export const i18n = new I18nService();

// Export t function for convenience
export const t = (key, params) => i18n.t(key, params);