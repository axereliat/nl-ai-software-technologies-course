/**
 * Footer component
 */

import { i18n } from '../../services/i18n.js';
import { state } from '../../services/state.js';
import { render } from '../../utils/dom.js';

/**
 * Render footer component
 */
export function renderFooter() {
  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="bg-secondary text-white py-4 mt-auto">
      <div class="container">
        <div class="row">
        <hr class="border-secondary my-3">
        <div class="text-center text-muted small">
          <p class="mb-0">
            &copy; ${currentYear} NL Fight Club. ${i18n.t('footer.rights') || 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  `;

  render('#footer-root', footerHTML);
}

/**
 * Initialize footer with state subscriptions
 */
export function initFooter() {
  // Re-render footer when language changes
  state.subscribe('currentLanguage', renderFooter);

  // Initial render
  renderFooter();
}