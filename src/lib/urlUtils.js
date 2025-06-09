import { Capacitor } from '@capacitor/core';

/**
 * Gets the current URL, handling both web and native platforms
 * @returns {string} The current URL
 */
export const getCurrentUrl = () => {
  // For native platforms, we need to construct the URL manually
  if (Capacitor.isNativePlatform()) {
    const path = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Use your production URL here
    const baseUrl = import.meta.env.VITE_BASE_URL;
    
    return `${baseUrl}${path}${search}${hash}`;
  }
  
  // For web platform, use the current URL
  return window.location.href;
};

/**
 * Gets the current path, handling both web and native platforms
 * @returns {string} The current path
 */
export const getCurrentPath = () => {
  return window.location.pathname;
};

/**
 * Gets the current search params, handling both web and native platforms
 * @returns {URLSearchParams} The current search params
 */
export const getCurrentSearchParams = () => {
  return new URLSearchParams(window.location.search);
}; 