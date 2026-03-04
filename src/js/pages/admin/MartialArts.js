/**
 * Admin Martial Arts Management page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

/**
 * Render admin martial arts list
 */
export async function renderAdminMartialArts() {
  console.log('Rendering admin martial arts...');

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  loading.show();

  try {
    // Fetch martial arts
    const martialArts = await dataService.getMartialArts();
    console.log('Martial arts loaded:', martialArts);

    const martialArtsHTML = `
      <div>
        <!-- Delete Confirmation Modal -->
        <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark border-danger">
              <div class="modal-header border-danger">
                <h5 class="modal-title text-white" id="deleteModalLabel">Потвърждение за изтриване</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body text-white">
                <p>Сигурни ли сте, че искате да изтриете <strong id="deleteItemName"></strong>?</p>
                <p class="text-muted small mb-0">Това действие не може да бъде отменено.</p>
              </div>
              <div class="modal-footer border-danger">
                <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Отказ</button>
                <button type="button" class="btn btn-danger" id="confirmDelete">Изтрий</button>
              </div>
            </div>
          </div>
        </div>

        <section class="bg-dark py-5">
          <div class="container py-4">
            <div class="classes-header mb-5">
              <h1 class="h2 text-white mb-4">Управление на бойни изкуства</h1>
              <a href="/admin/martial-arts/new" data-link class="add-class-btn">
                Добави бойно изкуство
              </a>
            </div>

            ${martialArts.length === 0 ? `
              <div class="text-center py-5">
                <p class="text-muted mb-4">Няма налични бойни изкуства.</p>
                <a href="/admin/martial-arts/new" data-link class="btn btn-warning">
                  Добави първо бойно изкуство
                </a>
              </div>
            ` : `
              <div class="row g-4">
                ${martialArts.map(ma => `
                  <div class="col-md-6 col-lg-4">
                    <div class="martial-art-card">
                      <div class="martial-art-image" style="background-image: url('${ma.image_url || '/images/placeholder-martial-art.jpg'}');">
                      </div>
                      <div class="martial-art-content">
                        <h3 class="martial-art-title">${ma.name || 'Без име'}</h3>
                        <p class="martial-art-subtitle">${ma.subtitle || ''}</p>
                        <p class="martial-art-description">${ma.description ? (ma.description.substring(0, 150) + (ma.description.length > 150 ? '...' : '')) : ''}</p>
                        <div class="d-flex gap-2 mt-3">
                          <button class="btn btn-outline-warning btn-sm flex-fill edit-martial-art-btn" data-id="${ma.id}">
                            <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Редактирай
                          </button>
                          <button class="btn btn-outline-danger btn-sm flex-fill delete-martial-art-btn" data-id="${ma.id}" data-name="${ma.name}">
                            <svg class="me-1" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Изтрий
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}

            <div class="mt-5">
              <a href="/admin" data-link class="btn btn-outline-light">
                <svg class="me-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад към админ панел
              </a>
            </div>
          </div>
        </section>
      </div>
    `;

    render('#app', martialArtsHTML);
    attachEventListeners();
  } catch (error) {
    console.error('Error loading martial arts:', error);
    toast.error('Грешка при зареждане на бойните изкуства');

    const errorHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">Управление на бойни изкуства</h1>
        <p class="text-muted">Грешка при зареждане на данните</p>
        <a href="/admin" data-link class="btn btn-warning mt-3">Назад към админ панел</a>
      </div>
    `;
    render('#app', errorHTML);
  } finally {
    loading.hide();
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Edit buttons
  document.querySelectorAll('.edit-martial-art-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      router.navigate(`/admin/martial-arts/${id}/edit`);
    });
  });

  // Delete buttons
  let pendingDeleteId = null;

  document.querySelectorAll('.delete-martial-art-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');

      // Set pending delete data
      pendingDeleteId = id;

      // Update modal content
      document.getElementById('deleteItemName').textContent = `"${name}"`;

      // Show modal
      const modal = new window.bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    });
  });

  // Confirm delete handler
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!pendingDeleteId) return;

      // Hide modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
      modal.hide();

      loading.show();
      try {
        await dataService.deleteMartialArt(pendingDeleteId);
        toast.success('Бойното изкуство беше изтрито успешно');
        pendingDeleteId = null;
        // Reload page
        await renderAdminMartialArts();
      } catch (error) {
        console.error('Error deleting martial art:', error);
        toast.error('Грешка при изтриване на бойното изкуство');
        loading.hide();
      }
    });
  }
}
