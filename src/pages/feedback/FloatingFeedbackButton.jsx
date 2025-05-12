import React from 'react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';

const FloatingFeedbackButton = () => {
  const { openFeedbackModal } = useFeedback();
  const { currentTheme } = useTheme();

  return (
    <button
      onClick={openFeedbackModal}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      style={{ 
        backgroundColor: currentTheme.colors.primary,
        color: currentTheme.colors.background
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
        />
      </svg>
    </button>
  );
};

export default FloatingFeedbackButton; 