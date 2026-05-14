import React, { createContext, useContext, useState, useEffect } from 'react';
import { initPerformanceTracking } from '../utils/analytics';
import { useFeedback } from './FeedbackContext';

const BetaTestingContext = createContext();

export const useBetaTesting = () => {
  const context = useContext(BetaTestingContext);
  if (!context) {
    throw new Error('useBetaTesting must be used within a BetaTestingProvider');
  }
  return context;
};

export const BetaTestingProvider = ({ children }) => {
  // const [isBetaMode, setIsBetaMode] = useState(process.env.NODE_ENV === 'development');
  const [isBetaMode, _setIsBetaMode] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { openFeedbackModal } = useFeedback();

  useEffect(() => {
    if (isBetaMode) {
      initPerformanceTracking();
    }
  }, [isBetaMode]);

  const togglePerformanceMonitor = () => {
    setShowPerformanceMonitor(prev => !prev);
  };

  const openBetaFeedback = () => {
    openFeedbackModal();
  };

  const value = {
    isBetaMode,
    showPerformanceMonitor,
    togglePerformanceMonitor,
    openBetaFeedback,
  };

  return (
    <BetaTestingContext.Provider value={value}>
      {children}
    </BetaTestingContext.Provider>
  );
};
