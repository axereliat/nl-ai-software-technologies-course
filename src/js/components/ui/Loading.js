/**
 * Loading component
 * Shows a loading spinner overlay or inline
 */

/**
 * Show loading overlay
 */
export function showLoading() {
  // Check if loading overlay already exists
  if (document.getElementById('loading-overlay')) {
    return;
  }

  const loadingHTML = `
    <div id="loading-overlay" class="loading-overlay">
      <div class="text-center">
        <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-white mt-3">Loading...</p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Show inline loading spinner
 * @param {string} container - Container selector
 * @param {string} message - Loading message (optional)
 */
export function showInlineLoading(container, message = 'Loading...') {
  const element = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!element) return;

  const loadingHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-warning mb-3" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted">${message}</p>
    </div>
  `;

  element.innerHTML = loadingHTML;
}

/**
 * Show small loading spinner (for buttons)
 * @returns {string} HTML for small spinner
 */
export function smallSpinner() {
  return `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
  `;
}

/**
 * Render a loading state to a container
 * @param {string} container - Container selector
 */
export function renderLoading(container) {
  const loadingHTML = `
    <div class="min-vh-100 d-flex align-items-center justify-center">
      <div class="text-center">
        <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `;

  const element = document.querySelector(container);
  if (element) {
    element.innerHTML = loadingHTML;
  }
}

export const loading = {
  show: showLoading,
  hide: hideLoading,
  inline: showInlineLoading,
  small: smallSpinner,
  render: renderLoading
};