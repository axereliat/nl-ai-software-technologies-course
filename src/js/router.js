/**
 * Custom router implementation using History API
 * Supports dynamic routes, guards, and browser navigation
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.guards = [];
    this.currentRoute = null;
    this.params = {};
  }

  /**
   * Register a route
   * @param {string} path - Route path (e.g., '/', '/martial-arts/:id')
   * @param {Function} handler - Function to call when route matches
   * @param {Object} meta - Optional metadata (e.g., { requiresAuth: true, requiresAdmin: true })
   */
  route(path, handler, meta = {}) {
    this.routes.set(path, { handler, meta, pattern: this.pathToRegex(path) });
  }

  /**
   * Add a navigation guard
   * @param {Function} guardFn - Function that receives (to, from) and returns { allowed: true } or { redirect: '/path' }
   */
  addGuard(guardFn) {
    this.guards.push(guardFn);
  }

  /**
   * Convert path pattern to regex
   * @param {string} path - Route path with optional :params
   * @returns {RegExp}
   */
  pathToRegex(path) {
    // Escape special regex characters except :
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '(?<$1>[^/]+)');

    return new RegExp(`^${pattern}$`);
  }

  /**
   * Match current path against routes
   * @param {string} path - Path to match
   * @returns {Object|null} - Matched route with params
   */
  matchRoute(path) {
    for (const [routePath, route] of this.routes) {
      const match = path.match(route.pattern);

      if (match) {
        // Extract params from named groups
        const params = match.groups || {};

        return {
          path: routePath,
          handler: route.handler,
          meta: route.meta,
          params
        };
      }
    }

    return null;
  }

  /**
   * Navigate to a path
   * @param {string} path - Path to navigate to
   * @param {Object} data - Optional state data
   */
  async navigate(path, data = {}) {
    // Run guards
    for (const guard of this.guards) {
      const result = await guard(path, this.currentRoute);

      if (result.redirect) {
        path = result.redirect;
      } else if (!result.allowed) {
        console.warn('Navigation blocked by guard');
        return;
      }
    }

    // Match route
    const matchedRoute = this.matchRoute(path);

    if (!matchedRoute) {
      console.warn(`No route found for path: ${path}`);
      this.render404();
      return;
    }

    // Update history
    if (window.location.pathname !== path) {
      window.history.pushState(data, '', path);
    }

    // Update current route and params
    this.currentRoute = path;
    this.params = matchedRoute.params;

    // Dispatch route change event for components that need to update
    window.dispatchEvent(new CustomEvent('routechange', { detail: { path } }));

    // Call route handler
    try {
      await matchedRoute.handler(matchedRoute.params);
    } catch (error) {
      console.error('Error rendering route:', error);
      this.render404();
    }
  }

  /**
   * Replace current history entry
   * @param {string} path - Path to replace with
   * @param {Object} data - Optional state data
   */
  replace(path, data = {}) {
    window.history.replaceState(data, '', path);
    this.navigate(path, data);
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward();
  }

  /**
   * Render 404 page
   */
  render404() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="container py-5 text-center">
          <h1 class="display-1 text-accent">404</h1>
          <h2 class="mb-4">Page Not Found</h2>
          <p class="text-muted mb-4">The page you're looking for doesn't exist.</p>
          <a href="/" data-link class="btn btn-warning">Go Home</a>
        </div>
      `;
    }
  }

  /**
   * Initialize router and set up event listeners
   */
  init() {
    // Handle popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });

    // Handle all link clicks
    document.addEventListener('click', (e) => {
      // Check if clicked element or parent has data-link attribute
      const link = e.target.closest('[data-link]');

      if (link && link.tagName === 'A') {
        e.preventDefault();
        const href = link.getAttribute('href');

        if (href && href !== window.location.pathname) {
          this.navigate(href);
        }
      }
    });

    console.log('Router initialized');
  }

  /**
   * Get current route params
   * @returns {Object}
   */
  getParams() {
    return this.params;
  }

  /**
   * Get current route path
   * @returns {string}
   */
  getCurrentPath() {
    return this.currentRoute;
  }
}

// Export singleton instance
export const router = new Router();