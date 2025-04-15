import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

const HeatMap = ({ item }) => {
  const { currentTheme } = useTheme();
  
  // Get all unique metrics across item
  // const allMetrics = new Set();
  // item.forEach(item => {
  //   if (item.item_metric_averages) {
  //     item.item_metric_averages.forEach(metric => allMetrics.add(metric));
  //   }
  // });
  
  console.log("item",item);
  const metrics = item.item_metric_averages;
  console.log("metrics",metrics);
  const maxValue = 5; // Assuming max value is 5

  // Function to get color based on value
  const getColor = (value) => {
    const percentage = value / maxValue;
    // Using a gradient from amber-400 to amber-600
    const hue = 45; // Amber base hue
    const saturation = Math.round(percentage * 100);
    const lightness = 50 + (percentage * 20); // Adjust lightness based on value
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Header row with metric names */}
        <div className="flex">
          <div className="w-30" /> {/* Empty cell for item names */}
          {metrics.map(metric => (
            <div 
              key={metric.metric_name}
              className="w-30 px-4 py-2 text-center font-medium text-gray-300 capitalize"
            >
              {(metric.metric_name).split("_").join(" ")}
            </div>
          ))}
        </div>

        <div className="flex item-center">
          {/* Item name */}
          <div className="w-48 px-4 py-3 text-gray-300 truncate">
            {item.name}
          </div>

          {/* Metric values */}
          {metrics.map(metric => {
            console.log("metric",metric);
            const value = metric.avg_rating || 0;
            const color = getColor(value);
            
            return (
              <div 
                key={`${item.id}-${metric.metric_name}`}
                className="w-20 px-2 py-3 text-center relative group"
              >
                <div 
                  className="w-full h-4 rounded-md transition-all duration-200"
                  style={{ backgroundColor: color }}
                />
                <div className="absolute inset-0 flex item-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded">
                    {value.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Color scale legend */}
        <div className="mt-4 flex item-center gap-2">
          <span className="text-sm text-gray-400">Low</span>
          <div className="flex-1 h-4 rounded-md overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-full w-full"
                style={{ 
                  backgroundColor: getColor((i / 19) * maxValue),
                  width: '5%'
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap; 