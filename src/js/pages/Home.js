/**
 * Home page
 */

import { i18n } from '../services/i18n.js';
import { render } from '../utils/dom.js';

/**
 * Render home page
 */
export async function renderHome() {
  const homeHTML = `
    <div>
      <!-- Hero Section -->
      <section class="hero-main position-relative text-white">
        <div class="hero-overlay"></div>
        <div class="container position-relative">
          <div class="row align-items-center" style="min-height: 90vh;">
            <div class="col-lg-6">
              <h1 class="display-1 fw-bold text-accent mb-4" style="font-size: 5rem; line-height: 1;">
                ${i18n.t('home.hero.title') || 'NO<br>LIMITATION'}
              </h1>
              <h2 class="h4 mb-4 text-white">
                ${i18n.t('home.hero.subtitle') || 'Боен клуб - Плевен'}
              </h2>
              <p class="fst-italic mb-2 text-white-50" style="font-size: 1.1rem;">
                ${i18n.t('home.hero.quote') || '"Винаги има начин, няма ограничения."'}
              </p>
              <p class="text-accent mb-5">
                ${i18n.t('home.hero.author') || '- Брус Лий'}
              </p>
              <a href="/contact" data-link class="btn btn-warning btn-lg px-5 py-3 rounded-pill">
                ${i18n.t('home.hero.cta') || 'Пробен урок'}
              </a>
             
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  render('#app', homeHTML);
}