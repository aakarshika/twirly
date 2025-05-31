import React from 'react';

const ErrorScreen = ({ 
  message = 'Something went wrong', 
  onRetry,
  showRetryButton = true
}) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-300 ease-in-out"
      style={{ 
        zIndex: 9999 // Ensure it's above everything
      }}
    >
      <div className="text-center animate-fade-in">
        <p 
          className="text-red-500 mb-4 text-md text-gray-500"
        >
          {message}
        </p>
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="font-semibold text-gray-500 transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text)'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorScreen; 