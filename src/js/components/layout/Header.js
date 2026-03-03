/**
 * Header component
 * Main navigation bar
 */

import { state } from '../../services/state.js';
import { authService } from '../../services/auth.js';
import { i18n } from '../../services/i18n.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { dataService } from '../../services/data.js';

/**
 * Get user initials from name or email
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (name.includes('@')) {
    return name.substring(0, 1).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Render header component
 */
export async function renderHeader() {
  const user = state.get('user');
  const profile = state.get('profile');
  const currentLanguage = state.get('currentLanguage');
  const currentPath = window.location.pathname;

  // Fetch martial arts from Supabase
  let martialArts = [];
  try {
    const allMartialArts = await dataService.getMartialArts();
    martialArts = allMartialArts.map(ma => ({
      slug: ma.slug,
      name: ma.name
    }));
  } catch (error) {
    console.error('Error loading martial arts for header:', error);
    // Fallback to empty array if loading fails
    martialArts = [];
  }

  const headerHTML = `
    <header class="bg-dark sticky-top shadow-sm">
      <nav class="navbar navbar-expand-lg navbar-dark container py-3">
        <a href="/" data-link class="navbar-brand fw-bold d-flex align-items-center gap-2">
          <img src="/images/logo.webp" alt="NL Fight Club Logo" class="header-logo" width="45" height="45">
          <div class="d-flex flex-column">
            <span class="text-accent" style="font-size: 1.1rem; line-height: 1;">NL</span>
            <span class="text-white" style="font-size: 0.7rem; line-height: 1;">БОЕН КЛУБ</span>
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
            ${martialArts.length > 0 ? `
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle px-3 ${currentPath.startsWith('/martial-arts') ? 'text-accent' : ''}" href="#" id="martialArtsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  ${i18n.t('nav.martialArts') || 'Бойни Изкуства'}
                </a>
                <ul class="dropdown-menu" aria-labelledby="martialArtsDropdown">
                  ${martialArts.map(ma => `
                    <li><a class="dropdown-item" href="/martial-arts/${ma.slug}" data-link>${ma.name}</a></li>
                  `).join('')}
                </ul>
              </li>
            ` : ''}

            ${user ? `
              ${profile?.role === 'admin' ? `
                <li class="nav-item">
                  <a href="/admin" data-link class="nav-link px-3 ${currentPath.startsWith('/admin') ? 'text-accent' : ''}">
                    ${i18n.t('nav.admin') || 'Админ'}
                  </a>
                </li>
              ` : ''}
              <li class="nav-item dropdown ms-lg-2">
                <button class="btn user-avatar-btn dropdown-toggle border-0 p-0" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  ${getInitials(profile?.full_name || user.email)}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <div class="px-3 py-2 border-bottom" style="border-color: rgba(212, 175, 55, 0.2) !important;">
                      <div class="small text-muted">${i18n.t('nav.signedInAs') || 'Влезли сте като'}</div>
                      <div class="text-white fw-bold">${profile?.full_name || user.email}</div>
                    </div>
                  </li>
                  <li><a class="dropdown-item" href="/profile" data-link>
                    <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ${i18n.t('nav.profile') || 'Профил'}
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item" id="logout-btn">
                    <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ${i18n.t('nav.logout') || 'Изход'}
                  </button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item ms-lg-2">
                <a href="/register" data-link class="btn btn-outline-warning btn-sm px-4 rounded-pill">
                  ${i18n.t('nav.register') || 'Register'}
                </a>
              </li>
              <li class="nav-item ms-lg-2">
                <a href="/login" data-link class="btn btn-warning btn-sm px-4 rounded-pill">
                  ${i18n.t('nav.login') || 'Login'}
                </a>
              </li>
            `}

            <!-- Language Selector -->
            <li class="nav-item dropdown ms-lg-2">
              <button class="btn btn-outline-warning btn-sm dropdown-toggle rounded-pill" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="min-width: 70px;">
                <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                ${currentLanguage.toUpperCase()}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item lang-btn ${currentLanguage === 'bg' ? 'active text-accent' : ''}" data-lang="bg">
                  🇧🇬 Български
                </button></li>
                <li><button class="dropdown-item lang-btn ${currentLanguage === 'en' ? 'active text-accent' : ''}" data-lang="en">
                  🇬🇧 English
                </button></li>
                <li><button class="dropdown-item lang-btn ${currentLanguage === 'ru' ? 'active text-accent' : ''}" data-lang="ru">
                  🇷🇺 Русский
                </button></li>
                <li><button class="dropdown-item lang-btn ${currentLanguage === 'it' ? 'active text-accent' : ''}" data-lang="it">
                  🇮🇹 Italiano
                </button></li>
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
      await renderHeader(); // Re-render header with new translations

      // Trigger page re-render with new language
      router.navigate(router.getCurrentPath());
    });
  });

  // Ensure all dropdown items with data-link are clickable
  document.querySelectorAll('.dropdown-menu [data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      // Let the router handle navigation, but ensure dropdown closes
      const dropdownToggle = link.closest('.dropdown')?.querySelector('[data-bs-toggle="dropdown"]');
      if (dropdownToggle) {
        // Use Bootstrap's Dropdown API to hide
        const bsDropdown = window.bootstrap?.Dropdown?.getInstance(dropdownToggle);
        if (bsDropdown) {
          setTimeout(() => bsDropdown.hide(), 100);
        }
      }
    });
  });
}

/**
 * Initialize header with state subscriptions
 */
export function initHeader() {
  // Re-render header when user or profile changes (async wrapper)
  state.subscribe('user', () => renderHeader());
  state.subscribe('profile', () => renderHeader());
  state.subscribe('currentLanguage', () => renderHeader());

  // Re-render header when route changes
  window.addEventListener('routechange', () => {
    renderHeader().catch(err => console.error('Error rendering header on route change:', err));
  });

  // Initial render (async)
  renderHeader().catch(err => console.error('Error rendering header:', err));
}