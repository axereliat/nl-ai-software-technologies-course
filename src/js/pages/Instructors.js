/**
 * Public Instructors listing page
 */

import { i18n } from '../services/i18n.js';
import { dataService } from '../services/data.js';
import { render } from '../utils/dom.js';
import { toast } from '../components/ui/Toast.js';
import { loading } from '../components/ui/Loading.js';

export async function renderInstructors() {
  loading.show();

  try {
    const instructors = await dataService.getInstructors();

    const html = `
      <div>
        <section class="about-hero text-white py-5">
          <div class="container text-center py-5">
            <h1 class="display-3 fw-bold text-accent mb-3">
              ${i18n.t('nav.instructors')}
            </h1>
          </div>
        </section>

        <section class="bg-dark py-5">
          <div class="container py-4">
            ${instructors.length === 0 ? `
              <p class="text-muted text-center">${i18n.t('admin.noInstructors') || 'Няма инструктори'}</p>
            ` : `
              <div class="row g-4">
                ${instructors.map(instructor => `
                  <div class="col-md-6 col-lg-4">
                    <div class="instructor-card">
                      ${instructor.photo_url ? `
                        <div class="instructor-image" style="background-image: url('${instructor.photo_url}');"></div>
                      ` : `
                        <div class="instructor-image instructor-image-placeholder">
                          <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      `}
                      <div class="instructor-content">
                        <h3 class="instructor-name">${instructor.name || ''}</h3>
                        ${instructor.title ? `<p class="instructor-title">${instructor.title}</p>` : ''}
                        ${instructor.disciplines && instructor.disciplines.length > 0 ? `
                          <p class="instructor-disciplines">${instructor.disciplines.join(', ')}</p>
                        ` : ''}
                        ${instructor.bio ? `<p class="text-muted small mt-2">${instructor.bio}</p>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </section>
      </div>
    `;

    render('#app', html);
  } catch (error) {
    console.error('Error loading instructors:', error);
    toast.error(i18n.t('admin.fetchError') || 'Грешка при зареждане');
  } finally {
    loading.hide();
  }
}