/**
 * Admin Instructor Create/Edit Form page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

/**
 * Render instructor form (create or edit)
 */
export async function renderInstructorForm(params = {}) {
  console.log('Rendering instructor form...', params);

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  const isEdit = params.id !== undefined && params.id !== 'new';
  let instructor = null;

  if (isEdit) {
    loading.show();
    try {
      instructor = await dataService.getInstructorById(params.id);

      if (!instructor) {
        toast.error('Инструкторът не беше намерен');
        router.navigate('/admin/instructors');
        return;
      }
    } catch (error) {
      console.error('Error loading instructor:', error);
      toast.error('Грешка при зареждане на инструктора');
      router.navigate('/admin/instructors');
      return;
    } finally {
      loading.hide();
    }
  }

  const formHTML = `
    <div>
      <section class="bg-dark py-5">
        <div class="container py-4">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h1 class="h2 text-white mb-5">
                ${isEdit ? 'Редактиране на инструктор' : 'Добавяне на инструктор'}
              </h1>

              <form id="instructor-form" class="martial-art-form-container">
                <!-- Photo Upload -->
                <div class="mb-4">
                  <label class="form-label text-white">Photo</label>
                  <div class="photo-upload-container">
                    <div class="photo-preview" id="photoPreview">
                      ${instructor?.photo_url ? `
                        <img src="${instructor.photo_url}" alt="Preview" class="preview-image">
                      ` : `
                        <div class="photo-placeholder">
                          <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          <p class="mt-2 mb-0 text-white">Click to upload</p>
                        </div>
                      `}
                    </div>
                    <input
                      type="file"
                      class="d-none"
                      id="photoInput"
                      accept="image/*"
                    >
                    <input
                      type="hidden"
                      id="photo_url"
                      name="photo_url"
                      value="${instructor?.photo_url || ''}"
                    >
                  </div>
                  <div class="form-text text-muted">Кликнете за качване на снимка или въведете URL</div>
                  <input
                    type="url"
                    class="form-control mt-2"
                    id="photoUrlInput"
                    placeholder="или въведете URL на снимката"
                    value="${instructor?.photo_url || ''}"
                  >
                </div>

                <!-- Instructor Name -->
                <div class="mb-4">
                  <label for="name" class="form-label text-white">
                    Instructor Name <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    name="name"
                    value="${instructor?.name || ''}"
                    required
                  >
                  <div class="invalid-feedback">Моля въведете име на инструктор</div>
                </div>

                <!-- Title -->
                <div class="mb-4">
                  <label for="title" class="form-label text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    name="title"
                    placeholder="Senior Instructor"
                    value="${instructor?.title || ''}"
                  >
                  <div class="form-text text-muted">Например: UFC Heavyweight Champion</div>
                </div>

                <!-- Disciplines -->
                <div class="mb-4">
                  <label for="disciplines" class="form-label text-white">
                    Disciplines
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="disciplines"
                    name="disciplines"
                    placeholder="JKD, MMA, BJJ"
                    value="${instructor?.disciplines ? instructor.disciplines.join(', ') : ''}"
                  >
                  <div class="form-text text-muted">Въведете дисциплините, разделени със запетая</div>
                </div>

                <!-- Display Order -->
                <div class="mb-4">
                  <label for="display_order" class="form-label text-white">
                    Display Order
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="display_order"
                    name="display_order"
                    min="0"
                    value="${instructor?.display_order || 0}"
                  >
                  <div class="form-text text-muted">По-ниското число се показва първо</div>
                </div>

                <!-- Biography -->
                <div class="mb-4">
                  <label for="bio" class="form-label text-white">
                    Biography
                  </label>
                  <textarea
                    class="form-control"
                    id="bio"
                    name="bio"
                    rows="6"
                    placeholder="Биография на инструктора..."
                  >${instructor?.bio || ''}</textarea>
                </div>

                <!-- Buttons -->
                <div class="d-flex gap-3 mt-5">
                  <button type="submit" class="btn btn-warning px-5">
                    ${isEdit ? 'Запази промените' : 'Създай'}
                  </button>
                  <a href="/admin/instructors" data-link class="btn btn-outline-light px-5">
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
  attachFormEvents(isEdit, instructor?.id);
}

/**
 * Attach form event listeners
 */
function attachFormEvents(isEdit, instructorId) {
  const form = document.getElementById('instructor-form');
  const photoPreview = document.getElementById('photoPreview');
  const photoInput = document.getElementById('photoInput');
  const photoUrlInput = document.getElementById('photoUrlInput');
  const photoUrlHidden = document.getElementById('photo_url');

  // Photo preview click to upload
  photoPreview.addEventListener('click', () => {
    photoInput.click();
  });

  // Handle file upload (for now just show preview, actual upload would need backend)
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        photoPreview.innerHTML = `<img src="${imageUrl}" alt="Preview" class="preview-image">`;
        photoUrlHidden.value = imageUrl;
        photoUrlInput.value = imageUrl;
        toast.info('Моля използвайте URL за постоянно съхранение на снимката');
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle photo URL input
  photoUrlInput.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      photoPreview.innerHTML = `<img src="${url}" alt="Preview" class="preview-image">`;
      photoUrlHidden.value = url;
    } else {
      photoPreview.innerHTML = `
        <div class="photo-placeholder">
          <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          <p class="mt-2 mb-0 text-white">Click to upload</p>
        </div>
      `;
      photoUrlHidden.value = '';
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const formData = new FormData(form);

    // Parse disciplines from comma-separated string to array
    const disciplinesStr = formData.get('disciplines');
    const disciplines = disciplinesStr
      ? disciplinesStr.split(',').map(d => d.trim()).filter(d => d)
      : [];

    const data = {
      name: formData.get('name'),
      title: formData.get('title') || null,
      bio: formData.get('bio') || null,
      photo_url: formData.get('photo_url') || null,
      disciplines: disciplines,
      display_order: parseInt(formData.get('display_order')) || 0
    };

    loading.show();

    try {
      if (isEdit) {
        await dataService.updateInstructor(instructorId, data);
        toast.success('Инструкторът беше обновен успешно');
      } else {
        await dataService.createInstructor(data);
        toast.success('Инструкторът беше създаден успешно');
      }
      router.navigate('/admin/instructors');
    } catch (error) {
      console.error('Error saving instructor:', error);
      toast.error('Грешка при запазване на инструктора');
    } finally {
      loading.hide();
    }
  });
}
