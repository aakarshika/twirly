import React from 'react';

const ErrorScreen = ({
  message = 'Something went wrong',
  onRetry,
  showRetryButton = true,
}) => (
  <div className="fixed inset-0 flex items-center justify-center z-[9999]">
    <div className="text-center px-6">
      <p className="mb-6 text-base" style={{ color: 'var(--color-text)' }}>
        {message}
      </p>
      {showRetryButton && onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded font-medium transition-opacity hover:opacity-80 cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

export default ErrorScreen;
