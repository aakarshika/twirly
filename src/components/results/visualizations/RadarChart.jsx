import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const RadarChart = ({ item }) => {
  const { currentTheme } = useTheme();
  
  const metrics = item.item_metric_averages;
  const maxValue = 5; // Assuming max value is 5
  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6']; // Amber, Blue, Green, Purple

  return (
    <div className="relative w-full h-[600px]">
      <svg viewBox="0 0 500 500" className="w-full h-auto">
        {/* Draw radar lines */}
        {metrics.map((metric, i) => {
          const angle = (i * 2 * Math.PI) / metrics.length;
          const x = 250 + Math.cos(angle) * 200;
          const y = 250 + Math.sin(angle) * 200;
          
          return (
            <g key={metric.metric_name}>
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
                {metric.metric_name.split('_').join(' ')}
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
          const points = metrics.map((metric, i) => {
            const angle = (i * 2 * Math.PI) / metrics.length;
            const value = metric.avg_rating || 0;
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
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: colors[0] }}
          />
          <span className="text-sm text-gray-300">{item.name}</span>
        </div>
      </div>
    </div>
  );
};

export default RadarChart; 