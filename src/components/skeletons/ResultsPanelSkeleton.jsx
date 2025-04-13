import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ResultsPanel = () => {
  const { currentTheme } = useTheme();

  return (
    <div style={{ backgroundColor: currentTheme.colors.card, color: currentTheme.colors.text }}>
      <h3 style={{ color: currentTheme.colors.primary }}>Results</h3>
      {/* Render results here */}
    </div>
  );
};

export default ResultsPanel; 