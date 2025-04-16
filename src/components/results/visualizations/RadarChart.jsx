import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const RadarChart = ({ item, comparisonSets }) => {
  const { currentTheme } = useTheme();
  
  // Get all unique metrics across all items
  const getAllMetrics = () => {
    const metrics = new Set();
    // Add metrics from the main item
    Object.keys(item.average_metrics || {}).forEach(metric => metrics.add(metric));
    // Add metrics from comparison sets
    comparisonSets?.forEach(set => {
      set.items.forEach(comparisonItem => {
        Object.keys(comparisonItem.average_metrics || {}).forEach(metric => metrics.add(metric));
      });
    });
    return Array.from(metrics);
  };

  const uniqueMetrics = getAllMetrics();
  const maxValue = 5; // Assuming max value is 5
  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899']; // Amber, Blue, Green, Purple, Pink

  // Helper function to get metric value
  const getMetricValue = (item, metric) => {
    return item.average_metrics?.[metric]?.avg_rating || 0;
  };

  return (
    <div className="relative w-full h-[600px]">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {/* Draw radar lines */}
        {uniqueMetrics.map((metric, i) => {
          const angle = (i * 2 * Math.PI) / uniqueMetrics.length;
          const x = 250 + Math.cos(angle) * 200;
          const y = 250 + Math.sin(angle) * 200;
          
          return (
            <g key={metric}>
              {/* Metric line */}
              <line
                x1="250"
                y1="250"
                x2={x}
                y2={y}
                stroke={currentTheme.colors.border}
                strokeWidth="1"
              />
              
              {/* Metric label */}
              <text
                x={250 + Math.cos(angle) * 220}
                y={250 + Math.sin(angle) * 220}
                textAnchor="middle"
                fill={currentTheme.colors.text}
                className="text-sm"
              >
                {metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </text>
            </g>
          );
        })}

        {/* Draw concentric circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <circle
            key={i}
            cx="250"
            cy="250"
            r={200 * scale}
            fill="none"
            stroke={currentTheme.colors.border}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}

        {/* Draw item data */}
        {(() => {
          const points = uniqueMetrics.map((metric, i) => {
            const angle = (i * 2 * Math.PI) / uniqueMetrics.length;
            const value = getMetricValue(item, metric);
            const scaledValue = (value / maxValue) * 200;
            
            return {
              x: 250 + Math.cos(angle) * scaledValue,
              y: 250 + Math.sin(angle) * scaledValue
            };
          });

          return (
            <g key={item.id}>
              {/* Fill area */}
              <polygon
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill={colors[0]}
                fillOpacity="0.2"
                stroke={colors[0]}
                strokeWidth="2"
              />
              
              {/* Data points */}
              {points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={colors[0]}
                />
              ))}
            </g>
          );
        })()}

        {/* Draw comparison set items data */}
        {comparisonSets?.map((set, setIndex) => {
          return set.items.map((comparisonItem, itemIndex) => {
            if (comparisonItem.id === item.id) return null; // Skip the current item
            
            const points = uniqueMetrics.map((metric, i) => {
              const angle = (i * 2 * Math.PI) / uniqueMetrics.length;
              const value = getMetricValue(comparisonItem, metric);
              const scaledValue = (value / maxValue) * 200;
              
              return {
                x: 250 + Math.cos(angle) * scaledValue,
                y: 250 + Math.sin(angle) * scaledValue
              };
            });

            return (
              <g key={`${set.set_id}-${comparisonItem.id}`}>
                {/* Fill area */}
                <polygon
                  points={points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill={colors[(itemIndex + 1) % colors.length]}
                  fillOpacity="0.2"
                  stroke={colors[(itemIndex + 1) % colors.length]}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {points.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={colors[(itemIndex + 1) % colors.length]}
                  />
                ))}
              </g>
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: colors[0] }}
          />
          <span className="text-sm" style={{ color: currentTheme.colors.text }}>{item.name}</span>
        </div>
        {comparisonSets?.map((set, setIndex) => {
          return set.items.map((comparisonItem, itemIndex) => {
            if (comparisonItem.id === item.id) return null;
            return (
              <div key={`${set.set_id}-${comparisonItem.id}`} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colors[(itemIndex + 1) % colors.length] }}
                />
                <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                  {comparisonItem.name}
                </span>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};

export default RadarChart; 