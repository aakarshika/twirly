import React from 'react';

const LoadingScreen = ({ 
  message = 'Loading...', 
  showLogo = false,
  size = 'default' // 'small' | 'default' | 'large'
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center transition-all duration-300 ease-in-out"
      style={{ 
        backgroundColor: 'var(--color-background)',
        zIndex: 9999 // Ensure it's above everything
      }}
    >
      <div className="text-center animate-fade-in">
        {showLogo && (
          <img 
            src="/public_logo_transparent.png" 
            alt="logo" 
            className="h-24 w-24 mx-auto mb-4 transition-transform duration-300 hover:scale-105" 
          />
        )}
        <div 
          className={`animate-spin rounded-full border-b-2 mx-auto transition-transform duration-300 ${sizeClasses[size]}`}
          style={{ borderColor: 'var(--color-primary)' }}
        />
        <p 
          className="mt-4 text-lg transition-colors duration-200"
          style={{ color: 'var(--color-text)' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 