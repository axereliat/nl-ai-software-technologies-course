/**
 * Login page
 */

import { i18n } from '../services/i18n.js';
import { authService } from '../services/auth.js';
import { router } from '../router.js';
import { render } from '../utils/dom.js';
import { toast } from '../components/ui/Toast.js';
import { loading } from '../components/ui/Loading.js';

/**
 * Render login page
 */
export async function renderLogin() {
  const loginHTML = `
    <div>
      <!-- Hero Section -->
      <section class="about-hero text-white py-5">
        <div class="container text-center py-5">
          <h1 class="display-3 fw-bold text-accent mb-3">
            ${i18n.t('auth.login') || 'Вход'}
          </h1>
        </div>
      </section>

      <!-- Login Form Section -->
      <section class="bg-dark py-5">
        <div class="container py-4">
          <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
              <div class="auth-card">
                <form id="login-form" class="needs-validation" novalidate>
                  <!-- Email -->
                  <div class="mb-4">
                    <label for="email" class="form-label text-white">${i18n.t('auth.email') || 'Имейл'}</label>
                    <input
                      type="email"
                      class="form-control form-control-lg bg-secondary text-white border-0"
                      id="email"
                      name="email"
                      required
                      autocomplete="email"
                    >
                    <div class="invalid-feedback" id="email-error">
                      Моля въведете валиден имейл адрес
                    </div>
                  </div>

                  <!-- Password -->
                  <div class="mb-4">
                    <label for="password" class="form-label text-white">${i18n.t('auth.password') || 'Парола'}</label>
                    <input
                      type="password"
                      class="form-control form-control-lg bg-secondary text-white border-0"
                      id="password"
                      name="password"
                      required
                      autocomplete="current-password"
                    >
                    <div class="invalid-feedback" id="password-error">
                      Моля въведете вашата парола
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button type="submit" class="btn btn-warning btn-lg w-100" id="login-btn">
                    ${i18n.t('auth.login') || 'Вход'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  render('#app', loginHTML);
  attachLoginEvents();
}

/**
 * Attach event listeners
 */
function attachLoginEvents() {
  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  // Custom validation messages for email
  if (emailInput && emailError) {
    emailInput.addEventListener('invalid', (e) => {
      e.preventDefault();
      if (emailInput.validity.valueMissing) {
        emailError.textContent = 'Моля въведете имейл адрес';
      } else if (emailInput.validity.typeMismatch) {
        emailError.textContent = 'Моля въведете валиден имейл адрес';
      }
    });

    emailInput.addEventListener('input', () => {
      emailInput.setCustomValidity('');
      emailError.textContent = 'Моля въведете валиден имейл адрес';
    });
  }

  // Custom validation messages for password
  if (passwordInput && passwordError) {
    passwordInput.addEventListener('invalid', (e) => {
      e.preventDefault();
      if (passwordInput.validity.valueMissing) {
        passwordError.textContent = 'Моля въведете вашата парола';
      }
    });

    passwordInput.addEventListener('input', () => {
      passwordInput.setCustomValidity('');
    });
  }

  // Email/Password Login
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const email = emailInput.value;
      const password = passwordInput.value;

      loginBtn.disabled = true;
      loginBtn.textContent = i18n.t('auth.loggingIn') || 'Влизане...';
      loading.show();

      try {
        const { error } = await authService.signIn(email, password);

        if (error) {
          throw error;
        }

        toast.success(i18n.t('auth.loginSuccess') || 'Успешен вход!');
        router.navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        toast.error(error.message || i18n.t('auth.invalidCredentials') || 'Грешен имейл или парола');
        loginBtn.disabled = false;
        loginBtn.textContent = i18n.t('auth.login') || 'Вход';
      } finally {
        loading.hide();
      }
    });
  }
}
