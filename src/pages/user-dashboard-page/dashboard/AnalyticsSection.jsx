import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const AnalyticsCard = ({ title, children }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: currentTheme.colors.text }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};
