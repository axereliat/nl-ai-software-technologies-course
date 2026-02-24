/**
 * Form validation utilities
 */

/**
 * Validation rules
 */
export const validators = {
  required: (value) => {
    return value?.trim() ? null : 'This field is required';
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },

  minLength: (min) => (value) => {
    return value?.length >= min ? null : `Minimum ${min} characters required`;
  },

  maxLength: (max) => (value) => {
    return value?.length <= max ? null : `Maximum ${max} characters allowed`;
  },

  pattern: (regex, message) => (value) => {
    return regex.test(value) ? null : message;
  },

  url: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  number: (value) => {
    return !isNaN(value) ? null : 'Must be a number';
  },

  min: (min) => (value) => {
    return Number(value) >= min ? null : `Minimum value is ${min}`;
  },

  max: (max) => (value) => {
    return Number(value) <= max ? null : `Maximum value is ${max}`;
  }
};

/**
 * Form validator class
 */
export class FormValidator {
  constructor(formElement, rules) {
    this.form = formElement;
    this.rules = rules;
    this.errors = {};
  }

  /**
   * Validate all fields
   * @returns {boolean} - True if valid, false otherwise
   */
  validate() {
    this.errors = {};

    Object.entries(this.rules).forEach(([fieldName, fieldRules]) => {
      const field = this.form.elements[fieldName];
      if (!field) return;

      const value = field.value;
      const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

      for (const rule of rulesArray) {
        const error = rule(value);
        if (error) {
          this.errors[fieldName] = error;
          break;
        }
      }
    });

    return Object.keys(this.errors).length === 0;
  }

  /**
   * Show validation errors on form
   */
  showErrors() {
    // Clear previous errors
    this.clearErrors();

    Object.entries(this.errors).forEach(([fieldName, error]) => {
      const field = this.form.elements[fieldName];
      if (!field) return;

      // Add error class to field
      field.classList.add('is-invalid');

      // Create error message element
      const errorElement = document.createElement('div');
      errorElement.className = 'invalid-feedback';
      errorElement.textContent = error;

      // Insert after field
      field.parentElement.appendChild(errorElement);
    });
  }

  /**
   * Clear all validation errors
   */
  clearErrors() {
    // Remove error classes
    this.form.querySelectorAll('.is-invalid').forEach(field => {
      field.classList.remove('is-invalid');
    });

    // Remove error messages
    this.form.querySelectorAll('.invalid-feedback').forEach(error => {
      error.remove();
    });

    this.errors = {};
  }

  /**
   * Get validation errors
   * @returns {Object}
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Check if form is valid
   * @returns {boolean}
   */
  isValid() {
    return Object.keys(this.errors).length === 0;
  }
}

/**
 * Validate a single field
 * @param {string} value - Field value
 * @param {Array} rules - Array of validation rules
 * @returns {string|null} - Error message or null if valid
 */
export function validateField(value, rules) {
  const rulesArray = Array.isArray(rules) ? rules : [rules];

  for (const rule of rulesArray) {
    const error = rule(value);
    if (error) {
      return error;
    }
  }

  return null;
}