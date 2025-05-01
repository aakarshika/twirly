import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
const LoadingOrError = ({type, error}) => {
  const { currentTheme } = useTheme();
  if (type == "loading") {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (type == "error") {
    return (
      <div className="p-4 text-red-500">
        Error loading. {error}
      </div>
    );
  }
  return <div>Hmm...</div>;
};

export default LoadingOrError;
