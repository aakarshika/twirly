import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const Description = ({ description }) => {
  const { currentTheme } = useTheme();

  if (!description) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
        Product Description
      </h2>
      <div 
        className="prose max-w-none"
        style={{ color: currentTheme.colors.text }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export default Description; 