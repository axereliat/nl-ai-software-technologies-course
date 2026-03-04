/**
 * Admin Martial Art Create/Edit Form page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

let currentBenefits = [];

/**
 * Render martial art form (create or edit)
 */
export async function renderMartialArtForm(params = {}) {
  console.log('Rendering martial art form...', params);

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  const isEdit = params.id !== undefined && params.id !== 'new';
  let martialArt = null;

  if (isEdit) {
    loading.show();
    try {
      const allMartialArts = await dataService.getMartialArts();
      // Convert params.id to number for comparison
      martialArt = allMartialArts.find(ma => ma.id == params.id);

      if (!martialArt) {
        toast.error('Бойното изкуство не беше намерено');
        router.navigate('/admin/martial-arts');
        return;
      }

      // Initialize benefits from existing data
      currentBenefits = martialArt.benefits || [];
    } catch (error) {
      console.error('Error loading martial art:', error);
      toast.error('Грешка при зареждане на бойното изкуство');
      router.navigate('/admin/martial-arts');
      return;
    } finally {
      loading.hide();
    }
  } else {
    currentBenefits = [];
  }

  const formHTML = `
    <div>
      <!-- Add Benefit Modal -->
      <div class="modal fade" id="addBenefitModal" tabindex="-1" aria-labelledby="addBenefitModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark border-warning">
            <div class="modal-header border-warning">
              <h5 class="modal-title text-white" id="addBenefitModalLabel">Добавяне на предимство</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="benefitInput" class="form-label text-white">Предимство</label>
                <input type="text" class="form-control" id="benefitInput" placeholder="Въведете предимство">
              </div>
            </div>
            <div class="modal-footer border-warning">
              <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Отказ</button>
              <button type="button" class="btn btn-warning" id="confirmAddBenefit">Добави</button>
            </div>
          </div>
        </div>
      </div>

      <section class="bg-dark py-5">
        <div class="container py-4">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h1 class="h2 text-white mb-5">
                ${isEdit ? 'Редактиране на бойно изкуство' : 'Добавяне на бойно изкуство'}
              </h1>

              <form id="martial-art-form" class="martial-art-form-container">
                <!-- Title -->
                <div class="mb-4">
                  <label for="title" class="form-label text-white">
                    Заглавие <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    name="title"
                    value="${martialArt?.name || ''}"
                    required
                  >
                  <div class="invalid-feedback">Моля въведете заглавие</div>
                </div>

                <!-- Subtitle -->
                <div class="mb-4">
                  <label for="subtitle" class="form-label text-white">
                    Подзаглавие
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="subtitle"
                    name="subtitle"
                    value="${martialArt?.subtitle || ''}"
                  >
                </div>

                <!-- Image URL -->
                <div class="mb-4">
                  <label for="image_url" class="form-label text-white">
                    URL на изображението
                  </label>
                  <input
                    type="url"
                    class="form-control"
                    id="image_url"
                    name="image_url"
                    value="${martialArt?.image_url || ''}"
                  >
                  <div class="form-text text-muted">Пълен URL адрес на изображението</div>
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <label for="description" class="form-label text-white">
                    Описание
                  </label>
                  <textarea
                    class="form-control"
                    id="description"
                    name="description"
                    rows="5"
                  >${martialArt?.description || ''}</textarea>
                </div>

                <!-- Benefits -->
                <div class="mb-4">
                  <label class="form-label text-white d-flex justify-content-between align-items-center">
                    <span>Предимства</span>
                    <button type="button" class="btn btn-sm btn-outline-warning" id="add-benefit-btn">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Добави
                    </button>
                  </label>
                  <div id="benefits-container" class="benefits-container">
                    ${renderBenefitsList()}
                  </div>
                  <div class="form-text text-muted">Добавете предимствата на това бойно изкуство</div>
                </div>

                <!-- Buttons -->
                <div class="d-flex gap-3 mt-5">
                  <button type="submit" class="btn btn-warning px-5">
                    ${isEdit ? 'Запази промените' : 'Създай'}
                  </button>
                  <a href="/admin/martial-arts" data-link class="btn btn-outline-light px-5">
                    Отказ
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  render('#app', formHTML);
  attachFormEvents(isEdit, martialArt?.id);
}

/**
 * Render benefits list
 */
function renderBenefitsList() {
  if (currentBenefits.length === 0) {
    return '<p class="text-muted small">Няма добавени предимства</p>';
  }

  return currentBenefits.map((benefit, index) => `
    <div class="benefit-item">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" checked disabled>
        <label class="form-check-label text-white">
          ${benefit}
        </label>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger remove-benefit-btn" data-index="${index}">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `).join('');
}

