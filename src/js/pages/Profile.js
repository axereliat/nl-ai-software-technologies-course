/**
 * Profile page
 */

import { i18n } from '../services/i18n.js';
import { authService } from '../services/auth.js';
import { state } from '../services/state.js';
import { router } from '../router.js';
import { render } from '../utils/dom.js';
import { toast } from '../components/ui/Toast.js';
import { loading } from '../components/ui/Loading.js';
import { supabase } from '../config/supabase.js';

/**
 * Render profile page
 */
export async function renderProfile() {
  const user = authService.getUser();
  const profile = authService.getProfile();

  if (!user) {
    router.navigate('/login');
    return;
  }

  const profileHTML = `
    <div>
      <!-- Hero Section -->
      <section class="about-hero text-white py-5">
        <div class="container text-center py-5">
          <h1 class="display-3 fw-bold text-accent mb-3">
            ${i18n.t('profile.title') || 'Моят Профил'}
          </h1>
        </div>
      </section>

      <!-- Profile Section -->
      <section class="bg-dark py-5">
        <div class="container py-4">
          <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
              <!-- Profile View -->
              <div class="auth-card" id="profile-view">
                <div class="text-center mb-4">
                  <div class="profile-avatar mb-3">
                    <div class="avatar-circle">
                      ${getInitials(profile?.full_name || user.email)}
                    </div>
                  </div>
                  <h2 class="h4 text-white mb-1">${profile?.full_name || 'No Name'}</h2>
                  <p class="text-muted">${user.email}</p>
                  ${profile?.role ? `<span class="badge bg-warning text-dark">${profile.role}</span>` : ''}
                </div>

                <div class="profile-info mb-4">
                  <div class="mb-3">
                    <label class="text-muted small">${i18n.t('profile.fullName') || 'Име и фамилия'}</label>
                    <p class="text-white mb-0">${profile?.full_name || 'Not set'}</p>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small">${i18n.t('profile.email') || 'Имейл'}</label>
                    <p class="text-white mb-0">${user.email}</p>
                  </div>
                  <div class="mb-3">
                    <label class="text-muted small">${i18n.t('profile.memberSince') || 'Член от'}</label>
                    <p class="text-white mb-0">${formatDate(user.created_at)}</p>
                  </div>
                </div>

                <button type="button" class="btn btn-warning w-100 mb-2" id="edit-profile-btn">
                  ${i18n.t('profile.editProfile') || 'Редактирай профила'}
                </button>

                <button type="button" class="btn btn-outline-light w-100" id="change-password-btn">
                  ${i18n.t('profile.changePassword') || 'Смяна на парола'}
                </button>
              </div>

              <!-- Profile Edit Form (hidden by default) -->
              <div class="auth-card d-none" id="profile-edit">
                <h3 class="h5 text-accent mb-4">${i18n.t('profile.editProfile') || 'Редактирай профила'}</h3>
                <form id="edit-profile-form" class="needs-validation" novalidate>
                  <!-- Full Name -->
                  <div class="mb-4">
                    <label for="edit-fullName" class="form-label text-white">${i18n.t('profile.fullName') || 'Име и фамилия'}</label>
                    <input
                      type="text"
                      class="form-control form-control-lg bg-secondary text-white border-0"
                      id="edit-fullName"
                      value="${profile?.full_name || ''}"
                      required
                      minlength="2"
                    >
                    <div class="invalid-feedback">
                      ${i18n.t('validation.nameRequired') || 'Моля въведете име'}
                    </div>
                  </div>

                  <!-- Buttons -->
                  <button type="submit" class="btn btn-warning w-100 mb-2" id="save-profile-btn">
                    ${i18n.t('common.save') || 'Запази'}
                  </button>
                  <button type="button" class="btn btn-outline-light w-100" id="cancel-edit-btn">
                    ${i18n.t('common.cancel') || 'Отказ'}
                  </button>
                </form>
              </div>

              <!-- Change Password Form (hidden by default) -->
              <div class="auth-card d-none" id="change-password-form-container">
                <h3 class="h5 text-accent mb-4">${i18n.t('profile.changePassword') || 'Смяна на парола'}</h3>
                <form id="change-password-form" class="needs-validation" novalidate>
                  <!-- New Password -->
                  <div class="mb-4">
                    <label for="new-password" class="form-label text-white">${i18n.t('profile.newPassword') || 'Нова парола'}</label>
                    <input
                      type="password"
                      class="form-control form-control-lg bg-secondary text-white border-0"
                      id="new-password"
                      required
                      minlength="6"
                    >
                    <div class="invalid-feedback">
                      ${i18n.t('auth.passwordTooShort') || 'Паролата трябва да е поне 6 символа'}
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div class="mb-4">
                    <label for="confirm-new-password" class="form-label text-white">${i18n.t('profile.confirmPassword') || 'Потвърди парола'}</label>
                    <input
                      type="password"
                      class="form-control form-control-lg bg-secondary text-white border-0"
                      id="confirm-new-password"
                      required
                      minlength="6"
                    >
                    <div class="invalid-feedback">
                      ${i18n.t('auth.passwordMismatch') || 'Паролите не съвпадат'}
                    </div>
                  </div>

                  <!-- Buttons -->
                  <button type="submit" class="btn btn-warning w-100 mb-2" id="save-password-btn">
                    ${i18n.t('common.save') || 'Запази'}
                  </button>
                  <button type="button" class="btn btn-outline-light w-100" id="cancel-password-btn">
                    ${i18n.t('common.cancel') || 'Отказ'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  render('#app', profileHTML);
  attachProfileEvents();
}

/**
 * Get user initials from name or email
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Attach event listeners
 */
function attachProfileEvents() {
  const profileView = document.getElementById('profile-view');
  const profileEdit = document.getElementById('profile-edit');
  const changePasswordContainer = document.getElementById('change-password-form-container');

  const editBtn = document.getElementById('edit-profile-btn');
  const changePasswordBtn = document.getElementById('change-password-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');

  const editForm = document.getElementById('edit-profile-form');
  const changePasswordForm = document.getElementById('change-password-form');

  const saveProfileBtn = document.getElementById('save-profile-btn');
  const savePasswordBtn = document.getElementById('save-password-btn');

  // Show edit form
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      profileView.classList.add('d-none');
      changePasswordContainer.classList.add('d-none');
      profileEdit.classList.remove('d-none');
    });
  }

  // Show change password form
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      profileView.classList.add('d-none');
      profileEdit.classList.add('d-none');
      changePasswordContainer.classList.remove('d-none');
    });
  }

  // Cancel edit
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      profileEdit.classList.add('d-none');
      profileView.classList.remove('d-none');
    });
  }

  // Cancel change password
  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', () => {
      changePasswordContainer.classList.add('d-none');
      profileView.classList.remove('d-none');
      changePasswordForm.reset();
      changePasswordForm.classList.remove('was-validated');
    });
  }

  // Edit profile form submission
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!editForm.checkValidity()) {
        editForm.classList.add('was-validated');
        return;
      }

      const fullName = document.getElementById('edit-fullName').value;
      const user = authService.getUser();

      saveProfileBtn.disabled = true;
      saveProfileBtn.textContent = i18n.t('common.saving') || 'Запазване...';
      loading.show();

      try {
        // Update profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Refresh profile
        await authService.refreshProfile();

        toast.success(i18n.t('profile.updateSuccess') || 'Профилът е обновен успешно!');

        // Re-render page to show updated data
        setTimeout(() => {
          renderProfile();
        }, 500);
      } catch (error) {
        console.error('Profile update error:', error);
        toast.error(error.message || i18n.t('profile.updateError') || 'Грешка при обновяване');
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = i18n.t('common.save') || 'Запази';
      } finally {
        loading.hide();
      }
    });
  }

  // Change password form submission
  if (changePasswordForm) {
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-new-password');

    // Password match validation
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        if (newPasswordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.setCustomValidity(i18n.t('auth.passwordMismatch') || 'Паролите не съвпадат');
        } else {
          confirmPasswordInput.setCustomValidity('');
        }
      });
    }

    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (newPassword !== confirmPassword) {
        confirmPasswordInput.setCustomValidity(i18n.t('auth.passwordMismatch') || 'Паролите не съвпадат');
        changePasswordForm.classList.add('was-validated');
        return;
      }

      if (!changePasswordForm.checkValidity()) {
        changePasswordForm.classList.add('was-validated');
        return;
      }

      savePasswordBtn.disabled = true;
      savePasswordBtn.textContent = i18n.t('common.saving') || 'Запазване...';
      loading.show();

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        toast.success(i18n.t('profile.passwordChanged') || 'Паролата е сменена успешно!');

        // Return to profile view
        changePasswordContainer.classList.add('d-none');
        profileView.classList.remove('d-none');
        changePasswordForm.reset();
        changePasswordForm.classList.remove('was-validated');
      } catch (error) {
        console.error('Password change error:', error);
        toast.error(error.message || i18n.t('profile.passwordChangeError') || 'Грешка при смяна на парола');
        savePasswordBtn.disabled = false;
        savePasswordBtn.textContent = i18n.t('common.save') || 'Запази';
      } finally {
        loading.hide();
      }
    });
  }
}
