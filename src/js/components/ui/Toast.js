/**
 * Toast notification component
 * Replaces react-hot-toast functionality
 */

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.warn('Toast container not found');
    return;
  }

  // Map type to Bootstrap classes
  const typeClasses = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-dark'
  };

  // Map type to icons
  const typeIcons = {
    success: `
      <svg class="flex-shrink-0 me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
      </svg>
    `,
    error: `
      <svg class="flex-shrink-0 me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
      </svg>
    `,
    info: `
      <svg class="flex-shrink-0 me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>
    `,
    warning: `
      <svg class="flex-shrink-0 me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
    `
  };

  const classes = typeClasses[type] || typeClasses.info;
  const icon = typeIcons[type] || typeIcons.info;

  // Create toast element
  const toastId = `toast-${Date.now()}-${Math.random()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast show ${classes} border-0 mb-2" role="alert" style="min-width: 250px;">
      <div class="toast-body d-flex align-items-center">
        ${icon}
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHTML);

  const toastElement = document.getElementById(toastId);
  const closeButton = toastElement.querySelector('.btn-close');

  // Auto-remove toast after duration
  const timeout = setTimeout(() => {
    removeToast(toastElement);
  }, duration);

  // Remove on close button click
  closeButton.addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toastElement);
  });
}

/**
 * Remove toast with animation
 * @param {HTMLElement} toastElement - Toast element to remove
 */
function removeToast(toastElement) {
  toastElement.classList.remove('show');
  toastElement.classList.add('hiding');

  setTimeout(() => {
    toastElement.remove();
  }, 300);
}

/**
 * Success toast shorthand
 * @param {string} message - Toast message
 */
export function success(message, duration = 3000) {
  showToast(message, 'success', duration);
}

/**
 * Error toast shorthand
 * @param {string} message - Toast message
 */
export function error(message, duration = 5000) {
  showToast(message, 'error', duration);
}

/**
 * Info toast shorthand
 * @param {string} message - Toast message
 */
export function info(message, duration = 3000) {
  showToast(message, 'info', duration);
}

/**
 * Warning toast shorthand
 * @param {string} message - Toast message
 */
export function warning(message, duration = 4000) {
  showToast(message, 'warning', duration);
}

/**
 * Export toast object with all methods
 */
export const toast = {
  show: showToast,
  success,
  error,
  info,
  warning
};