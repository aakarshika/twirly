// File: src/components/common/Metrics.jsx

import React from 'react';
import { BarChart } from 'lucide-react';

/**
 * Metrics component that visualizes rating data with horizontal bars
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Object containing metric names as keys and values (0-10)
 * @param {string} props.title - Optional title for the metrics section
 * @param {boolean} props.showIcon - Whether to show the BarChart icon
 * @param {string} props.className - Additional CSS classes
 */
const Metrics = ({ 
  metrics, 
  title = "Ratings", 
  showIcon = true,
  className = ''
}) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 mb-4 ${className}`}>
      {title && (
        <h4 className="font-medium text-sm flex items-center gap-1 mb-2 text-gray-300">
          {showIcon && <BarChart size={14} />}
          {title}
        </h4>
      )}
      
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="capitalize text-gray-400">{key}</span>
            <span>{typeof value === 'number' ? value.toFixed(1) : value}/10</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                value >= 8 ? 'bg-white' :
                value >= 6 ? 'bg-gray-300' :
                value >= 4 ? 'bg-gray-500' :
                'bg-gray-700'
              }`}
              style={{ width: `${(value / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Metrics;