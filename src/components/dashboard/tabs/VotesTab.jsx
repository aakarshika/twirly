import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const VotesTab = () => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="p-4 rounded-lg"
      style={{ backgroundColor: currentTheme.colors.surface }}
    >
      <h2 
        className="text-xl font-semibold mb-4"
        style={{ color: currentTheme.colors.text }}
      >
        Your Votes
      </h2>
      <div className="space-y-4">
        {/* Placeholder for votes content */}
        <p style={{ color: currentTheme.colors.textSecondary }}>
          No votes yet. Start voting on products to see them here.
        </p>
      </div>
    </div>
  );
};

export default VotesTab; 