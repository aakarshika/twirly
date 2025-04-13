import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const ComparisonCard = ({ comparison }) => {
  const { currentTheme } = useTheme();

  return (
    <div 
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.cardBackground }}
    >
      <div className="p-4">
        <h3 
          className="font-semibold text-lg mb-2"
          style={{ color: currentTheme.colors.text }}
        >
          {comparison.name}
        </h3>
        <p 
          className="text-sm mb-4"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {comparison.category}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {comparison.items} items
            </span>
            <span 
              className="text-sm"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {comparison.votes} votes
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">📊</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span className="text-sm">✏️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonsTab = () => {
  const { currentTheme } = useTheme();

  // Mock data - replace with actual data from your backend
  const comparisons = [
    {
      id: 1,
      name: 'Smartphones Comparison',
      category: 'Electronics',
      items: 5,
      votes: 234,
      created_at: '2024-03-15'
    },
    {
      id: 2,
      name: 'Laptops Comparison',
      category: 'Electronics',
      items: 4,
      votes: 189,
      created_at: '2024-03-10'
    },
    // Add more mock comparisons as needed
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-xl font-bold"
          style={{ color: currentTheme.colors.text }}
        >
          Your Comparisons
        </h2>
        <button
          className="px-4 py-2 rounded-lg font-medium"
          style={{ 
            backgroundColor: currentTheme.colors.primary,
            color: currentTheme.colors.buttonText
          }}
        >
          Create New Comparison
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisons.map(comparison => (
          <ComparisonCard key={comparison.id} comparison={comparison} />
        ))}
      </div>
    </div>
  );
};

export default ComparisonsTab; 