/**
 * Admin Class Create/Edit Form page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

// Days of week options
const DAYS_OF_WEEK = [
  { value: 0, label: 'Понеделник' },
  { value: 1, label: 'Вторник' },
  { value: 2, label: 'Сряда' },
  { value: 3, label: 'Четвъртък' },
  { value: 4, label: 'Петък' },
  { value: 5, label: 'Събота' },
  { value: 6, label: 'Неделя' }
];

// Age group options - must match database constraint
const AGE_GROUPS = [
  { value: 'adult', label: 'Adult Classes' },
  { value: 'kids', label: 'Kids (8-13 yrs)' },
  { value: 'youth', label: 'Youth (14-17 yrs)' },
  { value: 'all', label: 'All Ages' }
];

/**
 * Render class form (create or edit)
 */
export async function renderClassForm(params = {}) {
  console.log('Rendering class form...', params);

  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница.');
    router.navigate('/');
    return;
  }

  const isEdit = params.id !== undefined && params.id !== 'new';
  let classData = null;
  let martialArts = [];

  loading.show();

  try {
    // Fetch martial arts for discipline dropdown
    martialArts = await dataService.getMartialArts();

    if (isEdit) {
      classData = await dataService.getClassById(params.id);

      if (!classData) {
        toast.error('Class not found');
        router.navigate('/admin/classes');
        return;
      }
    }
  } catch (error) {
    console.error('Error loading class:', error);
    toast.error('Error loading class');
    router.navigate('/admin/classes');
    return;
  } finally {
    loading.hide();
  }

  // Format time for HTML input (HH:MM:SS -> HH:MM)
  const formatTimeForInput = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const formHTML = `
    <div>
      <section class="bg-dark py-5">
        <div class="container py-4">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h1 class="h2 text-white mb-5">
                ${isEdit ? 'Edit Class' : 'Add Class'}
              </h1>

              <form id="class-form" class="martial-art-form-container">
                <!-- Discipline -->
                <div class="mb-4">
                  <label for="discipline" class="form-label text-white">
                    Discipline <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    id="discipline"
                    name="discipline"
                    required
                  >
                    <option value="">Select discipline</option>
                    ${martialArts.map(ma => `
                      <option value="${ma.name}" ${classData?.discipline === ma.name ? 'selected' : ''}>
                        ${ma.name}
                      </option>
                    `).join('')}
                  </select>
                  <div class="invalid-feedback">Please select a discipline</div>
                </div>

                <!-- Day of Week -->
                <div class="mb-4">
                  <label for="day_of_week" class="form-label text-white">
                    Day of Week <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    id="day_of_week"
                    name="day_of_week"
                    required
                  >
                    <option value="">Select day</option>
                    ${DAYS_OF_WEEK.map(day => `
                      <option value="${day.value}" ${classData?.day_of_week == day.value ? 'selected' : ''}>
                        ${day.label}
                      </option>
                    `).join('')}
                  </select>
                  <div class="invalid-feedback">Please select a day</div>
                </div>

                <div class="row">
                  <!-- Start Time -->
                  <div class="col-md-6 mb-4">
                    <label for="start_time" class="form-label text-white">
                      Start Time <span class="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      class="form-control"
                      id="start_time"
                      name="start_time"
                      value="${formatTimeForInput(classData?.start_time)}"
                      required
                    >
                    <div class="invalid-feedback">Please enter start time</div>
                  </div>

                  <!-- End Time -->
                  <div class="col-md-6 mb-4">
                    <label for="end_time" class="form-label text-white">
                      End Time <span class="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      class="form-control"
                      id="end_time"
                      name="end_time"
                      value="${formatTimeForInput(classData?.end_time)}"
                      required
                    >
                    <div class="invalid-feedback">Please enter end time</div>
                  </div>
                </div>

                <!-- Age Group -->
                <div class="mb-4">
                  <label for="age_group" class="form-label text-white">
                    Age Group
                  </label>
                  <select
                    class="form-select"
                    id="age_group"
                    name="age_group"
                  >
                    <option value="">Select age group</option>
                    ${AGE_GROUPS.map(group => `
                      <option value="${group.value}" ${classData?.age_group === group.value ? 'selected' : ''}>
                        ${group.label}
                      </option>
                    `).join('')}
                  </select>
                  <div class="invalid-feedback">Please select an age group</div>
                </div>

                <!-- Buttons -->
                <div class="d-flex gap-3 mt-5">
                  <button type="submit" class="btn btn-warning px-5">
                    ${isEdit ? 'Save Changes' : 'Add Class'}
                  </button>
                  <a href="/admin/classes" data-link class="btn btn-outline-light px-5">
                    Cancel
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
  attachFormEvents(isEdit, classData?.id);
}

/**
 * Attach form event listeners
 */
function attachFormEvents(isEdit, classId) {
  const form = document.getElementById('class-form');

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const formData = new FormData(form);

    const discipline = formData.get('discipline');
    const dayOfWeek = formData.get('day_of_week');
    const startTime = formData.get('start_time');
    const endTime = formData.get('end_time');
    const ageGroup = formData.get('age_group');

    // Validate required fields
    if (!discipline || !dayOfWeek || !startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure time format includes seconds (HH:MM:SS)
    const formatTime = (time) => {
      if (!time) return null;
      // If time is already HH:MM:SS, return as is
      if (time.length === 8) return time;
      // If time is HH:MM, append :00
      return time + ':00';
    };

    const data = {
      discipline: discipline.trim(),
      day_of_week: parseInt(dayOfWeek),
      start_time: formatTime(startTime),
      end_time: endTime ? formatTime(endTime) : null,
      age_group: ageGroup.trim()
    };

    console.log('Submitting class data:', data);

    loading.show();

    try {
      if (isEdit) {
        const result = await dataService.updateClass(classId, data);
        console.log('Update result:', result);
        toast.success('Class updated successfully');
      } else {
        const result = await dataService.createClass(data);
        console.log('Create result:', result);
        toast.success('Class created successfully');
      }
      router.navigate('/admin/classes');
    } catch (error) {
      console.error('Error saving class:', error);
      console.error('Error details:', error.message, error.code, error.details);

      // Show more specific error message
      if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error saving class');
      }
    } finally {
      loading.hide();
    }
  });
}
