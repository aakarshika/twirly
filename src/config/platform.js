import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  if (Capacitor.getPlatform() === 'ios') return 'ios';
  if (Capacitor.getPlatform() === 'android') return 'android';
  return 'web';
}; 