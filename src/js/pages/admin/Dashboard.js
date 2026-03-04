/**
 * Admin Dashboard page
 */

import { i18n } from '../../services/i18n.js';
import { dataService } from '../../services/data.js';
import { authService } from '../../services/auth.js';
import { router } from '../../router.js';
import { render } from '../../utils/dom.js';
import { toast } from '../../components/ui/Toast.js';
import { loading } from '../../components/ui/Loading.js';

/**
 * Render admin dashboard
 */
export async function renderAdminDashboard() {
  console.log('Rendering admin dashboard...');

  // Check if user is logged in
  const user = authService.getUser();
  const profile = authService.getProfile();

  console.log('User:', user);
  console.log('Profile:', profile);
  console.log('Is admin:', authService.isAdmin());

  // Check admin access
  if (!authService.isAdmin()) {
    console.warn('Access denied: User is not admin');
    toast.error('Нямате достъп до тази страница. Моля влезте като администратор.');

    // Show login prompt
    const accessDeniedHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">Достъп отказан</h1>
        <p class="text-white mb-4">Тази страница е достъпна само за администратори.</p>
        <a href="/login" data-link class="btn btn-warning">Вход</a>
      </div>
    `;
    render('#app', accessDeniedHTML);
    return;
  }

  loading.show();

  let stats = {
    newSubmissions: 0,
    totalClasses: 0,
    totalInstructors: 0,
    totalMartialArts: 0,
    totalUsers: 0
  };

  try {
    // Try to fetch dashboard stats
    try {
      stats = await dataService.getStats();
      console.log('Dashboard stats loaded:', stats);
    } catch (statsError) {
      console.warn('Failed to load stats, using defaults:', statsError);
      // Continue with default stats
    }

    const dashboardHTML = `
      <div>
        <!-- Admin Panel -->
        <section class="bg-dark py-5">
          <div class="container py-4">
            <h1 class="h2 text-white mb-5">Админ панел</h1>

            <!-- Stats Cards -->
            <div class="row g-4 mb-5">
              <div class="col-md-4">
                <div class="stat-card-new stat-card-red">
                  <p class="stat-label-new mb-2">Нови съобщения</p>
                  <h2 class="stat-value-new mb-0">${stats.newSubmissions || 0}</h2>
                </div>
              </div>

              <div class="col-md-4">
                <div class="stat-card-new stat-card-blue">
                  <p class="stat-label-new mb-2">Общо тренировки</p>
                  <h2 class="stat-value-new mb-0">${stats.totalClasses || 0}</h2>
                </div>
              </div>

              <div class="col-md-4">
                <div class="stat-card-new stat-card-green">
                  <p class="stat-label-new mb-2">Общо инструктори</p>
                  <h2 class="stat-value-new mb-0">${stats.totalInstructors || 0}</h2>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="row mb-4">
              <div class="col-12">
                <h2 class="h4 text-white mb-4">Бързи връзки</h2>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6 col-lg-3">
                <a href="/admin/martial-arts" data-link class="quick-link-btn">
                  Управление на бойни изкуства
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a href="/admin/classes" data-link class="quick-link-btn">
                  Управление на тренировки
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a href="/admin/instructors" data-link class="quick-link-btn">
                  Управление на инструктори
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a href="/" data-link class="quick-link-btn">
                  Преглед на сайта
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    render('#app', dashboardHTML);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    toast.error(i18n.t('admin.loadError') || 'Грешка при зареждане на данните');

    const errorHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">${i18n.t('admin.dashboard') || 'Администраторски Панел'}</h1>
        <p class="text-muted">${i18n.t('admin.loadError') || 'Грешка при зареждане на данните'}</p>
      </div>
    `;
    render('#app', errorHTML);
  } finally {
    loading.hide();
  }
}
