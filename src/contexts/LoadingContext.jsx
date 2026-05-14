import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorScreen from '../components/common/ErrorScreen';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  // console.log('[LoadingContext] Provider mounting');
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true); // Start with true for initial load
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState('Loading App...');
  const [globalError, setGlobalError] = useState(null);
  const [globalErrorRetry, setGlobalErrorRetry] = useState(null);

  // Clear initial loading state after a short delay
  useEffect(() => {
    // console.log('[LoadingContext] Initial loading state:', { globalLoading, loadingStates });
    const timer = setTimeout(() => {
      // console.log('[LoadingContext] Clearing initial loading state');
      setGlobalLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const setLoading = (key, isLoading, message = 'Loading Things...') => {
    // console.log('[LoadingContext] Setting loading state:', { key, isLoading, message });
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));

    // If this is a global loading state, update the global loading
    if (key === 'global') {
      // console.log('[LoadingContext] Setting global loading:', { isLoading, message });
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
    // console.log('[LoadingContext] Setting error state:', { key, error });
    setErrorStates(prev => ({
      ...prev,
      [key]: error,
    }));

    // If this is a global error state, update the global error
    if (key === 'global') {
      // console.log('[LoadingContext] Setting global error:', { error });
      setGlobalError(error);
      setGlobalErrorRetry(retryFunction);
    }
  };

  const clearError = key => {
    // console.log('[LoadingContext] Clearing error state:', { key });
    setErrorStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    // If this is a global error state, clear it
    if (key === 'global') {
      // console.log('[LoadingContext] Clearing global error');
      setGlobalError(null);
      setGlobalErrorRetry(null);
    }
  };

  const clearLoading = key => {
    // console.log('[LoadingContext] Clearing loading state:', { key });
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

  const isLoading = key => loadingStates[key] || false;
  const getError = key => errorStates[key] || null;

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
    globalErrorRetry,
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
