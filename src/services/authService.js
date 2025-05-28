import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export const authService = {
  // Sign up with email and password
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('Starting Google sign in...');
      
      // Check if we're running in a native app
      const isNative = Capacitor.isNativePlatform();
      console.error('Is native platform:', isNative);
      console.error('Platform:', Capacitor.getPlatform());
      
      // Get the current URL for web fallback
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log('Current URL:', currentUrl);
      
      // Configure OAuth options
      const options = {
        provider: 'google',
        options: {
          redirectTo: isNative ? 'twirly://auth/callback' : `${currentUrl}/auth/v1/callback`,
          queryParams: {
            redirect_to: isNative ? 'twirly://' : `${currentUrl}/`
          },
          skipBrowserRedirect: isNative,
          flowType: 'pkce'
        }
      };
      
      console.log('OAuth options:', options);

      // Start the OAuth flow
      console.log('Calling Supabase OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth(options);
      
      console.log('OAuth response:', { data, error });
      
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (isNative && data?.url) {
        console.log('Opening browser with URL:', data.url);
        await Browser.open({ url: data.url });
      }
      
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  async deleteUser() {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user.id,
        false
      );
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },
}; 