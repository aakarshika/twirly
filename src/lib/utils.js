import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

/**
 * Combines multiple class names, resolving Tailwind CSS conflicts using tailwind-merge
 * 
 * @param {...string} inputs - Class names or conditional class expressions
 * @returns {string} - Merged class string with resolved Tailwind conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date as a string
 * 
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(
    'en-US',
    { ...defaultOptions, ...options }
  ).format(new Date(date));
}

/**
 * Truncate a string to a specified length with ellipsis
 * 
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} - Truncated string
 */
export function truncate(str, length) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Generate a random ID
 * 
 * @param {number} length - Length of the ID
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Calculate the average of an array of numbers
 * 
 * @param {Array<number>} values - Array of numbers
 * @returns {number} - Average value
 */
export function calculateAverage(values) {
  if (!values || !values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Create a delay using Promise
 * 
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an object is empty
 * 
 * @param {Object} obj - Object to check
 * @returns {boolean} - Whether the object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone an object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get the top-rated metric from a metrics object
 * 
 * @param {Object} metrics - Metrics object with key-value pairs
 * @returns {Object|null} - Object with name and value of the top metric
 */
export function getTopMetric(metrics) {
  if (!metrics || Object.keys(metrics).length === 0) {
    return null;
  }
  
  const entries = Object.entries(metrics);
  const [topName, topValue] = entries.reduce(
    (highest, current) => current[1] > highest[1] ? current : highest,
    entries[0]
  );
  
  return { name: topName, value: topValue };
}

export function getPublicUrlItems(filePath) {
  if (!filePath) return null;
  const { data: { publicUrl } } = supabase.storage
    .from('product-pics')
    .getPublicUrl(filePath);
  return publicUrl;
}
export function getPublicUrl(filePath) {
  if (!filePath) return null;
  const { data: { publicUrl } } = supabase.storage
    .from('profile-pics')
    .getPublicUrl(filePath);
  return publicUrl;
}
//function to split text by _ and join with a space with first letter uppercase
export function splitAndJoin(text) {
  return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function randomPastelColor() {
  const r = Math.floor(128 + Math.random() * 127);
  const g = Math.floor(128 + Math.random() * 127);
  const b = Math.floor(128 + Math.random() * 127);
  return `rgb(${r}, ${g}, ${b})`;
}
// get random pastel color in hex
export function randomPastelColorHex() {
  const r = Math.floor(128 + Math.random() * 127);
  const g = Math.floor(128 + Math.random() * 127);
  const b = Math.floor(128 + Math.random() * 127);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


export function getRGB(color) {
  
  //detect and convert hex to rgb:
  const isHexColor = /^(#|0x)[0-9A-Fa-f]+$/.test(color);
  //convert hex to rgb(r,g,b) where r,g,b are numbers between 0 and 255
  const rgbc = isHexColor ? `rgb(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)})` : color;

  return rgbc;
}


export function changeColorAlpha(c, amount) {
  const color = getRGB(c);
  return color.substring(0, color.length - 1) + ', '+ amount + ')';
}

//how to darken an rgb color by some percentage? it should add more black to the color. 
export function darkenColor(c, amount) {
  const color = getRGB(c).substring(4, getRGB(c).length - 1);
  const [r, g, b] = color.split(',').map(Number);
  const newR = Math.max(0, Math.min(255, r - amount));
  const newG = Math.max(0, Math.min(255, g - amount));
  const newB = Math.max(0, Math.min(255, b - amount));
  console.log("old", r, g, b);
  console.log("new", newR, newG, newB);
  return `rgb(${newR}, ${newG}, ${newB})`;
}
