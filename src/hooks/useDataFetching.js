import { useEffect } from 'react';
import { useLoading } from '../contexts/LoadingContext';

export const useDataFetching = (key, fetchFunction, dependencies = []) => {
  const { setLoading, setError, clearError, clearLoading, isLoading, getError } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(key, true);
        clearError(key);
        await fetchFunction();
      } catch (error) {
        setError(key, error.message || 'An error occurred');
      } finally {
        setLoading(key, false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      clearLoading(key);
      clearError(key);
    };
  }, [...dependencies, key]);

  return {
    isLoading: isLoading(key),
    error: getError(key)
  };
}; 