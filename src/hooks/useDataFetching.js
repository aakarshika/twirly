import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export const useDataFetching = (key, fetchFunction, dependencies = [], options = {}) => {
  const { setLoading, setError, clearError, clearLoading, isLoading, getError } = useLoading();
  const { 
    useGlobalLoading = false, 
    loadingMessage = 'Loading Comparison...',
    useGlobalError = false,
    retryFunction = null
  } = options;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useGlobalLoading) {
          setLoading('global', true, loadingMessage);
        } else {
          setLoading(key, true);
        }
        clearError(key);
        await fetchFunction();
      } catch (error) {
        if (useGlobalError) {
          setError('global', error.message || 'An error occurred', retryFunction);
        } else {
          setError(key, error.message || 'An error occurred');
        }
      } finally {
        if (useGlobalLoading) {
          setLoading('global', false);
        } else {
          setLoading(key, false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (useGlobalLoading) {
        clearLoading('global');
      } else {
        clearLoading(key);
      }
      if (useGlobalError) {
        clearError('global');
      } else {
        clearError(key);
      }
    };
  }, [...dependencies, key, useGlobalLoading, useGlobalError]);

  return {
    isLoading: useGlobalLoading ? isLoading('global') : isLoading(key),
    error: useGlobalError ? getError('global') : getError(key)
  };
}; 