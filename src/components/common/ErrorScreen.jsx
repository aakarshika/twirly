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
        backgroundColor: 'var(--color-background)',
        zIndex: 9999 // Ensure it's above everything
      }}
    >
      <div className="text-center animate-fade-in">
        <p 
          className="text-red-500 mb-4 text-lg"
          style={{ color: 'var(--color-text)' }}
        >
          {message}
        </p>
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
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