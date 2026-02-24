/**
 * Modal dialog component
 * Replaces custom modal functionality from React app
 */

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message/body
 * @param {string} options.confirmText - Confirm button text (default: 'Confirm')
 * @param {string} options.cancelText - Cancel button text (default: 'Cancel')
 * @param {Function} options.onConfirm - Callback when confirmed
 * @param {Function} options.onCancel - Callback when canceled
 * @param {string} options.type - Modal type: 'danger', 'warning', 'info' (affects button style)
 */
export function showModal(options) {
  const {
    title = 'Confirm',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
    type = 'danger'
  } = options;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.warn('Modal root not found');
    return;
  }

  // Map type to button variant
  const buttonVariants = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-primary'
  };

  const buttonClass = buttonVariants[type] || buttonVariants.danger;

  const modalHTML = `
    <div class="modal show d-block" id="confirm-modal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close btn-close-white" id="modal-close-x"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
            <button type="button" class="btn ${buttonClass}" id="modal-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modalRoot.innerHTML = modalHTML;

  const modal = document.getElementById('confirm-modal');
  const confirmButton = document.getElementById('modal-confirm');
  const cancelButton = document.getElementById('modal-cancel');
  const closeButton = document.getElementById('modal-close-x');

  // Confirm handler
  const handleConfirm = () => {
    onConfirm();
    hideModal();
  };

  // Cancel handler
  const handleCancel = () => {
    onCancel();
    hideModal();
  };

  // Close modal on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === modal) {
      handleCancel();
    }
  };

  // Close modal on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Attach event listeners
  confirmButton.addEventListener('click', handleConfirm);
  cancelButton.addEventListener('click', handleCancel);
  closeButton.addEventListener('click', handleCancel);
  modal.addEventListener('click', handleBackdropClick);
  document.addEventListener('keydown', handleEscape);

  // Cleanup function
  window.currentModalCleanup = () => {
    document.removeEventListener('keydown', handleEscape);
  };
}

/**
 * Hide the current modal
 */
export function hideModal() {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = '';
  }

  // Cleanup escape key listener
  if (window.currentModalCleanup) {
    window.currentModalCleanup();
    window.currentModalCleanup = null;
  }
}

/**
 * Show confirmation dialog (danger variant)
 * @param {Object} options - Modal options
 */
export function confirm(options) {
  return showModal({
    ...options,
    type: 'danger',
    confirmText: options.confirmText || 'Delete',
    title: options.title || 'Confirm Deletion'
  });
}

/**
 * Show alert dialog
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onClose - Callback when closed
 */
export function alert(title, message, onClose = () => {}) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.warn('Modal root not found');
    return;
  }

  const modalHTML = `
    <div class="modal show d-block" id="alert-modal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close btn-close-white" id="alert-close-x"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-primary" id="alert-ok">OK</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modalRoot.innerHTML = modalHTML;

  const modal = document.getElementById('alert-modal');
  const okButton = document.getElementById('alert-ok');
  const closeButton = document.getElementById('alert-close-x');

  const handleClose = () => {
    onClose();
    hideModal();
  };

  okButton.addEventListener('click', handleClose);
  closeButton.addEventListener('click', handleClose);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleClose();
    }
  });

  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escapeHandler);
      handleClose();
    }
  });
}

export const modal = {
  show: showModal,
  hide: hideModal,
  confirm,
  alert
};