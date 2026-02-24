/**
 * Header component
 * Main navigation bar
 */

import { state } from '../../services/state.js';
import { authService } from '../../services/auth.js';
import { i18n } from '../../services/i18n.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';

/**
 * Render header component
 */
export function renderHeader() {
  const user = state.get('user');
  const profile = state.get('profile');
  const currentLanguage = state.get('currentLanguage');
  const currentPath = window.location.pathname;

  const headerHTML = `
    <header class="bg-dark sticky-top shadow-sm">
      <nav class="navbar navbar-expand-lg navbar-dark container py-3">
        <a href="/" data-link class="navbar-brand fw-bold d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-2">
            <span class="text-accent fs-3">NL</span>
            <span class="text-white fs-6">БОЕН КЛУБ</span>
          </div>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <li class="nav-item">
              <a href="/" data-link class="nav-link px-3 ${currentPath === '/' ? 'text-accent' : ''}">
                ${i18n.t('nav.home')}
              </a>
            </li>
            <li class="nav-item">
              <a href="/about" data-link class="nav-link px-3 ${currentPath === '/about' ? 'text-accent' : ''}">
                ${i18n.t('nav.about')}
              </a>
            </li>
            <li class="nav-item">
              <a href="/contact" data-link class="nav-link px-3 ${currentPath === '/contact' ? 'text-accent' : ''}">
                ${i18n.t('nav.contact')}
              </a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle px-3 ${currentPath.startsWith('/martial-arts') ? 'text-accent' : ''}" href="#" id="martialArtsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${i18n.t('nav.martialArts')}
              </a>
              <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                <li><a class="dropdown-item text-white" href="/martial-arts/jkd" data-link>Jeet Kune Do</a></li>
                <li><a class="dropdown-item text-white" href="/martial-arts/mma" data-link>MMA</a></li>
                <li><a class="dropdown-item text-white" href="/martial-arts/bjj" data-link>BJJ</a></li>
              </ul>
            </li>

            ${user ? `
              ${profile?.role === 'admin' ? `
                <li class="nav-item">
                  <a href="/admin" data-link class="nav-link px-3">
                    ${i18n.t('nav.admin')}
                  </a>
                </li>
              ` : ''}
              <li class="nav-item dropdown ms-lg-2">
                <button class="btn btn-outline-warning btn-sm dropdown-toggle rounded-circle" type="button" id="userDropdown" data-bs-toggle="dropdown" style="width: 40px; height: 40px;">
                  A
                </button>
                <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                  <li><a class="dropdown-item text-white" href="/profile" data-link>${i18n.t('nav.profile')}</a></li>
                  <li><hr class="dropdown-divider bg-secondary"></li>
                  <li><button class="dropdown-item text-white" id="logout-btn">${i18n.t('nav.logout')}</button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item ms-lg-2">
                <a href="/login" data-link class="btn btn-warning btn-sm px-4">
                  ${i18n.t('nav.login')}
                </a>
              </li>
            `}

            <!-- Language Selector -->
            <li class="nav-item dropdown ms-lg-2">
              <button class="btn btn-outline-warning btn-sm dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" style="min-width: 60px;">
                ${currentLanguage.toUpperCase()}
              </button>
              <ul class="dropdown-menu dropdown-menu-end bg-dark border-secondary">
                <li><button class="dropdown-item text-white lang-btn" data-lang="bg">Български</button></li>
                <li><button class="dropdown-item text-white lang-btn" data-lang="en">English</button></li>
                <li><button class="dropdown-item text-white lang-btn" data-lang="ru">Русский</button></li>
                <li><button class="dropdown-item text-white lang-btn" data-lang="it">Italiano</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  `;

  render('#header-root', headerHTML);
  attachHeaderEvents();
}

/**
 * Attach event listeners to header elements
 */
function attachHeaderEvents() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.signOut();
      router.navigate('/');
    });
  }

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.getAttribute('data-lang');
      await i18n.changeLanguage(lang);
      renderHeader(); // Re-render header with new translations

      // Trigger page re-render with new language
      router.navigate(router.getCurrentPath());
    });
  });
}

/**
 * Initialize header with state subscriptions
 */
export function initHeader() {
  // Re-render header when user or profile changes
  state.subscribe('user', renderHeader);
  state.subscribe('profile', renderHeader);
  state.subscribe('currentLanguage', renderHeader);

  // Initial render
  renderHeader();
}