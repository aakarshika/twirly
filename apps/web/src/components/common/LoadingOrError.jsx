import React from 'react';

const LoadingOrError = ({ type, error }) => {
  if (type === 'loading') {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-20 rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--color-surface)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="p-4 text-sm" style={{ color: 'var(--color-danger)' }}>
        {error ?? 'Something went wrong.'}
      </div>
    );
  }

  return null;
};

export default LoadingOrError;
