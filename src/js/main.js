/**
 * Main application entry point
 * Initializes all services and sets up routing
 */

import { router } from './router.js';
import { authService } from './services/auth.js';
import { i18n } from './services/i18n.js';
import { state } from './services/state.js';
import { initHeader } from './components/layout/Header.js';
import { initFooter } from './components/layout/Footer.js';
import { loading } from './components/ui/Loading.js';
import { toast } from './components/ui/Toast.js';

// Import pages
import { renderHome } from './pages/Home.js';
import { renderAbout } from './pages/About.js';
import { renderContact } from './pages/Contact.js';
import { renderLogin } from './pages/Login.js';
import { renderRegister } from './pages/Register.js';
import { renderProfile } from './pages/Profile.js';
import { renderSchedule } from './pages/Schedule.js';
import { renderMartialArtDetail } from './pages/MartialArtDetail.js';
import { renderAdminDashboard } from './pages/admin/Dashboard.js';
import { renderAdminUsers } from './pages/admin/Users.js';
import { renderAdminMartialArts } from './pages/admin/MartialArts.js';
import { renderMartialArtForm } from './pages/admin/MartialArtForm.js';
import { renderAdminClasses } from './pages/admin/Classes.js';
import { renderClassForm } from './pages/admin/ClassForm.js';
import { renderAdminInstructors } from './pages/admin/Instructors.js';
import { renderInstructorForm } from './pages/admin/InstructorForm.js';

/**
 * Initialize the application
 */
async function initApp() {
  try {
    // Show loading overlay
    loading.show();

    // Initialize i18n
    await i18n.init();
    console.log('✓ i18n initialized');

    // Initialize auth
    await authService.initAuth();
    console.log('✓ Auth initialized');

    // Initialize layout components
    initHeader();
    initFooter();
    console.log('✓ Layout initialized');

    // Register routes
    registerRoutes();
    console.log('✓ Routes registered');

    // Add navigation guards
    addGuards();
    console.log('✓ Guards added');

    // Initialize router
    router.init();
    console.log('✓ Router initialized');

    // Navigate to current path
    const currentPath = window.location.pathname;
    await router.navigate(currentPath);

    // Hide loading overlay
    loading.hide();

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing application:', error);
    loading.hide();
    toast.error('Failed to initialize application. Please refresh the page.');
  }
}

/**
 * Register all routes
 */
function registerRoutes() {
  // Public routes
  router.route('/', renderHome);
  router.route('/about', renderAbout);
  router.route('/contact', renderContact);
  router.route('/schedule', renderSchedule);
  router.route('/login', renderLogin);
  router.route('/register', renderRegister);

  // Protected routes
  router.route('/profile', renderProfile, { requiresAuth: true });

  // Admin routes
  router.route('/admin', renderAdminDashboard, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/users', renderAdminUsers, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/martial-arts', renderAdminMartialArts, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/martial-arts/new', renderMartialArtForm, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/martial-arts/:id/edit', renderMartialArtForm, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/classes', renderAdminClasses, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/classes/new', renderClassForm, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/classes/:id/edit', renderClassForm, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/instructors', renderAdminInstructors, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/instructors/new', renderInstructorForm, { requiresAuth: true, requiresAdmin: true });
  router.route('/admin/instructors/:id/edit', renderInstructorForm, { requiresAuth: true, requiresAdmin: true });

  // Martial arts routes
  router.route('/martial-arts/:id', renderMartialArtDetail);
}

/**
 * Add navigation guards
 */
function addGuards() {
  router.addGuard(async (toPath) => {
    const route = router.matchRoute(toPath);

    if (!route) {
      return { allowed: true };
    }

    const { meta } = route;

    // Check if route requires authentication
    if (meta.requiresAuth) {
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated) {
        toast.warning('Please log in to access this page');
        return { redirect: '/login' };
      }
    }

    // Check if route requires admin
    if (meta.requiresAdmin) {
      const isAdmin = authService.isAdmin();

      if (!isAdmin) {
        toast.error('You do not have permission to access this page');
        return { redirect: '/' };
      }
    }

    return { allowed: true };
  });
}

/**
 * Create a placeholder page renderer
 * @param {string} title - Page title
 * @returns {Function}
 */
function renderPlaceholder(title) {
  return async (params = {}) => {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="container py-5">
          <div class="text-center">
            <h1 class="display-4 text-accent mb-4">${title}</h1>
            <p class="text-muted mb-4">This page is under construction.</p>
            ${params.id ? `<p class="text-muted">ID: ${params.id}</p>` : ''}
            <a href="/" data-link class="btn btn-warning">Go Home</a>
          </div>
        </div>
      `;
    }
  };
}

/**
 * Handle global errors
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

/**
 * Start the application
 */
initApp();