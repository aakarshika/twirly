import { authClient } from '../lib/authClient';
import { apiClient } from '../lib/apiClient';
import { getRedirectUrl } from '../config/auth';

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

function rethrow(err, code) {
  if (err instanceof AuthError) throw err;
  throw new AuthError(err?.message || 'Auth error', code);
}

// Better Auth returns { data, error } from each call. Unwrap to the same shape
// callers used to get from Supabase: { user, session }.
function unwrap(result, code) {
  if (result?.error) throw new AuthError(result.error.message, code);
  return result?.data ?? null;
}

export const authService = {
  async getSession() {
    try {
      const result = await authClient.getSession();
      return unwrap(result, 'SESSION_ERROR');
    } catch (err) {
      rethrow(err, 'SESSION_ERROR');
    }
  },

  async getCurrentUser() {
    try {
      const data = await this.getSession();
      return data?.user ?? null;
    } catch (err) {
      rethrow(err, 'USER_ERROR');
    }
  },

  async signUp(email, password) {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        // Better Auth requires `name` on email sign-up; default to the email
        // localpart so the existing UI (which only collects email+password) keeps working.
        name: email.split('@')[0],
      });
      return unwrap(result, 'SIGNUP_ERROR');
    } catch (err) {
      rethrow(err, 'SIGNUP_ERROR');
    }
  },

  async signIn(email, password) {
    try {
      const result = await authClient.signIn.email({ email, password });
      return unwrap(result, 'SIGNIN_ERROR');
    } catch (err) {
      rethrow(err, 'SIGNIN_ERROR');
    }
  },

  async signInWithGoogle() {
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: getRedirectUrl(),
      });
      return unwrap(result, 'GOOGLE_SIGNIN_ERROR');
    } catch (err) {
      rethrow(err, 'GOOGLE_SIGNIN_ERROR');
    }
  },

  async signOut() {
    try {
      const result = await authClient.signOut();
      return unwrap(result, 'SIGNOUT_ERROR');
    } catch (err) {
      rethrow(err, 'SIGNOUT_ERROR');
    }
  },

  async resetPassword(email) {
    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: getRedirectUrl(),
      });
      return unwrap(result, 'RESET_PASSWORD_ERROR');
    } catch (err) {
      rethrow(err, 'RESET_PASSWORD_ERROR');
    }
  },

  /**
   * Mobile deep-link OAuth callback. Better Auth handles OAuth via its server-side
   * callback URL, so on web there is nothing to do here. Native handling is wired
   * in a later sprint when the Capacitor deep-link flow is reworked.
   */
  async handleAuthCallback(_url) {
    return null;
  },

  /**
   * Subscribe to session changes. Better Auth's React `useSession()` is the
   * preferred path (used by `useAuthHook`); this shim only exists so legacy
   * non-React callers keep compiling. Returns the Supabase-shaped subscription
   * object the old API exposed.
   */
  onAuthStateChange(_callback) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  /**
   * Loads `user_preferences` for the given user. The table is added in Sprint 12;
   * until then this resolves to null so consumers handle "no prefs yet" gracefully.
   */
  async getUserPreferences(_userId) {
    try {
      const { data } = await apiClient.get('/users/me/preferences');
      return data?.data ?? null;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      return null;
    }
  },
};
