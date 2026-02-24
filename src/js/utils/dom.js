/**
 * DOM utility functions
 * Helper functions for rendering and manipulating the DOM
 */

/**
 * Render HTML string to a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} html - HTML string to render
 */
export function render(container, html) {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (element) {
    element.innerHTML = html;
  } else {
    console.warn(`Container not found: ${container}`);
  }
}

/**
 * Create element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement}
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/**
 * Append HTML to a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} html - HTML string to append
 */
export function append(container, html) {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (element) {
    element.insertAdjacentHTML('beforeend', html);
  }
}

/**
 * Prepend HTML to a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} html - HTML string to prepend
 */
export function prepend(container, html) {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (element) {
    element.insertAdjacentHTML('afterbegin', html);
  }
}

/**
 * Clear container contents
 * @param {string|HTMLElement} container - Container selector or element
 */
export function clear(container) {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (element) {
    element.innerHTML = '';
  }
}

/**
 * Show element
 * @param {string|HTMLElement} element - Element selector or element
 */
export function show(element) {
  const el = typeof element === 'string'
    ? document.querySelector(element)
    : element;

  if (el) {
    el.style.display = '';
    el.classList.remove('d-none');
  }
}

/**
 * Hide element
 * @param {string|HTMLElement} element - Element selector or element
 */
export function hide(element) {
  const el = typeof element === 'string'
    ? document.querySelector(element)
    : element;

  if (el) {
    el.classList.add('d-none');
  }
}

/**
 * Toggle element visibility
 * @param {string|HTMLElement} element - Element selector or element
 */
export function toggle(element) {
  const el = typeof element === 'string'
    ? document.querySelector(element)
    : element;

  if (el) {
    el.classList.toggle('d-none');
  }
}

/**
 * Add event listener with delegation
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {string} selector - Child selector for delegation
 * @param {Function} handler - Event handler
 */
export function delegate(container, eventType, selector, handler) {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (element) {
    element.addEventListener(eventType, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(target, e);
      }
    });
  }
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object}
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  return data;
}

/**
 * Set form data from object
 * @param {HTMLFormElement} form - Form element
 * @param {Object} data - Data object
 */
export function setFormData(form, data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value;
      } else {
        field.value = value ?? '';
      }
    }
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string}
 */
export function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Scroll to top of page
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
