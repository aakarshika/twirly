import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Specifications = ({ specifications }) => {
  const { currentTheme } = useTheme();

  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
        Technical Specifications
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between py-2 border-b">
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {key}
            </span>
            <span className="text-gray-600" style={{ color: currentTheme.colors.text }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Specifications; 