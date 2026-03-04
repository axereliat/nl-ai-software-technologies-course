/**
 * Admin Users Management page
 */

import { i18n } from '../../services/i18n.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';
import { supabase } from '../../config/supabase.js';

/**
 * Render admin users page
 */
export async function renderAdminUsers() {
  // Check admin access
  if (!authService.isAdmin()) {
    toast.error('Нямате достъп до тази страница');
    router.navigate('/');
    return;
  }

  loading.show();

  try {
    // Fetch all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const usersHTML = `
      <div>
        <!-- Hero Section -->
        <section class="about-hero text-white py-4">
          <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h1 class="display-4 fw-bold text-accent mb-3">
                  Управление на потребители
                </h1>
                <a href="/admin" data-link class="text-muted text-decoration-none">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="me-1">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                  </svg>
                  Назад към панела
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Add User Section -->
        <section class="bg-secondary py-5">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="admin-card mb-5">
                  <h2 class="h4 text-accent mb-4">Добави нов потребител</h2>
                  <form id="add-user-form" class="needs-validation" novalidate>
                    <div class="row g-3">
                      <!-- Email -->
                      <div class="col-md-6">
                        <label for="user-email" class="form-label text-white">Имейл</label>
                        <input
                          type="email"
                          class="form-control bg-dark text-white border-secondary"
                          id="user-email"
                          required
                        >
                        <div class="invalid-feedback">
                          Моля въведете валиден имейл
                        </div>
                      </div>

                      <!-- Password -->
                      <div class="col-md-6">
                        <label for="user-password" class="form-label text-white">Парола</label>
                        <input
                          type="password"
                          class="form-control bg-dark text-white border-secondary"
                          id="user-password"
                          required
                          minlength="6"
                        >
                        <div class="invalid-feedback">
                          Паролата трябва да е поне 6 символа
                        </div>
                      </div>

                      <!-- Full Name -->
                      <div class="col-md-6">
                        <label for="user-fullname" class="form-label text-white">Име и фамилия</label>
                        <input
                          type="text"
                          class="form-control bg-dark text-white border-secondary"
                          id="user-fullname"
                          required
                        >
                        <div class="invalid-feedback">
                          Моля въведете име и фамилия
                        </div>
                      </div>

                      <!-- Role -->
                      <div class="col-md-6">
                        <label for="user-role" class="form-label text-white">
                          Роля
                          <span class="text-muted small">Моля, попълнете това поле.</span>
                        </label>
                        <select
                          class="form-select bg-dark text-white border-secondary"
                          id="user-role"
                          required
                        >
                          <option value="" selected disabled>Изберете роля</option>
                          <option value="user">Потребител</option>
                          <option value="instructor">Инструктор</option>
                          <option value="admin">Администратор</option>
                        </select>
                        <div class="invalid-feedback">
                          Моля изберете роля
                        </div>
                      </div>

                      <!-- Submit Button -->
                      <div class="col-12">
                        <button type="submit" class="btn btn-warning btn-lg w-100" id="add-user-btn">
                          Добави
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Users List Section -->
        <section class="bg-dark py-5">
          <div class="container">
            <h2 class="h4 text-accent mb-4">Всички потребители (${users.length})</h2>
            <div class="admin-table">
              <div class="table-responsive">
                <table class="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>Име</th>
                      <th>Имейл</th>
                      <th>Роля</th>
                      <th>Създаден на</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(user => `
                      <tr>
                        <td>${user.full_name || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>
                          <span class="badge ${getRoleBadgeClass(user.role)}">
                            ${translateRole(user.role)}
                          </span>
                        </td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                          <button class="btn btn-sm btn-outline-warning change-role-btn" data-user-id="${user.id}" data-current-role="${user.role}">
                            Смени роля
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    render('#app', usersHTML);
    attachUserEvents();
  } catch (error) {
    console.error('Error loading users:', error);
    toast.error('Грешка при зареждане на потребителите');
  } finally {
    loading.hide();
  }
}

/**
 * Get role badge class
 */
function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin':
      return 'bg-danger';
    case 'instructor':
      return 'bg-warning text-dark';
    case 'user':
    default:
      return 'bg-secondary';
  }
}

/**
 * Translate role
 */
function translateRole(role) {
  switch (role) {
    case 'admin':
      return 'Администратор';
    case 'instructor':
      return 'Инструктор';
    case 'user':
    default:
      return 'Потребител';
  }
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('bg-BG', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Attach event listeners
 */
function attachUserEvents() {
  const form = document.getElementById('add-user-form');
  const addBtn = document.getElementById('add-user-btn');

  // Add user form
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const email = document.getElementById('user-email').value;
      const password = document.getElementById('user-password').value;
      const fullName = document.getElementById('user-fullname').value;
      const role = document.getElementById('user-role').value;

      addBtn.disabled = true;
      addBtn.textContent = 'Добавяне...';
      loading.show();

      try {
        // Create user via Supabase Auth Admin API
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName
          }
        });

        if (authError) throw authError;

        // Update profile with role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: role,
            full_name: fullName,
            email: email
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        toast.success('Потребителят е добавен успешно!');
        form.reset();
        form.classList.remove('was-validated');

        // Reload page to show new user
        setTimeout(() => {
          renderAdminUsers();
        }, 1000);
      } catch (error) {
        console.error('Add user error:', error);
        toast.error(error.message || 'Грешка при добавяне на потребител');
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Добави';
        loading.hide();
      }
    });
  }

  // Change role buttons
  document.querySelectorAll('.change-role-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.getAttribute('data-user-id');
      const currentRole = btn.getAttribute('data-current-role');

      // Show role selection prompt
      const newRole = prompt(`Изберете нова роля (user/instructor/admin). Текуща роля: ${currentRole}`);

      if (!newRole || !['user', 'instructor', 'admin'].includes(newRole)) {
        toast.error('Невалидна роля');
        return;
      }

      loading.show();

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);

        if (error) throw error;

        toast.success('Ролята е променена успешно!');
        renderAdminUsers();
      } catch (error) {
        console.error('Change role error:', error);
        toast.error('Грешка при смяна на ролята');
      } finally {
        loading.hide();
      }
    });
  });
}
