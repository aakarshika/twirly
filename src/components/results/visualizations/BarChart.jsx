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
    <div className="w-full">
      <div 
        className="rounded-lg shadow-sm overflow-hidden"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          border: `1px solid ${currentTheme.colors.border}`
        }}
      >
        <div 
          className="p-3 border-b"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <h2 
            className="text-base font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Comparison Results
          </h2>
        </div>
        <div 
          className="divide-y"
          style={{ borderColor: currentTheme.colors.border }}
        >
          {metrics.map(metric => (
            <div 
              key={metric} 
              className="p-2"
              style={{ borderColor: currentTheme.colors.border, backgroundColor: currentTheme.colors.card }}
            >
              <div className="flex items-center gap-2">
                <div className="w-24 min-w-[6rem]">
                  <span 
                    className="text-xs font-medium truncate block"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    {metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                <div className="flex-1 flex gap-1">
                  {items.map((item, i) => {
                    if (!item.averageMetrics) return null;
                    const value = ((item.averageMetrics[metric]?.average-3)*5/2) || 0;
                    const percentage = (value / 5) * 100;
                    
                    return (
                      <div key={item.id} className="flex-1 min-w-[2rem]">
                        <div 
                          className="h-3 rounded-sm overflow-hidden"
                          style={{ backgroundColor: currentTheme.colors.background }}
                        >
                          <div
                            className="h-full rounded-sm transition-all duration-300 flex items-center justify-end px-1"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: currentTheme.colors[item.color] || COMPARISON_COLOR_SET[i]
                            }}
                          >
                            <span 
                              className="text-[10px] font-medium"
                              style={{ 
                                color: 'white',
                                opacity: percentage < 25 ? 0 : 1,
                                textShadow: `0 1px 1px ${currentTheme.colors.shadow}`
                              }}
                            >
                              {value.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart; 