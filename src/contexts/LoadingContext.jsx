import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true); // Start with true for initial load
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState('Loading...');
  const [globalError, setGlobalError] = useState(null);
  const [globalErrorRetry, setGlobalErrorRetry] = useState(null);

  // Simulate minimum loading time for initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const setLoading = (key, isLoading, message = 'Loading...') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
    
    // If this is a global loading state, update the global loading
    if (key === 'global') {
      setGlobalLoading(isLoading);
      setGlobalLoadingMessage(message);
      // Clear any global error when starting to load
      if (isLoading) {
        setGlobalError(null);
        setGlobalErrorRetry(null);
      }
    }
  };

  const setError = (key, error, retryFunction = null) => {
    setErrorStates(prev => ({
      ...prev,
      [key]: error
    }));
    
    // If this is a global error state, update the global error
    if (key === 'global') {
      setGlobalError(error);
      setGlobalErrorRetry(retryFunction);
    }
  };

  const clearError = (key) => {
    setErrorStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    
    // If this is a global error state, clear it
    if (key === 'global') {
      setGlobalError(null);
      setGlobalErrorRetry(null);
    }
  };

  const clearLoading = (key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    
    // If this is a global loading state, clear it
    if (key === 'global') {
      setGlobalLoading(false);
    }
  };

  const isLoading = (key) => loadingStates[key] || false;
  const getError = (key) => errorStates[key] || null;

  const value = {
    setLoading,
    setError,
    clearError,
    clearLoading,
    isLoading,
    getError,
    loadingStates,
    errorStates,
    globalLoading,
    globalLoadingMessage,
    globalError,
    globalErrorRetry
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {globalLoading && (
        <LoadingScreen 
          message={globalLoadingMessage}
          showLogo={true}
        />
      )}
      {globalError && (
        <ErrorScreen 
          message={globalError}
          onRetry={globalErrorRetry}
          showRetryButton={!!globalErrorRetry}
        />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 