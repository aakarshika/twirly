import React from 'react';

const InitialLoadingScreen = () => (
  <div
    className="fixed inset-0 flex items-center justify-center z-[9999]"
    style={{ backgroundColor: 'var(--color-background)' }}
  >
    <div className="flex flex-col items-center gap-6">
      <img
        src="/public_logo_transparent.png"
        alt="Twirly"
        className="h-20 w-20"
      />
      <div
        className="rounded-full h-10 w-10 border-b-2 animate-spin"
        style={{ borderColor: 'var(--color-primary)' }}
      />
    </div>
  </div>
);

export default InitialLoadingScreen;
