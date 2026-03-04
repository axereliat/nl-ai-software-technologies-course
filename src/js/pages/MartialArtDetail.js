/**
 * Martial Art Detail page
 */

import { i18n } from '../services/i18n.js';
import { render } from '../utils/dom.js';
import { loading } from '../components/ui/Loading.js';
import { dataService } from '../services/data.js';
import { toast } from '../components/ui/Toast.js';

/**
 * Render martial art detail page
 * @param {Object} params - Route parameters with id
 */
export async function renderMartialArtDetail(params = {}) {
  const { id } = params;

  loading.show();

  let martialArt;

  try {
    // Fetch martial art from Supabase
    martialArt = await dataService.getMartialArtBySlug(id);
  } catch (error) {
    console.error('Error loading martial art:', error);

    render('#app', `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">${i18n.t('error.notFound') || 'Не е намерено'}</h1>
        <p class="text-muted mb-4">Това бойно изкуство не е намерено.</p>
        <a href="/" data-link class="btn btn-warning">${i18n.t('common.goHome') || 'Начало'}</a>
      </div>
    `);
    loading.hide();
    return;
  }

  if (!martialArt) {
    render('#app', `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">${i18n.t('error.notFound') || 'Не е намерено'}</h1>
        <p class="text-muted mb-4">Това бойно изкуство не е намерено.</p>
        <a href="/" data-link class="btn btn-warning">${i18n.t('common.goHome') || 'Начало'}</a>
      </div>
    `);
    loading.hide();
    return;
  }

  const detailHTML = `
    <div>
      <!-- Hero Section -->
      <section class="martial-art-detail-hero text-white py-5">
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-10">
              <div class="text-center py-5">
                <h1 class="display-1 fw-bold text-accent mb-4" style="font-size: 5rem;">
                  ${martialArt.name || 'Без име'}
                </h1>
                ${martialArt.subtitle ? `
                  <p class="lead text-white mb-5" style="font-size: 1.5rem; opacity: 0.9;">
                    ${martialArt.subtitle}
                  </p>
                ` : ''}
                ${martialArt.description ? `
                  <div class="martial-art-description">
                    <p class="text-white" style="font-size: 1.15rem; line-height: 1.8; max-width: 900px; margin: 0 auto;">
                      ${martialArt.description}
                    </p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      ${martialArt.benefits && martialArt.benefits.length > 0 ? `
        <section class="bg-secondary py-5">
          <div class="container py-4">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <h2 class="h2 text-white text-center mb-5">Benefits</h2>
                <div class="benefits-list">
                  ${martialArt.benefits.map(benefit => `
                    <div class="benefit-item-detail mb-3">
                      <div class="benefit-checkmark">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                          <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <span class="benefit-text">${benefit}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </section>
      ` : ''}
    </div>
  `;

  render('#app', detailHTML);
  loading.hide();
}
