import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const SideBySideBarChart = ({ items }) => {
  const { currentTheme } = useTheme();

  // Get all unique metrics across items
  const allMetrics = new Set();
  items.forEach(item => {
    if (item.averageMetrics) {
      Object.keys(item.averageMetrics).forEach(metric => allMetrics.add(metric));
    }
  });

  const metrics = Array.from(allMetrics);
  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6']; // Amber, Blue, Green, Purple
  const maxValue = 5; // Assuming max value is 5
  const barHeight = 40;
  const spacing = 25;
  const chartHeight = (metrics.length * (barHeight + spacing)) + 100; // Extra space for labels
  const maxBarWidth = 700; // Maximum width available for bars

  return (
    <div className="w-full h-[600px] relative">
      <svg viewBox={`0 0 800 ${chartHeight}`} className="w-full h-full">
        {/* Y-axis labels */}
        {metrics.map((metric, index) => (
          <text
            key={`metric-label-${metric}`}
            x="20"
            y={index * (barHeight + spacing) + barHeight / 2 + 20}
            textAnchor="start"
            dominantBaseline="middle"
            className="text-sm font-medium fill-gray-300"
          >
            {metric}
          </text>
        ))}

        {/* Bars */}
        {metrics.map((metric, metricIndex) => {
          const y = metricIndex * (barHeight + spacing) + 20;
          let currentX = 100; // Starting x position for stacking
          let currentY = y; // Declare currentY here
          return (
            <g key={`metric-group-${metric}`}>
              {items.map((item, itemIndex) => {
                if (!item.averageMetrics) return null;
                const value = item.averageMetrics[metric]?.average || 0;

                // Calculate the width of this segment based on its proportion of the total
                const segmentWidth = (value / maxValue) * maxBarWidth/2;

                const a = (
                  <g key={`${item.id}-${metric}`}>
                    <rect
                      x={currentX}
                      y={currentY}
                      width={segmentWidth}
                      height={barHeight/2}
                      fill={colors[itemIndex % colors.length]}
                      rx="2"
                      className="transition-all duration-200 hover:opacity-80"
                    />
                    {/* Value label */}
                    {segmentWidth > 30 && (
                      <text
                        x={currentX + segmentWidth + 20}
                        y={currentY + barHeight / 4}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-white font-medium"
                      >
                        {value.toFixed(1)}
                      </text>
                      
                    )}
                  </g>
                )


                // currentX += segmentWidth; // Update currentX for the next segment
                currentY += 10; // Update currentX for the next segment
                console.log("currentX", currentX);

                
                return a;
              })}
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1="100"
          y1="0"
          x2="100"
          y2={chartHeight - 50}
          stroke={currentTheme.colors.border}
          strokeWidth="1"
        />
        <line
          x1="100"
          y1={chartHeight - 50}
          x2="800"
          y2={chartHeight - 50}
          stroke={currentTheme.colors.border}
          strokeWidth="1"
        />

        {/* X-axis labels */}
        {[0, 1, 2, 3, 4, 5].map(value => (
          <g key={`x-axis-label-${value}`}>
            <line
              x1={100 + (value / maxValue) * maxBarWidth}
              y1={chartHeight - 50}
              x2={100 + (value / maxValue) * maxBarWidth}
              y2={chartHeight - 45}
              stroke={currentTheme.colors.border}
              strokeWidth="1"
            />
            <text
              x={100 + (value / maxValue) * maxBarWidth}
              y={chartHeight - 35}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {value}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-sm text-gray-300">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBySideBarChart;
