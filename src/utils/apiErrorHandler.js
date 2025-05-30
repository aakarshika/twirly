import * as Sentry from '@sentry/react';
import { toast } from 'sonner';

export const handleApiError = (error, context = '') => {
  // Log to Sentry
  Sentry.captureException(error, {
    extra: {
      context,
      url: error.config?.url,
      method: error.config?.method,
    },
  });

  // Handle different types of errors
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    switch (status) {
      case 401:
        toast.error('Please log in to continue');
        // Redirect to login if needed
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('The requested resource was not found');
        break;
      case 429:
        toast.error('Too many requests. Please try again later');
        break;
      case 500:
        toast.error('Server error. Please try again later');
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // Request made but no response
    toast.error('Network error. Please check your connection');
  } else {
    // Other errors
    toast.error('An unexpected error occurred');
  }

  return Promise.reject(error);
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
}; 