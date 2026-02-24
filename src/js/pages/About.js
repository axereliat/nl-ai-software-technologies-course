/**
 * About page
 */

import { i18n } from '../services/i18n.js';
import { render } from '../utils/dom.js';

/**
 * Render about page
 */
export async function renderAbout() {
  const aboutHTML = `
    <div>
      <!-- Hero Section with Quote -->
      <section class="about-hero text-white py-5">
        <div class="container text-center py-5">
          <h1 class="display-3 fw-bold text-accent mb-5">
            ${i18n.t('about.title') || 'За Нас'}
          </h1>
          <p class="lead mb-3 text-white">
            ${i18n.t('about.quote') || '"Using no way as a way, having No Limitation as limitation."'}
          </p>
          <p class="text-accent h5">
            ${i18n.t('about.quoteAuthor') || '- Bruce Lee'}
          </p>
        </div>
      </section>

      <!-- History Section -->
      <section class="bg-dark py-5">
        <div class="container py-4">
          <h2 class="text-accent text-center mb-5 h2">
            ${i18n.t('about.history') || 'История на клуба'}
          </h2>
          <div class="about-card">
            <p class="text-white mb-0" style="line-height: 1.8;">
              ${i18n.t('about.historyText') || 'Клубът е основан през 2010г. от Генко Симеонов и Панталей Гергов, които са старши инструктори в Джийт Кун До. Първоначално клубът е насочен към смесени бойни изкуства и е получил името ММА Плевен. Постепенно клубът разширява дейността си в множество бойни дисциплини - ММА, Граплинг, Сан Да и Бразилско Джиу Джицу. Това разширяване води до преименуване на клуба на No Limitation.'}
            </p>
          </div>
        </div>
      </section>

      <!-- Philosophy Section -->
      <section class="bg-secondary py-5">
        <div class="container py-4">
          <h2 class="text-accent text-center mb-5 h2">
            ${i18n.t('about.philosophy') || 'Философия'}
          </h2>
          <div class="about-card">
            <p class="text-white mb-0" style="line-height: 1.8;">
              ${i18n.t('about.philosophyText') || 'Името на клуба идва от цитат на Брус Лий: "Using no way as a way, having No Limitation as limitation". Вярваме, че всеки може да постигне своя потенциал чрез упорита работа и правилно насочване, без ограничения - както физически, така и ментални.'}
            </p>
          </div>
        </div>
      </section>

      <!-- Partnership Section -->
      <section class="bg-dark py-5">
        <div class="container py-4">
          <h2 class="text-accent text-center mb-5 h2">
            ${i18n.t('about.partnership') || 'Партньорства'}
          </h2>
          <div class="about-card">
            <p class="text-white mb-0" style="line-height: 1.8;">
              ${i18n.t('about.partnershipText') || 'Клубът работи в сътрудничество с Twisted Jiu Jitsu за Бразилско Джиу Джицу.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  `;

  render('#app', aboutHTML);
}
