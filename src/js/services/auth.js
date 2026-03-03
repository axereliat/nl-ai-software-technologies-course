/**
 * Authentication service
 * Replaces React's AuthContext with state management integration
 */

import { supabase } from '../config/supabase.js';
import { state } from './state.js';

class AuthService {
  constructor() {
    this.authSubscription = null;
  }

  /**
   * Initialize authentication
   * Sets up auth state listener and checks for existing session
   */
  async initAuth() {
    state.set('loading', true);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event, currentSession?.user?.email);

        if (currentSession?.user) {
          state.set('user', currentSession.user);
          state.set('session', currentSession);

          // Fetch profile with slight delay to avoid potential Supabase deadlock
          setTimeout(async () => {
            await this.fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          state.set('user', null);
          state.set('session', null);
          state.set('profile', null);
        }

        state.set('loading', false);
      }
    );

    this.authSubscription = subscription;

    // Get initial session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    console.log('Initial session check:', currentSession?.user?.email || 'no session');

    if (currentSession?.user) {
      state.set('session', currentSession);
      state.set('user', currentSession.user);
      await this.fetchProfile(currentSession.user.id);
    }

    state.set('loading', false);
  }

  /**
   * Fetch user profile from database
   * @param {string} userId - User ID
   */
  async fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      state.set('profile', data);
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }

  /**
   * Refresh current user's profile
   */
  async refreshProfile() {
    const user = state.get('user');
    if (user?.id) {
      await this.fetchProfile(user.id);
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{error: Error|null}>}
   */
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullName - User full name
   * @returns {Promise<{error: Error|null}>}
   */
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    return { data, error };
  }

  /**
   * Sign in with GitHub
   * @returns {Promise<{error: Error|null}>}
   */
  async signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    return { error };
  }

  /**
   * Sign in with Google
   * @returns {Promise<{error: Error|null}>}
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });

    return { error };
  }

  /**
   * Sign out current user
   */
  async signOut() {
    await supabase.auth.signOut();
  }

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  isAdmin() {
    const profile = state.get('profile');
    return profile?.role === 'admin';
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return state.get('user') !== null;
  }

  /**
   * Get current user
   * @returns {Object|null}
   */
  getUser() {
    return state.get('user');
  }

  /**
   * Get current user profile
   * @returns {Object|null}
   */
  getProfile() {
    return state.get('profile');
  }

  /**
   * Get current session
   * @returns {Object|null}
   */
  getSession() {
    return state.get('session');
  }

  /**
   * Cleanup auth subscription
   */
  cleanup() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}

// Export singleton instance
export const authService = new AuthService();