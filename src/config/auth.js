import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const getPlatform = () => Capacitor.getPlatform();

const REDIRECT_URLS = {
  web: import.meta.env.VITE_WEB_REDIRECT_URL || 'http://localhost:3000/auth/callback',
  ios: import.meta.env.VITE_IOS_REDIRECT_URL || 'https://twirlyapp.com/auth/callback',
  android: import.meta.env.VITE_ANDROID_REDIRECT_URL || 'https://twirlyapp.com/auth/callback'
};

export const getRedirectUrl = () => {
  const platform = getPlatform();
  return REDIRECT_URLS[platform];
}; 