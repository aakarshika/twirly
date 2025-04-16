import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const RadarChart = ({ item, comparisonSets }) => {
  const { currentTheme } = useTheme();
  
  // Get all unique metrics from aspects
  const getAllMetrics = () => {
    const metrics = new Set();
    comparisonSets?.forEach(set => {
      set.aspects?.forEach(aspect => {
        metrics.add(aspect.metric_name);
      });
    });
    return Array.from(metrics);
  };

  const uniqueMetrics = getAllMetrics();
  const maxValue = 5; // Assuming max value is 5
  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899']; // Amber, Blue, Green, Purple, Pink

  // Helper function to get metric value from reviews
  const getMetricValue = (reviews, metricName) => {
    if (!reviews || reviews.length === 0) return 0;
    
    console.log(`Calculating metric ${metricName} for reviews:`, reviews);
    
    const metricValues = reviews.flatMap(review => 
      review.review_metrics
        ?.filter(metric => metric.metric_name === metricName)
        .map(metric => metric.value) || []
    );
    
    console.log(`Metric values for ${metricName}:`, metricValues);
    
    const average = metricValues.length > 0 
      ? metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length 
      : 0;
    
    console.log(`Average for ${metricName}:`, average);
    return average;
  };

  // If no metrics or comparison sets, show empty state
  if (uniqueMetrics.length === 0 || !comparisonSets || comparisonSets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-gray-400">No metrics data available</p>
      </div>
    );
  }

  console.log('Unique Metrics:', uniqueMetrics);
  console.log('Comparison Sets:', comparisonSets);

  return (
    <div className="relative w-full h-[200px]">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Draw radar lines */}
        {uniqueMetrics.map((metric, i) => {
          const angle = (i * 2 * Math.PI) / uniqueMetrics.length;
          const x = 150 + Math.cos(angle) * 120;
          const y = 150 + Math.sin(angle) * 120;
          
          return (
            <g key={metric}>
              {/* Metric line */}
              <line
                x1="150"
                y1="150"
                x2={x}
                y2={y}
                stroke={currentTheme.colors.border}
                strokeWidth="1"
              />
              
              {/* Metric label */}
              <text
                x={150 + Math.cos(angle) * 140}
                y={150 + Math.sin(angle) * 140}
                textAnchor="middle"
                fill={currentTheme.colors.text}
                className="text-xs"
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
            cx="150"
            cy="150"
            r={120 * scale}
            fill="none"
            stroke={currentTheme.colors.border}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}

        {/* Draw comparison set data */}
        {comparisonSets?.map((set, setIndex) => {
          console.log('Processing set:', set);
          
          return set.items?.map((item, itemIndex) => {
            console.log('Processing item:', item);
            
            const points = uniqueMetrics.map((metric, i) => {
              const angle = (i * 2 * Math.PI) / uniqueMetrics.length;
              const value = getMetricValue(item.reviews, metric);
              const scaledValue = (value / maxValue) * 120;
              
              return {
                x: 150 + Math.cos(angle) * scaledValue,
                y: 150 + Math.sin(angle) * scaledValue
              };
            });

            console.log('Points for item:', points);

            return (
              <g key={`${set.id}-${item.id}`}>
                {/* Fill area */}
                <polygon
                  points={points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill={colors[itemIndex % colors.length]}
                  fillOpacity="0.2"
                  stroke={colors[itemIndex % colors.length]}
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {points.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={colors[itemIndex % colors.length]}
                  />
                ))}
              </g>
            );
          });
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 p-2">
        {comparisonSets?.map((set, setIndex) => 
          set.items?.map((item, itemIndex) => (
            <div key={`${set.id}-${item.id}`} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[itemIndex % colors.length] }}
              />
              <span className="text-xs" style={{ color: currentTheme.colors.text }}>
                {item.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RadarChart; 