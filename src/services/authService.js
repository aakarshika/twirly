import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { updateUserProfile } from './users';
import { getRedirectUrl, isNativePlatform } from '../config/auth';

// Create a service role client for admin operations
const supabaseAdmin = supabase.auth.admin;

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const authService = {
  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw new AuthError(error.message, 'SESSION_ERROR');
      return session;
    } catch (error) {
      throw new AuthError(error.message, 'SESSION_ERROR');
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw new AuthError(error.message, 'USER_ERROR');
      return user;
    } catch (error) {
      throw new AuthError(error.message, 'USER_ERROR');
    }
  },

  // Sign up with email and password
  async signUp(email, password) {
    try {
      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo
        }
      });
      if (error) throw new AuthError(error.message, 'SIGNUP_ERROR');
      return data;
    } catch (error) {
      throw new AuthError(error.message, 'SIGNUP_ERROR');
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new AuthError(error.message, 'SIGNIN_ERROR');
      return data;
    } catch (error) {
      throw new AuthError(error.message, 'SIGNIN_ERROR');
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const isNative = isNativePlatform();
      const redirectTo = getRedirectUrl();

      // Set up app URL open listener for handling the callback
      if (isNative) {
        App.addListener('appUrlOpen', async ({ url }) => {
          if (url.includes('auth/callback')) {
            const params = new URLSearchParams(url.split('#')[1]);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            
            if (access_token && refresh_token) {
              const { data: { session }, error } = await supabase.auth.setSession({
                access_token,
                refresh_token
              });
              
              if (error) throw new AuthError(error.message, 'GOOGLE_SIGNIN_ERROR');
              return session;
            }
          }
        });
      }
      
      const options = {
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          flowType: 'pkce'
        }
      };

      const { data, error } = await supabase.auth.signInWithOAuth(options);
      
      if (error) throw new AuthError(error.message, 'GOOGLE_SIGNIN_ERROR');

      if (isNative && data?.url) {
        if (Capacitor.getPlatform() === 'ios') {
          window.open(data.url, '_system');
        } else {
          await Browser.open({ 
            url: data.url,
            presentationStyle: 'fullscreen'
          });
        }
      }
      
      return data;
    } catch (error) {
      throw new AuthError(error.message, 'GOOGLE_SIGNIN_ERROR');
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new AuthError(error.message, 'SIGNOUT_ERROR');
    } catch (error) {
      throw new AuthError(error.message, 'SIGNOUT_ERROR');
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) throw new AuthError(error.message, 'RESET_PASSWORD_ERROR');
      return data;
    } catch (error) {
      throw new AuthError(error.message, 'RESET_PASSWORD_ERROR');
    }
  },

  // Delete user account
  async deleteUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthError('No user found', 'DELETE_USER_ERROR');
      
      const { error } = await supabase.auth.admin.deleteUser(user.id, false);
      if (error) throw new AuthError(error.message, 'DELETE_USER_ERROR');
    } catch (error) {
      throw new AuthError(error.message, 'DELETE_USER_ERROR');
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}; 