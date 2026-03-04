/**
 * Admin Instructors Management page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

/**
 * Render admin instructors list
 */
export async function renderAdminInstructors() {
  console.log('Rendering admin instructors...');

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  loading.show();

  try {
    // Fetch instructors
    const instructors = await dataService.getInstructors();
    console.log('Instructors loaded:', instructors);

    const instructorsHTML = `
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
              <h1 class="h2 text-white mb-4">Instructors</h1>
              <a href="/admin/instructors/new" data-link class="add-class-btn">
                Add Instructor
              </a>
            </div>

            ${instructors.length === 0 ? `
              <div class="text-center py-5">
                <p class="text-muted mb-4">Няма налични инструктори.</p>
                <a href="/admin/instructors/new" data-link class="btn btn-warning">
                  Добави първи инструктор
                </a>
              </div>
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
                        <h3 class="instructor-name">${instructor.name || 'Без име'}</h3>
                        ${instructor.title ? `
                          <p class="instructor-title">${instructor.title}</p>
                        ` : ''}
                        ${instructor.disciplines && instructor.disciplines.length > 0 ? `
                          <p class="instructor-disciplines">${instructor.disciplines.join(', ')}</p>
                        ` : ''}
                        <div class="d-flex gap-2 mt-3">
                          <button class="btn btn-outline-warning btn-sm flex-fill edit-instructor-btn" data-id="${instructor.id}">
                            Edit
                          </button>
                          <button class="btn btn-outline-danger btn-sm flex-fill delete-instructor-btn" data-id="${instructor.id}" data-name="${instructor.name}">
                            Delete
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

    render('#app', instructorsHTML);
    attachEventListeners();
  } catch (error) {
    console.error('Error loading instructors:', error);
    toast.error('Грешка при зареждане на инструкторите');

    const errorHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">Управление на инструктори</h1>
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
  document.querySelectorAll('.edit-instructor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      router.navigate(`/admin/instructors/${id}/edit`);
    });
  });

  // Delete buttons
  let pendingDeleteId = null;

  document.querySelectorAll('.delete-instructor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');

      pendingDeleteId = id;
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
        await dataService.deleteInstructor(pendingDeleteId);
        toast.success('Инструкторът беше изтрит успешно');
        pendingDeleteId = null;
        // Reload page
        await renderAdminInstructors();
      } catch (error) {
        console.error('Error deleting instructor:', error);
        toast.error('Грешка при изтриване на инструктора');
        loading.hide();
      }
    });
  }
}
