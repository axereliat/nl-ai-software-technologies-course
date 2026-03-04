/**
 * Admin Classes Management page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

// Day of week mapping
const DAYS_OF_WEEK = {
  0: 'Понеделник',
  1: 'Вторник',
  2: 'Сряда',
  3: 'Четвъртък',
  4: 'Петък',
  5: 'Събота',
  6: 'Неделя'
};

/**
 * Format time from HH:MM:SS to HH:MM
 */
function formatTime(timeString) {
  if (!timeString) return '-';
  return timeString.substring(0, 5);
}

/**
 * Format age group for display
 */
function formatAgeGroup(ageGroup) {
  const ageGroupMap = {
    'adult': 'Adult Classes',
    'kids': '8-13 yrs',
    'youth': '14-17 yrs',
    'all': 'All Ages'
  };
  return ageGroupMap[ageGroup] || ageGroup;
}

/**
 * Render admin classes list
 */
export async function renderAdminClasses() {
  console.log('Rendering admin classes...');

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  loading.show();

  try {
    // Fetch classes
    const classes = await dataService.getClasses();
    console.log('Classes loaded:', classes);

    const classesHTML = `
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
                <p>Сигурни ли сте, че искате да изтриете този клас?</p>
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
              <h1 class="h2 text-white mb-4">Classes</h1>
              <a href="/admin/classes/new" data-link class="add-class-btn">
                Add Class
              </a>
            </div>

            ${classes.length === 0 ? `
              <div class="text-center py-5">
                <p class="text-muted mb-4">Няма налични класове.</p>
                <a href="/admin/classes/new" data-link class="add-class-btn" style="max-width: 400px; margin: 0 auto;">
                  Add Class
                </a>
              </div>
            ` : `
              <div class="classes-table-container">
                <div class="classes-table-header">
                  <div class="table-col">Discipline</div>
                  <div class="table-col">Day of Week</div>
                  <div class="table-col">Time</div>
                  <div class="table-col">Age Group</div>
                  <div class="table-col table-col-actions">Actions</div>
                </div>
                <div class="classes-table-body">
                  ${classes.map(cls => `
                    <div class="class-row">
                      <div class="table-cell" data-label="Discipline:">${cls.discipline || '-'}</div>
                      <div class="table-cell" data-label="Day:">${DAYS_OF_WEEK[cls.day_of_week] || '-'}</div>
                      <div class="table-cell" data-label="Time:">${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}</div>
                      <div class="table-cell" data-label="Age Group:">${formatAgeGroup(cls.age_group)}</div>
                      <div class="table-cell table-cell-actions">
                        <button class="action-btn action-btn-edit edit-class-btn" data-id="${cls.id}">
                          Edit
                        </button>
                        <button class="action-btn action-btn-delete delete-class-btn" data-id="${cls.id}">
                          Delete
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
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

    render('#app', classesHTML);
    attachEventListeners();
  } catch (error) {
    console.error('Error loading classes:', error);
    toast.error('Грешка при зареждане на класовете');

    const errorHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">Управление на класове</h1>
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
  document.querySelectorAll('.edit-class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      router.navigate(`/admin/classes/${id}/edit`);
    });
  });

  // Delete buttons
  let pendingDeleteId = null;

  document.querySelectorAll('.delete-class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      pendingDeleteId = id;

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
        await dataService.deleteClass(pendingDeleteId);
        toast.success('Класът беше изтрит успешно');
        pendingDeleteId = null;
        // Reload page
        await renderAdminClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Грешка при изтриване на класа');
        loading.hide();
      }
    });
  }
}
