import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

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
      console.log('Is native platform:', isNative);
      console.log('Platform:', Capacitor.getPlatform());
      
      // Get the current URL for web fallback
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      console.log('Current URL:', currentUrl);

      // Set up app URL open listener for handling the callback
      if (isNative) {
        App.addListener('appUrlOpen', async ({ url }) => {
          console.log('App URL opened:', url);
          
          if (url.includes('auth/callback')) {
            // Extract the tokens from the URL
            const params = new URLSearchParams(url.split('#')[1]);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            
            if (access_token && refresh_token) {
              console.log('Got tokens from URL, setting session...');
              const { data: { session }, error } = await supabase.auth.setSession({
                access_token,
                refresh_token
              });
              
              if (error) {
                console.error('Error setting session:', error);
                throw error;
              }
              
              console.log('Session set successfully:', session);
              return session;
            }
          }
        });
      }
      
      // Configure OAuth options
      const options = {
        provider: 'google',
        options: {
          redirectTo: isNative ? 'twirly://auth/callback' : `${currentUrl}/auth/callback`,
          skipBrowserRedirect: isNative,
          flowType: 'pkce'
        }
      };
      
      console.log('OAuth options:', options);

      // Start the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth(options);
      
      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      if (isNative && data?.url) {
        console.log('Opening browser with URL:', data.url);
        // Use window.open for iOS to open in system browser
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