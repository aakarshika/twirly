import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errorStates, setErrorStates] = useState({});

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const setError = (key, error) => {
    setErrorStates(prev => ({
      ...prev,
      [key]: error
    }));
  };

  const clearError = (key) => {
    setErrorStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const clearLoading = (key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
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
    errorStates
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
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