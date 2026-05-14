import React from 'react';

const InitialLoadingScreen = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-background)',
        zIndex: 9999, // Ensure it's above everything
      }}
    >
      <div className="text-center animate-fade-in">
        <img
          src="/public_logo_transparent.png"
          alt="Twirly Logo"
          className="h-24 w-24 mx-auto mb-4 animate-pulse"
        />
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto transition-transform duration-300"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </div>
    </div>
  );
};

export default InitialLoadingScreen;
