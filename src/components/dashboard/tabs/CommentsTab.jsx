import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const CommentsTab = () => {
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
        Your Comments
      </h2>
      <div className="space-y-4">
        {/* Placeholder for comments content */}
        <p style={{ color: currentTheme.colors.textSecondary }}>
          No comments yet. Start engaging with products to see your comments here.
        </p>
      </div>
    </div>
  );
};

export default CommentsTab; 