/**
 * Attach form event listeners
 */
function attachFormEvents(isEdit, martialArtId) {
  const form = document.getElementById('martial-art-form');
  const addBenefitBtn = document.getElementById('add-benefit-btn');
  const titleInput = document.getElementById('title');
  const titleError = titleInput.nextElementSibling;

  // Title validation
  titleInput.addEventListener('invalid', (e) => {
    e.preventDefault();
    titleInput.classList.add('is-invalid');
    if (titleInput.validity.valueMissing) {
      titleError.textContent = 'Моля въведете заглавие';
      titleError.style.display = 'block';
    }
  });

  titleInput.addEventListener('input', () => {
    if (titleInput.value.trim()) {
      titleInput.classList.remove('is-invalid');
      titleError.style.display = 'none';
    }
  });

  // Add benefit button - show modal
  addBenefitBtn.addEventListener('click', () => {
    const modal = new window.bootstrap.Modal(document.getElementById('addBenefitModal'));
    const benefitInput = document.getElementById('benefitInput');
    benefitInput.value = '';
    modal.show();

    // Focus input when modal is shown
    document.getElementById('addBenefitModal').addEventListener('shown.bs.modal', () => {
      benefitInput.focus();
    }, { once: true });
  });

  // Confirm add benefit
  const confirmAddBtn = document.getElementById('confirmAddBenefit');
  const benefitInput = document.getElementById('benefitInput');

  const addBenefit = () => {
    const benefit = benefitInput.value.trim();
    if (benefit) {
      currentBenefits.push(benefit);
      updateBenefitsList();

      // Hide modal
      const modal = window.bootstrap.Modal.getInstance(document.getElementById('addBenefitModal'));
      modal.hide();
    }
  };

  confirmAddBtn.addEventListener('click', addBenefit);

  // Allow Enter key to submit
  benefitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit();
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');

      // Manually trigger validation display
      if (!titleInput.value.trim()) {
        titleInput.classList.add('is-invalid');
        titleError.style.display = 'block';
      }

      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      image_url: formData.get('image_url'),
      benefits: currentBenefits
    };

    loading.show();

    try {
      if (isEdit) {
        await dataService.updateMartialArt(martialArtId, data);
        toast.success('Бойното изкуство беше обновено успешно');
      } else {
        await dataService.createMartialArt(data);
        toast.success('Бойното изкуство беше създадено успешно');
      }
      router.navigate('/admin/martial-arts');
    } catch (error) {
      console.error('Error saving martial art:', error);
      toast.error('Грешка при запазване на бойното изкуство');
    } finally {
      loading.hide();
    }
  });

  // Attach remove benefit listeners
  attachRemoveBenefitListeners();
}

/**
 * Update benefits list in DOM
 */
function updateBenefitsList() {
  const container = document.getElementById('benefits-container');
  container.innerHTML = renderBenefitsList();
  attachRemoveBenefitListeners();
}

/**
 * Attach listeners to remove benefit buttons
 */
function attachRemoveBenefitListeners() {
  document.querySelectorAll('.remove-benefit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'));
      currentBenefits.splice(index, 1);
      updateBenefitsList();
    });
  });
}
