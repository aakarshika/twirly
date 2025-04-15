import React from 'react';
import { BarChart, Star } from 'lucide-react';

const Metrics = ({ metrics = [] }) => {
  // Ensure metrics is an array and has the correct structure
  const metricsArray = Array.isArray(metrics) ? metrics.map((metric) => ({
    title: metric.metric_name ? metric.metric_name.split("_").join(" ") : '',
    value: typeof metric.avg_rating === 'number' ? metric.avg_rating.toFixed(1) : '0.0'
  })) : [];

  if (metricsArray.length === 0) {
    return null;
  }

  // Get the average rating across all metrics
  const averageRating = metricsArray.reduce((sum, metric) => sum + parseFloat(metric.value), 0) / metricsArray.length;

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
        <div className="p-2 bg-amber-400/10 rounded-lg">
          <Star className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Overall Rating</p>
          <p className="text-lg font-semibold text-white">{averageRating.toFixed(1)}/5</p>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-2">
        {metricsArray.map((metric, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
            <div className="p-2 bg-primary-400/10 rounded-lg">
              <BarChart className="w-4 h-4 text-primary-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 capitalize">{metric.title}</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-white">{metric.value}/5</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        star <= parseFloat(metric.value)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;
