import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { COMPARISON_COLOR_SET } from '../../../lib/constants';

const BarChart = ({ items }) => {
  const { currentTheme } = useTheme();
  
  // Get all unique metrics across items
  const allMetrics = new Set();
  items.forEach(item => {
    if (item.averageMetrics) {
      Object.keys(item.averageMetrics).forEach(metric => allMetrics.add(metric));
    }
  });
  
  const metrics = Array.from(allMetrics);

  return (
    <div className="w-full" style={{ backgroundColor: currentTheme.colors.background, marginTop: '1vh' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>Comparison Results</h2>
      {metrics.map(metric => (
        <div key={metric} className="w-full">
          <h3 className="text-md font-medium mb-2" style={{ color: currentTheme.colors.text }}>{metric}</h3>
          <div className="flex items-center gap-4 w-full">
            {items.map((item, i) => {
              if (!item.averageMetrics) return null;
              const value = ((item.averageMetrics[metric]?.average-3)*5/2) || 0;
              const percentage = (value / 5) * 100;
              
              return (
                <div key={item.id} className="flex-1">
                  <div className="h-8 bg-gray-800 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(204, 204, 204, 0.56)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500 flex items-center"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: currentTheme.colors[item.color] || COMPARISON_COLOR_SET[i]
                      }}
                    >
                      <span className="text-sm font-medium ml-2" style={{ color: 'black' }}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart; 